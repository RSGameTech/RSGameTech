import { RevealGroup, Reveal } from "@/components/Reveal";
import FooterSection from "@/components/FooterSection";
import TermsContent from "@/content/terms.mdx";

const Terms = () => (
  <main className="flex flex-col gap-6 px-4 max-w-2xl mx-auto min-h-viewport pt-[90px]">
    <RevealGroup trigger="mount" className="flex flex-col gap-6">
      <Reveal
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: "var(--glass)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div
          className="prose max-w-none"
          style={{
            fontSize: 15,
            "--tw-prose-body": "var(--text-muted)",
            "--tw-prose-headings": "var(--text-color)",
            "--tw-prose-bold": "var(--text-color)",
            "--tw-prose-links": "var(--accent-purple)",
          } as React.CSSProperties}
        >
          <TermsContent />
        </div>
      </Reveal>
    </RevealGroup>
    <FooterSection />
  </main>
);

export default Terms;
