import CursorSpotlight from "@/components/CursorSpotlight";
import PageLoader from "@/components/PageLoader";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ideology from "@/components/Ideology";
import Problem from "@/components/Problem";
import Ecosystem from "@/components/Ecosystem";
import HowItWorks from "@/components/HowItWorks";
import Stories from "@/components/Stories";
import Team from "@/components/Team";
import Juggu from "@/components/Juggu";
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
        <HowItWorks />
        <Stories />
        <Team />
        <Juggu />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
