import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Network,
  ShieldAlert,
  BrainCircuit,
  Search,
  Link2,
  AlertTriangle,
  Eye,
  Database,
  ArrowRight,
  Fingerprint,
} from "lucide-react";

import "./AboutTraceX.css";

// =====================================================
// TEAM DATA
// =====================================================

const teamMembers = [
  {
    id: 1,
    name: "Ankan Chakraborty",
    role: "Frontend & UI-UX Developer",
    image: "/images/team/ankan (2).jpeg",
    about:
      "Focused on building the TraceX frontend experience, investigation dashboard, interactive visualizations, and user-facing investigation workflow.",
    skills: ["React", "JavaScript", "UI/UX", "Frontend"],
  },
  {
    id: 2,
    name: "Abir Chakraborty",
    role: "Blockchain / Backend_AI Developer",
    image: "/images/team/abir.jpeg",
    about:
      "Focused on blockchain analysis, backend integration, transaction processing, and connecting TraceX with real-time blockchain intelligence.",
    skills: ["Blockchain", "Backend", "APIs", "Python"],
  },
  {
    id: 3,
    name: "Aritra Sen",
    role: "FullStack Developer",
    image: "/images/team/aritra.jpeg",
    about:
      "Focused on system integration and turning TraceX investigation capabilities into a reliable end-to-end platform.",
    skills: ["Full Stack", "APIs", "Systems", "Integration"],
  },
  {
    id: 4,
    name: "Avik Mitra",
    role: "Full-Stack Developer",
    image: "/images/team/avik.jpeg",
    about:
      "Focused on system integration and turning TraceX investigation capabilities into a reliable end-to-end platform.",
    skills: ["Full Stack", "APIs", "Systems", "Integration"],
  },
];

// =====================================================
// WORKFLOW
// =====================================================

const workflowSteps = [
  {
    step: "01",
    title: "Report",
    desc: "Input suspicious wallet addresses, transaction hashes, or entities.",
  },
  {
    step: "02",
    title: "Analyze",
    desc: "AI engines parse historical blockchain data associated with the inputs.",
  },
  {
    step: "03",
    title: "Connect",
    desc: "TraceX builds a relationship graph mapping connected entities.",
  },
  {
    step: "04",
    title: "Trace",
    desc: "Deep-tracing algorithms follow fund movements across multiple hops.",
  },
  {
    step: "05",
    title: "Assess",
    desc: "Risk scoring is applied to linked wallets based on behavioral patterns.",
  },
  {
    step: "06",
    title: "Investigate",
    desc: "Actionable intelligence is generated for investigators and recovery teams.",
  },
];

// =====================================================
// INTELLIGENCE FEATURES
// =====================================================

const intelligenceFeatures = [
  {
    icon: Network,
    title: "Graph Analysis",
    desc: "Visualize complex transaction webs with interactive node mapping.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Assessment",
    desc: "Threat scoring based on interactions with suspicious entities.",
  },
  {
    icon: Fingerprint,
    title: "Entity Attribution",
    desc: "Identify wallet clusters and their potential real-world relationships.",
  },
  {
    icon: BrainCircuit,
    title: "AI Pattern Analysis",
    desc: "Detect suspicious transaction behaviors and laundering patterns.",
  },
];

// =====================================================
// SUSPICIOUS PATTERNS
// =====================================================

const suspiciousPatterns = [
  {
    icon: Activity,
    title: "Rapid Transfers",
    desc: "High-velocity fund movements designed to obscure the source.",
  },
  {
    icon: Link2,
    title: "Wallet Chains",
    desc: "Long sequences of transactions passing through intermediary wallets.",
  },
  {
    icon: Database,
    title: "Fund Aggregation",
    desc: "Multiple deposits consolidating into a central holding address.",
  },
  {
    icon: Search,
    title: "Fund Splitting",
    desc: "Large amounts dispersed across multiple smaller addresses.",
  },
  {
    icon: AlertTriangle,
    title: "Exchange Exposure",
    desc: "Interactions with high-risk or potentially suspicious exchanges.",
  },
  {
    icon: Eye,
    title: "Network Relationships",
    desc: "Hidden connections between seemingly unrelated suspect clusters.",
  },
];

// =====================================================
// ANIMATED NETWORK BACKGROUND
// =====================================================

function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let animationFrame;
    let particles = [];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;

        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;

        this.radius = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > window.innerWidth) {
          this.vx *= -1;
        }

        if (this.y < 0 || this.y > window.innerHeight) {
          this.vy *= -1;
        }
      }

      draw() {
        ctx.beginPath();

        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(59, 130, 246, 0.45)";
        ctx.fill();
      }
    }

    const createParticles = () => {
      const count = Math.min(
        100,
        Math.floor((window.innerWidth * window.innerHeight) / 18000),
      );

      particles = Array.from({ length: count }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle, i) => {
        particle.update();
        particle.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];

          const dx = particle.x - other.x;
          const dy = particle.y - other.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();

            ctx.strokeStyle = `rgba(59,130,246,${0.14 - distance / 1000})`;

            ctx.lineWidth = 0.5;

            ctx.moveTo(particle.x, particle.y);

            ctx.lineTo(other.x, other.y);

            ctx.stroke();
          }
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);

      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="about-network-background" />;
}

// =====================================================
// SCROLL REVEAL
// =====================================================

function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}) {
  const [visible, setVisible] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const directionClass =
    direction === "left"
      ? "about-reveal-left"
      : direction === "right"
        ? "about-reveal-right"
        : direction === "none"
          ? "about-reveal-scale"
          : "about-reveal-up";

  return (
    <div
      ref={ref}
      className={`about-reveal ${directionClass} ${
        visible ? "about-reveal-visible" : ""
      } ${className}`}
      style={{
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// =====================================================
// PAGE
// =====================================================

function AboutTraceX() {
  return (
    <main className="about-tracex">
      <NetworkBackground />

      {/* ============================================
          HERO
      ============================================ */}

      <section className="about-hero-full">
        <div className="about-hero-glow" />

        <div className="about-hero-content">
          <ScrollReveal direction="none">
            <div className="about-badge">
              <span />
              ABOUT TRACEX
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1>
              Turning Blockchain Data Into <span>Digital Intelligence.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p>
              TraceX is an AI-powered blockchain fraud investigation platform
              designed to help crypto scam victims, investigators, financial
              institutions, and law-enforcement teams trace suspicious
              cryptocurrency transactions and identify potential fraud-linked
              entities.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <a href="/investigate" className="about-primary-button">
              <span>Explore TraceX</span>

              <ArrowRight size={18} />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================
          ABOUT TRACEX
      ============================================ */}

      <section className="about-section about-story">
        <div className="about-container about-two-column">
          <ScrollReveal direction="left">
            <div>
              <div className="about-section-number">01 / ABOUT TRACEX</div>

              <h2>
                Cryptocurrency transactions leave trails.
                <span>TraceX helps investigate them.</span>
              </h2>

              <div className="about-story-text">
                <p>
                  While blockchain technology offers pseudonymity, the public
                  ledger records every movement. TraceX decodes this complex web
                  of transactions to uncover hidden relationships and suspicious
                  behaviors.
                </p>

                <p>
                  We analyze wallet activity, transaction relationships, fund
                  movement velocity, risk signals, and behavioral patterns to
                  provide actionable investigation intelligence.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <div className="about-visual-card">
              <div className="about-visual-header">
                <span>TXHASH MAP</span>

                <Activity size={16} />
              </div>

              <div className="about-graph">
                <div className="graph-line graph-line-one" />
                <div className="graph-line graph-line-two" />
                <div className="graph-line graph-line-three" />

                <div className="graph-node node-one">
                  <span />
                </div>

                <div className="graph-node node-two">
                  <span />
                </div>

                <div className="graph-node node-three">
                  <span />
                </div>

                <div className="graph-node node-four">
                  <span />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================
          WORKFLOW
      ============================================ */}

      <section className="about-section">
        <div className="about-container">
          <ScrollReveal>
            <div className="about-section-heading">
              <div className="about-section-number">02 / INVESTIGATION</div>

              <h2>The Investigation Workflow</h2>

              <p>
                From a single suspicious wallet to connected blockchain
                intelligence.
              </p>
            </div>
          </ScrollReveal>

          <div className="workflow-grid">
            {workflowSteps.map((item, index) => (
              <ScrollReveal key={item.step} delay={index * 0.08}>
                <article className="workflow-card">
                  <span className="workflow-number">{item.step}</span>

                  <div>
                    <h3>{item.title}</h3>

                    <p>{item.desc}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          INTELLIGENCE
      ============================================ */}

      <section className="about-section about-dark-section">
        <div className="about-container">
          <ScrollReveal>
            <div className="about-section-heading centered">
              <div className="about-section-number">03 / INTELLIGENCE</div>

              <h2>The Intelligence Layer</h2>

              <p>
                Analytical capabilities powering the TraceX investigation
                engine.
              </p>
            </div>
          </ScrollReveal>

          <div className="intelligence-grid">
            {intelligenceFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <ScrollReveal key={feature.title} delay={index * 0.1}>
                  <article className="intelligence-card">
                    <div className="intelligence-icon">
                      <Icon size={28} strokeWidth={1.5} />
                    </div>

                    <div>
                      <span>0{index + 1}</span>

                      <h3>{feature.title}</h3>

                      <p>{feature.desc}</p>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          SUSPICIOUS PATTERNS
      ============================================ */}

      <section className="about-section">
        <div className="about-container">
          <ScrollReveal>
            <div className="about-section-number">04 / DETECTION</div>

            <h2 className="patterns-heading">What TraceX Looks For</h2>
          </ScrollReveal>

          <div className="patterns-grid">
            {suspiciousPatterns.map((pattern, index) => {
              const Icon = pattern.icon;

              return (
                <ScrollReveal key={pattern.title} delay={index * 0.07}>
                  <article className="pattern-card">
                    <Icon size={23} />

                    <h3>{pattern.title}</h3>

                    <p>{pattern.desc}</p>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          TEAM
      ============================================ */}

      <section className="about-section team-section">
        <div className="about-container">
          <ScrollReveal>
            <div className="about-section-heading centered">
              <div className="about-section-number">05 / THE TEAM</div>

              <h2>Meet the Team Behind TraceX</h2>

              <p>
                Four minds building intelligence for the decentralized world.
              </p>
            </div>
          </ScrollReveal>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <ScrollReveal key={member.id} delay={index * 0.12}>
                <div className="team-card-wrapper">
                  <div className="team-card-inner">
                    {/* FRONT */}

                    <div className="team-card team-card-front">
                      <div className="team-image">
                        <img
                          src={member.image}
                          alt={member.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />

                        <div className="team-image-overlay" />

                        <div className="team-placeholder"></div>
                      </div>

                      <div className="team-front-info">
                        <Network size={17} />

                        <h3>{member.name}</h3>

                        <p>{member.role}</p>
                      </div>
                    </div>

                    {/* BACK */}

                    <div className="team-card team-card-back">
                      <span className="team-back-label">TEAM MEMBER</span>

                      <h3>{member.name}</h3>

                      <p className="team-back-role">{member.role}</p>

                      <div className="team-about">
                        <span>ABOUT</span>

                        <p>{member.about}</p>
                      </div>

                      <div className="team-skills">
                        {member.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          VISION
      ============================================ */}

      <section className="about-section about-vision">
        <div className="vision-glow" />

        <div className="vision-content">
          <ScrollReveal direction="none">
            <ShieldAlert size={48} strokeWidth={1} />

            <h2>
              Make blockchain investigation more <span>understandable</span>
              ,
              <br />
              <span>connected</span> and <span>intelligent</span>.
            </h2>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================
          CTA
      ============================================ */}

      <section className="about-cta">
        <div className="about-container">
          <ScrollReveal>
            <h2>Every transaction tells a story.</h2>

            <p>
              TraceX is built to help uncover that story through blockchain
              intelligence.
            </p>

            <a href="/investigate" className="about-cta-button">
              Explore TraceX
              <ArrowRight size={20} />
            </a>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}

export default AboutTraceX;
