import { useEffect } from "react";
import CursorSpotlight from "@/components/CursorSpotlight.jsx";
import PageLoader from "@/components/PageLoader.jsx";
import Header from "@/components/Header.jsx";
import Hero from "@/components/Hero.jsx";
import Ideology from "@/components/Ideology.jsx";
import Problem from "@/components/Problem.jsx";
import Ecosystem from "@/components/Ecosystem.jsx";
import WhatYouCanDo from "@/components/WhatYouCanDo.jsx";
import HowItWorks from "@/components/HowItWorks.jsx";
import Trust from "@/components/Trust.jsx";
import Stories from "@/components/Stories.jsx";
import Team from "@/components/Team.jsx";
import Juggu from "@/components/Juggu.jsx";
import FAQ from "@/components/FAQ.jsx";
import FinalCTA from "@/components/FinalCTA.jsx";
import Footer from "@/components/Footer.jsx";
import { useSEO } from "@/hooks/useSEO.js";

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
    canonicalUrl: "https://jugarr.in/",
    robots: "index, follow",
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
