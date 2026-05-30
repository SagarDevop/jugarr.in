import CursorSpotlight from "@/components/CursorSpotlight";
import PageLoader from "@/components/PageLoader";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ideology from "@/components/Ideology";
import Problem from "@/components/Problem";
import Ecosystem from "@/components/Ecosystem";
import WhatYouCanDo from "@/components/WhatYouCanDo";
import HowItWorks from "@/components/HowItWorks";
import Trust from "@/components/Trust";
import Stories from "@/components/Stories";
import Team from "@/components/Team";
import Juggu from "@/components/Juggu";
import FAQ from "@/components/FAQ";
import SEOContent from "@/components/SEOContent";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <PageLoader />
      <CursorSpotlight />
      <Header />
      <main>
        <Hero />
        <Ideology />
        <Problem />
        <Ecosystem />
        <WhatYouCanDo />
        <HowItWorks />
        <Trust />
        <Stories />
        <Team />
        <Juggu />
        <FAQ />
        <SEOContent />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
