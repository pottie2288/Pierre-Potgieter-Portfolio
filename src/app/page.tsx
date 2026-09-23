import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ServicesIntro from "@/components/ServicesIntro";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Credentials from "@/components/Credentials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SiteAnimations from "@/components/SiteAnimations";

export default function Home() {
  return (
    <>
      <PageTransition />
      <main data-page-container="" className="main-wrapper">
        <Header />
        <Hero />
        <About />
        <ServicesIntro />
        <Services />
        <Portfolio />
        <Credentials />
        <Contact />
        <Footer />
      </main>
      <SiteAnimations />
    </>
  );
}
