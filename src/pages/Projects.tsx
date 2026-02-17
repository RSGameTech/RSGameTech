import DotGridBackground from "@/components/DotGridBackground";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import GlassContainer from "@/components/GlassContainer";
import { Button } from "@/components/ui/button";
import { useMouseGlow } from "@/hooks/useMouseGlow";
import { Construction, ArrowLeft } from "lucide-react";

const Projects = () => {
  useMouseGlow();

  return (
    <>
      <DotGridBackground />
      <Navbar />
      <main className="flex flex-col items-center justify-center gap-4 px-4 max-w-4xl mx-auto min-h-screen pb-[20px] pt-[70px]">
        <GlassContainer className="text-center py-16 px-8 max-w-md w-full">
          <Construction className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Projects</h1>
          <p className="text-muted-foreground text-sm mb-6">Coming Soon</p>
          <Button variant="ghost" asChild className="glass-inner glow-container rounded-full px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">
            <a href="/"><ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home</a>
          </Button>
        </GlassContainer>
        <FooterSection />
      </main>
    </>
  );
};

export default Projects;
