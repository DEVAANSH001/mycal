import Navbar from "@/components/Landing/Navbar";
import Hero from "@/components/Landing/Hero";
import LogoBar from "@/components/Landing/LogoBar";
import HowItWorks from "@/components/Landing/HowItWorks";
import Features from "@/components/Landing/Features";
import FeatureGrid from "@/components/Landing/FeatureGrid";

import Footer from "@/components/Landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 font-sans text-gray-900 selection:bg-gray-900 selection:text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <LogoBar />
      <HowItWorks />
      <Features />
      <FeatureGrid />
     
      <Footer />
    </main>
  );
}
