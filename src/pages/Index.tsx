import DotGridBackground from "@/components/DotGridBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ToolkitSection from "@/components/ToolkitSection";
import FooterSection from "@/components/FooterSection";
import { useMouseGlow } from "@/hooks/useMouseGlow";
const Index = () => {
  useMouseGlow();
  return <>
      <DotGridBackground />
      <Navbar />
      <main className="flex flex-col gap-4 px-4 max-w-4xl mx-auto min-h-screen pb-[20px] pt-[70px]">
        <HeroSection />
        <AboutSection />
        <ToolkitSection />
        <FooterSection />
      </main>
    </>;
};
export default Index;