import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";

const Index = lazy(() => import("./pages/Index"));
const Links = lazy(() => import("./pages/Links"));
const Projects = lazy(() => import("./pages/Projects"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Uses = lazy(() => import("./pages/Uses"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div
    className="flex items-center justify-center min-h-screen"
    style={{ background: "var(--bg1)" }}
  />
);

const App = () => {
  const isLinksSubdomain = window.location.hostname.startsWith("links.");
  const isBlogsSubdomain = window.location.hostname.startsWith("blogs.");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Links subdomain: hide nav links */}
              {isLinksSubdomain ? (
                <Route element={<Layout showNavLinks={false} />}>
                  <Route path="/" element={<Links />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              ) : (
                <>
                  {/* Layout with nav links */}
                  <Route element={<Layout />}>
                    <Route path="/" element={isBlogsSubdomain ? <Blogs /> : <Index />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/:slug" element={<BlogPost />} />
                    <Route path="/uses" element={<Uses />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  {/* Layout without nav links (links page) */}
                  <Route element={<Layout showNavLinks={false} />}>
                    <Route path="/links" element={<Links />} />
                  </Route>
                </>
              )}
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
