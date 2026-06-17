import { useLocation, useOutlet } from "react-router-dom";
import AmbientOrbs from "@/components/AmbientOrbs";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

interface LayoutProps {
  showNavLinks?: boolean;
}

const Layout = ({ showNavLinks = true }: LayoutProps) => {
  // Initialise Lenis smooth scrolling + GSAP/ScrollTrigger sync once.
  useSmoothScroll();
  const location = useLocation();
  // useOutlet() returns a concrete element for the *current* route, so the
  // previous page can be snapshotted and animated out before unmounting.
  const outlet = useOutlet();

  return (
    <>
      <AmbientOrbs />
      <Navbar showLinks={showNavLinks} />
      <PageTransition locationKey={location.pathname}>{outlet}</PageTransition>
    </>
  );
};

export default Layout;
