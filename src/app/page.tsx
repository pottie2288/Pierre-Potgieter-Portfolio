import Navbar              from "@/components/Navbar";
import HeroSection         from "@/components/HeroSection";
import FeaturedWork        from "@/components/FeaturedWork";
import AboutMeSection      from "@/components/AboutMeSection";
import ServicesSection     from "@/components/ServicesSection";
import RunnerGame          from "@/components/RunnerGame";
import PhilosophySection   from "@/components/PhilosophySection";
import Footer              from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <PhilosophySection />
        <FeaturedWork />
        <AboutMeSection />
        <ServicesSection />
        <RunnerGame />
      </main>
      <Footer />
    </>
  );
}
