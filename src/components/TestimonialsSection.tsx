import { RevealGroup, Reveal } from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import config from "@/config/testimonials";

const TestimonialsSection = () => {
  if (config.items.length === 0) return null;

  return (
    <section id="testimonials" className="w-full flex flex-col justify-center relative py-5">
      <RevealGroup className="flex flex-col gap-8">
        <Reveal>
          <h2
            className="font-bold"
            style={{ fontSize: 28, letterSpacing: "-1px", color: "var(--text-color)" }}
          >
            {config.heading}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {config.subheading}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {config.items.map((t, i) => (
            <Reveal key={i} className="h-full">
              <TiltCard
                className="rounded-2xl p-4 md:p-6 h-full flex flex-col gap-4 md:gap-5"
                style={{
                  background: "var(--glass)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <div className="flex flex-col gap-1">
                  <div
                    className="text-3xl md:text-[40px] leading-none"
                    style={{
                      color: "var(--accent-purple)",
                      fontFamily: "Georgia, serif",
                      opacity: 0.6,
                    }}
                  >
                    "
                  </div>
                  <blockquote
                    className="flex-1 text-xs md:text-sm leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t.quote}
                  </blockquote>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "var(--accent-purple)" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-color)" }}
                    >
                      {t.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-dim)", fontFamily: "var(--mono)" }}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </RevealGroup>
    </section>
  );
};

export default TestimonialsSection;
