import { useState, useEffect } from "react";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import { motion } from "framer-motion";
import { staggerContainer, revealVariants } from "@/hooks/useScrollReveal";
import { ChevronDown } from "lucide-react";
import config from "@/config/hero";
import { socials } from "@/config/socials";
import SocialIcon from "@/components/SocialIcon";

const HeroSection = () => {

  const words = config.gradientWords ?? ["web", "startups", "humans", "tomorrow", "fun"];
  const typedWord = useTypingEffect(words);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToNextSection = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="w-full relative flex flex-col justify-center min-h-[100vh] min-h-[100dvh]"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5"
      >
        {/* Status badge */}
        <motion.div variants={revealVariants}>
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm"
            style={{
              background: "var(--glass)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--glass-border)",
              color: "var(--accent-purple)",
              width: "fit-content",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#4ade80", animation: "pulse 2s infinite" }}
            />
            {config.availability ?? "Available for work"}
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={revealVariants}
          className="font-bold leading-[1.1]"
          style={{
            fontSize: "clamp(40px, 7vw, 72px)",
            letterSpacing: "-2px",
            color: "var(--text-color)",
          }}
        >
          I build things
          <br />
          for the{" "}
          <span className="gradient-text">{typedWord}</span>
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: "0.9em",
              background: "var(--accent-purple)",
              marginLeft: 4,
              animation: "blink 0.8s step-end infinite",
              verticalAlign: "baseline",
              position: "relative",
              top: "0.05em",
            }}
          />
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={revealVariants}
          style={{
            fontSize: 18,
            color: "var(--text-muted)",
            maxWidth: 520,
            lineHeight: 1.6,
          }}
        >
          {config.tagline}
        </motion.p>

        {/* Social links */}
        {socials.some(s => s.showInHero !== false) && (
          <motion.div variants={revealVariants} className="flex items-center gap-2">
            {socials.filter(s => s.showInHero !== false).map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  background: "var(--glass)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-muted)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--glass-strong)";
                  e.currentTarget.style.color = "var(--text-color)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--glass)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <SocialIcon link={s} />
                {s.label}
              </a>
            ))}
          </motion.div>
        )}

      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 0 : 1 }}
        transition={{ delay: isScrolled ? 0 : 1.5, duration: isScrolled ? 0.3 : 1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors z-10"
        style={{ pointerEvents: isScrolled ? "none" : "auto" }}
        onClick={scrollToNextSection}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
        <ChevronDown size={20} className="animate-bounce" />
      </motion.div>
    </section>
  );
};

export default HeroSection;

