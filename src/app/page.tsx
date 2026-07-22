import Navbar              from "@/components/Navbar";
import HeroSection         from "@/components/HeroSection";
import FeaturedWork        from "@/components/FeaturedWork";
import AboutMeSection      from "@/components/AboutMeSection";
import InkRevealSection    from "@/components/InkRevealSection";
import ServicesSection     from "@/components/ServicesSection";
import ContactSection      from "@/components/ContactSection";
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
        <InkRevealSection />
        <ServicesSection />
        <ContactSection />
        <RunnerGame />
      </main>
      <Footer />
    </>
  );
}
