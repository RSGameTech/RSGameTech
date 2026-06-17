import { RevealGroup, Reveal } from "@/components/Reveal";
import config from "@/config/about";
import AboutContent from "@/content/about.mdx";

// Set to true once the correct stats data is ready
const SHOW_ABOUT_STATS = false;

const AboutSection = () => {
  const photoSrc = config.photo || "/avatar-alt.jpg";

  return (
    <section id="about" className="w-full flex flex-col justify-center relative py-5">
      <RevealGroup className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 md:items-center">
        {/* Photo / placeholder */}
        <Reveal className="relative mx-auto flex-shrink-0 self-center" style={{ width: 304, height: 304 }}>
          {/* Photo — centered within the frame container */}
          <div
            className="absolute overflow-hidden rounded-full shadow-lg"
            style={{
              width: 240, height: 240,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              border: "2px solid var(--glass-border)",
            }}
          >
            <img src={photoSrc} alt="Ritam Sarkar" className="block h-full w-full object-cover" width={240} height={240} loading="lazy" />
          </div>
          {/* Frame fills the 304px container — no scale needed */}
          <img src="/ayaka-frame.webp" alt="" className="pointer-events-none absolute inset-0 z-10 w-full h-full object-contain" />
        </Reveal>

        {/* Text + stats */}
        <Reveal className="flex flex-col justify-center gap-4">
          <h2 className="font-bold" style={{ fontSize: 28, letterSpacing: "-1px", color: "var(--text-color)" }}>
            {config.heading}
          </h2>
          <div
            className="prose max-w-none"
            style={
              {
                fontSize: 15,
                "--tw-prose-body": "var(--text-muted)",
                "--tw-prose-bold": "var(--text-color)",
                "--tw-prose-links": "var(--accent-purple)",
              } as React.CSSProperties
            }>
            <AboutContent />
          </div>
          {SHOW_ABOUT_STATS && (
            <div className="flex gap-3 mt-2">
              {config.stats.map((s) => (
                <div
                  key={s.label}
                  className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2"
                  style={{
                    background: "var(--glass)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid var(--glass-border)",
                  }}>
                  <span className="font-bold text-2xl" style={{ color: "var(--accent-purple)" }}>
                    {s.num}
                  </span>
                  <span className="text-xs text-center leading-tight" style={{ color: "var(--text-dim)", fontFamily: "var(--mono)" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </RevealGroup>
    </section>
  );
};

export default AboutSection;
