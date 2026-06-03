import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import FooterSection from "@/components/FooterSection";
import { staggerContainer, revealVariants } from "@/hooks/useScrollReveal";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex flex-col w-full max-w-4xl mx-auto px-4 min-h-screen pt-[90px]">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center"
      >
        <motion.div
          variants={revealVariants}
          className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center"
          style={{
            background: "var(--glass)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h1
            className="font-bold"
            style={{ fontSize: 72, letterSpacing: "-4px", color: "var(--text-color)", lineHeight: 1 }}
          >
            404
          </h1>
          <p className="text-base font-medium" style={{ color: "var(--text-muted)" }}>
            Oops! Page not found.
          </p>
          <Link
            to="/"
            className="mt-2 inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: "var(--accent-purple)" }}
          >
            Return to Home
          </Link>
        </motion.div>
      </motion.div>
      <FooterSection />
    </main>
  );
};

export default NotFound;
