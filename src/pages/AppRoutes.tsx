import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./Index.tsx";

const NotFound = lazy(() => import("./NotFound.tsx"));
const BlogPage = lazy(() => import("./Blog.tsx"));
const BlogPostPage = lazy(() => import("./BlogPost.tsx"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.tsx"));
const WebsiteSEOPage = lazy(() => import("./services/WebsiteSEO.tsx"));
const EcommerceSEOPage = lazy(() => import("./services/EcommerceSEO.tsx"));
const GraphicsDesignPage = lazy(() => import("./services/GraphicsDesign.tsx"));
const ComingSoonService = lazy(() => import("./services/ComingSoon.tsx"));
const SectionPage = lazy(() => import("./SectionPage").then((m) => ({ default: m.SectionPage })));
const CustomPageView = lazy(() => import("./CustomPageView").then((m) => ({ default: m.CustomPageView })));

import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { About } from "@/components/site/About";
import { Portfolio } from "@/components/site/Portfolio";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Blog as BlogSection } from "@/components/site/Blog";

const SECTION_COMPONENTS: Record<string, { Component: React.ComponentType; title: string }> = {
  services: { Component: Services, title: "Services" },
  about: { Component: About, title: "About" },
  portfolio: { Component: Portfolio, title: "Portfolio" },
  testimonials: { Component: Testimonials, title: "Testimonials" },
  contact: { Component: Contact, title: "Contact" },
};

const RouteFallback = () => (
  <div className="min-h-screen grid place-items-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <img src="/favicon.jpg" alt="AniRise" className="h-12 w-12 rounded-full animate-pulse" />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<BlogPage />} />
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
