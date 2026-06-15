import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { AdminLogin } from "./AdminLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  LogOut, Users, FileText, Settings, Eye, MousePointerClick, TrendingUp, Plus, Trash2, Pencil,
  Save, X, Home, Search, Type, Copy, Phone, RefreshCw, Download, Image as ImageIcon, Bot,
  FolderOpen, FolderX, ArrowRight, Check, Code2, Link2, Monitor, Tablet, Smartphone, Layout,
  Sparkles, FileCog, ChevronRight, Layers, Globe, MapPin, FileEdit, Image as ImgIcon,
  Inbox, PhoneCall, Mail, Clock, Star, MessageSquare, Lock,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BlogPost } from "@/data/blog";
import logo from "@/assets/anirise-logo.jpg";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ServiceContentEditor } from "@/components/admin/ServiceContentEditor";
import { TextBlocksEditor } from "@/components/admin/TextBlocksEditor";
import { SortableList } from "@/components/admin/SortableList";
import { SectionNoteEditor } from "@/components/admin/SectionNoteEditor";
import { LinkableTextarea } from "@/components/admin/LinkableTextarea";
import { CaseStudiesEditor } from "@/components/admin/CaseStudiesEditor";
import { Switch } from "@/components/ui/switch";
import MDEditor from "@uiw/react-md-editor";
import jsPDF from "jspdf";
import { SECTION_KEYS, SectionKey, PROJECT_CATEGORIES, SERVICE_ICON_CHOICES, DEFAULT_HOME_ORDER } from "@/context/AdminContext";
import { SERVICE_SECTION_IDS, SERVICE_SECTION_LABELS, type ServiceSectionId } from "@/data/serviceContentDefaults";

const visitData = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  visits: 80 + Math.floor(Math.random() * 200),
  pageviews: 200 + Math.floor(Math.random() * 400),
}));

const devicePresets = {
  desktop: { w: 1280, label: "Desktop", icon: Monitor },
  tablet: { w: 820, label: "Tablet", icon: Tablet },
  mobile: { w: 390, label: "Mobile", icon: Smartphone },
} as const;

type DeviceKey = keyof typeof devicePresets;

const SITE_PAGES = [
  { key: "hero", label: "Hero" },
  { key: "services", label: "Services" },
  { key: "about", label: "About" },
  { key: "portfolio", label: "Portfolio" },
  { key: "blog", label: "Blog section" },
  { key: "testimonials", label: "Testimonials" },
  { key: "contact", label: "Contact" },
  { key: "case-studies", label: "Case studies" },
  { key: "footer", label: "Footer" },
];

const HOME_BLOCKS = [
  { key: "trustStrip", label: "Trust strip" },
  { key: "stats", label: "Stats band" },
  { key: "servicesPreview", label: "Services preview" },
  { key: "caseStudies", label: "Case studies" },
  
  { key: "homeFaq", label: "Home FAQ" },
  { key: "finalCta", label: "Final CTA" },
] as const;

const SITE_SERVICES = [
  { slug: "website-seo", label: "Website SEO" },
  { slug: "ecommerce-seo", label: "Ecommerce SEO" },
  { slug: "graphics-design", label: "Graphics Design" },
  { slug: "website-development", label: "Website Development" },
  { slug: "social-media-marketing", label: "Social Media Marketing" },
  { slug: "digital-marketing", label: "Digital Marketing" },
];

// Module-level helpers (defined OUTSIDE the dashboard so input focus is not lost on re-render)
const SectionHeader = ({ icon: Icon, title, subtitle, action }: { icon: any; title: string; subtitle: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-border/60">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-bold leading-tight">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-semibold mb-1.5 block text-foreground/80">{label}</label>
    {children}
  </div>
);

// Only these admin pageKeys map to a real public URL where meta tags actually ship.
// Listed once here so we never render SEO controls for pages clients can't index.
const INDEXABLE_PAGE_KEYS = new Set([
  "home", "services", "about", "portfolio", "blog", "testimonials", "contact", "strategy-call", "case-studies",
]);

const PAGE_URL_PREVIEW: Record<string, string> = {
  home: "/", services: "/services", about: "/about", portfolio: "/portfolio", blog: "/blog",
  testimonials: "/testimonials", contact: "/contact", "strategy-call": "/strategy-call",
  "case-studies": "/case-studies",
};

const SCHEMA_TYPE_OPTIONS = [
  "Article", "BlogPosting", "BreadcrumbList", "Service", "Product",
  "FAQPage", "WebPage", "WebSite", "Organization", "LocalBusiness", "Person", "Event",
];

export const SeoBlock = ({
  pageKey, seo, updatePageSeo, defaultPath, disableSlug = false, slugPrefix,
  externalSlug, onExternalSlugChange, onSaveNow,
}: {
  pageKey: string;
  seo: any; updatePageSeo: (key: string, patch: any) => void;
  /** Override default URL for non-built-in pages (e.g. /services/website-seo). */
  defaultPath?: string;
  /** Hide slug-edit input entirely (read-only display). */
  disableSlug?: boolean;
  /** When set, show this fixed prefix and only let admin edit the trailing slug. e.g. "/services/" */
  slugPrefix?: string;
  /** When set, the slug input reads/writes this external value instead of pageSeo[key].slug. */
  externalSlug?: string;
  onExternalSlugChange?: (next: string) => void;
  onSaveNow?: () => Promise<boolean>;
}) => {
  // Allow extended keys (svc:*, proj:*) by checking defaultPath presence.
  if (!INDEXABLE_PAGE_KEYS.has(pageKey) && !defaultPath) return null;
  const s = seo.pageSeo[pageKey] || {};
  const titleLen = s.metaTitle?.length || 0;
  const descLen = s.metaDescription?.length || 0;
  const status: "published" | "draft" = s.status === "draft" ? "draft" : "published";
  const canonicalAuto = s.canonicalAuto !== false; // default true
  const defaultSlug = defaultPath
    ? defaultPath.replace(/^\/+/, "")
    : (pageKey === "home" ? "" : pageKey);
  // For slugPrefix mode, the "tail" is everything after the prefix.
  const prefixClean = slugPrefix ? slugPrefix.replace(/^\/+/, "").replace(/\/+$/, "") + "/" : "";
  const defaultTail = slugPrefix ? defaultSlug.slice(prefixClean.length) : defaultSlug;
  const effectiveTail = slugPrefix
    ? ((externalSlug ?? s.slug ?? "").trim() || defaultTail)
    : ((s.slug?.trim() || defaultSlug)).replace(/^\/+/, "");
  const effectiveSlug = slugPrefix ? `${prefixClean}${effectiveTail}` : effectiveTail;
  const previewPath = effectiveSlug ? `/${effectiveSlug}` : "/";
  const robots: "index" | "noindex" = s.robots === "noindex" ? "noindex" : "index";
  const schemas: any[] = Array.isArray(s.schemas) ? s.schemas : [];

  const update = (patch: any) => updatePageSeo(pageKey, patch);

  const addSchema = () => {
    const id = `ps_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    update({ schemas: [...schemas, { id, type: "Article", enabled: true, name: "New schema", json: "{}" }] });
  };
  const updateSchema = (id: string, patch: any) => {
    update({ schemas: schemas.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  };
  const removeSchema = (id: string) => {
    update({ schemas: schemas.filter((x) => x.id !== id) });
  };

  const onSave = async () => {
    update({});
    const ok = onSaveNow ? await onSaveNow() : true;
    if (ok) toast.success(`SEO saved for ${previewPath} — live now`);
  };

  const sanitizeTail = (v: string) =>
    v.trim().toLowerCase().replace(/[^a-z0-9\-_]/g, "").replace(/^\/+/, "");

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Search className="h-4 w-4" />
        <h4 className="font-bold">Page SEO &amp; settings</h4>
        <span className="text-[11px] text-muted-foreground font-mono">{previewPath}</span>
        {status === "draft" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">DRAFT</span>
        )}
        {robots === "noindex" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300">NOINDEX</span>
        )}
        <Button size="sm" variant="hero" className="ml-auto" onClick={onSave}>
          <Save className="h-4 w-4" /> Save SEO
        </Button>
      </div>

      {/* Slug + status */}
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="text-xs font-medium mb-1 block">
            URL slug{" "}
            <span className="text-muted-foreground font-normal">
              (default: <code className="font-mono">{defaultSlug ? `/${defaultSlug}` : "/"}</code>)
            </span>
          </label>
          {pageKey === "home" ? (
            <Input value="/" disabled />
          ) : slugPrefix ? (
            <div className="flex items-stretch rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="px-3 py-2 text-sm font-mono text-muted-foreground bg-secondary/60 select-none border-r border-input">/{prefixClean}</span>
              <input
                value={externalSlug ?? s.slug ?? ""}
                placeholder={defaultTail}
                onChange={(e) => {
                  const next = sanitizeTail(e.target.value);
                  if (onExternalSlugChange) onExternalSlugChange(next);
                  else update({ slug: next });
                }}
                className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
              />
            </div>
          ) : disableSlug ? (
            <Input value={`/${defaultSlug}`} disabled />
          ) : (
            <Input
              value={s.slug || ""}
              placeholder={defaultSlug}
              onChange={(e) => update({ slug: e.target.value.trim().toLowerCase().replace(/[^a-z0-9\-_/]/g, "").replace(/^\/+/, "") })}
            />
          )}
          <p className="text-[10px] text-muted-foreground mt-1">
            Original path <code className="font-mono">/{defaultSlug || ""}</code> always works too — both render this page.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary">
          <Switch
            checked={status === "published"}
            onCheckedChange={(v) => update({ status: v ? "published" : "draft" })}
          />
          <span className="text-sm font-medium">{status === "published" ? "Published" : "Draft"}</span>
        </div>
      </div>


      <div>
        <label className="text-xs font-medium mb-1 block">
          Meta title <span className={titleLen > 60 ? "text-destructive" : "text-muted-foreground"}>({titleLen}/60)</span>
        </label>
        <Input value={s.metaTitle || ""} onChange={(e) => update({ metaTitle: e.target.value })} placeholder="e.g. Portfolio — AniRise Client Work & Results" />
      </div>
      <div>
        <label className="text-xs font-medium mb-1 block">
          Meta description <span className={descLen > 160 ? "text-destructive" : "text-muted-foreground"}>({descLen}/160)</span>
        </label>
        <Textarea rows={3} value={s.metaDescription || ""} onChange={(e) => update({ metaDescription: e.target.value })} placeholder="Short summary shown by Google under the title." />
      </div>
      <div>
        <label className="text-xs font-medium mb-1 block">Meta keywords <span className="text-muted-foreground">(optional)</span></label>
        <Input value={s.metaKeywords || ""} onChange={(e) => update({ metaKeywords: e.target.value })} placeholder="comma, separated, keywords" />
      </div>

      {/* Canonical */}
      <div className="rounded-xl border border-border/60 p-3 space-y-2 bg-secondary/30">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold">Canonical URL</span>
          <div className="ml-auto flex items-center gap-2">
            <Switch checked={canonicalAuto} onCheckedChange={(v) => update({ canonicalAuto: v })} />
            <span className="text-xs">Auto</span>
          </div>
        </div>
        {canonicalAuto ? (
          <p className="text-[11px] text-muted-foreground font-mono break-all">
            {(seo.canonicalUrl || "https://anirise.com.bd").replace(/\/$/, "")}{previewPath}
          </p>
        ) : (
          <Input
            value={s.canonicalUrl || ""}
            onChange={(e) => update({ canonicalUrl: e.target.value })}
            placeholder="https://example.com/your-canonical-url"
          />
        )}
      </div>

      {/* Robots */}
      <div className="rounded-xl border border-border/60 p-3 space-y-3 bg-secondary/30">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium mb-1 block">Robots</label>
            <select
              value={robots}
              onChange={(e) => update({ robots: e.target.value })}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="index">Index (visible to search engines)</option>
              <option value="noindex">No-index (hide from search engines)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium mb-1 block">Sitemap change frequency</label>
            <select
              value={s.changefreq || "monthly"}
              onChange={(e) => update({ changefreq: e.target.value })}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              {["always","hourly","daily","weekly","monthly","yearly","never"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium mb-1 block">Sitemap priority (0.0 – 1.0)</label>
            <Input value={s.priority || "0.8"} onChange={(e) => update({ priority: e.target.value })} placeholder="0.8" />
          </div>
        </div>
      </div>

      {/* Page-level JSON-LD schemas */}
      <div className="rounded-xl border border-border/60 p-3 space-y-3 bg-secondary/30">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold">Structured data (JSON-LD)</span>
          <Button size="sm" variant="outline" className="ml-auto h-7 text-xs" onClick={addSchema}>
            <Plus className="h-3.5 w-3.5" /> Add schema
          </Button>
        </div>
        {schemas.length === 0 && (
          <p className="text-[11px] text-muted-foreground">No page-level schemas. The page will use the sitewide Organization schema as fallback.</p>
        )}
        {schemas.map((sc: any) => (
          <div key={sc.id} className="rounded-lg border border-border/60 bg-background p-3 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                className="h-8 text-xs flex-1 min-w-[140px]"
                value={sc.name || ""}
                onChange={(e) => updateSchema(sc.id, { name: e.target.value })}
                placeholder="Schema name (internal only)"
              />
              <select
                value={sc.type}
                onChange={(e) => updateSchema(sc.id, { type: e.target.value })}
                className="h-8 px-2 rounded-md border border-input bg-background text-xs"
              >
                {SCHEMA_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="flex items-center gap-1.5">
                <Switch checked={sc.enabled !== false} onCheckedChange={(v) => updateSchema(sc.id, { enabled: v })} />
                <span className="text-[10px]">{sc.enabled !== false ? "On" : "Off"}</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => removeSchema(sc.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
            <Textarea
              rows={4}
              className="font-mono text-[11px]"
              value={sc.json || ""}
              onChange={(e) => updateSchema(sc.id, { json: e.target.value })}
              placeholder='{"headline": "My article", "author": {"@type": "Person", "name": "Jane"}}'
            />
            <p className="text-[10px] text-muted-foreground">
              JSON body only — <code>@context</code> and <code>@type</code> are added automatically.
            </p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
        These tags ship in the <code>&lt;head&gt;</code> of <code className="font-mono">{previewPath}</code>. Draft status hides the page from public navigation and serves a 404 to visitors.
      </p>
    </Card>
  );
};

const AdminDashboard = () => {
  const {
    isAuthed, logout, posts, addPost, updatePost, deletePost,
    content, updateContent, visits,
    seo, updateSeo, appearance, updateAppearance, fontChoices, saveAllNow,
    contact, updateContact, regenerateSitemap, buildSitemap,
    portfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
    addRedirect, updateRedirect, deleteRedirect,
    addSchema, updateSchema, deleteSchema,
    customPages, addCustomPage, updateCustomPage, deleteCustomPage,
    homeSections, addHomeSection, updateHomeSection, deleteHomeSection,
    homeMembership, setHomeMembership,
    pageLocation, setPageLocation,
    sectionGroups, addSectionGroup, updateSectionGroup, deleteSectionGroup,
    updatePageSeo,
    leads, deleteLead, clearLeads,
    visitSeries, pruneOldLeads,
    reviews, approveReview, deleteReview,
    homeBlocks, setHomeBlock,
    homeFaqs, addHomeFaq, updateHomeFaq, deleteHomeFaq,
    serviceFaqs, addServiceFaq, updateServiceFaq, deleteServiceFaq,
    stats, addStat, updateStat, deleteStat,
    trustLogos, addTrustLogo, updateTrustLogo, deleteTrustLogo,
    caseStudies, addCaseStudy, updateCaseStudy, deleteCaseStudy,
    finalCta, updateFinalCta,
    servicePreviews, updateServicePreview,
    serviceContent, updateServiceContent,
    addService, updateService, deleteService,
    processFlow, updateProcessFlow, addProcessFlowStep, updateProcessFlowStep, deleteProcessFlowStep,
  } = useAdmin();
  // Dynamic services list (admin-managed). Falls back to legacy static labels when DB list is empty.
  const adminServicesList = (content.servicesList || []);
  const siteServices: { slug: string; label: string }[] = adminServicesList.length
    ? [...adminServicesList].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((s) => ({ slug: s.slug, label: s.title }))
    : SITE_SERVICES;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<BlogPost, "id">>({
    slug: "", title: "", excerpt: "", category: "SEO",
    author: "AniRise Team", date: new Date().toISOString().slice(0, 10),
    readTime: "5 min", cover: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80", coverAlt: "",
    ctaEnabled: false, ctaLabel: "", ctaUrl: "", body: "",
  });
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [blogMode, setBlogMode] = useState<"simple" | "editor">("simple");
  const [activePage, setActivePage] = useState<string>("hero");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const [wrapWidth, setWrapWidth] = useState(1000);

  useEffect(() => {
    if (!previewWrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWrapWidth(e.contentRect.width);
    });
    ro.observe(previewWrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { document.title = "Admin — AniRise"; }, []);

  const startEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setBlogMode(p.body && p.body.trim().length > 0 ? "editor" : "simple");
    setDraft({ slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, author: p.author, date: p.date, readTime: p.readTime, cover: p.cover, coverAlt: p.coverAlt || "", ctaEnabled: !!p.ctaEnabled, ctaLabel: p.ctaLabel || "", ctaUrl: p.ctaUrl || "", body: p.body || "" });
  };

  const saveDraft = async () => {
    if (!draft.title || !draft.slug) { toast.error("Title and slug are required"); return; }
    const ok = editingId ? await updatePost(editingId, draft) : await addPost(draft);
    if (!ok) { toast.error("Save failed — please log in again and retry"); return; }
    toast.success(editingId ? "Post updated" : "Post created");
    setEditingId(null);
    setBlogMode("simple");
    setDraft({ slug: "", title: "", excerpt: "", category: "SEO", author: "AniRise Team", date: new Date().toISOString().slice(0, 10), readTime: "5 min", cover: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80", coverAlt: "", ctaEnabled: false, ctaLabel: "", ctaUrl: "", body: "" });
  };

  const persistNow = async (message = "Saved — live now") => {
    const tId = toast.loading("Saving…");
    const r = await saveAllNow();
    if (!r.ok) {
      toast.error(`Save failed: ${r.error || "unknown"}`, { id: tId });
      return false;
    }
    toast.success(message, { id: tId });
    return true;
  };

  const saveSitemapNow = async () => {
    updateSeo({ sitemap: seo.sitemap, autoSitemap: false });
    const tId = toast.loading("Saving sitemap…");
    const r = await saveAllNow();
    if (!r.ok) {
      toast.error(`Save failed: ${r.error || "unknown"}`, { id: tId });
      return;
    }
    try {
      await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/sitemap?t=${Date.now()}`, { cache: "no-store" });
    } catch {}
    toast.success("Sitemap saved — live URL refreshed", { id: tId });
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded`);
  };

  const generateSeoReport = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const margin = 48;
    let y = margin;
    const now = new Date();
    const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, W, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("AniRise — Monthly SEO Report", margin, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${monthLabel}  ·  ${seo.canonicalUrl}`, margin, 72);

    y = 130;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Key metrics (last 30 days)", margin, y);
    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const metrics: [string, string][] = [
      ["Total visitors", visits.toLocaleString()],
      ["Estimated page views", Math.round(visits * 2.7).toLocaleString()],
      ["New leads", leads.filter((l) => l.createdAt > Date.now() - 30 * 86400000).length.toString()],
      ["Published posts", posts.length.toString()],
      ["Custom pages", customPages.filter((p) => p.published).length.toString()],
      ["Indexed sitemap URLs", (seo.sitemap.match(/<url>/g) || []).length.toString()],
    ];
    metrics.forEach(([k, v]) => {
      doc.text(k, margin, y);
      doc.setFont("helvetica", "bold");
      doc.text(v, W - margin, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 18;
    });

    y += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Daily visitors — last 14 days", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const max = Math.max(1, ...visitSeries.map((d) => d.visits));
    const barW = (W - margin * 2) / Math.max(1, visitSeries.length) - 4;
    const baseY = y + 90;
    visitSeries.forEach((d, i) => {
      const h = (d.visits / max) * 80;
      const x = margin + i * (barW + 4);
      doc.setFillColor(59, 130, 246);
      doc.rect(x, baseY - h, barW, h, "F");
      doc.setTextColor(100, 116, 139);
      doc.text(d.day, x + barW / 2, baseY + 12, { align: "center" });
    });
    y = baseY + 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SEO configuration", margin, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const wrap = (label: string, val: string) => {
      doc.setFont("helvetica", "bold"); doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(val || "—", W - margin * 2 - 90);
      doc.text(lines, margin + 90, y);
      y += lines.length * 13 + 4;
    };
    wrap("Meta title", seo.metaTitle);
    wrap("Meta description", seo.metaDescription);
    wrap("Keywords", seo.metaKeywords);
    wrap("Canonical URL", seo.canonicalUrl);
    wrap("Active schemas", seo.schemas.filter((s) => s.enabled).map((s) => s.type).join(", "));
    wrap("Active redirects", seo.redirects.filter((r) => r.enabled).length.toString());

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Recommendations", margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const recs = [
      "Publish 2 new blog posts this month targeting long-tail SEO keywords.",
      "Refresh the meta description on top 5 pages with action-oriented copy.",
      "Add internal links from blog posts back to your top service pages.",
      "Request indexing in Google Search Console for any new custom pages.",
      "Review and optimise images > 200KB to improve Core Web Vitals.",
    ];
    recs.forEach((r) => {
      const lines = doc.splitTextToSize(`• ${r}`, W - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 13 + 2;
    });

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated ${now.toLocaleString()} · AniRise`, margin, doc.internal.pageSize.getHeight() - 24);

    doc.save(`anirise-seo-report-${now.toISOString().slice(0, 7)}.pdf`);
    toast.success("SEO report downloaded");
  };

  const allPages = useMemo(
    () => [...SITE_PAGES.map((p) => ({ ...p, isCustom: false as const })),
           ...customPages.map((p) => ({ key: `custom:${p.id}`, label: p.title || p.slug || "Untitled page", isCustom: true as const, id: p.id }))],
    [customPages]
  );

  if (!isAuthed) return <AdminLogin />;

  const renderPageEditor = () => {
    if (activePage === "home-overview" || activePage === "home-order") {
      const builtinLabels: Record<string, string> = {
        hero: "Hero", trustStrip: "Trust strip", stats: "Stats band",
        servicesPreview: "Services preview", about: "About",
        caseStudies: "Case studies", processFlow: "Process flow",
        whyChoose: "Why choose AniRise", strategyCall: "Strategy call",
        homeFaq: "Home FAQ", blog: "Blog", finalCta: "Final CTA",
      };
      const customSecs = homeSections.filter((s) => (s.groupKey ?? "home") === "home");
      const customPg = customPages.filter((p) => (p.groupKey ?? "") === "home");
      const defaultIds = [
        ...DEFAULT_HOME_ORDER,
        ...customSecs.map((s) => `hs:${s.id}`),
        ...customPg.map((p) => `cp:${p.id}`),
      ];
      const saved = Array.isArray(content.homeOrder) ? content.homeOrder : [];
      const ordered = [
        ...saved.filter((id) => defaultIds.includes(id)),
        ...defaultIds.filter((id) => !saved.includes(id)),
      ];
      const labelFor = (id: string) => {
        if (id.startsWith("hs:")) {
          const s = customSecs.find((x) => x.id === id.slice(3));
          return s ? `${s.title || "Untitled"} (custom)` : id;
        }
        if (id.startsWith("cp:")) {
          const p = customPg.find((x) => x.id === id.slice(3));
          return p ? `${p.title || p.slug} (page)` : id;
        }
        return builtinLabels[id] || id;
      };
      const items = ordered.map((id) => ({ id, label: labelFor(id) }));
      return (
        <div className="space-y-6">
          <Card className="p-5 sm:p-6 space-y-3">
            <SectionHeader icon={Layers} title="Home page section order" subtitle="Drag to reorder every block on the home page — built-in, custom sections, and custom pages assigned to home." />
            <SortableList
              items={items}
              onReorder={(next) => updateContent({ homeOrder: next.map((i) => i.id) })}
              renderItem={(item) => (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{item.id}</span>
                </div>
              )}
            />
          </Card>
          <SeoBlock pageKey="home" seo={seo} updatePageSeo={updatePageSeo} onSaveNow={() => persistNow("Home SEO saved — live now")} />
        </div>
      );
    }
    if (activePage.startsWith("custom:")) {
      const id = activePage.slice(7);
      const cp = customPages.find((x) => x.id === id);
      if (!cp) return <p className="text-sm text-muted-foreground">Page not found.</p>;
      const parentOptions = ["", ...SITE_PAGES.map((p) => p.key), ...customPages.filter((x) => x.id !== id).map((x) => x.slug)];
      const cpSeoKey = `custom:${cp.id}`;
      return (
        <div className="space-y-4">
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                  <FileCog className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold leading-tight">Page settings</h3>
                  <p className="text-xs text-muted-foreground">Title, URL & visibility</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                <Switch checked={cp.published} onCheckedChange={(v) => updateCustomPage(cp.id, { published: v })} />
                <span className="text-sm font-medium">{cp.published ? "Published" : "Draft"}</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Page title</label>
                <Input value={cp.title} onChange={(e) => updateCustomPage(cp.id, { title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-foreground/80">URL slug</label>
                <Input value={cp.slug} onChange={(e) => updateCustomPage(cp.id, { slug: e.target.value.replace(/[^a-z0-9-/]/gi, "-").toLowerCase() })} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Parent page</label>
                <Select value={cp.parent || "__root"} onValueChange={(v) => updateCustomPage(cp.id, { parent: v === "__root" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__root">— Root —</SelectItem>
                    {parentOptions.filter(Boolean).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Show in</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { v: "navbar", label: "Top navbar" },
                    { v: "menu", label: "3-dot menu" },
                  ] as const).map((opt) => {
                    const checked = (cp.navLocation || []).includes(opt.v);
                    return (
                      <button
                        type="button"
                        key={opt.v}
                        onClick={() => {
                          const current = cp.navLocation || [];
                          const next = checked ? current.filter((x) => x !== opt.v) : [...current, opt.v];
                          updateCustomPage(cp.id, { navLocation: next });
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          checked ? "bg-accent text-accent-foreground border-accent" : "bg-background border-border text-foreground/70 hover:border-accent/40"
                        }`}
                      >
                        {checked ? "✓ " : ""}{opt.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">Select none = hidden (direct URL only). Select both to show everywhere.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Section group</label>
                <Select value={cp.groupKey || "__standalone"} onValueChange={(v) => updateCustomPage(cp.id, { groupKey: v === "__standalone" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__standalone">— Standalone route —</SelectItem>
                    {sectionGroups.map((g) => <SelectItem key={g.key} value={g.key}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
              Final URL: <span className="font-mono text-foreground">{seo.canonicalUrl}/{cp.parent ? cp.parent + "/" : ""}{cp.slug}</span>
            </div>
            <ImageUpload label="Page image" value={cp.image} onChange={(v) => updateCustomPage(cp.id, { image: v })} aspect="aspect-[16/9]" altValue={cp.imageAlt} onAltChange={(v) => updateCustomPage(cp.id, { imageAlt: v })} />
            <div>
              <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Page description / body</label>
              <Textarea
                rows={6}
                placeholder="Quick plain-text or Markdown body. Use the paragraphs editor below for multi-paragraph layouts with per-paragraph alignment."
                value={cp.body}
                onChange={(e) => updateCustomPage(cp.id, { body: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">If you add paragraphs below, those will be rendered instead of this field.</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <TextBlocksEditor
                value={cp.textBlocks}
                onChange={(next) => updateCustomPage(cp.id, { textBlocks: next })}
                label="Paragraphs (multi-paragraph + alignment)"
                hint="When present, this replaces the description/body field above on the live page."
              />
            </div>
            <div className="flex justify-between pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => { deleteCustomPage(cp.id); setActivePage("hero"); toast.success("Page deleted"); }}>
                <Trash2 className="h-4 w-4 text-destructive" /> Delete page
              </Button>
              <Button variant="hero" size="sm" onClick={() => persistNow("Page saved — live now")}><Save className="h-4 w-4" /> Save</Button>
            </div>
          </Card>

          {(() => {
            const sections = cp.sections || [];
            const metrics = cp.metrics || [];
            const deliverables = cp.deliverables || [];
            const gallery = cp.gallery || [];
            const table = cp.table || { title: "", headers: ["Column 1", "Column 2"], rows: [["", ""]] };
            const chart = cp.chart || { title: "", type: "area" as const, data: [] };
            const updateTable = (patch: Partial<typeof table>) => updateCustomPage(cp.id, { table: { ...table, ...patch } });
            const updateChart = (patch: Partial<typeof chart>) => updateCustomPage(cp.id, { chart: { ...chart, ...patch } });
            return (
              <Card className="p-5 sm:p-6 space-y-5">
                <div>
                  <h4 className="font-bold">Page builder — rich content</h4>
                  <p className="text-xs text-muted-foreground">Add an intro, narrative sections, stat cards, a chart, a table, deliverables, gallery and a CTA. All optional.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Eyebrow (small label above title)">
                    <Input value={cp.eyebrow || ""} onChange={(e) => updateCustomPage(cp.id, { eyebrow: e.target.value })} placeholder="e.g. Service · 2025" />
                  </Field>
                  <Field label="CTA label">
                    <Input value={cp.ctaLabel || ""} onChange={(e) => updateCustomPage(cp.id, { ctaLabel: e.target.value })} placeholder="e.g. Book a free call" />
                  </Field>
                  <Field label="CTA link">
                    <Input value={cp.ctaUrl || ""} onChange={(e) => updateCustomPage(cp.id, { ctaUrl: e.target.value })} placeholder="https://... or /contact" />
                  </Field>
                </div>

                <Field label="Intro paragraph (shows under the title)">
                  <Textarea rows={3} value={cp.intro || ""} onChange={(e) => updateCustomPage(cp.id, { intro: e.target.value })} placeholder="One short paragraph summarising the page." />
                </Field>

                {/* Sections */}
                <div className="space-y-2 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Narrative sections</p>
                    <Button size="sm" variant="outline" onClick={() => updateCustomPage(cp.id, { sections: [...sections, { id: `s${Date.now()}`, title: "New section", body: "" }] })}><Plus className="h-3 w-3" /> Add section</Button>
                  </div>
                  {sections.map((s, idx) => (
                    <div key={s.id} className="space-y-2 p-3 rounded-lg border border-border/50">
                      <div className="flex gap-2">
                        <Input value={s.title} onChange={(e) => { const next = [...sections]; next[idx] = { ...s, title: e.target.value }; updateCustomPage(cp.id, { sections: next }); }} placeholder="Section title" className="font-semibold" />
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateCustomPage(cp.id, { sections: sections.filter((x) => x.id !== s.id) })}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <Textarea rows={3} value={s.body} onChange={(e) => { const next = [...sections]; next[idx] = { ...s, body: e.target.value }; updateCustomPage(cp.id, { sections: next }); }} placeholder="Section body (single block). Use paragraphs editor below for multi-paragraph + alignment." />
                      <TextBlocksEditor
                        value={s.textBlocks}
                        onChange={(tb) => { const next = [...sections]; next[idx] = { ...s, textBlocks: tb }; updateCustomPage(cp.id, { sections: next }); }}
                        label="Paragraphs"
                        hint="Optional. When set, replaces the single body field above."
                      />
                    </div>
                  ))}
                </div>

                {/* Metrics */}
                <div className="space-y-2 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Stat cards</p>
                    <Button size="sm" variant="outline" onClick={() => updateCustomPage(cp.id, { metrics: [...metrics, { id: `m${Date.now()}`, label: "New metric", value: "+0%" }] })}><Plus className="h-3 w-3" /> Add stat</Button>
                  </div>
                  {metrics.map((m, idx) => (
                    <div key={m.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input value={m.value} onChange={(e) => { const next = [...metrics]; next[idx] = { ...m, value: e.target.value }; updateCustomPage(cp.id, { metrics: next }); }} placeholder="Value (+180%)" />
                      <Input value={m.label} onChange={(e) => { const next = [...metrics]; next[idx] = { ...m, label: e.target.value }; updateCustomPage(cp.id, { metrics: next }); }} placeholder="Label" />
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateCustomPage(cp.id, { metrics: metrics.filter((x) => x.id !== m.id) })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="space-y-2 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Chart</p>
                    <div className="flex items-center gap-2">
                      <select className="text-xs rounded-md border border-input bg-background px-2 py-1" value={chart.type} onChange={(e) => updateChart({ type: e.target.value as "area" | "bar" })}>
                        <option value="area">Area</option>
                        <option value="bar">Bar</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => updateChart({ data: [...chart.data, { id: `p${Date.now()}`, label: "New", value: 0 }] })}><Plus className="h-3 w-3" /> Add point</Button>
                    </div>
                  </div>
                  <Input value={chart.title || ""} onChange={(e) => updateChart({ title: e.target.value })} placeholder="Chart title" />
                  {chart.data.map((pt, idx) => (
                    <div key={pt.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input value={pt.label} onChange={(e) => { const next = [...chart.data]; next[idx] = { ...pt, label: e.target.value }; updateChart({ data: next }); }} placeholder="Label" />
                      <Input type="number" value={pt.value} onChange={(e) => { const next = [...chart.data]; next[idx] = { ...pt, value: Number(e.target.value) }; updateChart({ data: next }); }} placeholder="Value" />
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateChart({ data: chart.data.filter((x) => x.id !== pt.id) })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="space-y-2 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Data table</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateTable({ headers: [...table.headers, "Col"], rows: table.rows.map((r) => [...r, ""]) })}><Plus className="h-3 w-3" /> Column</Button>
                      <Button size="sm" variant="outline" onClick={() => updateTable({ rows: [...table.rows, table.headers.map(() => "")] })}><Plus className="h-3 w-3" /> Row</Button>
                    </div>
                  </div>
                  <Input value={table.title || ""} onChange={(e) => updateTable({ title: e.target.value })} placeholder="Table title" />
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${table.headers.length}, minmax(0,1fr)) auto` }}>
                    {table.headers.map((h, i) => (
                      <Input key={`h${i}`} value={h} onChange={(e) => { const next = [...table.headers]; next[i] = e.target.value; updateTable({ headers: next }); }} placeholder={`Header ${i + 1}`} className="font-semibold" />
                    ))}
                    <div />
                    {table.rows.map((row, ri) => (
                      <Fragment key={`r${ri}`}>
                        {table.headers.map((_, ci) => (
                          <Input key={`r${ri}c${ci}`} value={row[ci] || ""} onChange={(e) => { const next = table.rows.map((r) => [...r]); next[ri][ci] = e.target.value; updateTable({ rows: next }); }} placeholder="..." />
                        ))}
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateTable({ rows: table.rows.filter((_, i) => i !== ri) })}><Trash2 className="h-4 w-4" /></Button>
                      </Fragment>
                    ))}
                  </div>
                  {table.headers.length > 1 && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateTable({ headers: table.headers.slice(0, -1), rows: table.rows.map((r) => r.slice(0, -1)) })}><Trash2 className="h-3 w-3" /> Remove last column</Button>
                  )}
                </div>

                {/* Deliverables / checklist */}
                <div className="space-y-2 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Checklist / "What's included"</p>
                    <Button size="sm" variant="outline" onClick={() => updateCustomPage(cp.id, { deliverables: [...deliverables, ""] })}><Plus className="h-3 w-3" /> Add item</Button>
                  </div>
                  {deliverables.map((d, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={d} onChange={(e) => { const next = [...deliverables]; next[idx] = e.target.value; updateCustomPage(cp.id, { deliverables: next }); }} placeholder="e.g. Monthly performance report" />
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateCustomPage(cp.id, { deliverables: deliverables.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                {/* Gallery */}
                <div className="space-y-2 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Gallery images</p>
                    <Button size="sm" variant="outline" onClick={() => updateCustomPage(cp.id, { gallery: [...gallery, { id: `g${Date.now()}`, image: "", alt: "" }] })}><Plus className="h-3 w-3" /> Add image</Button>
                  </div>
                  {gallery.map((g, idx) => (
                    <div key={g.id} className="space-y-2 p-3 rounded-lg border border-border/50">
                      <ImageUpload value={g.image} onChange={(v) => { const next = [...gallery]; next[idx] = { ...g, image: v }; updateCustomPage(cp.id, { gallery: next }); }} aspect="aspect-[4/3]" altValue={g.alt} onAltChange={(v) => { const next = [...gallery]; next[idx] = { ...g, alt: v }; updateCustomPage(cp.id, { gallery: next }); }} />
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateCustomPage(cp.id, { gallery: gallery.filter((x) => x.id !== g.id) })}><Trash2 className="h-3 w-3" /> Remove image</Button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}

          <Card className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Search className="h-4 w-4" />
              <h4 className="font-bold">Page SEO</h4>
              <span className="text-[11px] text-muted-foreground">/{cp.parent ? cp.parent + "/" : ""}{cp.slug}</span>
              <Button size="sm" variant="hero" className="ml-auto" onClick={() => persistNow(`SEO saved for /${cp.slug} — live now`)}>
                <Save className="h-4 w-4" /> Save SEO
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground -mt-1">These tags ship in the <code>&lt;head&gt;</code> of this page so Google can rank it correctly.</p>
            <div>
              <label className="text-xs font-medium mb-1 block">Meta title <span className={(cp.seo?.metaTitle?.length || 0) > 60 ? "text-destructive" : "text-muted-foreground"}>({cp.seo?.metaTitle?.length || 0}/60)</span></label>
              <Input value={cp.seo?.metaTitle || ""} onChange={(e) => updateCustomPage(cp.id, { seo: { ...(cp.seo || { metaTitle: "", metaDescription: "", metaKeywords: "" }), metaTitle: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Meta description <span className={(cp.seo?.metaDescription?.length || 0) > 160 ? "text-destructive" : "text-muted-foreground"}>({cp.seo?.metaDescription?.length || 0}/160)</span></label>
              <Textarea rows={3} value={cp.seo?.metaDescription || ""} onChange={(e) => updateCustomPage(cp.id, { seo: { ...(cp.seo || { metaTitle: "", metaDescription: "", metaKeywords: "" }), metaDescription: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Meta keywords <span className="text-muted-foreground">(optional)</span></label>
              <Input value={cp.seo?.metaKeywords || ""} onChange={(e) => updateCustomPage(cp.id, { seo: { ...(cp.seo || { metaTitle: "", metaDescription: "", metaKeywords: "" }), metaKeywords: e.target.value } })} />
            </div>
          </Card>
        </div>
      );
    }

    // Home builder block editors (sub-pages of the Home page)
    if (activePage.startsWith("hb:")) {
      const blockKey = activePage.slice(3) as typeof HOME_BLOCKS[number]["key"];
      const meta = HOME_BLOCKS.find((b) => b.key === blockKey);
      if (!meta) return <p className="text-sm text-muted-foreground">Block not found.</p>;
      const enabledToggle = (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
          <Switch checked={homeBlocks[blockKey]} onCheckedChange={(v) => { setHomeBlock(blockKey, v); toast.success("Updated"); }} />
          <span className="text-sm font-medium">{homeBlocks[blockKey] ? "Visible" : "Hidden"}</span>
        </div>
      );

      const wrap = (subtitle: string, children: React.ReactNode) => (
        <Card className="p-5 sm:p-6 space-y-4">
          <SectionHeader icon={Layers} title={meta.label} subtitle={subtitle} action={enabledToggle} />
          {children}
        </Card>
      );


      if (blockKey === "trustStrip") return wrap("Client logos / brand names marquee on the home page.", <>
        <div className="p-3 rounded-xl border border-border/60 bg-card space-y-2">
          <p className="text-sm font-semibold text-foreground">Navbar top bar</p>
          <p className="text-xs text-muted-foreground">Shown at the very top of every page, next to the phone number. Leave both empty to hide.</p>
          <div className="grid sm:grid-cols-2 gap-2">
            <Input placeholder="Label (e.g. Revenue Driven for our clients)" value={(content as any).topBarLabel || ""} onChange={(e) => updateContent({ topBarLabel: e.target.value } as any)} />
            <Input placeholder="Value (e.g. $10,000+)" value={(content as any).topBarValue || ""} onChange={(e) => updateContent({ topBarValue: e.target.value } as any)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { addTrustLogo({ name: "New Brand", image: "" }); toast.success("Logo added"); }}><Plus className="h-4 w-4" /> Add logo</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {trustLogos.map((t) => (
            <div key={t.id} className="p-3 rounded-xl border border-border/60 bg-card space-y-2">
              <Input placeholder="Brand name" value={t.name} onChange={(e) => updateTrustLogo(t.id, { name: e.target.value })} />
              <ImageUpload value={t.image} onChange={(url) => updateTrustLogo(t.id, { image: url })} />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTrustLogo(t.id)}><Trash2 className="h-4 w-4" /> Remove</Button>
            </div>
          ))}
        </div>
      </>);

      if (blockKey === "stats") return wrap('Boro number gula (e.g. "15+" / "Projects Delivered").', <>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { addStat({ value: "0+", label: "New metric" }); toast.success("Stat added"); }}><Plus className="h-4 w-4" /> Add stat</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.id} className="p-3 rounded-xl border border-border/60 bg-card grid grid-cols-[100px_1fr_auto] gap-2 items-center">
              <Input value={s.value} onChange={(e) => updateStat(s.id, { value: e.target.value })} placeholder="Value" />
              <Input value={s.label} onChange={(e) => updateStat(s.id, { label: e.target.value })} placeholder="Label" />
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteStat(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </>);

      if (blockKey === "servicesPreview") return wrap("Auto-scrolling services cards on home. Edit each card's image, title and description.", <>
        <p className="text-sm text-muted-foreground">Section title/intro is edited on the <button className="text-accent underline" onClick={() => setActivePage("services")}>Services page</button>. Leave title/description empty to use the defaults.</p>
        <div className="space-y-3">
          {siteServices.map((s) => {
            const sp = servicePreviews[s.slug] || { image: "", imageAlt: "", title: "", desc: "" };
            return (
              <div key={s.slug} className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{s.label}</p>
                  <span className="text-xs text-muted-foreground">/{s.slug}</span>
                </div>
                <ImageUpload value={sp.image} onChange={(url) => updateServicePreview(s.slug, { image: url })} />
                <Input value={sp.imageAlt || ""} onChange={(e) => updateServicePreview(s.slug, { imageAlt: e.target.value })} placeholder="Image alt text (for SEO)" />
                <Input value={sp.title || ""} onChange={(e) => updateServicePreview(s.slug, { title: e.target.value })} placeholder={`Card title (default: ${s.label})`} />
                <LinkableTextarea
                  label="Card paragraph"
                  rows={8}
                  value={sp.desc || ""}
                  onChange={(v) => updateServicePreview(s.slug, { desc: v })}
                  placeholder="Full paragraph shown in the Services page deep-dive section. Supports Markdown: **bold**, [link](https://...), etc."
                />
                <p className="text-xs text-muted-foreground">This paragraph also appears next to the image on the Services page. Leave empty to fall back to the card description.</p>
              </div>
            );
          })}
        </div>
      </>);

      if (blockKey === "caseStudies") return wrap("Each card opens its own case study page (/case-studies/:id) with intro, stats, chart, table & more.", <CaseStudiesEditor />);



      if (blockKey === "homeFaq") return wrap("Brand/general questions on the home page.", <>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { addHomeFaq({ question: "New question?", answer: "Answer..." }); toast.success("Added"); }}><Plus className="h-4 w-4" /> Add FAQ</Button>
        </div>
        <div className="space-y-3">
          {homeFaqs.map((f) => (
            <div key={f.id} className="p-3 rounded-xl border border-border/60 bg-card space-y-2">
              <Input value={f.question} onChange={(e) => updateHomeFaq(f.id, { question: e.target.value })} placeholder="Question" />
              <Textarea value={f.answer} onChange={(e) => updateHomeFaq(f.id, { answer: e.target.value })} placeholder="Answer" rows={2} />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteHomeFaq(f.id)}><Trash2 className="h-4 w-4" /> Remove</Button>
            </div>
          ))}
        </div>
      </>);

      if (blockKey === "finalCta") return wrap("Bottom-of-page banner with primary + secondary CTAs.", <>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Field label="Headline"><Input value={finalCta.headline} onChange={(e) => updateFinalCta({ headline: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Subline"><Textarea rows={2} value={finalCta.subline} onChange={(e) => updateFinalCta({ subline: e.target.value })} /></Field></div>
          <Field label="Primary button label"><Input value={finalCta.primaryLabel} onChange={(e) => updateFinalCta({ primaryLabel: e.target.value })} /></Field>
          <Field label="Primary button URL"><Input value={finalCta.primaryUrl} onChange={(e) => updateFinalCta({ primaryUrl: e.target.value })} /></Field>
          <Field label="Secondary button label"><Input value={finalCta.secondaryLabel} onChange={(e) => updateFinalCta({ secondaryLabel: e.target.value })} /></Field>
          <Field label="Secondary button URL"><Input value={finalCta.secondaryUrl} onChange={(e) => updateFinalCta({ secondaryUrl: e.target.value })} /></Field>
        </div>
      </>);

      return null;
    }

    // Service page editors
    if (activePage.startsWith("svc:")) {
      const slug = activePage.slice(4);
      const svc = siteServices.find((s) => s.slug === slug);
      if (!svc) return <p className="text-sm text-muted-foreground">Service not found.</p>;
      const adminSvc = adminServicesList.find((s) => s.slug === slug);
      const urlSlugVal = adminSvc?.urlSlug ?? "";
      const publicTail = (urlSlugVal.trim() || slug);
      const faqs = serviceFaqs[slug] || [];
      return (
        <div className="space-y-4">
          <Card className="p-5 sm:p-6 space-y-4">
            <SectionHeader
              icon={Layers}
              title={svc.label}
              subtitle={`Service page — /services/${publicTail}`}
              action={
                <Button asChild variant="outline" size="sm"><Link to={`/services/${publicTail}`} target="_blank"><ArrowRight className="h-4 w-4" /> View page</Link></Button>
              }
            />
            {adminSvc ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Card title">
                  <Input value={adminSvc.title} onChange={(e) => updateService(adminSvc.id, { title: e.target.value })} />
                </Field>
                <Field label="Icon (lucide)">
                  <Select value={adminSvc.iconName || "Sparkles"} onValueChange={(v) => updateService(adminSvc.id, { iconName: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[260px]">
                      {SERVICE_ICON_CHOICES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <LinkableTextarea
                    label="Card paragraph (shown on Services overview card)"
                    rows={6}
                    value={adminSvc.desc}
                    onChange={(v) => updateService(adminSvc.id, { desc: v })}
                    placeholder="Full paragraph that appears on the service card. Write as long as you need."
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <Switch checked={adminSvc.published !== false} onCheckedChange={(v) => updateService(adminSvc.id, { published: v })} />
                    <span className="text-sm font-medium">{adminSvc.published !== false ? "Published" : "Draft"}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (!confirm(`Delete service "${adminSvc.title}"? Its page and content stay in the DB but become unreachable.`)) return;
                    deleteService(adminSvc.id);
                    setActivePage("services");
                    toast.success("Service deleted");
                  }}><Trash2 className="h-4 w-4 text-destructive" /> Delete service</Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Legacy service — edit title/desc/icon by adding it to the admin Services list (use “+ Add service”).</p>
            )}
            <p className="text-sm text-muted-foreground">Edit every text, stat, process step, deliverable, chart bar and CTA shown on this service page. FAQ is at the bottom.</p>
          </Card>

          <SeoBlock
            pageKey={`svc:${slug}`}
            seo={seo}
            updatePageSeo={updatePageSeo}
            defaultPath={`/services/${slug}`}
            slugPrefix={adminSvc ? "/services/" : undefined}
            disableSlug={!adminSvc}
            externalSlug={adminSvc ? urlSlugVal : undefined}
            onExternalSlugChange={adminSvc ? (next) => updateService(adminSvc.id, { urlSlug: next }) : undefined}
          />


          <ServiceContentEditor
            slug={slug}
            content={serviceContent[slug] ?? { enabled: true, heroEyebrow: svc.label, heroHeadlineBefore: svc.label, heroHeadlineAccent: "", heroBlurb: "", heroPrimaryLabel: "", heroPrimaryUrl: "/#contact", heroSecondaryLabel: "", heroSecondaryUrl: "#process", stats: [], whyEyebrow: "", whyTitle: "", whyCards: [], processEyebrow: "", processTitle: "", processSteps: [], deliverablesEyebrow: "", deliverablesTitle: "", deliverablesBlurb: "", deliverables: [], chart: { enabled: false, eyebrow: "", title: "", subtitle: "", bars: [] }, ctaHeadline: "", ctaBlurb: "", ctaLabel: "", ctaUrl: "/#contact" }}
            onChange={(patch) => updateServiceContent(slug, patch)}
          />

          {/* Section reorder (drag) for this service's internal sections */}
          {(() => {
            const sc = serviceContent[slug];
            const saved = (sc?.sectionOrder || []).filter((id) =>
              (SERVICE_SECTION_IDS as readonly string[]).includes(id),
            ) as ServiceSectionId[];
            const ordered: ServiceSectionId[] = [
              ...saved,
              ...SERVICE_SECTION_IDS.filter((id) => !saved.includes(id)),
            ];
            const items = ordered.map((id) => ({ id, label: SERVICE_SECTION_LABELS[id] }));
            return (
              <Card className="p-5 sm:p-6 space-y-3">
                <SectionHeader icon={Layers} title="Service section order" subtitle="Drag to reorder internal sections on this service page." />
                <SortableList
                  items={items}
                  onReorder={(next) => updateServiceContent(slug, { sectionOrder: next.map((i) => i.id) } as any)}
                  renderItem={(item) => (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium truncate">{item.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{item.id}</span>
                    </div>
                  )}
                />
              </Card>
            );
          })()}

          {/* Deep-dive zigzag paragraph + image for this service (also used on /services page) */}
          <Card className="p-5 sm:p-6 space-y-3">
            <SectionHeader icon={FileEdit} title="Deep-dive paragraph (Services page)" subtitle="Image + long paragraph shown in the zigzag section on /services and as the side image/paragraph next to this service." />
            {(() => {
              const sp = servicePreviews[slug] || { image: "", imageAlt: "", title: "", desc: "" };
              return (
                <div className="space-y-3">
                  <ImageUpload value={sp.image} onChange={(url) => updateServicePreview(slug, { image: url })} />
                  <Input value={sp.imageAlt || ""} onChange={(e) => updateServicePreview(slug, { imageAlt: e.target.value })} placeholder="Image alt text (for SEO)" />
                  <Input value={sp.title || ""} onChange={(e) => updateServicePreview(slug, { title: e.target.value })} placeholder={`Heading override (default: ${svc.label})`} />
                  <LinkableTextarea
                    label="Deep-dive paragraph"
                    rows={10}
                    value={sp.desc || ""}
                    onChange={(v) => updateServicePreview(slug, { desc: v })}
                    placeholder="Full paragraph shown in the Services page deep-dive section. Supports Markdown: **bold**, [link](https://...), lists, etc."
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to fall back to the card paragraph above.</p>
                </div>
              );
            })()}
          </Card>

          {/* Per-service paragraph note */}
          <Card className="p-5 sm:p-6 space-y-3">
            <SectionHeader icon={FileEdit} title="Page paragraph" subtitle="Optional heading + paragraph at the bottom of this service page." />
            <SectionNoteEditor noteId={`svc:${slug}`} label="Paragraph for this service page" />
          </Card>



          <Card className="p-5 sm:p-6 space-y-4">
            <SectionHeader
              icon={FileText}
              title="Service FAQ"
              subtitle={`${faqs.length} question${faqs.length === 1 ? "" : "s"}`}
              action={
                <Button size="sm" onClick={() => { addServiceFaq(slug, { question: "New question?", answer: "Answer..." }); toast.success("Added"); }}><Plus className="h-4 w-4" /> Add FAQ</Button>
              }
            />
            <div className="space-y-3">
              {faqs.map((f) => (
                <div key={f.id} className="p-3 rounded-xl border border-border/60 bg-card space-y-2">
                  <Input value={f.question} onChange={(e) => updateServiceFaq(slug, f.id, { question: e.target.value })} placeholder="Question" />
                  <Textarea value={f.answer} onChange={(e) => updateServiceFaq(slug, f.id, { answer: e.target.value })} placeholder="Answer" rows={2} />
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteServiceFaq(slug, f.id)}><Trash2 className="h-4 w-4" /> Remove</Button>
                </div>
              ))}
              {!faqs.length && <p className="text-xs text-muted-foreground">No FAQs yet. Add one to get started.</p>}
            </div>
          </Card>
        </div>
      );
    }

    // Individual project editor
    if (activePage.startsWith("proj:")) {
      const pid = activePage.slice(5);
      const it = portfolio.find((x) => x.id === pid);
      if (!it) return <p className="text-sm text-muted-foreground">Project not found.</p>;
      const metrics = it.metrics || [];
      const deliverables = it.deliverables || [];
      const techStack = it.techStack || [];
      const gallery = it.gallery || [];
      const table = it.table || { title: "", headers: ["Metric", "Before", "After"], rows: [["", "", ""]] };
      const chart = it.chart || { title: "", type: "area" as const, data: [] };
      const updateTable = (patch: Partial<typeof table>) => updatePortfolioItem(it.id, { table: { ...table, ...patch } });
      const updateChart = (patch: Partial<typeof chart>) => updatePortfolioItem(it.id, { chart: { ...chart, ...patch } });
      return (
        <div className="space-y-4">
          <Card className="p-5 sm:p-6 space-y-5">
            <SectionHeader
              icon={ImgIcon}
              title={it.title || "Untitled project"}
              subtitle={`Project detail page — /portfolio/${(it.slug?.trim() || it.id)}`}
              action={<Button asChild variant="outline" size="sm"><Link to={`/portfolio/${it.slug?.trim() || it.id}`} target="_blank"><ArrowRight className="h-4 w-4" /> View page</Link></Button>}
            />

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Title"><Input value={it.title} onChange={(e) => updatePortfolioItem(it.id, { title: e.target.value })} /></Field>
              <Field label="Tag (badge on card)"><Input value={it.tag} onChange={(e) => updatePortfolioItem(it.id, { tag: e.target.value })} /></Field>
              <Field label="Category (for filter tabs)">
                <Select value={it.category || ""} onValueChange={(v) => updatePortfolioItem(it.id, { category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Eyebrow (small label above title)"><Input value={it.eyebrow || ""} onChange={(e) => updatePortfolioItem(it.id, { eyebrow: e.target.value })} placeholder="e.g. Shopify · Fashion retail" /></Field>
              <Field label="Live URL (optional)"><Input value={it.liveUrl || ""} onChange={(e) => updatePortfolioItem(it.id, { liveUrl: e.target.value })} placeholder="https://..." /></Field>
              <Field label="Client"><Input value={it.client || ""} onChange={(e) => updatePortfolioItem(it.id, { client: e.target.value })} /></Field>
              <Field label="Role"><Input value={it.role || ""} onChange={(e) => updatePortfolioItem(it.id, { role: e.target.value })} placeholder="e.g. Lead SEO & CRO partner" /></Field>
              <Field label="Timeline"><Input value={it.timeline || ""} onChange={(e) => updatePortfolioItem(it.id, { timeline: e.target.value })} placeholder="e.g. 10 weeks" /></Field>
            </div>

            <ImageUpload label="Cover image" value={it.image} onChange={(v) => updatePortfolioItem(it.id, { image: v })} aspect="aspect-[4/3]" altValue={it.imageAlt} onAltChange={(v) => updatePortfolioItem(it.id, { imageAlt: v })} />

            <Field label="Short description (card + summary)">
              <Textarea rows={2} value={it.description || ""} onChange={(e) => updatePortfolioItem(it.id, { description: e.target.value })} />
            </Field>
            <Field label="Intro / lead paragraph (big text under title)">
              <Textarea rows={3} value={it.intro || ""} onChange={(e) => updatePortfolioItem(it.id, { intro: e.target.value })} />
            </Field>

            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Overview"><Textarea rows={5} value={it.overview || ""} onChange={(e) => updatePortfolioItem(it.id, { overview: e.target.value })} /></Field>
              <Field label="Approach"><Textarea rows={5} value={it.approach || ""} onChange={(e) => updatePortfolioItem(it.id, { approach: e.target.value })} /></Field>
              <Field label="Outcome"><Textarea rows={5} value={it.outcome || ""} onChange={(e) => updatePortfolioItem(it.id, { outcome: e.target.value })} /></Field>
            </div>

            {/* Tech stack */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Tech stack (chips)</p>
                <Button size="sm" variant="outline" onClick={() => updatePortfolioItem(it.id, { techStack: [...techStack, ""] })}><Plus className="h-3 w-3" /> Add tech</Button>
              </div>
              {techStack.map((t, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={t} onChange={(e) => { const next = [...techStack]; next[idx] = e.target.value; updatePortfolioItem(it.id, { techStack: next }); }} placeholder="e.g. Next.js" />
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updatePortfolioItem(it.id, { techStack: techStack.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            {/* Deliverables */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Deliverables (checklist)</p>
                <Button size="sm" variant="outline" onClick={() => updatePortfolioItem(it.id, { deliverables: [...deliverables, ""] })}><Plus className="h-3 w-3" /> Add item</Button>
              </div>
              {deliverables.map((d, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={d} onChange={(e) => { const next = [...deliverables]; next[idx] = e.target.value; updatePortfolioItem(it.id, { deliverables: next }); }} placeholder="e.g. Figma design system" />
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updatePortfolioItem(it.id, { deliverables: deliverables.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Metric cards (big numbers)</p>
                <Button size="sm" variant="outline" onClick={() => updatePortfolioItem(it.id, { metrics: [...metrics, { id: `m${Date.now()}`, label: "New metric", value: "+0%" }] })}><Plus className="h-3 w-3" /> Add metric</Button>
              </div>
              {metrics.map((s, idx) => (
                <div key={s.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input value={s.value} onChange={(e) => { const next = [...metrics]; next[idx] = { ...s, value: e.target.value }; updatePortfolioItem(it.id, { metrics: next }); }} placeholder="Value (+180%)" />
                  <Input value={s.label} onChange={(e) => { const next = [...metrics]; next[idx] = { ...s, label: e.target.value }; updatePortfolioItem(it.id, { metrics: next }); }} placeholder="Label" />
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updatePortfolioItem(it.id, { metrics: metrics.filter((x) => x.id !== s.id) })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Chart</p>
                <div className="flex items-center gap-2">
                  <select className="text-xs rounded-md border border-input bg-background px-2 py-1" value={chart.type} onChange={(e) => updateChart({ type: e.target.value as "area" | "bar" })}>
                    <option value="area">Area</option>
                    <option value="bar">Bar</option>
                  </select>
                  <Button size="sm" variant="outline" onClick={() => updateChart({ data: [...chart.data, { id: `p${Date.now()}`, label: "New", value: 0 }] })}><Plus className="h-3 w-3" /> Add point</Button>
                </div>
              </div>
              <Input value={chart.title || ""} onChange={(e) => updateChart({ title: e.target.value })} placeholder="Chart title" />
              {chart.data.map((pt, idx) => (
                <div key={pt.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input value={pt.label} onChange={(e) => { const next = [...chart.data]; next[idx] = { ...pt, label: e.target.value }; updateChart({ data: next }); }} placeholder="Label" />
                  <Input type="number" value={pt.value} onChange={(e) => { const next = [...chart.data]; next[idx] = { ...pt, value: Number(e.target.value) }; updateChart({ data: next }); }} placeholder="Value" />
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateChart({ data: chart.data.filter((x) => x.id !== pt.id) })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Comparison table</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateTable({ headers: [...table.headers, "Col"], rows: table.rows.map((r) => [...r, ""]) })}><Plus className="h-3 w-3" /> Column</Button>
                  <Button size="sm" variant="outline" onClick={() => updateTable({ rows: [...table.rows, table.headers.map(() => "")] })}><Plus className="h-3 w-3" /> Row</Button>
                </div>
              </div>
              <Input value={table.title || ""} onChange={(e) => updateTable({ title: e.target.value })} placeholder="Table title" />
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${table.headers.length}, minmax(0,1fr)) auto` }}>
                {table.headers.map((h, i) => (
                  <Input key={`h${i}`} value={h} onChange={(e) => { const next = [...table.headers]; next[i] = e.target.value; updateTable({ headers: next }); }} placeholder={`Header ${i + 1}`} className="font-semibold" />
                ))}
                <div />
                {table.rows.map((row, ri) => (
                  <Fragment key={`r${ri}`}>
                    {table.headers.map((_, ci) => (
                      <Input key={`r${ri}c${ci}`} value={row[ci] || ""} onChange={(e) => { const next = table.rows.map((r) => [...r]); next[ri][ci] = e.target.value; updateTable({ rows: next }); }} placeholder="..." />
                    ))}
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateTable({ rows: table.rows.filter((_, i) => i !== ri) })}><Trash2 className="h-4 w-4" /></Button>
                  </Fragment>
                ))}
              </div>
              {table.headers.length > 1 && (
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateTable({ headers: table.headers.slice(0, -1), rows: table.rows.map((r) => r.slice(0, -1)) })}><Trash2 className="h-3 w-3" /> Remove last column</Button>
              )}
            </div>

            {/* Gallery */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Gallery images</p>
                <Button size="sm" variant="outline" onClick={() => updatePortfolioItem(it.id, { gallery: [...gallery, { id: `g${Date.now()}`, image: "", alt: "" }] })}><Plus className="h-3 w-3" /> Add image</Button>
              </div>
              {gallery.map((g, idx) => (
                <div key={g.id} className="space-y-2 p-3 rounded-lg border border-border/50">
                  <ImageUpload value={g.image} onChange={(v) => { const next = [...gallery]; next[idx] = { ...g, image: v }; updatePortfolioItem(it.id, { gallery: next }); }} aspect="aspect-[4/3]" altValue={g.alt} onAltChange={(v) => { const next = [...gallery]; next[idx] = { ...g, alt: v }; updatePortfolioItem(it.id, { gallery: next }); }} />
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updatePortfolioItem(it.id, { gallery: gallery.filter((x) => x.id !== g.id) })}><Trash2 className="h-3 w-3" /> Remove image</Button>
                </div>
              ))}
            </div>

            <Field label="Extra long-form content (optional, appended at the bottom)">
              <Textarea rows={6} placeholder="Plain text or basic Markdown." value={it.body || ""} onChange={(e) => updatePortfolioItem(it.id, { body: e.target.value })} />
            </Field>

            <div className="flex justify-end pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => { deletePortfolioItem(it.id); setActivePage("portfolio"); toast.success("Project deleted"); }}>
                <Trash2 className="h-4 w-4 text-destructive" /> Delete project
              </Button>
            </div>
          </Card>

          {/* Per-project paragraph note */}
          <Card className="p-5 sm:p-6 space-y-3">
            <SectionHeader icon={FileEdit} title="Page paragraph" subtitle="Optional heading + paragraph at the bottom of this project detail page." />
            <SectionNoteEditor noteId={`proj:${it.id}`} label="Paragraph for this project page" />
          </Card>

          <SeoBlock
            pageKey={`proj:${it.id}`}
            seo={seo}
            updatePageSeo={updatePageSeo}
            defaultPath={`/portfolio/${it.id}`}
            slugPrefix="/portfolio/"
            externalSlug={it.slug || ""}
            onExternalSlugChange={(next) => updatePortfolioItem(it.id, { slug: next })}
          />


        </div>
      );
    }

    const builtInPages: Record<string, { icon: any; title: string; subtitle: string; fields: { label: string; key: string; multiline?: boolean }[]; image?: { label: string; key: string; altKey: string; aspect: string } }> = {
      hero: {
        icon: Sparkles, title: "Hero section", subtitle: "Top-of-page headline and intro",
        fields: [
          { label: "Eyebrow", key: "heroEyebrow" },
          { label: "Headline", key: "heroHeadline" },
          { label: "Tagline", key: "heroTagline", multiline: true },
          { label: "Hero video URL (YouTube embed or .mp4)", key: "heroVideoUrl" },
          { label: "Video title (SEO)", key: "heroVideoTitle" },
          { label: "Video description (SEO)", key: "heroVideoDescription", multiline: true },
        ],
        image: { label: "Hero image", key: "heroImage", altKey: "heroImageAlt", aspect: "aspect-square" },
      },
      services: {
        icon: Layers, title: "Services section", subtitle: "What we offer",
        fields: [
          { label: "Title", key: "servicesTitle" },
          { label: "Intro", key: "servicesBlurb", multiline: true },
        ],
        image: { label: "Section image", key: "servicesImage", altKey: "servicesImageAlt", aspect: "aspect-[16/9]" },
      },
      about: {
        icon: Users, title: "About section", subtitle: "Who we are",
        fields: [
          { label: "Eyebrow (small uppercase tag)", key: "aboutEyebrow" },
          { label: "Headline", key: "aboutHeadline" },
          { label: "Blurb", key: "aboutBlurb", multiline: true },
          { label: "Stat value (e.g. 100%)", key: "aboutStatValue" },
          { label: "Stat label (e.g. Client Focused)", key: "aboutStatLabel" },
        ],
        image: { label: "About image", key: "aboutImage", altKey: "aboutImageAlt", aspect: "aspect-square" },
      },
      portfolio: {
        icon: ImgIcon, title: "Portfolio section", subtitle: "Recent work intro",
        fields: [
          { label: "Title", key: "portfolioTitle" },
          { label: "Blurb", key: "portfolioBlurb", multiline: true },
        ],
        image: { label: "Section image", key: "portfolioImage", altKey: "portfolioImageAlt", aspect: "aspect-[16/9]" },
      },
      blog: {
        icon: FileText, title: "Blog section copy", subtitle: "Intro shown above blog cards",
        fields: [
          { label: "Title", key: "blogTitle" },
          { label: "Blurb", key: "blogBlurb", multiline: true },
        ],
        image: { label: "Section image", key: "blogImage", altKey: "blogImageAlt", aspect: "aspect-[16/9]" },
      },
      testimonials: {
        icon: Sparkles, title: "Testimonials", subtitle: "What clients say",
        fields: [{ label: "Title", key: "testimonialsTitle" }],
        image: { label: "Section image", key: "testimonialsImage", altKey: "testimonialsImageAlt", aspect: "aspect-[16/9]" },
      },
      contact: {
        icon: Phone, title: "Contact section", subtitle: "Form intro and headline",
        fields: [
          { label: "Headline", key: "contactHeadline" },
          { label: "Blurb", key: "contactBlurb", multiline: true },
        ],
        image: { label: "Section image", key: "contactImage", altKey: "contactImageAlt", aspect: "aspect-[16/9]" },
      },
      "case-studies": {
        icon: TrendingUp, title: "Case studies page", subtitle: "Standalone /case-studies listing page — add, edit, and remove every case study below.",
        fields: [],
      },
      footer: {
        icon: Layers, title: "Footer", subtitle: "Edit everything shown in the site footer. The 'Crafted by Jahin' signature line is fixed and cannot be removed.",
        fields: [
          { label: "Brand name", key: "footerBrandName" },
          { label: "Tagline / description", key: "footerTagline", multiline: true },
          { label: "CTA button label (leave empty to hide)", key: "footerCtaLabel" },
          { label: "CTA button link", key: "footerCtaHref" },
          { label: "Pages column heading", key: "footerPagesHeading" },
          { label: "Services column heading", key: "footerServicesHeading" },
          { label: "Connect column heading", key: "footerConnectHeading" },
          { label: "Copyright line (use {year} for current year)", key: "footerCopyright" },
          { label: "Bottom byline (right side)", key: "footerByline" },
        ],
        image: { label: "Footer logo", key: "footerLogo", altKey: "footerBrandName", aspect: "aspect-square" },
      },
    };


    if (builtInPages[activePage]) {
      const cfg = builtInPages[activePage];
      const c: any = content;
      return (
        <div className="space-y-4">
          
          <Card className="p-5 sm:p-6 space-y-5">
            <SectionHeader icon={cfg.icon} title={cfg.title} subtitle={cfg.subtitle} />
            <div className="space-y-4">
              {cfg.fields.map((f) => (
                <Field key={f.key} label={f.label}>
                  {f.multiline
                    ? <Textarea rows={3} value={c[f.key]} onChange={(e) => updateContent({ [f.key]: e.target.value } as any)} />
                    : <Input value={c[f.key]} onChange={(e) => updateContent({ [f.key]: e.target.value } as any)} />}
                </Field>
              ))}
              {activePage === "hero" && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-background/40">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable hero video</p>
                    <p className="text-xs text-muted-foreground">When off, the "Watch How We Work" button is replaced with "Book A Strategy Call".</p>
                  </div>
                  <Switch
                    checked={c.heroVideoEnabled !== false}
                    onCheckedChange={(v) => updateContent({ heroVideoEnabled: v } as any)}
                  />
                </div>
              )}
              {cfg.image && (
                <ImageUpload
                  label={cfg.image.label}
                  value={c[cfg.image.key]}
                  onChange={(v) => updateContent({ [cfg.image!.key]: v } as any)}
                  aspect={cfg.image.aspect}
                  altValue={c[cfg.image.altKey]}
                  onAltChange={(v) => updateContent({ [cfg.image!.altKey]: v } as any)}
                />
              )}
            </div>
          </Card>
          {activePage === "footer" && (
            <>
              {(() => {
                const FOOTER_PAGE_KEYS = [
                  { key: "home", label: "Home", defaultSlug: "" },
                  { key: "portfolio", label: "Portfolio", defaultSlug: "portfolio" },
                  { key: "blog", label: "Blog", defaultSlug: "blog" },
                  { key: "contact", label: "Contact", defaultSlug: "contact" },
                  { key: "strategy-call", label: "Book A Strategy Call", defaultSlug: "strategy-call" },
                ];
                const pagesDefaults = FOOTER_PAGE_KEYS
                  .filter((p) => seo.pageSeo?.[p.key]?.status !== "draft")
                  .map((p) => {
                    const custom = seo.pageSeo?.[p.key]?.slug?.trim();
                    const slug = custom && custom.length > 0 ? custom.replace(/^\/+/, "") : p.defaultSlug;
                    return { id: `auto-${p.key}`, label: p.label, href: slug ? `/${slug}` : "/" };
                  });
                const servicesDefaults = siteServices.map((s) => ({
                  id: `auto-${s.slug}`,
                  label: s.label,
                  href: `/services/${s.slug}`,
                }));
                return (["footerPagesItems", "footerServicesItems"] as const).map((key) => {
                  const isPages = key === "footerPagesItems";
                  const title = isPages ? "Pages column links" : "Services column links";
                  const subtitle = isPages
                    ? "Existing pages are pre-filled. Edit, delete or add links — your changes replace the auto-generated list."
                    : "Existing services are pre-filled. Edit, delete or add links — your changes replace the auto-generated list.";
                  const stored = (((content as any)[key] ?? []) as { id: string; label: string; href: string }[]);
                  const defaults = isPages ? pagesDefaults : servicesDefaults;
                  const items = stored.length > 0 ? stored : defaults;
                  const setItems = (next: typeof items) => updateContent({ [key]: next } as any);
                  return (
                    <Card key={key} className="p-5 sm:p-6 space-y-3">
                      <SectionHeader icon={Link2} title={title} subtitle={subtitle} action={
                        <Button variant="hero" size="sm" onClick={() => setItems([...items, { id: Date.now().toString(), label: "New link", href: "/" }])}>
                          <Plus className="h-4 w-4" /> Add link
                        </Button>
                      } />
                      <div className="space-y-2">
                        {items.map((it, idx) => (
                          <div key={it.id} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-center p-3 rounded-lg border border-border bg-background/40">
                            <Input value={it.label} placeholder="Label" onChange={(e) => {
                              const next = [...items]; next[idx] = { ...it, label: e.target.value }; setItems(next);
                            }} />
                            <Input value={it.href} placeholder="/path or https://..." onChange={(e) => {
                              const next = [...items]; next[idx] = { ...it, href: e.target.value }; setItems(next);
                            }} />
                            <Button variant="ghost" size="icon" onClick={() => {
                              const next = [...items]; next.splice(idx, 1); setItems(next);
                            }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        ))}
                        {items.length === 0 && (
                          <p className="text-xs text-muted-foreground">No links yet — click "Add link" to create one.</p>
                        )}
                      </div>
                    </Card>
                  );
                });
              })()}
            </>
          )}
          {activePage === "case-studies" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <SectionHeader icon={TrendingUp} title="Case studies" subtitle="Add, edit and remove individual case studies — same fields as project detail pages." />
              <CaseStudiesEditor />
            </Card>
          )}
          {activePage === "case-studies" && (
            <SectionNoteEditor noteId="caseStudiesPage" label="Paragraph for the Case Studies listing page" />
          )}
          {activePage === "about" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <SectionHeader icon={Users} title="Pillars" subtitle="Three highlight points shown with checkmarks." />
              <div className="space-y-4">
                {(((content as any).aboutPillars ?? []) as { title: string; desc: string }[]).map((p, idx) => (
                  <div key={idx} className="grid sm:grid-cols-[1fr_2fr_auto] gap-2 items-start p-3 rounded-lg border border-border bg-background/40">
                    <Input
                      value={p.title}
                      placeholder="Title"
                      onChange={(e) => {
                        const next = [...(((content as any).aboutPillars ?? []) as any[])];
                        next[idx] = { ...next[idx], title: e.target.value };
                        updateContent({ aboutPillars: next } as any);
                      }}
                    />
                    <Textarea
                      rows={2}
                      value={p.desc}
                      placeholder="Description"
                      onChange={(e) => {
                        const next = [...(((content as any).aboutPillars ?? []) as any[])];
                        next[idx] = { ...next[idx], desc: e.target.value };
                        updateContent({ aboutPillars: next } as any);
                      }}
                    />
                    <Button variant="ghost" size="icon" onClick={() => {
                      const next = [...(((content as any).aboutPillars ?? []) as any[])];
                      next.splice(idx, 1);
                      updateContent({ aboutPillars: next } as any);
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="hero" size="sm" onClick={() => {
                  const next = [...(((content as any).aboutPillars ?? []) as any[]), { title: "New pillar", desc: "" }];
                  updateContent({ aboutPillars: next } as any);
                }}><Plus className="h-4 w-4" /> Add pillar</Button>
              </div>
            </Card>
          )}
          {activePage === "about" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <SectionHeader icon={FileText} title="Our Story" subtitle="Long-form story section on the About page. Body supports markdown links — e.g. [contact us](#contact)." />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Eyebrow">
                  <Input value={(content as any).aboutStoryEyebrow || ""} onChange={(e) => updateContent({ aboutStoryEyebrow: e.target.value } as any)} placeholder="Our Story" />
                </Field>
                <Field label="Title">
                  <Input value={(content as any).aboutStoryTitle || ""} onChange={(e) => updateContent({ aboutStoryTitle: e.target.value } as any)} placeholder="Built to help brands rise — honestly." />
                </Field>
              </div>
              <Field label="Body (markdown links supported)">
                <LinkableTextarea
                  rows={8}
                  value={(content as any).aboutStoryBody || ""}
                  onChange={(v) => updateContent({ aboutStoryBody: v } as any)}
                  placeholder="Write the story… use [text](url) for links."
                />
              </Field>
              <Field label="Side image">
                <ImageUpload value={(content as any).aboutStoryImage || ""} onChange={(url) => updateContent({ aboutStoryImage: url } as any)} />
                <Input className="mt-2" value={(content as any).aboutStoryImageAlt || ""} onChange={(e) => updateContent({ aboutStoryImageAlt: e.target.value } as any)} placeholder="Image alt text" />
              </Field>
            </Card>
          )}
          {activePage === "about" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <SectionHeader icon={Users} title="Our Team" subtitle="Team members shown on the About page." />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Eyebrow">
                  <Input value={(content as any).aboutTeamEyebrow || ""} onChange={(e) => updateContent({ aboutTeamEyebrow: e.target.value } as any)} placeholder="Our Team" />
                </Field>
                <Field label="Title">
                  <Input value={(content as any).aboutTeamTitle || ""} onChange={(e) => updateContent({ aboutTeamTitle: e.target.value } as any)} placeholder="The people behind your growth" />
                </Field>
              </div>
              <Field label="Blurb">
                <Textarea rows={2} value={(content as any).aboutTeamBlurb || ""} onChange={(e) => updateContent({ aboutTeamBlurb: e.target.value } as any)} />
              </Field>
              <div className="space-y-3">
                {(((content as any).aboutTeam ?? []) as { id: string; name: string; role: string; image: string; bio: string }[]).map((m, idx) => (
                  <div key={m.id} className="p-3 rounded-xl border border-border bg-background/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground">Member {idx + 1}</p>
                      <Button variant="ghost" size="icon" onClick={() => {
                        const next = [...(((content as any).aboutTeam ?? []) as any[])];
                        next.splice(idx, 1);
                        updateContent({ aboutTeam: next } as any);
                      }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Input value={m.name} placeholder="Name" onChange={(e) => {
                        const next = [...(((content as any).aboutTeam ?? []) as any[])];
                        next[idx] = { ...next[idx], name: e.target.value };
                        updateContent({ aboutTeam: next } as any);
                      }} />
                      <Input value={m.role} placeholder="Role" onChange={(e) => {
                        const next = [...(((content as any).aboutTeam ?? []) as any[])];
                        next[idx] = { ...next[idx], role: e.target.value };
                        updateContent({ aboutTeam: next } as any);
                      }} />
                    </div>
                    <Textarea rows={2} value={m.bio} placeholder="Short bio" onChange={(e) => {
                      const next = [...(((content as any).aboutTeam ?? []) as any[])];
                      next[idx] = { ...next[idx], bio: e.target.value };
                      updateContent({ aboutTeam: next } as any);
                    }} />
                    <ImageUpload value={m.image} onChange={(url) => {
                      const next = [...(((content as any).aboutTeam ?? []) as any[])];
                      next[idx] = { ...next[idx], image: url };
                      updateContent({ aboutTeam: next } as any);
                    }} />
                  </div>
                ))}
                <Button variant="hero" size="sm" onClick={() => {
                  const next = [...(((content as any).aboutTeam ?? []) as any[]), { id: `t_${Date.now().toString(36)}`, name: "New member", role: "Role", image: "", bio: "" }];
                  updateContent({ aboutTeam: next } as any);
                }}><Plus className="h-4 w-4" /> Add team member</Button>
              </div>
            </Card>
          )}
          {activePage === "about" && (
            <SectionNoteEditor noteId="about" label="Paragraph for the About page" />
          )}
          {activePage === "portfolio" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <SectionHeader
                icon={ImgIcon}
                title="Projects"
                subtitle={`${portfolio.length} project${portfolio.length === 1 ? "" : "s"} — each opens its own detail page (/portfolio/:id). Edit individual projects from the sidebar.`}
                action={
                  <Button variant="hero" size="sm" onClick={() => {
                    const id = Date.now().toString();
                    addPortfolioItem({ image: "", imageAlt: "", tag: "New tag", title: "New project", description: "", body: "" });
                    setTimeout(() => setActivePage(`proj:${id}`), 0);
                    toast.success("Project added");
                  }}>
                    <Plus className="h-4 w-4" /> Add project
                  </Button>
                }
              />
            </Card>
          )}
          {activePage === "portfolio" && (
            <Card className="p-5 sm:p-6 space-y-3">
              <SectionHeader icon={Layers} title="Project order" subtitle="Drag to reorder project cards on /portfolio." />
              <SortableList
                items={[...portfolio]
                  .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
                  .map((p) => ({ id: p.id, label: p.title || "Untitled", tag: p.tag }))}
                onReorder={(next) => {
                  next.forEach((item, idx) => updatePortfolioItem(item.id, { order: idx + 1 }));
                }}
                renderItem={(item) => (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.tag && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.tag}</span>}
                  </div>
                )}
              />
            </Card>
          )}
          {activePage === "services" && (
            <Card className="p-5 sm:p-6 space-y-3">
              <SectionHeader icon={Layers} title="Service card order" subtitle="Drag to reorder service cards across /services, home preview, navbar dropdown." />
              <SortableList
                items={[...(content.servicesList || [])]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((s) => ({ id: s.id, label: s.title, slug: s.slug, published: s.published }))}
                onReorder={(next) => {
                  next.forEach((item, idx) => updateService(item.id, { order: idx + 1 }));
                }}
                renderItem={(item) => (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{item.slug}{!item.published && " · off"}</span>
                  </div>
                )}
              />
            </Card>
          )}
          {activePage === "services" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <SectionHeader icon={FileEdit} title="Deep-dive paragraphs (zigzag section)" subtitle="Image + long paragraph shown for each service in the /services deep-dive zigzag. Edit per service below." />
              <div className="space-y-4">
                {siteServices.map((s) => {
                  const sp = servicePreviews[s.slug] || { image: "", imageAlt: "", title: "", desc: "" };
                  return (
                    <details key={s.slug} className="p-4 rounded-xl border border-border/60 bg-card" open>
                      <summary className="cursor-pointer font-semibold text-foreground flex items-center justify-between">
                        <span>{s.label}</span>
                        <span className="text-xs text-muted-foreground">/{s.slug}</span>
                      </summary>
                      <div className="mt-4 space-y-3">
                        <ImageUpload value={sp.image} onChange={(url) => updateServicePreview(s.slug, { image: url })} />
                        <Input value={sp.imageAlt || ""} onChange={(e) => updateServicePreview(s.slug, { imageAlt: e.target.value })} placeholder="Image alt text (for SEO)" />
                        <Input value={sp.title || ""} onChange={(e) => updateServicePreview(s.slug, { title: e.target.value })} placeholder={`Heading override (default: ${s.label})`} />
                        <LinkableTextarea
                          label="Deep-dive paragraph"
                          rows={10}
                          value={sp.desc || ""}
                          onChange={(v) => updateServicePreview(s.slug, { desc: v })}
                          placeholder="Full paragraph shown in the Services page deep-dive section. Supports Markdown: **bold**, [link](https://...), lists, etc."
                        />
                        <p className="text-[11px] text-muted-foreground">Leave empty to fall back to the card paragraph for this service.</p>
                      </div>
                    </details>
                  );
                })}
              </div>
            </Card>
          )}
          {activePage === "contact" && (
            <Card className="p-5 sm:p-6 space-y-4">
              <SectionHeader icon={Phone} title="Contact details" subtitle="Visible across the site" />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="WhatsApp digits"><Input value={contact.whatsapp} onChange={(e) => updateContact({ whatsapp: e.target.value.replace(/[^0-9]/g, "") })} /></Field>
                <Field label="Phone display"><Input value={contact.phoneDisplay} onChange={(e) => updateContact({ phoneDisplay: e.target.value })} /></Field>
                <Field label="Phone tel"><Input value={contact.phoneTel} onChange={(e) => updateContact({ phoneTel: e.target.value })} /></Field>
                <Field label="Email"><Input type="email" value={contact.email} onChange={(e) => updateContact({ email: e.target.value })} /></Field>
                <Field label="Facebook URL"><Input value={contact.facebook} onChange={(e) => updateContact({ facebook: e.target.value })} /></Field>
                <Field label="Instagram URL"><Input value={contact.instagram} onChange={(e) => updateContact({ instagram: e.target.value })} /></Field>
                <div className="sm:col-span-2"><Field label="Address"><Input value={contact.address} onChange={(e) => updateContact({ address: e.target.value })} /></Field></div>
              </div>
            </Card>
          )}
          {/* Built-in sections (services, portfolio, about, testimonials, contact, case-studies, footer-page meta)
              always have a standalone public route (e.g. /portfolio, /services) — so always expose SEO settings.
              SeoBlock itself returns null for non-indexable keys. */}
          <SeoBlock pageKey={activePage} seo={seo} updatePageSeo={updatePageSeo} onSaveNow={() => persistNow(`SEO saved for /${activePage} — live now`)} />
        </div>
      );
    }

    if (activePage.startsWith("homesec:")) {
      const id = activePage.slice(8);
      const sec = homeSections.find((x) => x.id === id);
      if (!sec) return <p className="text-sm text-muted-foreground">Section not found.</p>;
      return (
        <div className="space-y-4">
          <Card className="p-5 sm:p-6 space-y-5">
            <SectionHeader
              icon={FileEdit}
              title="Custom home section"
              subtitle="Free-form content block"
              action={
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                  <Switch checked={sec.enabled} onCheckedChange={(v) => updateHomeSection(sec.id, { enabled: v })} />
                  <span className="text-sm font-medium">{sec.enabled ? "Visible" : "Hidden"}</span>
                </div>
              }
            />
            <Field label="Section title"><Input value={sec.title} onChange={(e) => updateHomeSection(sec.id, { title: e.target.value })} /></Field>
            <Field label="Section content (single block)"><Textarea rows={4} value={sec.body} onChange={(e) => updateHomeSection(sec.id, { body: e.target.value })} placeholder="Use paragraphs editor below for multi-paragraph + alignment." /></Field>
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <TextBlocksEditor
                value={sec.textBlocks}
                onChange={(tb) => updateHomeSection(sec.id, { textBlocks: tb })}
                label="Paragraphs (multi-paragraph + alignment)"
                hint="When present, replaces the section content field above."
              />
            </div>
            <ImageUpload label="Section image" value={sec.image} onChange={(v) => updateHomeSection(sec.id, { image: v })} aspect="aspect-[16/9]" altValue={sec.imageAlt} onAltChange={(v) => updateHomeSection(sec.id, { imageAlt: v })} />
            <div className="flex justify-end pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => { deleteHomeSection(sec.id); setActivePage("home"); toast.success("Section removed"); }}>
                <Trash2 className="h-4 w-4 text-destructive" /> Delete section
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    // Home overview
    return (
      <div className="space-y-4">
        <Card className="p-5 sm:p-6 space-y-4">
          <SectionHeader
            icon={Home}
            title="Pages overview"
            subtitle="Pick a page from the sidebar to edit, or add a custom block to the homepage."
            action={
              <Button variant="hero" size="sm" onClick={() => {
                const id = Date.now().toString();
                addHomeSection({ title: "New section", body: "", image: "", imageAlt: "", enabled: true });
                setTimeout(() => setActivePage(`homesec:${id}`), 0);
                toast.success("Section added");
              }}>
                <Plus className="h-4 w-4" /> Add home block
              </Button>
            }
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {SITE_PAGES.map((p) => {
              const loc = pageLocation[p.key] ?? "home";
              const grp = sectionGroups.find((g) => g.key === loc);
              return (
                <button key={p.key} onClick={() => setActivePage(p.key)}
                  className="text-left p-3 rounded-lg border border-border hover:border-accent hover:bg-secondary/40 transition-colors flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary grid place-items-center shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{grp ? grp.label : "Standalone"}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </Card>

        {/* Phase 4 — drag-and-drop home block order (built-ins + custom sections + custom pages) */}
        {(() => {
          const builtinLabels: Record<string, string> = {
            hero: "Hero", trustStrip: "Trust strip", stats: "Stats band",
            servicesPreview: "Services preview", about: "About",
            caseStudies: "Case studies", processFlow: "Process flow",
            whyChoose: "Why choose AniRise", strategyCall: "Strategy call",
            homeFaq: "Home FAQ", blog: "Blog", finalCta: "Final CTA",
          };
          const customSecs = homeSections.filter((s) => (s.groupKey ?? "home") === "home");
          const customPg = customPages.filter((p) => (p.groupKey ?? "") === "home");
          const defaultIds = [
            ...DEFAULT_HOME_ORDER,
            ...customSecs.map((s) => `hs:${s.id}`),
            ...customPg.map((p) => `cp:${p.id}`),
          ];
          const saved = Array.isArray(content.homeOrder) ? content.homeOrder : [];
          const ordered = [
            ...saved.filter((id) => defaultIds.includes(id)),
            ...defaultIds.filter((id) => !saved.includes(id)),
          ];
          const labelFor = (id: string) => {
            if (id.startsWith("hs:")) {
              const s = customSecs.find((x) => x.id === id.slice(3));
              return s ? `${s.title || "Untitled"} (custom)` : id;
            }
            if (id.startsWith("cp:")) {
              const p = customPg.find((x) => x.id === id.slice(3));
              return p ? `${p.title || p.slug} (page)` : id;
            }
            return builtinLabels[id] || id;
          };
          const items = ordered.map((id) => ({ id, label: labelFor(id) }));
          return (
            <Card className="p-5 sm:p-6 space-y-3">
              <SectionHeader icon={Layers} title="Home page section order" subtitle="Drag to reorder every block on the home page — built-in, custom sections, and custom pages assigned to home." />
              <SortableList
                items={items}
                onReorder={(next) => updateContent({ homeOrder: next.map((i) => i.id) })}
                renderItem={(item) => (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{item.id}</span>
                  </div>
                )}
              />
            </Card>
          );
        })()}

        <SeoBlock pageKey="strategy-call" seo={seo} updatePageSeo={updatePageSeo} />
      </div>
    );
  };

  const previewWidth = devicePresets[device].w;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-9 w-9 rounded-full" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">AniRise</p>
              <p className="font-bold text-foreground leading-tight">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/"><Home className="h-4 w-4" /> View site</Link></Button>
            <Button onClick={() => { logout(); toast.success("Logged out"); }} variant="ghost" size="sm"><LogOut className="h-4 w-4" /> Logout</Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="overview"><TrendingUp className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
            <TabsTrigger value="pages"><Layout className="h-4 w-4 mr-1" /> Pages</TabsTrigger>
            
            <TabsTrigger value="leads">
              <Inbox className="h-4 w-4 mr-1" /> Leads
              {leads.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{leads.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="blog"><FileText className="h-4 w-4 mr-1" /> Blog</TabsTrigger>
            <TabsTrigger value="notes"><FileEdit className="h-4 w-4 mr-1" /> Section Notes</TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageSquare className="h-4 w-4 mr-1" /> Reviews
              {reviews.filter((r) => !r.approved).length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{reviews.filter((r) => !r.approved).length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" /> Settings</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const todayVisits = visitSeries.length ? visitSeries[visitSeries.length - 1].visits : 0;
                const todayLeads = leads.filter((l) => l.createdAt > Date.now() - 86400000).length;
                return [
                  { icon: Users, label: "Visitors (30d)", value: visits.toLocaleString(), trend: "+12.4%" },
                  { icon: Eye, label: "Page views (today)", value: Math.round(todayVisits * 2.7).toLocaleString(), trend: "+8.1%" },
                  { icon: MousePointerClick, label: "Conversions (30d)", value: leads.filter((l) => l.createdAt > Date.now() - 30 * 86400000).length.toString(), trend: "+22%" },
                  { icon: FileText, label: "New leads (today)", value: todayLeads.toString(), trend: "" },
                ];
              })().map((s) => (
                <Card key={s.label} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent grid place-items-center"><s.icon className="h-5 w-5" /></div>
                    {s.trend && <span className="text-xs font-semibold text-accent">{s.trend}</span>}
                  </div>
                  <p className="mt-3 text-2xl font-extrabold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </Card>
              ))}
            </div>

            <div className="grid gap-4">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <h3 className="font-bold">Visitors — last 14 days</h3>
                  <Button variant="outline" size="sm" onClick={() => generateSeoReport()}>
                    <Download className="h-4 w-4" /> Monthly SEO report (PDF)
                  </Button>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={visitSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="visits" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>


            {/* Live device preview */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-bold flex items-center gap-2"><Monitor className="h-4 w-4" /> Live website preview</h3>
                  <p className="text-sm text-muted-foreground">See exactly how the site renders on each device. Scrollable inside the frame.</p>
                </div>
                <div className="inline-flex rounded-xl border border-border p-1 bg-secondary/40">
                  {(Object.keys(devicePresets) as DeviceKey[]).map((k) => {
                    const D = devicePresets[k];
                    const I = D.icon;
                    const active = device === k;
                    return (
                      <button key={k} onClick={() => setDevice(k)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        <I className="h-4 w-4" /> {D.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div ref={previewWrapRef} className="rounded-xl bg-secondary/30 border border-border p-3 sm:p-6">
                {(() => {
                  const scale = Math.min(1, wrapWidth / previewWidth);
                  const frameH = 700;
                  return (
                    <div className="mx-auto" style={{ width: previewWidth * scale, height: frameH * scale }}>
                      <div className="bg-background rounded-2xl shadow-elegant border border-border overflow-hidden"
                        style={{ width: previewWidth, height: frameH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                        <iframe src="/" title="Website preview" className="border-0" style={{ width: previewWidth, height: frameH }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Card>
          </TabsContent>

          {/* PAGES */}
          <TabsContent value="pages" className="space-y-6">
            <div className="grid lg:grid-cols-[280px_1fr] gap-5 lg:items-start">
              <Card className="p-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-border bg-secondary/40 flex items-center gap-2 shrink-0">
                  <Layers className="h-4 w-4 text-accent" />
                  <span className="text-sm font-bold">Site pages</span>
                </div>

                <div className="p-2 space-y-1 overflow-y-auto flex-1 min-h-0">

                  {/* HOME page group */}
                  {(() => {
                    const isOpen = openGroups["home"] ?? false;
                    const customHomeSections = homeSections.filter((s) => (s.groupKey ?? "home") === "home" || !s.groupKey);
                    return (
                      <Collapsible open={isOpen} onOpenChange={(v) => setOpenGroups((p) => ({ ...p, home: v }))}>
                        <CollapsibleTrigger className="w-full text-left px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors">
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                          <Home className="h-3.5 w-3.5 text-accent" />
                          <span className="flex-1 truncate">Home page</span>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">{1 + HOME_BLOCKS.length + customHomeSections.length}</Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="ml-4 pl-3 border-l border-border/60 space-y-0.5 mt-1 mb-1">
                            <li>
                              <button onClick={() => setActivePage("home-overview")}
                                className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === "home-overview" || activePage === "home-order" ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                <Layers className="h-3 w-3 opacity-60" />
                                <span className="truncate">Home overview (order + SEO)</span>
                              </button>
                            </li>
                            <li>
                              <button onClick={() => setActivePage("hero")}
                                className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === "hero" ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                <FileText className="h-3 w-3 opacity-60" />
                                <span className="truncate">Hero</span>
                              </button>
                            </li>

                            {HOME_BLOCKS.map((b) => {
                              const key = `hb:${b.key}`;
                              const on = homeBlocks[b.key];
                              return (
                                <li key={b.key}>
                                  <button onClick={() => setActivePage(key)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === key ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                    <FileEdit className="h-3 w-3 opacity-60" />
                                    <span className="truncate flex-1">{b.label}</span>
                                    {!on && <Badge variant="outline" className="h-4 px-1 text-[9px]">Off</Badge>}
                                  </button>
                                </li>
                              );
                            })}
                            <li>
                              <button onClick={() => setActivePage("blog")}
                                className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === "blog" ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                <FileText className="h-3 w-3 opacity-60" />
                                <span className="truncate">Blog section</span>
                              </button>
                            </li>
                            {customHomeSections.map((s) => (
                              <li key={s.id}>
                                <button onClick={() => setActivePage(`homesec:${s.id}`)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === `homesec:${s.id}` ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                  <FileEdit className="h-3 w-3 opacity-60" />
                                  <span className="truncate flex-1">{s.title || "Untitled"}</span>
                                  {!s.enabled && <Badge variant="outline" className="h-4 px-1 text-[9px]">Off</Badge>}
                                </button>
                              </li>
                            ))}
                            <li>
                              <button onClick={() => {
                                const id = Date.now().toString();
                                addHomeSection({ title: "New section", body: "", image: "", imageAlt: "", enabled: true });
                                setTimeout(() => setActivePage(`homesec:${id}`), 0);
                                toast.success("Custom section added");
                              }}
                                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
                                <Plus className="h-3 w-3" /> Add custom section
                              </button>
                            </li>
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })()}

                  {/* SERVICES group */}
                  {(() => {
                    const isOpen = openGroups["services"] ?? false;
                    return (
                      <Collapsible open={isOpen} onOpenChange={(v) => setOpenGroups((p) => ({ ...p, services: v }))}>
                        <CollapsibleTrigger className="w-full text-left px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors">
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                          <Layers className="h-3.5 w-3.5 text-accent" />
                          <span className="flex-1 truncate">Services</span>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">{1 + siteServices.length}</Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="ml-4 pl-3 border-l border-border/60 space-y-0.5 mt-1 mb-1">
                            <li>
                              <button onClick={() => setActivePage("services")}
                                className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === "services" ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                <FileText className="h-3 w-3 opacity-60" />
                                <span className="truncate">Services overview</span>
                              </button>
                            </li>
                            {siteServices.map((s) => {
                              const key = `svc:${s.slug}`;
                              const count = (serviceFaqs[s.slug] || []).length;
                              return (
                                <li key={s.slug}>
                                  <button onClick={() => setActivePage(key)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === key ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                    <FileText className="h-3 w-3 opacity-60" />
                                    <span className="truncate flex-1">{s.label}</span>
                                    <span className="text-[10px] text-muted-foreground">{count} FAQ</span>
                                  </button>
                                </li>
                              );
                            })}
                            <li>
                              <button onClick={() => {
                                const item = addService({ title: "New service", desc: "Short description", iconName: "Sparkles" });
                                setTimeout(() => setActivePage(`svc:${item.slug}`), 0);
                                toast.success("Service added");
                              }}
                                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
                                <Plus className="h-3 w-3" /> Add service
                              </button>
                            </li>
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })()}

                  {/* PROJECTS group */}
                  {(() => {
                    const isOpen = openGroups["projects"] ?? false;
                    return (
                      <Collapsible open={isOpen} onOpenChange={(v) => setOpenGroups((p) => ({ ...p, projects: v }))}>
                        <CollapsibleTrigger className="w-full text-left px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors">
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                          <ImgIcon className="h-3.5 w-3.5 text-accent" />
                          <span className="flex-1 truncate">Projects</span>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">{1 + portfolio.length}</Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="ml-4 pl-3 border-l border-border/60 space-y-0.5 mt-1 mb-1">
                            <li>
                              <button onClick={() => setActivePage("portfolio")}
                                className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === "portfolio" ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                <FileText className="h-3 w-3 opacity-60" />
                                <span className="truncate">Projects page</span>
                              </button>
                            </li>
                            {portfolio.map((it) => (
                              <li key={it.id}>
                                <button onClick={() => setActivePage(`proj:${it.id}`)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === `proj:${it.id}` ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                  <FileEdit className="h-3 w-3 opacity-60" />
                                  <span className="truncate flex-1">{it.title || "Untitled"}</span>
                                </button>
                              </li>
                            ))}
                            <li>
                              <button onClick={() => {
                                const id = Date.now().toString();
                                addPortfolioItem({ image: "", imageAlt: "", tag: "New tag", title: "New project", description: "", body: "" });
                                setTimeout(() => setActivePage(`proj:${id}`), 0);
                                toast.success("Project added");
                              }}
                                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
                                <Plus className="h-3 w-3" /> Add project
                              </button>
                            </li>
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })()}

                  {/* Other built-in pages */}
                  {(() => {
                    const isOpen = openGroups["other"] ?? false;
                    const others = ["about", "testimonials", "contact", "case-studies", "footer"];
                    return (
                      <Collapsible open={isOpen} onOpenChange={(v) => setOpenGroups((p) => ({ ...p, other: v }))}>
                        <CollapsibleTrigger className="w-full text-left px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors">
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                          <Globe className="h-3.5 w-3.5 text-accent" />
                          <span className="flex-1 truncate">Other pages</span>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">{others.length}</Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="ml-4 pl-3 border-l border-border/60 space-y-0.5 mt-1 mb-1">
                            {others.map((k) => {
                              const p = SITE_PAGES.find((x) => x.key === k)!;
                              return (
                                <li key={k}>
                                  <button onClick={() => setActivePage(k)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === k ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                    <FileText className="h-3 w-3 opacity-60" />
                                    <span className="truncate">{p.label}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })()}

                  {/* Custom pages */}
                  {(() => {
                    const isOpen = openGroups["custom"] ?? false;
                    return (
                      <Collapsible open={isOpen} onOpenChange={(v) => setOpenGroups((p) => ({ ...p, custom: v }))}>
                        <CollapsibleTrigger className="w-full text-left px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors">
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                          <FileCog className="h-3.5 w-3.5 text-accent" />
                          <span className="flex-1 truncate">Custom pages</span>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">{customPages.length}</Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="ml-4 pl-3 border-l border-border/60 space-y-0.5 mt-1 mb-1">
                            {customPages.map((p) => (
                              <li key={p.id}>
                                <button onClick={() => setActivePage(`custom:${p.id}`)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${activePage === `custom:${p.id}` ? "bg-accent/15 text-accent font-semibold" : "hover:bg-secondary text-foreground/70"}`}>
                                  <FileText className="h-3 w-3 opacity-60" />
                                  <span className="truncate flex-1">{p.title || p.slug}</span>
                                  {!p.published && <Badge variant="outline" className="h-4 px-1 text-[9px]">Draft</Badge>}
                                </button>
                              </li>
                            ))}
                            <li>
                              <button onClick={() => {
                                const id = Date.now().toString();
                                addCustomPage({
                                  title: "New Page", slug: `new-page-${id.slice(-4)}`, parent: "",
                                  navLocation: ["navbar"], image: "", imageAlt: "", body: "",
                                  seo: { metaTitle: "New Page", metaDescription: "", metaKeywords: "" },
                                  published: false, groupKey: "",
                                });
                                setTimeout(() => setActivePage(`custom:${id}`), 0);
                                toast.success("Page added");
                              }}
                                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
                                <Plus className="h-3 w-3" /> Add page
                              </button>
                            </li>
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })()}
                </div>
              </Card>
              <div>{renderPageEditor()}</div>
            </div>
          </TabsContent>

          {/* LEADS */}
          <TabsContent value="leads" className="space-y-4">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-accent text-accent-foreground grid place-items-center shadow-accent">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Contact form leads</h3>
                    <p className="text-sm text-muted-foreground">
                      Every submission from the website Contact section. Tap a phone number to call instantly.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Auto-clears entries older than 90 days to save storage.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="h-7 px-2.5">{leads.length} total</Badge>
                  {leads.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
                          const domain = seo.canonicalUrl || "https://anirise.com.bd";
                          const rows = [
                            ["Date", "Name", "Email", "Phone", "Service", "Message", "Source"],
                            ...leads.map((l) => [
                              new Date(l.createdAt).toISOString(),
                              l.name, l.email, l.phone, l.service, l.message, domain,
                            ]),
                          ];
                          const meta = `# AniRise Leads Export\n# Domain: ${domain}\n# Exported: ${new Date().toISOString()}\n`;
                          const csv = meta + rows.map((r) => r.map(esc).join(",")).join("\n");
                          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `anirise-leads-${new Date().toISOString().slice(0, 10)}.csv`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success("CSV exported");
                        }}
                      >
                        <Download className="h-4 w-4" /> Export CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Clear all leads? This cannot be undone.")) {
                            clearLeads();
                            toast.success("All leads cleared");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" /> Clear all
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {leads.length === 0 ? (
              <Card className="p-10 text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-secondary/60 grid place-items-center mb-4">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-semibold">No leads yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  New messages from the Contact section will appear here.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {leads.map((l) => {
                  const date = new Date(l.createdAt);
                  const expiresAt = new Date(l.createdAt + 90 * 24 * 60 * 60 * 1000);
                  const daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
                  return (
                    <Card key={l.id} className="p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-foreground">{l.name}</p>
                            {l.service && (
                              <Badge variant="secondary" className="text-[10px]">{l.service}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> {date.toLocaleString()} · expires in {daysLeft}d
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { deleteLead(l.id); toast.success("Lead deleted"); }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 mt-4">
                        <a
                          href={`tel:${l.phone}`}
                          className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3 hover:bg-accent/10 hover:border-accent transition-smooth group"
                        >
                          <span className="h-9 w-9 rounded-lg bg-gradient-accent text-accent-foreground grid place-items-center shadow-accent">
                            <PhoneCall className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tap to call</p>
                            <p className="font-semibold text-foreground truncate group-hover:text-accent transition-smooth">
                              {l.phone}
                            </p>
                          </div>
                        </a>
                        <a
                          href={`mailto:${l.email}`}
                          className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3 hover:bg-accent/10 hover:border-accent transition-smooth group"
                        >
                          <span className="h-9 w-9 rounded-lg bg-accent/10 text-accent grid place-items-center">
                            <Mail className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
                            <p className="font-semibold text-foreground truncate group-hover:text-accent transition-smooth">
                              {l.email}
                            </p>
                          </div>
                        </a>
                      </div>

                      {l.message && (
                        <div className="mt-3 rounded-xl bg-background border border-border/60 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Message</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{l.message}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* BLOG */}
          <TabsContent value="blog" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                {editingId ? <><Pencil className="h-4 w-4" /> Edit post</> : <><Plus className="h-4 w-4" /> New post</>}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                <Input placeholder="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
                <Input placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                <Input placeholder="Read time" value={draft.readTime} onChange={(e) => setDraft({ ...draft, readTime: e.target.value })} />
                <Input placeholder="Date" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </div>
              <Textarea className="mt-3" placeholder="Short excerpt — shown on blog cards and in search results (1-2 sentences)" rows={3} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
              <div className="mt-3">
                <ImageUpload label="Cover image" value={draft.cover} onChange={(v) => setDraft({ ...draft, cover: v })} aspect="aspect-[16/9]" altValue={draft.coverAlt} onAltChange={(v) => setDraft({ ...draft, coverAlt: v })} />
              </div>
              <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-bold">Article body</p>
                    <p className="text-xs text-muted-foreground">Choose how you want to write this post.</p>
                  </div>
                  <div className="inline-flex rounded-lg border border-border p-0.5 bg-background">
                    {(["simple", "editor"] as const).map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setBlogMode(m)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${blogMode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {m === "simple" ? "Simple description" : "Full editor"}
                      </button>
                    ))}
                  </div>
                </div>
                {blogMode === "simple" ? (
                  <div className="mt-3">
                    <Textarea
                      rows={10}
                      placeholder="Write the full article here. Plain text — paragraphs separated by blank lines. Basic Markdown (##, **bold**, lists, links) also works."
                      value={draft.body || ""}
                      onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-2">For a no-frills writing experience. Switch to Full editor for a richer toolbar and live preview.</p>
                  </div>
                ) : (
                  <div className="mt-3" data-color-mode="light">
                    <MDEditor
                      value={draft.body || ""}
                      onChange={(v) => setDraft({ ...draft, body: v ?? "" })}
                      height={420}
                      preview="edit"
                      visibleDragbar={false}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Supports Markdown — headings, lists, links, images, tables, code blocks.</p>
                  </div>
                )}
              </div>
              <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">Call-to-action button</p>
                    <p className="text-xs text-muted-foreground">Optional. Shows below the article body when enabled.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={!!draft.ctaEnabled} onCheckedChange={(v) => setDraft({ ...draft, ctaEnabled: v })} />
                    <span className="text-xs font-medium">{draft.ctaEnabled ? "On" : "Off"}</span>
                  </div>
                </div>
                {draft.ctaEnabled && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input placeholder="Button label (e.g. Book a free SEO audit)" value={draft.ctaLabel || ""} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} />
                    <Input placeholder="Link URL (https://… or /contact)" value={draft.ctaUrl || ""} onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })} />
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={saveDraft} variant="hero"><Save className="h-4 w-4" /> {editingId ? "Update" : "Publish"}</Button>
                {editingId && <Button variant="outline" onClick={() => setEditingId(null)}><X className="h-4 w-4" /> Cancel</Button>}
              </div>
            </Card>

            {editingId && draft.slug && (
              <SeoBlock
                pageKey={`blog/${draft.slug}`}
                seo={seo}
                updatePageSeo={updatePageSeo}
                defaultPath={`/blog/${draft.slug}`}
                slugPrefix="/blog/"
              />
            )}

            <Card className="p-0 overflow-hidden">
              <div className="p-5 border-b border-border"><h3 className="font-bold">All posts ({posts.length})</h3></div>
              <ul className="divide-y divide-border">
                {posts.map((p) => (
                  <li key={p.id} className="p-5 flex items-center gap-4">
                    <img src={p.cover} alt="" className="h-14 w-20 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.category} · {p.date} · /{p.slug}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { deletePost(p.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          {/* SECTION NOTES — admin paragraph + heading under each section */}
          <TabsContent value="notes" className="space-y-4">
            <Card className="p-5">
              <SectionHeader
                icon={FileEdit}
                title="Section notes"
                subtitle="Add an optional heading + paragraph under any section. Leave both empty to hide. Alignment controls how the text sits in the page width."
              />
              <div className="mt-4 grid gap-4">
                {[
                  { id: "servicesPreview", label: "Home — Services preview" },
                  
                  { id: "whyChoose",       label: "Home — Why Choose AniRise" },
                  { id: "stats",           label: "Home — Stats band" },
                  { id: "caseStudies",     label: "Home — Case studies" },
                  { id: "trustStrip",      label: "Home — Trust strip" },
                  { id: "homeFaq",         label: "Home — FAQ" },
                  { id: "strategyCall",    label: "Home — Strategy call" },
                  { id: "finalCta",        label: "Home — Final CTA" },
                  { id: "portfolioPage",   label: "Projects / Portfolio page" },
                ].map((row) => (
                  <SectionNoteEditor key={row.id} noteId={row.id} label={row.label} />
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* REVIEWS */}
          <TabsContent value="reviews" className="space-y-4">

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Customer reviews</h3>
                  <p className="text-sm text-muted-foreground">Approve reviews to make them visible on the Testimonials section.</p>
                </div>
                <Badge variant="outline">{reviews.length} total</Badge>
              </div>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No reviews yet. They will appear here once visitors submit them.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {reviews.map((r) => (
                    <li key={r.id} className="py-4 flex flex-col sm:flex-row gap-4 sm:items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{r.name}</p>
                          {r.role && <span className="text-xs text-muted-foreground">— {r.role}</span>}
                          <Badge variant={r.approved ? "default" : "secondary"} className="text-[10px]">
                            {r.approved ? "Approved" : "Pending"}
                          </Badge>
                          <div className="flex gap-0.5 ml-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 mt-2 leading-relaxed">"{r.quote}"</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant={r.approved ? "outline" : "default"}
                          onClick={() => approveReview(r.id, !r.approved)}
                        >
                          <Check className="h-4 w-4 mr-1" /> {r.approved ? "Unapprove" : "Approve"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteReview(r.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="space-y-6">
            <Tabs defaultValue="seo" className="space-y-5">
              <Card className="p-2 bg-secondary/40 border-dashed">
                <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
                  <TabsTrigger value="seo" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Search className="h-3.5 w-3.5" /> Global SEO</TabsTrigger>
                  <TabsTrigger value="schema" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Code2 className="h-3.5 w-3.5" /> Schema</TabsTrigger>
                  <TabsTrigger value="sitemap" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"><FileText className="h-3.5 w-3.5" /> Sitemap</TabsTrigger>
                  <TabsTrigger value="robots" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Bot className="h-3.5 w-3.5" /> Robots</TabsTrigger>
                  <TabsTrigger value="redirects" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Link2 className="h-3.5 w-3.5" /> Redirects</TabsTrigger>
                  <TabsTrigger value="canonical" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Globe className="h-3.5 w-3.5" /> Canonical</TabsTrigger>
                  <TabsTrigger value="appearance" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Type className="h-3.5 w-3.5" /> Appearance</TabsTrigger>
                  <TabsTrigger value="security" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"><Lock className="h-3.5 w-3.5" /> Security</TabsTrigger>
                </TabsList>
              </Card>

              <TabsContent value="seo" className="space-y-4 mt-0">
                <Card className="p-5 sm:p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Search className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-bold leading-tight">Site-wide meta</h3>
                      <p className="text-xs text-muted-foreground">Default title & description for the whole site</p>
                    </div>
                  </div>
                  {(() => {
                    const titleOver = seo.metaTitle.length > 60;
                    const descOver = seo.metaDescription.length > 160;
                    return (
                      <>
                        <div>
                          <label className="text-xs font-semibold mb-1.5 block text-foreground/80">
                            Meta title <span className={`font-normal ${titleOver ? "text-destructive font-semibold" : "text-muted-foreground"}`}>({seo.metaTitle.length}/60)</span>
                          </label>
                          <Input value={seo.metaTitle} onChange={(e) => updateSeo({ metaTitle: e.target.value })} className={titleOver ? "border-destructive focus-visible:ring-destructive" : ""} />
                          {titleOver && <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">⚠ Title exceeds 60 characters — Google will truncate with "…"</p>}
                        </div>
                        <div>
                          <label className="text-xs font-semibold mb-1.5 block text-foreground/80">
                            Meta description <span className={`font-normal ${descOver ? "text-destructive font-semibold" : "text-muted-foreground"}`}>({seo.metaDescription.length}/160)</span>
                          </label>
                          <Textarea rows={3} value={seo.metaDescription} onChange={(e) => updateSeo({ metaDescription: e.target.value })} className={descOver ? "border-destructive focus-visible:ring-destructive" : ""} />
                          {descOver && <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">⚠ Description exceeds 160 characters — Google will truncate with "…"</p>}
                        </div>
                        <div>
                          <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Meta keywords</label>
                          <Input value={seo.metaKeywords} onChange={(e) => updateSeo({ metaKeywords: e.target.value })} />
                        </div>
                        <div className="rounded-xl border border-border p-4 bg-secondary/40">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Google preview</p>
                          <div className="flex items-start gap-3">
                            <img src={logo} alt="favicon" className="h-7 w-7 rounded-full mt-1 ring-1 ring-border" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[#006621] text-xs truncate">{seo.canonicalUrl}</p>
                              <p className="text-[#1a0dab] text-lg leading-tight truncate">
                                {titleOver ? seo.metaTitle.slice(0, 60) + "…" : seo.metaTitle}
                              </p>
                              <p className="text-sm text-foreground/80 line-clamp-2">
                                {descOver ? seo.metaDescription.slice(0, 160) + "…" : seo.metaDescription}
                              </p>
                            </div>
                          </div>
                          {(titleOver || descOver) && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                              <span aria-hidden>⚠</span>
                              <span>
                                {titleOver && descOver
                                  ? "Both title and description are too long — Google will truncate both with '…'."
                                  : titleOver
                                    ? "Title is too long — Google will cut it off after ~60 characters."
                                    : "Description is too long — Google will cut it off after ~160 characters."}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </Card>
              </TabsContent>

              <TabsContent value="schema" className="space-y-4 mt-0">
                <Card className="p-5 sm:p-6 space-y-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap pb-3 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Code2 className="h-5 w-5" /></div>
                      <div>
                        <h3 className="font-bold leading-tight">Schema.org / JSON-LD</h3>
                        <p className="text-xs text-muted-foreground">Structured data injected live into &lt;head&gt;</p>
                      </div>
                    </div>
                    <Select onValueChange={(t) => {
                      if (!t) return;
                      const templates: Record<string, any> = {
                        Organization: { name: "AniRise", url: seo.canonicalUrl, logo: `${seo.canonicalUrl}/favicon.jpg` },
                        LocalBusiness: { name: "AniRise", address: { "@type": "PostalAddress", addressCountry: "BD" }, telephone: "+8801337744727", url: seo.canonicalUrl },
                        WebSite: { name: "AniRise", url: seo.canonicalUrl },
                        WebPage: { name: "Page title", url: seo.canonicalUrl },
                        Article: { headline: "Article", author: { "@type": "Person", name: "AniRise" }, datePublished: new Date().toISOString().slice(0, 10) },
                        BlogPosting: { headline: "Post", author: { "@type": "Person", name: "AniRise" }, datePublished: new Date().toISOString().slice(0, 10) },
                        BreadcrumbList: { itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: seo.canonicalUrl }] },
                        Product: { name: "Product", offers: { "@type": "Offer", priceCurrency: "USD", price: "0.00" } },
                        Service: { serviceType: "SEO", provider: { "@type": "Organization", name: "AniRise" } },
                        FAQPage: { mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }] },
                        Person: { name: "Name", jobTitle: "Founder" },
                        Event: { name: "Event", startDate: new Date().toISOString() },
                      };
                      addSchema({ type: t as any, name: `${t} — new`, enabled: true, json: JSON.stringify(templates[t], null, 2) });
                      toast.success(`${t} added`);
                    }}>
                      <SelectTrigger className="w-[200px] h-10"><SelectValue placeholder="+ Add schema…" /></SelectTrigger>
                      <SelectContent>
                        {["Organization","LocalBusiness","WebSite","WebPage","Article","BlogPosting","BreadcrumbList","Product","Service","FAQPage","Person","Event"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {seo.schemas.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                      No schemas yet. Add one above to get started.
                    </div>
                  )}
                  <div className="space-y-3">
                    {seo.schemas.map((s) => {
                      let valid = true;
                      try { JSON.parse(s.json); } catch { valid = false; }
                      return (
                        <div key={s.id} className={`rounded-xl border p-4 space-y-3 ${valid ? "border-border bg-secondary/20" : "border-destructive/40 bg-destructive/5"}`}>
                          <div className="flex flex-wrap items-center gap-3 justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge variant="secondary" className="bg-accent/15 text-accent">{s.type}</Badge>
                              <Input className="h-9 max-w-xs" value={s.name} onChange={(e) => updateSchema(s.id, { name: e.target.value })} />
                              {!valid && <Badge variant="destructive">Invalid JSON</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch checked={s.enabled} onCheckedChange={(v) => updateSchema(s.id, { enabled: v })} />
                              <Button variant="ghost" size="sm" onClick={() => { deleteSchema(s.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </div>
                          <Textarea rows={6} className="font-mono text-xs" value={s.json} onChange={(e) => updateSchema(s.id, { json: e.target.value })} />
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Per-page schemas in use across the site (editable, writes back to pageSeo) */}
                {(() => {
                  const pageEntries = Object.entries(seo.pageSeo || {})
                    .map(([key, v]: any) => ({
                      key,
                      schemas: Array.isArray(v?.schemas) ? v.schemas : [],
                    }))
                    .filter((e) => e.schemas.length > 0)
                    .sort((a, b) => a.key.localeCompare(b.key));

                  const editSchema = (pageKey: string, id: string, patch: any) => {
                    const cur = Array.isArray(seo.pageSeo?.[pageKey]?.schemas) ? seo.pageSeo[pageKey].schemas : [];
                    updatePageSeo(pageKey, { schemas: cur.map((x: any) => (x.id === id ? { ...x, ...patch } : x)) });
                  };
                  const removeSchemaFromPage = (pageKey: string, id: string) => {
                    const cur = Array.isArray(seo.pageSeo?.[pageKey]?.schemas) ? seo.pageSeo[pageKey].schemas : [];
                    updatePageSeo(pageKey, { schemas: cur.filter((x: any) => x.id !== id) });
                    toast.success("Schema removed");
                  };
                  const addSchemaToPage = (pageKey: string) => {
                    const cur = Array.isArray(seo.pageSeo?.[pageKey]?.schemas) ? seo.pageSeo[pageKey].schemas : [];
                    const id = `ps_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
                    updatePageSeo(pageKey, { schemas: [...cur, { id, type: "Article", enabled: true, name: "New schema", json: "{}" }] });
                  };

                  const builtIn = [
                    { where: "Home (/)", type: "WebSite", note: "Fallback when no admin schema set" },
                    { where: "Blog post (/blog/:slug)", type: "BlogPosting", note: "Auto-generated from post when no admin schema set" },
                    { where: "Hero section (/)", type: "VideoObject", note: "Auto-emitted when hero video is enabled" },
                    { where: "Sitewide", type: "Organization", note: "From Settings → Schema (global)" },
                  ];
                  const totalPage = pageEntries.reduce((n, e) => n + e.schemas.length, 0);
                  return (
                    <Card className="p-5 sm:p-6 space-y-4">
                      <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                        <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent grid place-items-center"><Code2 className="h-5 w-5" /></div>
                        <div className="min-w-0">
                          <p className="font-bold leading-tight">Page-level schemas in use</p>
                          <p className="text-[11px] text-muted-foreground">Edits here are saved straight back to each page's SEO ({totalPage} total).</p>
                        </div>
                      </div>
                      {pageEntries.length === 0 ? (
                        <p className="text-[12px] text-muted-foreground">No per-page schemas added yet. Open any page editor and use its “Structured data (JSON-LD)” block to add one — it will show up here too.</p>
                      ) : (
                        <div className="space-y-3">
                          {pageEntries.map((e) => (
                            <div key={e.key} className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="font-mono text-[10px]">{e.key}</Badge>
                                <span className="text-[11px] text-muted-foreground">{e.schemas.length} schema{e.schemas.length > 1 ? "s" : ""}</span>
                                <Button size="sm" variant="ghost" className="ml-auto h-7 text-[11px]" onClick={() => addSchemaToPage(e.key)}>
                                  <Plus className="h-3.5 w-3.5" /> Add
                                </Button>
                              </div>
                              {e.schemas.map((sc: any) => {
                                let valid = true;
                                try { if (sc.json && sc.json.trim()) JSON.parse(sc.json); } catch { valid = false; }
                                return (
                                  <div key={sc.id} className={`rounded-lg border p-3 space-y-2 ${valid ? "border-border/60 bg-background" : "border-destructive/40 bg-destructive/5"}`}>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Input
                                        className="h-8 text-xs flex-1 min-w-[140px]"
                                        value={sc.name || ""}
                                        onChange={(ev) => editSchema(e.key, sc.id, { name: ev.target.value })}
                                        placeholder="Schema name (internal only)"
                                      />
                                      <select
                                        value={sc.type}
                                        onChange={(ev) => editSchema(e.key, sc.id, { type: ev.target.value })}
                                        className="h-8 px-2 rounded-md border border-input bg-background text-xs"
                                      >
                                        {SCHEMA_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                      </select>
                                      {!valid && <Badge variant="destructive" className="text-[10px]">Invalid JSON</Badge>}
                                      <div className="flex items-center gap-1.5">
                                        <Switch checked={sc.enabled !== false} onCheckedChange={(v) => editSchema(e.key, sc.id, { enabled: v })} />
                                        <span className="text-[10px]">{sc.enabled !== false ? "On" : "Off"}</span>
                                      </div>
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => removeSchemaFromPage(e.key, sc.id)}>
                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                      </Button>
                                    </div>
                                    <Textarea
                                      rows={4}
                                      className="font-mono text-[11px]"
                                      value={sc.json || ""}
                                      onChange={(ev) => editSchema(e.key, sc.id, { json: ev.target.value })}
                                      placeholder='{"headline": "My article"}'
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                          <div className="flex justify-end pt-1">
                            <Button size="sm" variant="hero" onClick={async () => { const ok = await persistNow("Schemas saved — live now"); if (!ok) toast.error("Save failed"); }}>
                              <Save className="h-4 w-4" /> Save changes
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="pt-3 border-t border-border/60">
                        <p className="text-[11px] font-semibold text-muted-foreground mb-2">Built-in schemas emitted automatically</p>
                        <div className="space-y-1.5">
                          {builtIn.map((b) => (
                            <div key={b.where + b.type} className="flex items-center gap-2 text-[12px]">
                              <Badge variant="outline" className="font-mono">{b.type}</Badge>
                              <span className="text-foreground/80">{b.where}</span>
                              <span className="text-muted-foreground">— {b.note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })()}
              </TabsContent>

              <TabsContent value="sitemap" className="space-y-4 mt-0">
                <Card className="p-5 sm:p-6 space-y-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap pb-3 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><FileText className="h-5 w-5" /></div>
                      <div>
                        <h3 className="font-bold leading-tight">Sitemap.xml</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Switch checked={seo.autoSitemap} onCheckedChange={(v) => updateSeo({ autoSitemap: v })} />
                          <span className="text-xs text-muted-foreground">Auto-sync with live site (recommended)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(seo.sitemap); toast.success("Copied"); }}><Copy className="h-4 w-4" /> Copy</Button>
                      <Button variant="outline" size="sm" onClick={() => downloadFile("sitemap.xml", seo.sitemap, "application/xml")}><Download className="h-4 w-4" /> Download</Button>
                    </div>
                  </div>

                  <SitemapUrlsEditor
                    sitemap={seo.sitemap}
                    canonicalUrl={seo.canonicalUrl}
                    onChange={(xml) => updateSeo({ sitemap: xml, autoSitemap: false })}
                    onSave={saveSitemapNow}
                  />
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Raw XML</label>
                    <Textarea rows={10} className="font-mono text-xs" value={seo.sitemap} onChange={(e) => updateSeo({ sitemap: e.target.value, autoSitemap: false })} />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(`https://anirise.com.bd/sitemap.xml?t=${Date.now()}`, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <Eye className="h-4 w-4" /> Review
                    </Button>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={saveSitemapNow}
                    >
                      <Save className="h-4 w-4" /> Save sitemap
                    </Button>
                  </div>

                </Card>
              </TabsContent>


              <TabsContent value="robots" className="space-y-4 mt-0">
                <Card className="p-5 sm:p-6 space-y-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap pb-3 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Bot className="h-5 w-5" /></div>
                      <div>
                        <h3 className="font-bold leading-tight">Robots.txt</h3>
                        <p className="text-xs text-muted-foreground">Tell crawlers what to index</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(seo.robotsTxt); toast.success("Copied"); }}><Copy className="h-4 w-4" /> Copy</Button>
                      <Button variant="outline" size="sm" onClick={() => downloadFile("robots.txt", seo.robotsTxt, "text/plain")}><Download className="h-4 w-4" /> Download</Button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/30 p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-12 w-12 grid place-items-center rounded-xl bg-primary/10 text-primary"><Bot className="h-6 w-6" /></div>
                        <span className="text-[10px] font-semibold text-muted-foreground">Crawlers</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-accent" />
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-accent" /><span className="text-sm">Allow: <span className="font-mono">/</span></span></div>
                        <div className="flex items-center gap-2"><FolderX className="h-5 w-5 text-destructive" /><span className="text-sm">Disallow: <span className="font-mono">/admin</span></span></div>
                      </div>
                    </div>
                  </div>
                  {(() => {
                    type Rule = { kind: "Allow" | "Disallow"; path: string; on: boolean };
                    const lines = seo.robotsTxt.split(/\r?\n/);
                    const ua = (lines.find(l => /^user-agent:/i.test(l)) || "User-agent: *").split(":").slice(1).join(":").trim() || "*";
                    const sm = (lines.find(l => /^sitemap:/i.test(l)) || "").split(":").slice(1).join(":").trim();
                    const rules: Rule[] = lines
                      .map(l => l.trim())
                      .filter(l => /^(allow|disallow):/i.test(l))
                      .map(l => {
                        const [k, ...rest] = l.split(":");
                        return { kind: (k.trim().toLowerCase() === "allow" ? "Allow" : "Disallow"), path: rest.join(":").trim(), on: true };
                      });
                    const write = (nextUa: string, nextRules: Rule[], nextSm: string) => {
                      const body = [
                        `User-agent: ${nextUa}`,
                        ...nextRules.filter(r => r.on).map(r => `${r.kind}: ${r.path}`),
                        "",
                        nextSm ? `Sitemap: ${nextSm}` : "",
                      ].join("\n").trim() + "\n";
                      updateSeo({ robotsTxt: body });
                    };
                    return (
                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="px-4 py-3 bg-secondary/40 grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">User-agent</label>
                            <Input className="h-8" value={ua} onChange={(e) => write(e.target.value, rules, sm)} />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Sitemap URL</label>
                            <Input className="h-8 font-mono text-xs" placeholder="https://…/sitemap.xml" value={sm} onChange={(e) => write(ua, rules, e.target.value)} />
                          </div>
                        </div>
                        <ul className="divide-y divide-border">
                          {rules.map((r, i) => (
                            <li key={i} className="p-3 flex flex-wrap items-center gap-2">
                              <Switch checked={r.on} onCheckedChange={(v) => { const next = [...rules]; next[i] = { ...r, on: v }; write(ua, next, sm); }} />
                              <Select value={r.kind} onValueChange={(v) => { const next = [...rules]; next[i] = { ...r, kind: v as Rule["kind"] }; write(ua, next, sm); }}>
                                <SelectTrigger className="h-9 w-[120px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Allow"><span className="inline-flex items-center gap-2"><FolderOpen className="h-3.5 w-3.5 text-accent" /> Allow</span></SelectItem>
                                  <SelectItem value="Disallow"><span className="inline-flex items-center gap-2"><FolderX className="h-3.5 w-3.5 text-destructive" /> Disallow</span></SelectItem>
                                </SelectContent>
                              </Select>
                              <Input className="h-9 flex-1 min-w-[160px] font-mono text-xs" value={r.path}
                                onChange={(e) => { const next = [...rules]; next[i] = { ...r, path: e.target.value }; write(ua, next, sm); }} />
                              <Button variant="ghost" size="sm" onClick={() => { const next = rules.filter((_, j) => j !== i); write(ua, next, sm); toast.success("Removed"); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                        <div className="p-3 bg-secondary/30 border-t border-border flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => write(ua, [...rules, { kind: "Allow", path: "/", on: true }], sm)}>
                            <Plus className="h-3.5 w-3.5" /> Add Allow
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => write(ua, [...rules, { kind: "Disallow", path: "/admin", on: true }], sm)}>
                            <Plus className="h-3.5 w-3.5" /> Add Disallow
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Raw text</label>
                    <Textarea rows={8} className="font-mono text-xs" value={seo.robotsTxt} onChange={(e) => updateSeo({ robotsTxt: e.target.value })} />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/robots?t=${Date.now()}`;
                        const tId = toast.loading("Fetching live robots.txt…");
                        try {
                          const res = await fetch(url, { cache: "no-store" });
                          const txt = await res.text();
                          toast.success(`Live robots.txt OK — ${txt.split(/\r?\n/).length} lines`, { id: tId });
                          console.log("[live robots.txt]", txt);
                        } catch (e: any) {
                          toast.error(`Fetch failed: ${e?.message || e}`, { id: tId });
                        }
                      }}
                    >
                      <RefreshCw className="h-4 w-4" /> Verify live robots.txt
                    </Button>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={async () => {
                        const tId = toast.loading("Saving robots.txt…");
                        const r = await saveAllNow();
                        if (!r.ok) {
                          toast.error(`Save failed: ${r.error || "unknown"}`, { id: tId });
                          return;
                        }
                        try {
                          await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/robots?t=${Date.now()}`, { cache: "no-store" });
                        } catch {}
                        toast.success("robots.txt saved — live URL refreshed", { id: tId });
                      }}
                    >
                      <Save className="h-4 w-4" /> Save robots.txt
                    </Button>
                  </div>
                </Card>
              </TabsContent>




              <TabsContent value="redirects" className="space-y-4 mt-0">
                <Card className="p-5 sm:p-6 space-y-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap pb-3 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Link2 className="h-5 w-5" /></div>
                      <div>
                        <h3 className="font-bold leading-tight">URL Redirects</h3>
                        <p className="text-xs text-muted-foreground">Send old URLs to new locations</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        const json = JSON.stringify({ redirects: seo.redirects.filter(r => r.enabled).map(r => ({ source: r.from, destination: r.to, permanent: r.code === 301 || r.code === 308, statusCode: r.code })) }, null, 2);
                        navigator.clipboard.writeText(json); toast.success("vercel.json copied");
                      }}><Copy className="h-4 w-4" /> Copy vercel.json</Button>
                      <Button variant="hero" size="sm" onClick={() => addRedirect({ from: "/old-path", to: "/new-path", code: 301, enabled: true })}>
                        <Plus className="h-4 w-4" /> Add redirect
                      </Button>
                    </div>
                  </div>
                  {seo.redirects.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                      No redirects yet. Add one to get started.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {seo.redirects.map((r) => (
                        <div key={r.id} className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Switch checked={r.enabled} onCheckedChange={(v) => updateRedirect(r.id, { enabled: v })} />
                            <Badge variant={r.enabled ? "default" : "outline"}>{r.code}</Badge>
                            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => { deleteRedirect(r.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                          <div className="grid sm:grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                            <Input className="h-9 font-mono text-xs" placeholder="/from" value={r.from} onChange={(e) => updateRedirect(r.id, { from: e.target.value })} />
                            <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                            <Input className="h-9 font-mono text-xs" placeholder="/to" value={r.to} onChange={(e) => updateRedirect(r.id, { to: e.target.value })} />
                            <Select value={String(r.code)} onValueChange={(v) => updateRedirect(r.id, { code: Number(v) as any })}>
                              <SelectTrigger className="h-9 w-[90px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="301">301</SelectItem>
                                <SelectItem value="302">302</SelectItem>
                                <SelectItem value="307">307</SelectItem>
                                <SelectItem value="308">308</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="canonical" className="space-y-4 mt-0">
                <Card className="p-5 sm:p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Globe className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-bold leading-tight">Canonical URL</h3>
                      <p className="text-xs text-muted-foreground">The site's authoritative base URL</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Base URL</label>
                    <Input value={seo.canonicalUrl} onChange={(e) => updateSeo({ canonicalUrl: e.target.value })} className="font-mono text-sm" />
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
                    <Switch checked={seo.canonicalAuto} onCheckedChange={(v) => updateSeo({ canonicalAuto: v })} className="mt-1" />
                    <div>
                      <p className="text-sm font-medium">Auto per-page canonical</p>
                      <p className="text-xs text-muted-foreground">Generate canonical from base URL + current path automatically.</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Per-page overrides are managed inside each page editor under <span className="font-semibold">Pages</span>.</p>

                  {/* Canonical URLs in use across the site */}
                  {(() => {
                    const xml = buildSitemap(seo.canonicalUrl || "https://anirise.com.bd");
                    const matches = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
                    const ps = seo.pageSeo || {};
                    const overrides = Object.entries(ps)
                      .filter(([, v]: any) => v && v.canonicalAuto === false && v.canonicalUrl)
                      .map(([k, v]: any) => ({ key: k, url: v.canonicalUrl as string }));
                    return (
                      <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">Canonical URLs in use</p>
                            <p className="text-[11px] text-muted-foreground">All canonical URLs currently emitted across the public site ({matches.length} total).</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(matches.join("\n"));
                              toast.success("Copied all canonical URLs");
                            }}
                          >
                            Copy all
                          </Button>
                        </div>
                        <div className="max-h-72 overflow-y-auto rounded-lg border border-border bg-background divide-y divide-border/60">
                          {matches.length === 0 && (
                            <p className="p-3 text-xs text-muted-foreground">No public pages found.</p>
                          )}
                          {matches.map((u, i) => (
                            <div key={`${u}-${i}`} className="flex items-center gap-2 px-3 py-2 text-xs">
                              <span className="font-mono truncate flex-1" title={u}>{u}</span>
                              <a href={u} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline whitespace-nowrap">Open</a>
                              <button
                                type="button"
                                onClick={() => { navigator.clipboard.writeText(u); toast.success("Copied"); }}
                                className="text-muted-foreground hover:text-foreground whitespace-nowrap"
                              >
                                Copy
                              </button>
                            </div>
                          ))}
                        </div>
                        {overrides.length > 0 && (
                          <div className="pt-2 border-t border-border/60">
                            <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Pages with a manual canonical override</p>
                            <ul className="space-y-1">
                              {overrides.map((o) => (
                                <li key={o.key} className="text-[11px] font-mono text-foreground/80 truncate">
                                  <span className="text-muted-foreground">{o.key}:</span> {o.url}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4 mt-0">
                <Card className="p-5 sm:p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Type className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-bold leading-tight">Typography</h3>
                      <p className="text-xs text-muted-foreground">Choose fonts and base size for the site</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Heading font</label>
                      <Select value={appearance.headingFont} onValueChange={(v) => updateAppearance({ headingFont: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {fontChoices.map((f) => <SelectItem key={f} value={f}><span style={{ fontFamily: `'${f}', sans-serif` }}>{f}</span></SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Body font</label>
                      <Select value={appearance.bodyFont} onValueChange={(v) => updateAppearance({ bodyFont: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {fontChoices.map((f) => <SelectItem key={f} value={f}><span style={{ fontFamily: `'${f}', sans-serif` }}>{f}</span></SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-foreground/80">Base font size</label>
                        <Badge variant="secondary">{appearance.baseFontSize}px</Badge>
                      </div>
                      <input type="range" min={14} max={20} step={1}
                        value={appearance.baseFontSize}
                        onChange={(e) => updateAppearance({ baseFontSize: Number(e.target.value) })}
                        className="w-full accent-accent" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-5 bg-gradient-to-br from-secondary/40 to-secondary/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Live preview</p>
                    <h2 style={{ fontFamily: `'${appearance.headingFont}', sans-serif` }} className="text-3xl font-extrabold mb-2">We Help Your Brand Rise</h2>
                    <p style={{ fontFamily: `'${appearance.bodyFont}', sans-serif` }} className="text-foreground/80">AniRise drives Visibility, fuels Growth, Success.</p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4 mt-0">
                <AdminPasswordChange />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// ---------- Sitemap URLs editor (local state — survives parent re-renders cleanly) ----------
type SitemapRow = { loc: string; pr: string; cf: string; lm: string; on: boolean };

const CHANGEFREQ_OPTIONS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;
const todayISO = () => new Date().toISOString().slice(0, 10);

function parseSitemapXml(xml: string): SitemapRow[] {
  if (!xml) return [];
  return Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g)).map((m) => {
    const loc = (m[1].match(/<loc>([\s\S]*?)<\/loc>/) || [])[1] || "";
    const pr = (m[1].match(/<priority>([\s\S]*?)<\/priority>/) || [])[1] || "0.8";
    const cf = (m[1].match(/<changefreq>([\s\S]*?)<\/changefreq>/) || [])[1] || "monthly";
    const lm = (m[1].match(/<lastmod>([\s\S]*?)<\/lastmod>/) || [])[1] || todayISO();
    return { loc: loc.trim(), pr: pr.trim() || "0.8", cf: cf.trim() || "monthly", lm: lm.trim() || todayISO(), on: true };
  });
}

function buildSitemapXml(rows: SitemapRow[]): string {
  const inner = rows
    .filter((r) => r.on && r.loc.trim())
    .map((r) =>
      `  <url><loc>${r.loc.trim()}</loc><lastmod>${(r.lm || todayISO()).trim()}</lastmod><changefreq>${(r.cf || "monthly").trim()}</changefreq><priority>${r.pr}</priority></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${inner}\n</urlset>`;
}

function SitemapUrlsEditor({
  sitemap,
  canonicalUrl,
  onChange,
  onSave,
}: {
  sitemap: string;
  canonicalUrl: string;
  onChange: (xml: string) => void;
  onSave: () => void | Promise<void>;
}) {
  const [rows, setRows] = useState<SitemapRow[]>(() => parseSitemapXml(sitemap));
  const lastEmittedRef = useRef<string>(sitemap);

  useEffect(() => {
    if (sitemap === lastEmittedRef.current) return;
    setRows(parseSitemapXml(sitemap));
    lastEmittedRef.current = sitemap;
  }, [sitemap]);

  const commit = (next: SitemapRow[]) => {
    setRows(next);
    const xml = buildSitemapXml(next);
    lastEmittedRef.current = xml;
    onChange(xml);
  };

  const base = (canonicalUrl || "").replace(/\/+$/, "");

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2.5 bg-secondary/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between gap-2 flex-wrap">
        <span>URL entries ({rows.length})</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => {
              commit([...rows, { loc: `${base}/new-page`, pr: "0.5", cf: "monthly", lm: todayISO(), on: true }]);
              toast.success("URL added");
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add URL
          </Button>
          <Button type="button" size="sm" variant="hero" className="h-8" onClick={onSave}>
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="p-4 text-xs text-muted-foreground">No URLs yet — click "Add URL" to create one.</div>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((u, i) => (
            <li key={i} className="p-3 flex flex-wrap items-center gap-2">
              <Switch
                checked={u.on}
                onCheckedChange={(v) => commit(rows.map((r, j) => (j === i ? { ...r, on: v } : r)))}
              />
              <Input
                className="h-9 flex-1 min-w-[180px] font-mono text-xs"
                value={u.loc}
                onChange={(e) => commit(rows.map((r, j) => (j === i ? { ...r, loc: e.target.value } : r)))}
              />
              <Select
                value={u.pr}
                onValueChange={(v) => commit(rows.map((r, j) => (j === i ? { ...r, pr: v } : r)))}
              >
                <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.3", "0.1"].map((p) => (
                    <SelectItem key={p} value={p}>Priority {p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={u.cf}
                onValueChange={(v) => commit(rows.map((r, j) => (j === i ? { ...r, cf: v } : r)))}
              >
                <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHANGEFREQ_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                className="h-9 w-[150px] text-xs"
                value={u.lm}
                onChange={(e) => commit(rows.map((r, j) => (j === i ? { ...r, lm: e.target.value } : r)))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  commit(rows.filter((_, j) => j !== i));
                  toast.success("Removed");
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminPasswordChange() {

  const { changeAdminPassword } = useAdmin();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { toast.error("New passwords don't match."); return; }
    setBusy(true);
    const r = await changeAdminPassword(oldPw, newPw);
    setBusy(false);
    if (!r.ok) { toast.error(r.error || "Failed to change password."); return; }
    toast.success("Password updated. Use the new password next time you log in.");
    setOldPw(""); setNewPw(""); setConfirmPw("");
  };

  return (
    <Card className="p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-border/60">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Lock className="h-5 w-5" /></div>
        <div>
          <h3 className="font-bold leading-tight">Change Admin Password</h3>
          <p className="text-xs text-muted-foreground">Old password stops working as soon as the new one is saved.</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Current password</label>
          <Input type="password" autoComplete="current-password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block text-foreground/80">New password</label>
          <Input type="password" autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Confirm new password</label>
          <Input type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
        </div>
        <Button type="submit" disabled={busy} variant="hero" className="rounded-full">
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Card>
  );
}

export default AdminDashboard;
