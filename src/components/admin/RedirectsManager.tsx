import { useMemo, useState } from "react";
import { useAdmin, type Redirect } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, ShieldCheck, AlertTriangle, Loader2, ExternalLink, Pencil, X } from "lucide-react";
import { toast } from "sonner";

type Draft = { from: string; to: string; code: 301 | 302 | 307 | 308; enabled: boolean };

const CODES: Draft["code"][] = [301, 302, 307, 308];

function normalizePath(value: string): string {
  const v = (value || "").trim();
  if (!v) return "";
  try {
    if (/^https?:\/\//i.test(v)) {
      const u = new URL(v);
      const p = u.pathname.replace(/\/+$/, "") || "/";
      return u.origin + (p === "/" ? "" : p) + u.search;
    }
  } catch {
    /* fall through */
  }
  const prefixed = v.startsWith("/") ? v : `/${v}`;
  return prefixed.length > 1 ? prefixed.replace(/\/+$/, "") : "/";
}

function validate(draft: Draft, all: Redirect[], editingId?: string): string | null {
  const from = normalizePath(draft.from);
  const to = normalizePath(draft.to);
  if (!from || !to) return "Both old URL and new URL are required.";
  if (from === to) return "Old URL and new URL cannot be the same.";
  if (!from.startsWith("/")) return "Old URL must be a same-site path starting with /.";
  // Duplicate (same from)
  const dup = all.find((r) => r.id !== editingId && normalizePath(r.from) === from);
  if (dup) return `A redirect already exists for ${from}.`;
  // Direct loop A->B + B->A
  const reverse = all.find((r) => r.id !== editingId && normalizePath(r.from) === to && normalizePath(r.to) === from);
  if (reverse) return `Loop detected: ${to} already redirects back to ${from}.`;
  // Chain loop traversal
  const map = new Map<string, string>();
  for (const r of all) if (r.id !== editingId && r.enabled !== false) map.set(normalizePath(r.from), normalizePath(r.to));
  map.set(from, to);
  let cur = from;
  const seen = new Set<string>();
  for (let i = 0; i < 25; i++) {
    if (seen.has(cur)) return `Redirect loop detected starting at ${from}.`;
    seen.add(cur);
    const nxt = map.get(cur);
    if (!nxt) break;
    cur = nxt;
  }
  return null;
}

export function RedirectsManager() {
  const { seo, addRedirect, updateRedirect, deleteRedirect, saveAllNow } = useAdmin();
  const redirects = seo.redirects ?? [];

  const [draft, setDraft] = useState<Draft>({ from: "", to: "", code: 301, enabled: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { status: number; location?: string; ok: boolean; note?: string }>>({});

  const canonicalOrigin = useMemo(() => {
    try { return new URL(seo.canonicalUrl || window.location.origin).origin; } catch { return window.location.origin; }
  }, [seo.canonicalUrl]);

  const reset = () => { setDraft({ from: "", to: "", code: 301, enabled: true }); setEditingId(null); };

  const persist = async () => {
    const r = await saveAllNow();
    return !!r?.ok;
  };

  const onSubmit = async () => {
    const err = validate(draft, redirects, editingId ?? undefined);
    if (err) { toast.error(err); return; }
    const payload = {
      from: normalizePath(draft.from),
      to: normalizePath(draft.to),
      code: draft.code,
      enabled: draft.enabled,
    };
    if (editingId) updateRedirect(editingId, payload); else addRedirect(payload);
    const ok = await persist();
    toast[ok ? "success" : "error"](ok ? "Redirect saved — live on server" : "Save failed");
    if (ok) reset();
  };

  const onDelete = async (id: string) => {
    deleteRedirect(id);
    const ok = await persist();
    toast[ok ? "success" : "error"](ok ? "Redirect removed" : "Delete failed");
  };

  const onEdit = (r: Redirect) => {
    setEditingId(r.id);
    setDraft({ from: r.from, to: r.to, code: (r.code as Draft["code"]) || 301, enabled: r.enabled !== false });
  };

  const testRedirect = async (r: Redirect) => {
    setTesting(r.id);
    try {
      const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/check-redirect`;
      const target = canonicalOrigin + normalizePath(r.from);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      const status = Number(data?.status ?? 0);
      const location = typeof data?.location === "string" ? data.location : undefined;
      const expectedTo = normalizePath(r.to);
      const gotPath = (() => {
        if (!location) return "";
        try { return normalizePath(new URL(location, target).pathname); } catch { return location; }
      })();
      const isRedirect = status >= 300 && status < 400;
      const matches = gotPath === expectedTo;
      setResults((p) => ({
        ...p,
        [r.id]: {
          status,
          location,
          ok: isRedirect && matches && status === r.code,
          note: !isRedirect
            ? `Server returned ${status} (not a redirect). SEO risk: looks like a 200 OK.`
            : !matches
            ? `Redirected to ${gotPath || location} (expected ${expectedTo}).`
            : status !== r.code
            ? `Got ${status}, expected ${r.code}.`
            : `Verified ${status} → ${expectedTo}`,
        },
      }));
    } catch (e: any) {
      setResults((p) => ({ ...p, [r.id]: { status: 0, ok: false, note: e?.message || "Check failed" } }));
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Redirect Manager</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Server-side 301 redirects executed by Vercel middleware before any page renders. Only redirects you add here are active — slug
          changes never auto-create redirects.
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold">{editingId ? "Edit redirect" : "Add redirect"}</p>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
          <div>
            <label className="text-xs font-medium mb-1 block">Old URL (path)</label>
            <Input value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} placeholder="/old-page" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">New URL (path or full URL)</label>
            <Input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} placeholder="/new-page" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Type</label>
            <Select value={String(draft.code)} onValueChange={(v) => setDraft({ ...draft, code: Number(v) as Draft["code"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CODES.map((c) => (
                  <SelectItem key={c} value={String(c)}>{c} {c === 301 ? "Permanent" : c === 302 ? "Found" : c === 307 ? "Temp" : "Perm (keep method)"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-2 h-10">
              <Switch checked={draft.enabled} onCheckedChange={(v) => setDraft({ ...draft, enabled: v })} />
              <span className="text-xs">Enabled</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="hero" size="sm" onClick={onSubmit}><Save className="h-4 w-4" /> {editingId ? "Update" : "Add"} redirect</Button>
          {editingId && <Button variant="outline" size="sm" onClick={reset}><X className="h-4 w-4" /> Cancel</Button>}
          {!editingId && <Button variant="outline" size="sm" onClick={reset}><Plus className="h-4 w-4" /> Clear</Button>}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <p className="text-sm font-semibold">Active redirects ({redirects.length})</p>
          <Badge variant="outline" className="text-xs">Server-side · runs before render</Badge>
        </div>
        {redirects.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground text-center">No redirects yet. Add one above.</div>
        ) : (
          <div className="divide-y">
            {redirects.map((r) => {
              const res = results[r.id];
              return (
                <div key={r.id} className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                      <code className="px-1.5 py-0.5 rounded bg-muted">{r.from}</code>
                      <span className="text-muted-foreground">→</span>
                      <code className="px-1.5 py-0.5 rounded bg-muted">{r.to}</code>
                      <Badge variant={r.code === 301 ? "default" : "secondary"} className="text-[10px]">{r.code}</Badge>
                      {r.enabled === false && <Badge variant="outline" className="text-[10px]">disabled</Badge>}
                    </div>
                    {res && (
                      <div className={`text-xs mt-1 flex items-center gap-1 ${res.ok ? "text-green-600" : "text-amber-600"}`}>
                        {res.ok ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        HTTP {res.status || "—"} · {res.note}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => testRedirect(r)} disabled={testing === r.id}>
                      {testing === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                      Test 301
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <p className="text-[11px] text-muted-foreground">
        Verification calls a server-side checker (no browser cache, no JS following) that issues <code>fetch(url, {`{redirect: 'manual'}`})</code>{" "}
        and returns the raw HTTP status + Location header — proving the response is a real 301/302 from Vercel, not a 200 OK with a
        client-side redirect.
      </p>
    </div>
  );
}
