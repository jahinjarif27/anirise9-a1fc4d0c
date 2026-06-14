import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./Index.tsx";
import BlogPage from "./Blog.tsx";
import BlogPostPage from "./BlogPost.tsx";
import { CustomPageView } from "./CustomPageView";
import { SectionPage } from "./SectionPage";
import { useAdmin } from "@/context/AdminContext";
import { useParams } from "react-router-dom";
import { resolvePathToBuiltIn, type BuiltInPageKey } from "@/lib/pageConfig";

const NotFound = lazy(() => import("./NotFound.tsx"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.tsx"));
const WebsiteSEOPage = lazy(() => import("./services/WebsiteSEO.tsx"));
const EcommerceSEOPage = lazy(() => import("./services/EcommerceSEO.tsx"));
const GraphicsDesignPage = lazy(() => import("./services/GraphicsDesign.tsx"));
const ComingSoonService = lazy(() => import("./services/ComingSoon.tsx"));
const StrategyCallPage = lazy(() => import("./StrategyCallPage.tsx"));
const CaseStudyDetail = lazy(() => import("./CaseStudyDetail.tsx"));
const ProjectDetail = lazy(() => import("./ProjectDetail.tsx"));
const SitemapViewer = lazy(() => import("./SitemapViewer.tsx"));

import { Services } from "@/components/site/Services";
import { Portfolio } from "@/components/site/Portfolio";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { About } from "@/components/site/About";
import { CaseStudies } from "@/components/site/home/CaseStudies";

const SECTION_COMPONENTS: Record<string, { Component: React.ComponentType; title: string }> = {
  services: { Component: Services, title: "Services" },
  portfolio: { Component: Portfolio, title: "Projects" },
  "case-studies": { Component: CaseStudies, title: "Case studies" },
  projects: { Component: Portfolio, title: "Projects" },
  testimonials: { Component: Testimonials, title: "Testimonials" },
  contact: { Component: Contact, title: "Contact" },
  about: { Component: About, title: "About" },
};

/**
 * Catch-all single-segment route. Order of resolution:
 *   1. Admin-set custom slug for a built-in page → render that page
 *   2. Default slug for a built-in page → render that page
 *   3. Custom page (CustomPageView)
 */
const DynamicSlugResolver = () => {
  const { slug } = useParams<{ slug: string }>();
  const { seo } = useAdmin();
  const matched = resolvePathToBuiltIn(slug || "", seo.pageSeo);
  if (matched && matched !== "home" && matched !== "blog" && matched !== "strategy-call") {
    const entry = SECTION_COMPONENTS[matched as BuiltInPageKey];
    if (entry) {
      return <SectionPage Section={entry.Component} title={entry.title} sectionKey={matched} />;
    }
  }
  // Fall through to custom page (handles /:slug for admin-created pages)
  return <CustomPageView />;
};

/**
 * Catch-all two-segment route for detail pages whose parent section has an
 * admin-overridden slug. e.g. portfolio.slug = "project" → /project/p1 works.
 */
const DynamicDetailResolver = () => {
  const { section } = useParams<{ section: string; id: string }>();
  const { seo } = useAdmin();
  const matched = resolvePathToBuiltIn(section || "", seo.pageSeo);
  if (matched === "portfolio") return <ProjectDetail />;
  if (matched === "blog") return <BlogPostPage />;
  return <NotFound />;
};


export const AppRoutes = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/strategy-call" element={<StrategyCallPage />} />
        <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
        <Route path="/portfolio/:id" element={<ProjectDetail />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/services/website-seo" element={<WebsiteSEOPage />} />
        <Route path="/services/ecommerce-seo" element={<EcommerceSEOPage />} />
        <Route path="/services/graphics-design" element={<GraphicsDesignPage />} />
        <Route path="/services/:slug" element={<ComingSoonService />} />
        {Object.entries(SECTION_COMPONENTS).map(([key, { Component, title }]) => (
          <Route
            key={key}
            path={`/${key}`}
            element={<SectionPage Section={Component} title={title} sectionKey={key} />}
          />
        ))}
        <Route path="/p/:slug" element={<CustomPageView />} />
        <Route path="/sitemap" element={<SitemapViewer />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/:slug" element={<DynamicSlugResolver />} />
        <Route path="/:section/:id" element={<DynamicDetailResolver />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
