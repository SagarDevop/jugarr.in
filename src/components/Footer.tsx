import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-brand-title">Jugarr</span>
          <p className="footer-brand-desc">
            Connecting the dots of campus potential across India.
          </p>
          <div className="social-links">
            <a
              href="https://www.instagram.com/jugarr.in"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/jugaaddotco/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a
              href="https://www.threads.com/@jugarr.in"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Threads"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12.632 20.301c-2.274 0-4.004-.543-5.143-1.613-1.12-1.052-1.688-2.511-1.688-4.336v-1.637c0-2.072.548-3.722 1.632-4.904C8.528 6.618 10.138 6 12.262 6c2.091 0 3.731.593 4.876 1.765 1.132 1.157 1.706 2.748 1.706 4.729v3.081c0 1.258-.87 1.83-1.895 1.83-.984 0-1.768-.621-1.768-1.83v-3.081c0-1.134-.336-1.996-1.002-2.563-.675-.573-1.554-.863-2.611-.863-1.229 0-2.188.423-2.852 1.258-.667.839-1.005 2.05-1.005 3.6v1.637c0 1.294.341 2.308 1.013 3.018.667.703 1.584 1.06 2.723 1.06 1.144 0 2.062-.352 2.732-1.045l1.62 1.631c-1.12 1.196-2.628 1.804-4.475 1.804zM12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" />
              </svg>
            </a>
            <a
              href="https://x.com/Jugaaddotco"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="X"
            >
              <svg viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-nav">
          <div className="footer-col">
            <span className="footer-col-title">Network</span>
            <Link href="#" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="#" className="footer-link">
              Terms of Service
            </Link>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Join Us</span>
            <Link href="#" className="footer-link">
              Campus Ambassadors
            </Link>
            <Link href="#" className="footer-link">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} JUGARR. ALL RIGHTS RESERVED. MADE BY STUDENTS FOR STUDENTS.
        </p>
      </div>
    </footer>
  );
}
