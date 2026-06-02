import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ToolkitSection from "@/components/ToolkitSection";
import ProjectsSection from "@/components/ProjectsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="flex flex-col w-full max-w-4xl mx-auto px-4">
      <HeroSection />
      <AboutSection />
      <ToolkitSection />
      <ProjectsSection />
      <TestimonialsSection />
      <FooterSection />
    </main>
  );
};

export default Index;
