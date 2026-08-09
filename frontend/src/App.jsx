import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import BlogIndex from "./pages/BlogIndex.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";
import Success from "./pages/Success.jsx";
import AdminPortal from "./pages/AdminPortal.jsx";

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Add light theme class on load
    document.documentElement.classList.add("light");
  }, []);

  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/success" element={<Success />} />
      <Route path="/admin" element={<AdminPortal />} />
    </Routes>
  );
}
