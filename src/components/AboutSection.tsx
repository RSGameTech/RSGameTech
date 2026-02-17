import { useMarkdown } from "@/hooks/useConfig";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const AboutSection = () => {
  const { content: md, isLoading } = useMarkdown("/content/about.md");

  const blocks = md ? md.split("\n\n").filter(Boolean) : [];

  if (isLoading) {
    return (
      <section>
        <Card className="glass rounded-xl glow-container border-0 p-6 space-y-4">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </section>
    );
  }

  return (
    <section>
      <Card className="glass rounded-xl glow-container border-0">
        {blocks.length > 0 && (
          <CardHeader>
            {blocks[0].startsWith("# ") && (
              <h2 className="text-2xl font-bold text-foreground">
                {blocks[0].replace("# ", "")}
              </h2>
            )}
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {md ? (
            blocks.slice(blocks[0]?.startsWith("# ") ? 1 : 0).map((block, i) => {
              if (/^(\*{3,}|-{3,}|_{3,})$/.test(block.trim())) {
                return <Separator key={i} className="my-4" />;
              }
              const parts = block.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return <strong key={j} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
                }
                return part;
              });
              return (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {parts}
                </p>
              );
            })
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default AboutSection;
