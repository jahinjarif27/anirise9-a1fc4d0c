import { useEffect, useMemo, useRef, useState } from "react";
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
  Inbox, PhoneCall, Mail, Clock, Star, MessageSquare,
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
import { Switch } from "@/components/ui/switch";
import MDEditor from "@uiw/react-md-editor";
import jsPDF from "jspdf";
import { SECTION_KEYS, SectionKey } from "@/context/AdminContext";

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

const AdminDashboard = () => {
  const {
    isAuthed, logout, posts, addPost, updatePost, deletePost,
    content, updateContent, visits,
    seo, updateSeo, appearance, updateAppearance, fontChoices,
    contact, updateContact, regenerateSitemap,
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
  } = useAdmin();
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ home: true });
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

  const saveDraft = () => {
    if (!draft.title || !draft.slug) { toast.error("Title and slug are required"); return; }
    if (editingId) { updatePost(editingId, draft); toast.success("Post updated"); }
    else { addPost(draft); toast.success("Post created"); }
    setEditingId(null);
    setBlogMode("simple");
    setDraft({ slug: "", title: "", excerpt: "", category: "SEO", author: "AniRise Team", date: new Date().toISOString().slice(0, 10), readTime: "5 min", cover: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80", coverAlt: "", ctaEnabled: false, ctaLabel: "", ctaUrl: "", body: "" });
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

  const LocationSelector = ({ pageKey, optional = false }: { pageKey: string; optional?: boolean }) => {
    const current = pageLocation[pageKey] ?? (optional ? "" : "home");
    return (
      <Card className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row bg-gradient-to-br from-secondary/40 to-secondary/10 border-dashed">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent grid place-items-center shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-sm">Page location</p>
            <p className="text-xs text-muted-foreground">
              Where this page lives in the site structure.
            </p>
          </div>
        </div>
        <Select value={current || "__standalone"} onValueChange={(v) => {
          setPageLocation(pageKey, v === "__standalone" ? "" : v);
          toast.success("Location updated");
        }}>
          <SelectTrigger className="w-full sm:w-[220px] h-10 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sectionGroups.map((g) => (
              <SelectItem key={g.key} value={g.key}>
                <span className="inline-flex items-center gap-2">
                  {g.isHome ? <Home className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
                  {g.label}
                </span>
              </SelectItem>
            ))}
            <SelectItem value="__standalone">
              <span className="inline-flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Standalone route</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </Card>
    );
  };

  const SeoBlock = ({ pageKey, hideAuto = false }: { pageKey: string; hideAuto?: boolean }) => {
    const s = seo.pageSeo[pageKey] || { metaTitle: "", metaDescription: "", metaKeywords: "" };
    return (
      <Card className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <h4 className="font-bold">Page SEO</h4>
          {!hideAuto && (
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => {
              const title = (content as any)[`${pageKey}Headline`] || (content as any)[`${pageKey}Title`] || s.metaTitle;
              const desc = (content as any)[`${pageKey}Blurb`] || (content as any)[`${pageKey}Tagline`] || s.metaDescription;
              updatePageSeo(pageKey, { metaTitle: title, metaDescription: desc });
              toast.success("Auto-filled from page content");
            }}><Sparkles className="h-4 w-4" /> Auto-generate</Button>
          )}
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Meta title <span className="text-muted-foreground">({s.metaTitle.length}/60)</span></label>
          <Input value={s.metaTitle} onChange={(e) => updatePageSeo(pageKey, { metaTitle: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Meta description <span className="text-muted-foreground">({s.metaDescription.length}/160)</span></label>
          <Textarea rows={3} value={s.metaDescription} onChange={(e) => updatePageSeo(pageKey, { metaDescription: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Meta keywords</label>
          <Input value={s.metaKeywords} onChange={(e) => updatePageSeo(pageKey, { metaKeywords: e.target.value })} />
        </div>
      </Card>
    );
  };

  const renderPageEditor = () => {
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
                rows={8}
                placeholder="Write the page content here. Plain text or Markdown — headings (##), lists, links etc. are supported."
                value={cp.body}
                onChange={(e) => updateCustomPage(cp.id, { body: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">This shows as the main content on the page. Leave empty to show only the title and image.</p>
            </div>
            <div className="flex justify-between pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => { deleteCustomPage(cp.id); setActivePage("hero"); toast.success("Page deleted"); }}>
                <Trash2 className="h-4 w-4 text-destructive" /> Delete page
              </Button>
              <Button variant="hero" size="sm" onClick={() => toast.success("Saved")}><Save className="h-4 w-4" /> Save</Button>
            </div>
          </Card>
          <SeoBlock pageKey={cpSeoKey} hideAuto />
        </div>
      );
    }

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

      const Wrap = ({ children, subtitle }: { children: React.ReactNode; subtitle: string }) => (
        <Card className="p-5 sm:p-6 space-y-4">
          <SectionHeader icon={Layers} title={meta.label} subtitle={subtitle} action={enabledToggle} />
          {children}
        </Card>
      );

      if (blockKey === "trustStrip") return (
        <Wrap subtitle="Client logos / brand names marquee on the home page.">
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
        </Wrap>
      );

      if (blockKey === "stats") return (
        <Wrap subtitle='Boro number gula (e.g. "15+" / "Projects Delivered").'>
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
        </Wrap>
      );

      if (blockKey === "servicesPreview") return (
        <Wrap subtitle="Auto-scrolling services cards on home. Add an image + alt text for each service card.">
          <p className="text-sm text-muted-foreground">Section title/intro is edited on the <button className="text-accent underline" onClick={() => setActivePage("services")}>Services page</button>.</p>
          <div className="space-y-3">
            {SITE_SERVICES.map((s) => {
              const sp = servicePreviews[s.slug] || { image: "", imageAlt: "" };
              return (
                <div key={s.slug} className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{s.label}</p>
                    <span className="text-xs text-muted-foreground">/{s.slug}</span>
                  </div>
                  <ImageUpload value={sp.image} onChange={(url) => updateServicePreview(s.slug, { image: url })} />
                  <Input value={sp.imageAlt} onChange={(e) => updateServicePreview(s.slug, { imageAlt: e.target.value })} placeholder="Image alt text (for SEO)" />
                </div>
              );
            })}
          </div>
        </Wrap>
      );

      if (blockKey === "caseStudies") return (
        <Wrap subtitle="Each card opens its own case study page (/case-studies/:id).">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { addCaseStudy({ title: "New case study", metric: "+100%", description: "", image: "", link: "", imageAlt: "", body: "" }); toast.success("Added"); }}><Plus className="h-4 w-4" /> Add case study</Button>
          </div>
          <div className="space-y-3">
            {caseStudies.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input value={c.title} onChange={(e) => updateCaseStudy(c.id, { title: e.target.value })} placeholder="Title" />
                  <Input value={c.metric} onChange={(e) => updateCaseStudy(c.id, { metric: e.target.value })} placeholder="Metric (e.g. +180% traffic)" />
                </div>
                <Textarea value={c.description} onChange={(e) => updateCaseStudy(c.id, { description: e.target.value })} placeholder="Short description (card)" rows={2} />
                <ImageUpload value={c.image} onChange={(url) => updateCaseStudy(c.id, { image: url })} />
                <Input value={c.imageAlt || ""} onChange={(e) => updateCaseStudy(c.id, { imageAlt: e.target.value })} placeholder="Image alt text" />
                <Textarea value={c.body || ""} onChange={(e) => updateCaseStudy(c.id, { body: e.target.value })} placeholder="Full case study content (shown on detail page)" rows={6} />
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCaseStudy(c.id)}><Trash2 className="h-4 w-4" /> Remove</Button>
              </div>
            ))}
          </div>
        </Wrap>
      );

      if (blockKey === "homeFaq") return (
        <Wrap subtitle="Brand/general questions on the home page.">
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
        </Wrap>
      );

      if (blockKey === "finalCta") return (
        <Wrap subtitle="Bottom-of-page banner with primary + secondary CTAs.">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Field label="Headline"><Input value={finalCta.headline} onChange={(e) => updateFinalCta({ headline: e.target.value })} /></Field></div>
            <div className="sm:col-span-2"><Field label="Subline"><Textarea rows={2} value={finalCta.subline} onChange={(e) => updateFinalCta({ subline: e.target.value })} /></Field></div>
            <Field label="Primary button label"><Input value={finalCta.primaryLabel} onChange={(e) => updateFinalCta({ primaryLabel: e.target.value })} /></Field>
            <Field label="Primary button URL"><Input value={finalCta.primaryUrl} onChange={(e) => updateFinalCta({ primaryUrl: e.target.value })} /></Field>
            <Field label="Secondary button label"><Input value={finalCta.secondaryLabel} onChange={(e) => updateFinalCta({ secondaryLabel: e.target.value })} /></Field>
            <Field label="Secondary button URL"><Input value={finalCta.secondaryUrl} onChange={(e) => updateFinalCta({ secondaryUrl: e.target.value })} /></Field>
          </div>
        </Wrap>
      );

      return null;
    }

    // Service page editors
    if (activePage.startsWith("svc:")) {
      const slug = activePage.slice(4);
      const svc = SITE_SERVICES.find((s) => s.slug === slug);
      if (!svc) return <p className="text-sm text-muted-foreground">Service not found.</p>;
      const faqs = serviceFaqs[slug] || [];
      return (
        <div className="space-y-4">
          <Card className="p-5 sm:p-6 space-y-4">
            <SectionHeader
              icon={Layers}
              title={svc.label}
              subtitle={`Service page — /services/${slug}`}
              action={
                <Button asChild variant="outline" size="sm"><Link to={`/services/${slug}`} target="_blank"><ArrowRight className="h-4 w-4" /> View page</Link></Button>
              }
            />
            <p className="text-sm text-muted-foreground">Page layout & copy are managed in code. Use the FAQ editor below to add/edit questions shown on this service page.</p>
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

    const builtInPages: Record<string, { icon: any; title: string; subtitle: string; fields: { label: string; key: string; multiline?: boolean }[]; image?: { label: string; key: string; altKey: string; aspect: string } }> = {
      hero: {
        icon: Sparkles, title: "Hero section", subtitle: "Top-of-page headline and intro",
        fields: [
          { label: "Eyebrow", key: "heroEyebrow" },
          { label: "Headline", key: "heroHeadline" },
          { label: "Tagline", key: "heroTagline", multiline: true },
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
          { label: "Headline", key: "aboutHeadline" },
          { label: "Blurb", key: "aboutBlurb", multiline: true },
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
    };

    if (builtInPages[activePage]) {
      const cfg = builtInPages[activePage];
      const c: any = content;
      return (
        <div className="space-y-4">
          <LocationSelector pageKey={activePage} />
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
          <SeoBlock pageKey={activePage} />
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
            <Field label="Section content"><Textarea rows={4} value={sec.body} onChange={(e) => updateHomeSection(sec.id, { body: e.target.value })} /></Field>
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
        <SeoBlock pageKey="home" />
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
              {[
                { icon: Users, label: "Visitors (30d)", value: visits.toLocaleString(), trend: "+12.4%" },
                { icon: Eye, label: "Page views", value: (visits * 2.7).toFixed(0), trend: "+8.1%" },
                { icon: MousePointerClick, label: "Conversions", value: "47", trend: "+22%" },
                { icon: FileText, label: "Posts", value: posts.length.toString(), trend: "" },
              ].map((s) => (
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
            <div className="grid lg:grid-cols-[280px_1fr] gap-5">
              <Card className="p-0 h-fit lg:sticky lg:top-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/40 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent" />
                  <span className="text-sm font-bold">Site pages</span>
                </div>

                <div className="p-2 space-y-1">
                  {/* HOME page group */}
                  {(() => {
                    const isOpen = openGroups["home"] ?? true;
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
                    const isOpen = openGroups["services"] ?? true;
                    return (
                      <Collapsible open={isOpen} onOpenChange={(v) => setOpenGroups((p) => ({ ...p, services: v }))}>
                        <CollapsibleTrigger className="w-full text-left px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors">
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                          <Layers className="h-3.5 w-3.5 text-accent" />
                          <span className="flex-1 truncate">Services</span>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">{1 + SITE_SERVICES.length}</Badge>
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
                            {SITE_SERVICES.map((s) => {
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
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })()}

                  {/* Other built-in pages */}
                  {(() => {
                    const isOpen = openGroups["other"] ?? true;
                    const others = ["about", "portfolio", "testimonials", "contact"];
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
                    const isOpen = openGroups["custom"] ?? true;
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
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Meta title <span className="text-muted-foreground font-normal">({seo.metaTitle.length}/60)</span></label>
                    <Input value={seo.metaTitle} onChange={(e) => updateSeo({ metaTitle: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Meta description <span className="text-muted-foreground font-normal">({seo.metaDescription.length}/160)</span></label>
                    <Textarea rows={3} value={seo.metaDescription} onChange={(e) => updateSeo({ metaDescription: e.target.value })} />
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
                        <p className="text-[#1a0dab] text-lg leading-tight truncate">{seo.metaTitle}</p>
                        <p className="text-sm text-foreground/80 line-clamp-2">{seo.metaDescription}</p>
                      </div>
                    </div>
                  </div>
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
                          <span className="text-xs text-muted-foreground">Auto-sync on publish</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(seo.sitemap); toast.success("Copied"); }}><Copy className="h-4 w-4" /> Copy</Button>
                      <Button variant="outline" size="sm" onClick={() => downloadFile("sitemap.xml", seo.sitemap, "application/xml")}><Download className="h-4 w-4" /> Download</Button>
                    </div>
                  </div>
                  {(() => {
                    const urls = Array.from(seo.sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)).map((m, i) => {
                      const loc = (m[1].match(/<loc>([\s\S]*?)<\/loc>/) || [])[1] || "";
                      const pr = (m[1].match(/<priority>([\s\S]*?)<\/priority>/) || [])[1] || "0.8";
                      return { id: i, loc, pr };
                    });
                    const writeBack = (next: { loc: string; pr: string; on: boolean }[]) => {
                      const inner = next.filter(u => u.on).map(u => `  <url><loc>${u.loc}</loc><priority>${u.pr}</priority></url>`).join("\n");
                      updateSeo({ sitemap: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${inner}\n</urlset>` });
                    };
                    const items = urls.map(u => ({ ...u, on: true }));
                    return (
                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="px-4 py-2.5 bg-secondary/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                          <span>URL entries ({items.length})</span>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => writeBack([...items, { loc: `${seo.canonicalUrl}/new-page`, pr: "0.5", on: true }])}>
                            <Plus className="h-3.5 w-3.5" /> Add URL
                          </Button>
                        </div>
                        <ul className="divide-y divide-border">
                          {items.map((u, i) => (
                            <li key={i} className="p-3 flex flex-wrap items-center gap-2">
                              <Switch checked={u.on} onCheckedChange={(v) => { const next = [...items]; next[i] = { ...u, on: v }; writeBack(next); }} />
                              <Input className="h-9 flex-1 min-w-[180px] font-mono text-xs" value={u.loc}
                                onChange={(e) => { const next = [...items]; next[i] = { ...u, loc: e.target.value }; writeBack(next); }} />
                              <Select value={u.pr} onValueChange={(v) => { const next = [...items]; next[i] = { ...u, pr: v }; writeBack(next); }}>
                                <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {["1.0","0.9","0.8","0.7","0.6","0.5","0.3","0.1"].map(p => <SelectItem key={p} value={p}>Priority {p}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="sm" onClick={() => { const next = items.filter((_, j) => j !== i); writeBack(next); toast.success("Removed"); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-foreground/80">Raw XML</label>
                    <Textarea rows={10} className="font-mono text-xs" value={seo.sitemap} onChange={(e) => updateSeo({ sitemap: e.target.value })} />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="hero" size="sm" onClick={() => { updateSeo({ sitemap: seo.sitemap }); toast.success("Sitemap saved"); }}>
                      <Save className="h-4 w-4" /> Save sitemap
                    </Button>
                  </div>
                  <div className="rounded-xl bg-secondary/40 border border-border/60 p-4 text-xs text-muted-foreground leading-relaxed">
                    <p className="font-bold text-foreground mb-1.5 text-sm">How to use this sitemap</p>
                    <p>
                      Your sitemap auto-updates whenever you add or remove a page or blog post — no manual work needed.
                      The <span className="font-semibold text-foreground">Priority</span> value (1.0 = highest, 0.1 = lowest) hints to Google which URLs matter most on your site; keep your homepage at 1.0 and core service pages above 0.8.
                      Change priorities here and click <span className="font-semibold text-foreground">Save sitemap</span>. Submit the sitemap URL once in Google Search Console — Google then re-reads it automatically.
                    </p>
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
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
