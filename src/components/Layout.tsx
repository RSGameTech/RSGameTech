import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AmbientOrbs from "@/components/AmbientOrbs";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

interface LayoutProps {
  showNavLinks?: boolean;
}

const Layout = ({ showNavLinks = true }: LayoutProps) => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <AmbientOrbs />
      <Navbar showLinks={showNavLinks} />
      <AnimatePresence mode="sync">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </>
  );
};

export default Layout;
