import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { WaitlistProvider } from "./context/WaitlistContext.jsx";
import { MusicProvider } from "./context/MusicContext.jsx";
import Home from "./pages/Home.jsx";
import BlogIndex from "./pages/BlogIndex.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";
import CareersIndex from "./pages/CareersIndex.jsx";
import JobDetailPage from "./pages/JobDetailPage.jsx";
import Success from "./pages/Success.jsx";
import AdminPortal from "./pages/AdminPortal.jsx";
import JugarrisIndex from "./pages/JugarrisIndex.jsx";
import JugarrProfilePage from "./pages/JugarrProfilePage.jsx";
import AzaadBharat from "./pages/AzaadBharat.jsx";

export default function App() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Add light theme class on load
    document.documentElement.classList.add("light");
  }, []);

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace("#", "");
      const scrollToElement = () => {
        const el =
          document.getElementById(targetId) ||
          (targetId === "cta" ? document.querySelector(".cta-section") : null);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      };

      if (!scrollToElement()) {
        const timer = setTimeout(() => {
          scrollToElement();
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      // Scroll to top on page change if no hash
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <WaitlistProvider>
      <MusicProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/careers" element={<CareersIndex />} />
          <Route path="/careers/:slug" element={<JobDetailPage />} />
          <Route path="/meet-the-jugarris" element={<JugarrisIndex />} />
          <Route path="/meet-the-jugarris/:slug" element={<JugarrProfilePage />} />
          <Route path="/success" element={<Success />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/azaad-bharat" element={<AzaadBharat />} />
        </Routes>
      </MusicProvider>
    </WaitlistProvider>
  );
}
