import { Route, Routes } from "react-router-dom";
import Index from "./Index.tsx";
import NotFound from "./NotFound.tsx";
import BlogPage from "./Blog.tsx";
import BlogPostPage from "./BlogPost.tsx";
import AdminDashboard from "./admin/AdminDashboard.tsx";
import WebsiteSEOPage from "./services/WebsiteSEO.tsx";
import EcommerceSEOPage from "./services/EcommerceSEO.tsx";
import GraphicsDesignPage from "./services/GraphicsDesign.tsx";
import ComingSoonService from "./services/ComingSoon.tsx";
import { SectionPage } from "./SectionPage";
import { CustomPageView } from "./CustomPageView";
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

export const AppRoutes = () => {
  return (
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
  );
};
