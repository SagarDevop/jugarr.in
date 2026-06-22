import { useEffect } from "react";
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
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

export default function Home() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("jugarr_referred_by", ref.toUpperCase());
    }
    
    const join = params.get("join");
    if (join === "true") {
      setTimeout(() => {
        const el = document.querySelector(".cta-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  }, []);

  useSEO({
    title: "Jugarr – Student Marketplace | Buy, Sell & Earn on Campus",
    description: "India’s student-to-student campus marketplace. Buy and sell old books, notes, furniture, and gadgets. Find opportunities and earn within your college.",
    keywords: [
      "Jugarr",
      "student marketplace",
      "campus marketplace",
      "college marketplace",
      "student-to-student marketplace",
      "buy and sell books college",
      "sell old books",
      "second-hand furniture college",
      "student opportunities",
      "student economy",
      "campus market",
      "student services",
      "buy and sell on campus",
      "college marketplace India",
      "student gigs",
      "student network",
      "circular economy",
    ],
  });

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
        
        
        <FinalCTA />
      </main>
      <FAQ />
      <Footer />
    </>
  );
}
