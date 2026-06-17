import { Link } from "react-router-dom";
import { RevealGroup, Reveal } from "@/components/Reveal";
import { useMouseGlow } from "@/hooks/useMouseGlow";
import FooterSection from "@/components/FooterSection";
import { ArrowUpRight, Github, ArrowLeft } from "lucide-react";
import config from "@/config/projects";

const statusStyles: Record<string, { label: string; bg: string; dot: string }> = {
  live:     { label: "Live",     bg: "rgba(34,197,94,0.12)",   dot: "#22c55e" },
  wip:      { label: "WIP",      bg: "rgba(234,179,8,0.12)",   dot: "#eab308" },
  archived: { label: "Archived", bg: "rgba(148,163,184,0.12)", dot: "#94a3b8" },
};

const Projects = () => {
  useMouseGlow();

  return (
    <main className="flex flex-col w-full max-w-4xl mx-auto px-4 pt-[70px]">
      <RevealGroup trigger="mount" className="flex flex-col gap-8 py-10">
        {/* Back link */}
        <Reveal>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-color)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <ArrowLeft size={14} /> Back to home
          </Link>
        </Reveal>

        {/* Heading */}
        <Reveal>
          <h1
            className="font-bold"
            style={{ fontSize: 28, letterSpacing: "-1px", color: "var(--text-color)" }}
          >
            {config.heading}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {config.subheading}
          </p>
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.items.map((project, i) => {
            const st = project.status ? statusStyles[project.status] : null;
            return (
              <Reveal key={i} className="h-full">
                <div
                  className="rounded-2xl h-full flex flex-col overflow-hidden"
                  style={{
                    background: "var(--glass)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  {/* Image */}
                  <div
                    className="relative w-full overflow-hidden aspect-[4/3] flex-shrink-0"
                    style={{
                      background: project.image
                        ? undefined
                        : "linear-gradient(135deg, var(--glass-strong) 0%, var(--glass) 100%)",
                    }}
                  >
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
                      />
                    ) : (
                      <span
                        className="absolute inset-0 flex items-center justify-center text-4xl font-black tracking-tighter select-none opacity-10"
                        style={{ color: "var(--text-color)" }}
                      >
                        {project.title.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    {st && (
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          background: st.bg,
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          color: "var(--text-color)",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                        {st.label}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 gap-3 p-5">
                    <h2
                      className="font-semibold text-base leading-snug"
                      style={{ color: "var(--text-color)" }}
                    >
                      {project.title}
                    </h2>

                    <p
                      className="text-sm leading-relaxed flex-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {project.description}
                    </p>

                    {project.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag.label}
                            className="text-xs font-medium rounded-md px-2.5 py-0.5"
                            style={{
                              background: "var(--glass)",
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                              border: "1px solid var(--glass-border)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {project.tags?.length > 0 && (project.liveUrl || project.repoUrl) && (
                      <div style={{ borderTop: "1px solid var(--glass-border)" }} />
                    )}

                    {(project.liveUrl || project.repoUrl) && (
                      <div className="flex items-center gap-2">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
                            style={{ background: "var(--accent-purple)" }}
                          >
                            Live <ArrowUpRight size={12} />
                          </a>
                        )}
                        {project.repoUrl && (
                          <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                            style={{
                              background: "var(--glass-strong)",
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                              border: "1px solid var(--glass-border)",
                              color: "var(--text-color)",
                            }}
                          >
                            <Github size={12} /> Repo
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </RevealGroup>

      <FooterSection />
    </main>
  );
};

export default Projects;
