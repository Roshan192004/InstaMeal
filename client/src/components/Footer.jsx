import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Logo */}
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-name-footer">instaMeal</span>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-links-grid">
          {/* Column 1 */}
          <div className="footer-col">
            <h4>Eternal</h4>
            <ul>
              <li><a href="#">instaMeal</a></li>
              <li><a href="#">Blinkit</a></li>
              <li><a href="#">District</a></li>
              <li><a href="#">Hyperpure</a></li>
              <li><a href="#">Feeding India</a></li>
              <li><a href="#">Investor Relations</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h4>For Restaurants</h4>
            <ul>
              <li><a href="#">Partner With Us</a></li>
              <li><a href="#">Apps For You</a></li>
              <li><a href="#">Restaurant Consulting</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h4>For Delivery Partners</h4>
            <ul>
              <li><a href="#">Partner With Us</a></li>
              <li><a href="#">Apps For You</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="footer-col">
            <h4>Learn More</h4>
            <ul>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Security</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Help & Support</a></li>
              <li><a href="#">Report a Fraud</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          {/* Column 5: Social Links */}
          <div className="footer-col social-col">
            <h4>Social Links</h4>
            <div className="social-icons">
              <a href="#" aria-label="LinkedIn" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" aria-label="Youtube" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter (X)" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>

            <div className="app-store-buttons">
              <button className="btn-store">
                <svg viewBox="0 0 384 512" className="store-icon" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                <div className="store-text">
                  <span className="store-subtitle">Download on the</span>
                  <span className="store-title">App Store</span>
                </div>
              </button>
              
              <button className="btn-store">
                <svg viewBox="0 0 512 512" className="store-icon" fill="currentColor">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                </svg>
                <div className="store-text">
                  <span className="store-subtitle">GET IT ON</span>
                  <span className="store-title">Google Play</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners.<br />2008-2026 © instaMeal™ Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
