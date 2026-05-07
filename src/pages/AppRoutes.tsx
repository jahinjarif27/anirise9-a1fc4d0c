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
import { useAdmin } from "@/context/AdminContext";

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: Hero,
  services: Services,
  about: About,
  portfolio: Portfolio,
  blog: BlogSection,
  testimonials: Testimonials,
  contact: Contact,
};

export const AppRoutes = () => {
  const { pageLocation } = useAdmin();
  const standaloneSections = Object.keys(SECTION_COMPONENTS).filter(
    (k) => k !== "hero" && pageLocation[k] && pageLocation[k] !== "home"
  );

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/services/website-seo" element={<WebsiteSEOPage />} />
      <Route path="/services/ecommerce-seo" element={<EcommerceSEOPage />} />
      <Route path="/services/graphics-design" element={<GraphicsDesignPage />} />
      <Route path="/services/:slug" element={<ComingSoonService />} />
      {standaloneSections.map((k) => (
        <Route key={k} path={`/${k}`} element={<SectionPage Section={SECTION_COMPONENTS[k]} />} />
      ))}
      <Route path="/p/:slug" element={<CustomPageView />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
