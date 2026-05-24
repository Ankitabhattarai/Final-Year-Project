import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const barHeights = [40, 65, 50, 80, 60, 90, 70, 85, 55, 75];

export default function Landing({ onNavigateToLogin, onNavigateToSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);
  const observerRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);

    const timer = setTimeout(() => setBarsVisible(true), 600);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    return () => { window.removeEventListener("scroll", handleScroll); clearTimeout(timer); observer.disconnect(); };
  }, []);

  return (
    <>
      <div className="noise" />

      {/* ── HEADER ── */}
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          <div className="logo-mark">C</div>
          <span className="logo-name">Care<span>line</span></span>
        </div>
        <nav className="nav">
          <button className="nav-link" onClick={() => navigate('/join')}>For Hospitals</button>
          <button className="nav-link" onClick={() => navigate('/about')}>About</button>
          <button className="nav-btn-outline" onClick={onNavigateToLogin}>Log in</button>
          <button className="nav-btn-filled" onClick={onNavigateToSignup}>Get Started</button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div className="hero-inner">
          <div className="hero-left">

            <h1 className="hero-headline">
              The smarter way to<br />
              <em>manage patient flow</em>
            </h1>
            <p className="hero-sub">
              Careline's intelligent platform streamlines queues, reduces wait times, and optimizes resource allocation — so your staff can focus on what matters most.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={onNavigateToSignup}>
                Start for Free →
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-val">30<span>%</span></div>
                <div className="stat-lbl">Fewer wait times</div>
              </div>
              <div className="stat">
                <div className="stat-val">4.9<span>★</span></div>
                <div className="stat-lbl">Average rating</div>
              </div>
              <div className="stat">
                <div className="stat-val">120<span>+</span></div>
                <div className="stat-lbl">Hospitals onboarded</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="float-badge">↓ 30% wait time today</div>
            <img
              src="https://www.shutterstock.com/image-photo/meeting-tablet-team-doctors-collaboration-600nw-2478229171.jpg"
              alt="Modern Hospital Building"
              className="hero-hospital-img"
            />

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section features">
        <div className="features-inner">
          <div className="features-top fade-up">
            <div>
              <div className="section-tag">Core Features</div>
              <h2 className="section-heading">
                Everything your hospital<br /><em>needs to run smoothly</em>
              </h2>
            </div>
            <p className="section-body">
              From intake to discharge, Careline gives your team real-time intelligence and AI-driven tools to keep operations flowing and patients moving forward.
            </p>
          </div>
          <div className="features-grid fade-up">
            {[
              { num: "01", icon: "⏱", title: "Intelligent Queue Management", desc: "Real-time visibility into every queue across your entire facility. Prioritize dynamically, reduce bottlenecks, and keep patients informed automatically." },
              { num: "02", icon: "📡", title: "Live Operations Monitoring", desc: "A single pane of glass for bed status, staff allocation, and patient flow. Spot problems before they escalate with smart threshold alerts." },
              { num: "03", icon: "🤖", title: "AI Scheduling Engine", desc: "Our ML model learns from your historical patterns to auto-schedule appointments, predict surge periods, and balance resources intelligently." },
              { num: "04", icon: "💬", title: "Patient Communication", desc: "Automated SMS and app updates keep patients informed about their wait status — reducing anxiety and no-shows simultaneously." },
              { num: "05", icon: "📊", title: "Analytics & Reports", desc: "Deep-dive dashboards reveal where time and money are lost. Export HIPAA-compliant reports for compliance and performance reviews." },
              { num: "06", icon: "🔗", title: "Seamless Integrations", desc: "Connect to your existing EMR, EHR, and hospital information systems via pre-built connectors. No rip-and-replace required." },
            ].map((f) => (
              <div className="feat-card" key={f.num}>
                <div className="feat-num">{f.num}</div>
                <div className="feat-icon-wrap">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <p className="feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section className="section impact">
        <div className="impact-inner">
          <div className="fade-up">
            <div className="section-tag">Proven Results</div>
            <h2 className="section-heading">Real impact,<br /><em>measurable outcomes</em></h2>
            <div className="impact-number">30%</div>
            <p className="impact-label">Average reduction in patient wait times across our partner hospitals within the first 90 days of deployment.</p>
          </div>
          <div className="impact-pillars fade-up">
            {[
              { icon: "🏥", title: "120+ Hospital Partners", desc: "From regional clinics to multi-site health systems across 14 countries." },
              { icon: "⚡", title: "94% Faster Triage", desc: "AI-assisted priority scoring reduces manual assessment time dramatically." },
              { icon: "💰", title: "22% Cost Reduction", desc: "Better resource allocation means less waste and more efficiency per shift." },
              { icon: "😊", title: "4.9/5 Patient Satisfaction", desc: "Patients report significantly less frustration and improved communication." },
            ].map((p) => (
              <div className="pillar" key={p.title}>
                <div className="pillar-icon">{p.icon}</div>
                <div>
                  <div className="pillar-title">{p.title}</div>
                  <div className="pillar-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="testimonial-section">
        <div className="testi-inner">
          <div className="fade-up">
            <div className="section-tag">Testimonials</div>
            <h2 className="section-heading">Trusted by healthcare leaders</h2>
            <p className="section-body">Don't take our word for it — hear from the teams delivering better care with Careline.</p>
          </div>
          <div className="testi-card fade-up">
            <div className="testi-stars">{'★★★★★'}</div>
            <p className="testi-text">
              "Careline has fundamentally changed how we operate. Our emergency department used to have patients waiting over an hour — now our average is under 15 minutes. The AI scheduling alone has saved us the equivalent of two full-time staff members."
            </p>
            <div className="testi-author">
              <div className="testi-avatar">A</div>
              <div>
                <div className="testi-name">Dr. Anya Sharma</div>
                <div className="testi-role">Chief Administrator, City General Hospital</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-inner fade-up">
          <div className="section-tag" style={{ justifyContent: "center" }}>Get Started</div>
          <h2 className="cta-heading">
            Ready to <em>transform</em><br />your hospital?
          </h2>
          <p className="cta-sub">
            Join 120+ healthcare providers who trust Careline for intelligent patient flow management. Free to try, no credit card required.
          </p>
          <div className="cta-actions">
            <button className="btn-hero-primary" style={{ fontSize: "16px", padding: "16px 36px" }} onClick={onNavigateToSignup}>
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
            <div className="footer-logo logo">
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
                        navigate('/about');
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