import './Landing.css';

function Landing({ onNavigateToLogin, onNavigateToSignup }) {
  return (
    <div className="landing-container">
      {/* HEADER / NAVIGATION */}
      <header className="header">
        <div className="logo">
          <div className="logo-placeholder">Careline</div>
          <span className="logo-text">Careline</span>
        </div>
        <nav className="nav">
          <button className="nav-btn hospital-btn" onClick={() => window.location.href = '/join'}>Join as Hospital</button>
          <button className="nav-btn login-btn" onClick={onNavigateToLogin}>Patient Login</button>
          <button className="nav-btn signup-btn" onClick={onNavigateToSignup}>Sign Up</button>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Revolutionizing Hospital Efficiency with AI Queue Management
            </h1>
            <p className="hero-description">
              Careline's intelligent platform streamlines patient flow, reduces wait times, and optimizes resource allocation for a seamless healthcare experience.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={onNavigateToSignup}>Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">Hospital Image</div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <h2 className="section-title">Streamline Operations with Core Features</h2>
        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon">•</div>
            <h3 className="feature-title">Reduce Patient Wait Times</h3>
            <p className="feature-description">
              Optimize patient flow with real-time queue management and intelligent scheduling.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon">•</div>
            <h3 className="feature-title">Real-time Monitoring</h3>
            <p className="feature-description">
              Get instant insights into queue status and resource allocation for better decisions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon">•</div>
            <h3 className="feature-title">AI-Powered Scheduling</h3>
            <p className="feature-description">
              Automate appointment scheduling with AI to maximize efficiency and resource allocation.
            </p>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className="impact-section">
        <h2 className="section-title">Proven Impact on Healthcare Efficiency</h2>
        <div className="impact-stat">
          <div className="stat-number">30%</div>
          <div className="stat-label">Reduction in Patient Wait Times</div>
        </div>
        <p className="impact-description">
          Careline's innovative AI platform has empowered leading hospitals to significantly enhance operational efficiency and patient satisfaction, helping every reduce costs.
        </p>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Partners Say</h2>
        <div className="testimonial-card">
          <div className="testimonial-content">
            <p className="testimonial-text">
              "Careline has transformed our patient management system. The AI-driven insights have drastically cut down wait times, allowing our staff to focus more on patient care rather than logistics for modern hospitals."
            </p>
            <div className="testimonial-author">
              <div className="author-image">
                <div className="image-placeholder-small">User Photo</div>
              </div>
              <div className="author-info">
                <div className="author-name">Dr. Anya Sharma</div>
                <div className="author-title">Chief Administrator, City General Hospital</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Transform Your Hospital?</h2>
        <p className="cta-description">
          Join leading healthcare providers who trust Careline for intelligent queue management and enhanced patient experiences.
        </p>
        <button className="btn-primary" onClick={onNavigateToSignup}>Sign Up for Free</button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-placeholder">Careline</div>
              <span className="logo-text">Careline</span>
            </div>
            <p className="footer-tagline">
              AI-driven and cloud-based queue and workflow management.
            </p>
            <div className="social-links">
              <span className="social-label">Social Accounts Here</span>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <a href="#" className="footer-link">About Us</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Blog</a>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Support</h4>
              <a href="#" className="footer-link">Help Center</a>
              <a href="#" className="footer-link">Contact Us</a>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Legal</h4>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Careline. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
