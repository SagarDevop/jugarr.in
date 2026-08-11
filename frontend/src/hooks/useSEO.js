import { useEffect } from "react";

const SITE_URL = "https://jugarr.in";
const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image.png`;

/**
 * useSEO – Sets all SEO-relevant <head> tags dynamically.
 *
 * @param {object} options
 * @param {string}  options.title          - Page <title>
 * @param {string}  options.description    - Meta description
 * @param {string[]} [options.keywords]    - Meta keywords array
 * @param {string}  [options.canonicalUrl] - Explicit canonical URL (defaults to current URL)
 * @param {string}  [options.ogType]       - og:type (default: "website")
 * @param {string}  [options.ogImage]      - Absolute URL to og:image
 * @param {string}  [options.robots]       - robots directive (default: "index, follow")
 */
export function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  robots = "index, follow",
}) {
  useEffect(() => {
    // ── Helpers ─────────────────────────────────────────────────────────────
    const setMeta = (attr, value, content) => {
      let el = document.querySelector(`meta[${attr}="${value}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // ── Canonical URL ────────────────────────────────────────────────────────
    // Derive from window.location if not explicitly supplied, always using
    // the canonical domain (strips www, enforces https://jugarr.in).
    const resolvedCanonical =
      canonicalUrl ||
      (() => {
        const path = window.location.pathname + window.location.search;
        return `${SITE_URL}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
      })();

    // ── Title ────────────────────────────────────────────────────────────────
    if (title) {
      document.title = title;
    }

    // ── Canonical link ───────────────────────────────────────────────────────
    setLink("canonical", resolvedCanonical);

    // ── Standard meta tags ───────────────────────────────────────────────────
    if (description) {
      setMeta("name", "description", description);
    }
    if (keywords && keywords.length > 0) {
      setMeta("name", "keywords", keywords.join(", "));
    }
    setMeta("name", "robots", robots);

    // ── Open Graph ───────────────────────────────────────────────────────────
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:url", resolvedCanonical);
    if (title) setMeta("property", "og:title", title);
    if (description) setMeta("property", "og:description", description);
    if (ogImage) setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", "Jugarr");

    // ── Twitter / X ──────────────────────────────────────────────────────────
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("property", "twitter:url", resolvedCanonical);
    if (title) setMeta("property", "twitter:title", title);
    if (description) setMeta("property", "twitter:description", description);
    if (ogImage) setMeta("property", "twitter:image", ogImage);
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, robots]);
}
