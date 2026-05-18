import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./Index.tsx";
import BlogPage from "./Blog.tsx";
import BlogPostPage from "./BlogPost.tsx";
import { CustomPageView } from "./CustomPageView";
import { SectionPage } from "./SectionPage";

const NotFound = lazy(() => import("./NotFound.tsx"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.tsx"));
const WebsiteSEOPage = lazy(() => import("./services/WebsiteSEO.tsx"));
const EcommerceSEOPage = lazy(() => import("./services/EcommerceSEO.tsx"));
const GraphicsDesignPage = lazy(() => import("./services/GraphicsDesign.tsx"));
const ComingSoonService = lazy(() => import("./services/ComingSoon.tsx"));
const StrategyCallPage = lazy(() => import("./StrategyCallPage.tsx"));
const CaseStudyDetail = lazy(() => import("./CaseStudyDetail.tsx"));
const ProjectDetail = lazy(() => import("./ProjectDetail.tsx"));

import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Portfolio } from "@/components/site/Portfolio";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Blog as BlogSection } from "@/components/site/Blog";

const SECTION_COMPONENTS: Record<string, { Component: React.ComponentType; title: string }> = {
  services: { Component: Services, title: "Services" },
  portfolio: { Component: Portfolio, title: "Projects" },
  projects: { Component: Portfolio, title: "Projects" },
  testimonials: { Component: Testimonials, title: "Testimonials" },
  contact: { Component: Contact, title: "Contact" },
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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/:slug" element={<CustomPageView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
