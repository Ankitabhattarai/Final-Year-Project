import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";

export default function About() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);

    // Apply fade-up animations on scroll intersection
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    // Scroll to top on page load
    window.scrollTo(0, 0);

    return () => { 
      window.removeEventListener("scroll", handleScroll); 
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="noise" />

      {/* ── HEADER ── */}
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-mark">C</div>
          <span className="logo-name">Care<span>line</span></span>
        </div>
        <nav className="nav">
          <button className="nav-link" onClick={() => navigate('/')}>Home</button>
          <button className="nav-link" onClick={() => navigate('/join')}>For Hospitals</button>
          <button className="nav-link active">About</button>
          <button className="nav-btn-outline" onClick={() => navigate('/login')}>Log in</button>
          <button className="nav-btn-filled" onClick={() => navigate('/signup')}>Get Started</button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div className="about-hero-inner">
          <div className="about-hero-center fade-up visible">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              Our Mission & Purpose
            </div>
            <h1 className="about-headline">
              Empowering healthcare,<br />
              <em>one flow at a time</em>
            </h1>
            <p className="about-sub">
              We believe that seeking medical attention should be stress-free. Careline is an intelligent orchestration platform designed to streamline queues, reduce bottlenecks, and optimize resource allocation.
            </p>
          </div>
        </div>
      </section>

      {/* ── CORE PURPOSE ── */}
      <section className="section about-purpose">
        <div className="about-purpose-inner">
          <div className="about-purpose-top fade-up">
            <div className="section-tag">What Care is For</div>
            <h2 className="section-heading">
              Why we built <em>Careline</em>
            </h2>
            <p className="section-body">
              Modern healthcare facilities are overloaded, leading to long wait times, stressed staff, and poor patient experiences. Careline coordinates patient throughput from registration to recovery.
            </p>
          </div>

          <div className="about-purpose-grid fade-up">
            {[
              {
                icon: "⏱",
                title: "Streamlining the Patient Experience",
                desc: "Crowded waiting rooms increase patient anxiety and infection risks. Careline keeps patients informed with real-time queue forecasts, notifications, and fluid updates, letting them wait comfortably."
              },
              {
                icon: "👩‍⚕️",
                title: "Supporting Clinical Workforces",
                desc: " front-desk personnel and triage nurses face massive administrative pressure. By automating queue distribution and patient registration, Careline lets clinical teams do what they do best: care for patients."
              },
              {
                icon: "🔮",
                title: "AI-Driven Predictive Resource Allocation",
                desc: "Using historical trends, our machine learning engine models patient arrival patterns to help management allocate staff and beds before a surge occurs, turning reactive scheduling into proactive care."
              },
              {
                icon: "📊",
                title: "Unifying Operations & Analytics",
                desc: "Every clinic and department is interconnected. Careline brings telemetry together under simple dashboards, giving administrators the real-time insights required to run efficient, high-performance facilities."
              }
            ].map((pillar, idx) => (
              <div className="about-card" key={idx}>
                <div className="about-card-icon">{pillar.icon}</div>
                <h3 className="about-card-title">{pillar.title}</h3>
                <p className="about-card-desc">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT QUOTE ── */}
      <section className="about-quote-section fade-up">
        <div className="quote-container">
          <div className="quote-icon">“</div>
          <p className="quote-text">
            Careline is not just a tool; it is a vision of modern, stress-free health coordination. Every minute we save in a waiting lobby is a minute returned to care, family, and life.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-inner fade-up">
          <div className="section-tag" style={{ justifyContent: "center" }}>Join the Future</div>
          <h2 className="cta-heading">
            Ready to <em>transform</em><br />your patient experience?
          </h2>
          <p className="cta-sub">
            Join forward-thinking healthcare providers who trust Careline to simplify their patient journeys. Free to try, easy to integrate.
          </p>
          <div className="cta-actions">
            <button className="btn-hero-primary" style={{ fontSize: "16px", padding: "16px 36px" }} onClick={() => navigate('/signup')}>
              Start Free Trial →
            </button>
            <button className="btn-hero-ghost" style={{ fontSize: "16px", padding: "16px 28px" }} onClick={() => navigate('/join')}>
              Join as Hospital
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-logo logo" onClick={() => navigate('/')}>
              <div className="logo-mark">C</div>
              <span className="logo-name">Care<span>line</span></span>
            </div>
            <p className="footer-tagline">AI-driven queue and workflow management built for modern healthcare teams.</p>
            <div className="social-row">
              {["𝕏", "in", "▶"].map((s, i) => (
                <a key={i} href="#" className="social-btn">{s}</a>
              ))}
            </div>
          </div>
          {[
            { title: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
            { title: "Support", links: ["Help Center", "Contact Us", "Status", "Security"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "HIPAA", "Cookie Policy"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="footer-col-title">{col.title}</div>
              <div className="footer-links">
                {col.links.map((l) => (
                  <a
                    href="#"
                    className="footer-link"
                    key={l}
                    onClick={(e) => {
                      e.preventDefault();
                      if (l === "About Us") {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        navigate('/');
                      }
                    }}
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2025 Careline Inc. All rights reserved.</span>
          <span>Built for the future of healthcare</span>
        </div>
      </footer>
    </>
  );
}
