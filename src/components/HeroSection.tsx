import { useState, useEffect, useRef } from "react";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RevealGroup, Reveal } from "@/components/Reveal";
import { getLenis } from "@/hooks/useSmoothScroll";
import { ChevronDown } from "lucide-react";
import config from "@/config/hero";
import { socials } from "@/config/socials";
import SocialIcon from "@/components/SocialIcon";

const HeroSection = () => {

  const words = config.gradientWords ?? ["web", "startups", "humans", "tomorrow", "fun"];
  const typedWord = useTypingEffect(words);

  const [isScrolled, setIsScrolled] = useState(false);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fade the scroll indicator out once scrolled (delayed fade-in on load).
  // overwrite:true kills any pending tween — without it, the delayed 1.5s
  // fade-in could fire after the fade-out and bring the indicator back.
  useGSAP(
    () => {
      gsap.to(scrollIndicatorRef.current, {
        opacity: isScrolled ? 0 : 1,
        duration: isScrolled ? 0.3 : 1,
        delay: isScrolled ? 0 : 1.5,
        ease: "power2.out",
        overwrite: true,
      });
    },
    { dependencies: [isScrolled] }
  );

  const scrollToNextSection = () => {
    // Measure the hero instead of assuming it is exactly window.innerHeight —
    // on iOS Safari innerHeight tracks whichever viewport the address bar
    // currently gives us, while the hero is pinned to the small viewport (svh),
    // so the two disagree by the height of the bar and the scroll overshoots.
    const target = heroRef.current?.offsetHeight ?? window.innerHeight;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="w-full relative flex flex-col justify-center min-h-viewport"
    >
      <RevealGroup
        trigger="mount"
        className="flex flex-col gap-5"
      >
        {/* Status badge */}
        <Reveal>
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
        </Reveal>

        {/* Headline */}
        <Reveal
          as="h1"
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
        </Reveal>

        {/* Tagline */}
        <Reveal
          as="p"
          style={{
            fontSize: 18,
            color: "var(--text-muted)",
            maxWidth: 520,
            lineHeight: 1.6,
          }}
        >
          {config.tagline}
        </Reveal>

        {/* Social links */}
        {socials.some(s => s.showInHero !== false) && (
          <Reveal className="flex items-center gap-2">
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
          </Reveal>
        )}

      </RevealGroup>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        style={{ opacity: 0, pointerEvents: isScrolled ? "none" : "auto" }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors z-10"
        onClick={scrollToNextSection}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
        <ChevronDown size={20} className="animate-bounce" />
      </div>
    </section>
  );
};

export default HeroSection;

