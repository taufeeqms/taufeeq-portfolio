import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowUp,
  Award,
  BrainCircuit,
  Code2,
  Cpu,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
const portrait = "/assets/profile.jpg";
const RESUME_URL = "/resume.pdf";

export const Route = createFileRoute("/")({
  component: Index,
});

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certificates" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
];

const TYPING_ROLES = [
  "AI/ML Student",
  "Python Developer",
  "Android Developer",
  "Future AI Engineer",
];

/* -------------------------- hooks -------------------------- */

function useTyping(words: string[], speed = 85, pause = 1500) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const current = words[i % words.length];
    const t = setTimeout(
      () => {
        if (!del) {
          const next = current.slice(0, text.length + 1);
          setText(next);
          if (next === current) setTimeout(() => setDel(true), pause);
        } else {
          const next = current.slice(0, text.length - 1);
          setText(next);
          if (next === "") {
            setDel(false);
            setI((v) => v + 1);
          }
        }
      },
      del ? speed / 2 : speed,
    );
    return () => clearTimeout(t);
  }, [text, del, i, words, speed, pause]);
  return text;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function useCountUp(target: number, duration = 1400, start = false) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return v;
}

/* -------------------------- background canvas -------------------------- */

function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0, h = 0, dpr = 1;
    let pts: { x: number; y: number; vx: number; vy: number }[] = [];

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(60, Math.floor((w * h) / 22000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // points + links
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = "rgba(0,245,255,0.55)";
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const a = 1 - Math.sqrt(d2) / 140;
            ctx.strokeStyle = `rgba(0,245,255,${a * 0.14})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    setup();
    draw();
    const onResize = () => setup();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}

function MatrixRain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.05]"
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 font-mono text-[10px] leading-tight text-[#00F5FF] whitespace-pre"
          style={{
            left: `${(i / 16) * 100}%`,
            animation: `matrix-fall ${8 + (i % 5) * 2}s linear ${i * 0.7}s infinite`,
          }}
        >
          {Array.from({ length: 40 })
            .map(() => (Math.random() > 0.5 ? "1" : "0"))
            .join("\n")}
        </div>
      ))}
    </div>
  );
}

function AuroraBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(56,189,248,0.22), transparent 60%), radial-gradient(ellipse 70% 50% at 90% 15%, rgba(124,58,237,0.18), transparent 60%), radial-gradient(ellipse 70% 50% at 5% 85%, rgba(0,245,255,0.18), transparent 60%), linear-gradient(180deg, #030612 0%, #050816 40%, #06102a 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl animate-aurora"
        style={{
          background:
            "radial-gradient(closest-side, #00F5FF66, #38BDF833 40%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-12rem] right-[-8rem] -z-10 h-[40rem] w-[40rem] rounded-full opacity-40 blur-3xl animate-aurora"
        style={{
          animationDelay: "-6s",
          background:
            "radial-gradient(closest-side, #7C3AED66, #1E3A8A33 45%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/3 left-[-10rem] -z-10 h-[32rem] w-[32rem] rounded-full opacity-30 blur-3xl animate-aurora"
        style={{
          animationDelay: "-3s",
          background: "radial-gradient(closest-side, #1D4ED866, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
        }}
      />
      <FloatingParticles />
    </>
  );
}

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 12,
        size: 2 + Math.random() * 3,
        hue: i % 3 === 0 ? "#7C3AED" : "#00F5FF",
      })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            boxShadow: `0 0 ${p.size * 4}px ${p.hue}`,
            opacity: 0.55,
            animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------- custom cursor -------------------------- */

function CustomCursor() {
  const dot = useRef<HTMLDivElement | null>(null);
  const ring = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    };
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("a, button, [role='button'], input, textarea, select, label");
      ring.current?.classList.toggle("is-hover", !!interactive);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);
  return (
    <>
      <div ref={ring} className="cursor-ring hidden md:block" aria-hidden />
      <div ref={dot} className="cursor-dot hidden md:block" aria-hidden />
    </>
  );
}

/* -------------------------- scroll progress -------------------------- */

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent">
      <div
        className="h-full origin-left transition-[width] duration-100"
        style={{
          width: `${p}%`,
          background: "linear-gradient(90deg, #00F5FF, #7C3AED)",
          boxShadow: "0 0 12px #00F5FF88",
        }}
      />
    </div>
  );
}

/* -------------------------- magnetic button -------------------------- */

function magneticProps() {
  return {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.12;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.12;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "";
    },
  };
}

/* -------------------------- root -------------------------- */

function Index() {
  useReveal();
  const ids = useMemo(() => NAV.map((n) => n.id), []);
  const active = useActiveSection(ids);
  const typed = useTyping(TYPING_ROLES);

  const [showTop, setShowTop] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setShowTop(y > 600);
      const goingDown = y > lastY && y > 120;
      setNavVisible(!goingDown);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const statsRef = useRef<HTMLDivElement | null>(null);
  const [statsIn, setStatsIn] = useState(false);
  useEffect(() => {
    if (!statsRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setStatsIn(true),
      { threshold: 0.4 },
    );
    io.observe(statsRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <AuroraBackdrop />
      <NeuralCanvas />
      <MatrixRain />
      <ScrollProgress />
      <CustomCursor />

      <Nav active={active} scrolled={scrolled} visible={navVisible} />

      <main>
        <Hero typed={typed} />
        <About statsRef={statsRef} statsIn={statsIn} />
        <Education />
        <Skills />
        <ToolsTech />
        <CurrentlyLearning />
        <Projects />
        <Certifications />
        <Achievements />
        <ResumeSection />
        <Contact />
      </main>

      <Footer />

      <button
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full glass text-accent transition-all btn-magnetic hover:text-accent-foreground hover:bg-accent ${
          showTop ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"
        }`}
        style={{ boxShadow: "0 0 24px -4px #00F5FF66" }}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}

/* -------------------------- nav -------------------------- */

function Nav({ active, scrolled, visible }: { active: string; scrolled: boolean; visible: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      } ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div
          className={`glass flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all ${
            scrolled ? "shadow-[0_10px_40px_-20px_#00F5FF55]" : ""
          }`}
        >
          <a href="#home" className="flex items-center gap-2 font-heading font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent glow-ring">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm sm:text-base">
              Taufeeq<span className="text-accent">.</span>
            </span>
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={`relative rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active === n.id
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
                <span
                  className={`absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full transition-all duration-300 ${
                    active === n.id ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                  }`}
                  style={{ background: "linear-gradient(90deg, #00F5FF, #7C3AED)", boxShadow: "0 0 10px #00F5FF88" }}
                />
              </a>
            ))}
          </nav>
          <a
            href={RESUME_URL}
            download
            {...magneticProps()}
            className="btn-magnetic hidden items-center gap-2 rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-all hover:opacity-90 md:inline-flex"
          >
            <Download className="h-4 w-4" /> Resume
          </a>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-lg p-2 text-foreground/80 hover:bg-white/5"
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-current transition-all ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-current transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-current transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
        {open && (
          <div className="glass mt-2 rounded-2xl p-3 md:hidden animate-fade-up">
            <div className="flex flex-col">
              {NAV.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    active === n.id ? "bg-accent/10 text-accent" : "text-muted-foreground"
                  }`}
                >
                  {n.label}
                </a>
              ))}
              <a
                href={RESUME_URL}
                download
                className="mt-2 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#050816]"
                style={{ background: "linear-gradient(120deg, #00F5FF, #7C3AED)" }}
              >
                <Download className="h-4 w-4" /> Download Resume
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* -------------------------- section wrapper -------------------------- */

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-12 max-w-2xl">
          {eyebrow && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-glow" />
              {eyebrow}
            </div>
          )}
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="text-gradient-cyber">{title}</span>
          </h2>
          {subtitle && (
            <p className="mt-3 text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

/* -------------------------- hero -------------------------- */

function Hero({ typed }: { typed: string }) {
  return (
    <section
      id="home"
      className="relative min-h-screen scroll-mt-24 overflow-hidden px-4 pt-32 pb-16"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-shimmer-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-glow" />
            Available for AI/ML &amp; Software Development Internships
          </div>
          <h1
            className="text-4xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Hi, I'm <span className="text-gradient-cyber">Taufeeq M S</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
            Artificial Intelligence &amp; Machine Learning Student
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-lg sm:text-xl">
            <span className="text-muted-foreground">I am a</span>
            <span className="min-h-[1.6em] font-semibold text-accent" style={{ fontFamily: "var(--font-heading)" }}>
              {typed}
              <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-0.5 bg-accent animate-caret" />
            </span>
          </div>
          <p className="mt-6 max-w-xl text-muted-foreground">
            Second-year Artificial Intelligence and Machine Learning student
            passionate about building real-world software solutions using
            Python, Java, Android Studio, and Machine Learning. Continuously
            learning new technologies and seeking internship opportunities in
            AI/ML and Software Development.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={RESUME_URL}
              download
              {...magneticProps()}
              className="btn-magnetic group inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition-all hover:opacity-90"
            >
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Download Resume
            </a>
            <a
              href="#contact"
              {...magneticProps()}
              className="btn-magnetic inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-medium text-foreground transition-colors hover:border-white/25 hover:text-accent"
            >
              <Mail className="h-4 w-4" />
              Contact Me
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-muted-foreground">
            <SocialIcon href="https://github.com/taufeeqms" external label="GitHub"><Github className="h-5 w-5" /></SocialIcon>
            <SocialIcon href="https://www.linkedin.com/in/taufeeq-ms-19aa07377" external label="LinkedIn"><Linkedin className="h-5 w-5" /></SocialIcon>
            <SocialIcon href="mailto:taufeeq.ms2007@gmail.com" label="Email"><Mail className="h-5 w-5" /></SocialIcon>
            <SocialIcon href="tel:+918122844807" label="Phone"><Phone className="h-5 w-5" /></SocialIcon>
            <span className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 text-accent" /> Chennai, India
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          {/* soft ambient halo */}
          <div
            aria-hidden
            className="absolute -inset-10 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, #38BDF833, transparent 70%)" }}
          />
          <div className="relative rounded-full p-[1.5px] animate-float-slow aspect-square"
               style={{ background: "linear-gradient(140deg, rgba(125,211,252,0.55), rgba(167,139,250,0.35) 45%, rgba(255,255,255,0.06) 70%)" }}>
            <div className="relative overflow-hidden rounded-full h-full w-full bg-background ring-1 ring-white/5">
              <img
                src={portrait}
                alt="Portrait of Taufeeq M S"
                width={1024}
                height={1024}
                className="h-full w-full object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-background/50 via-transparent to-transparent" />
            </div>
          </div>
          <FloatingChip className="-left-4 top-6" icon={<BrainCircuit className="h-3.5 w-3.5" />} label="Machine Learning" />
          <FloatingChip className="-right-4 bottom-16" icon={<Code2 className="h-3.5 w-3.5" />} label="Python · Java · C" />
          <FloatingChip className="left-1/2 -bottom-4 -translate-x-1/2" icon={<Zap className="h-3.5 w-3.5" />} label="Open to Internships" />
        </div>
      </div>
    </section>
  );
}

function SocialIcon({
  href,
  external,
  label,
  children,
}: {
  href: string;
  external?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      aria-label={label}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group grid h-10 w-10 place-items-center rounded-xl glass text-foreground/80 transition-all duration-300 hover:-translate-y-0.5 hover:rotate-6 hover:text-accent hover:shadow-[0_0_24px_-4px_#00F5FFaa]"
    >
      {children}
    </a>
  );
}

function FloatingChip({
  className,
  icon,
  label,
}: {
  className?: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div
      className={`absolute hidden items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-foreground animate-float-slow sm:inline-flex ${className}`}
    >
      <span className="text-accent">{icon}</span>
      {label}
    </div>
  );
}

/* -------------------------- about -------------------------- */

function About({
  statsRef,
  statsIn,
}: {
  statsRef: React.RefObject<HTMLDivElement | null>;
  statsIn: boolean;
}) {
  const s1 = useCountUp(70, 1400, statsIn);
  const s2 = useCountUp(500, 1600, statsIn);
  const s3 = useCountUp(60, 1400, statsIn);
  const s4 = useCountUp(2, 1200, statsIn);
  return (
    <Section
      id="about"
      eyebrow="About Me"
      title="Building intelligent, real-world software."
      subtitle="Second-year B.E. student in AI & ML at Jeppiaar Engineering College (Anna University), based in Chennai."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="reveal glass rounded-3xl p-6 sm:p-8 lg:col-span-3">
          <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
            I'm passionate about <span className="text-accent">Artificial Intelligence</span>,
            <span className="text-accent"> Machine Learning</span>, software and
            <span className="text-accent"> Android development</span>. I love turning ideas into
            working products — starting from the fundamentals and staying curious about how systems
            actually behave.
          </p>
          <p className="mt-4 text-muted-foreground">
            I've independently designed and shipped a QR-based attendance system that cut manual
            attendance time by 70% for a class of 60+ students, presented original research at a
            technical symposium, and competed in AI/IoT hackathons. I mentor first-year students on
            Python and Git and collaborate weekly with a peer study group.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Artificial Intelligence", "Machine Learning", "Android Dev", "Cybersecurity", "Software Dev"].map((t) => (
              <span key={t} className="rounded-full glass px-3 py-1 text-xs text-foreground/80">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div ref={statsRef} className="reveal grid grid-cols-2 gap-4 lg:col-span-2">
          {[
            { v: `${s1}%`, l: "Faster attendance", i: <Rocket className="h-4 w-4" /> },
            { v: `${s2}+`, l: "Scan events tested", i: <QrCode className="h-4 w-4" /> },
            { v: `${s3}+`, l: "Students impacted", i: <Users className="h-4 w-4" /> },
            { v: `${s4}+`, l: "Years coding", i: <Code2 className="h-4 w-4" /> },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-5 transition-transform hover:-translate-y-1">
              <div className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
                {s.i}
              </div>
              <div className="text-3xl font-bold text-gradient-cyber" style={{ fontFamily: "var(--font-heading)" }}>{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* -------------------------- education -------------------------- */

function Education() {
  const items = [
    {
      date: "Aug 2025 – May 2029 (Expected)",
      title: "B.E. — Artificial Intelligence and Machine Learning",
      org: "Jeppiaar Engineering College · Anna University, Chennai",
      desc: "Relevant coursework: Python, C, Data Structures, DBMS, Machine Learning Fundamentals, Artificial Intelligence Fundamentals, OOP (Java).",
    },
  ];
  return (
    <Section id="education" eyebrow="Education" title="Academic timeline" subtitle="A focused, coursework-driven foundation in AI, ML, and software engineering.">
      <div className="relative">
        <div className="absolute left-4 top-0 h-full w-px sm:left-6"
             style={{ background: "linear-gradient(180deg, #00F5FF, #7C3AED 40%, transparent)" }} />
        {items.map((it) => (
          <div key={it.title} className="reveal relative pl-12 sm:pl-16">
            <div className="absolute left-1.5 top-1 grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent glow-ring sm:left-3.5">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <div className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1">
              <div className="mb-1 text-xs font-medium text-accent">{it.date}</div>
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{it.title}</h3>
              <div className="mt-1 text-sm text-muted-foreground">{it.org}</div>
              <p className="mt-3 text-sm text-foreground/80">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------- skills -------------------------- */

type SkillCard = { name: string; icon: ReactNode; desc: string };

function Skills() {
  const cards: SkillCard[] = [
    { name: "Python", icon: <Code2 className="h-5 w-5" />, desc: "Primary language for scripting, data & ML." },
    { name: "Java", icon: <Code2 className="h-5 w-5" />, desc: "OOP fundamentals & Android app logic." },
    { name: "C", icon: <Code2 className="h-5 w-5" />, desc: "Systems thinking, memory & pointers." },
    { name: "Android Studio", icon: <Wrench className="h-5 w-5" />, desc: "Native Android app development." },
    { name: "SQLite", icon: <Cpu className="h-5 w-5" />, desc: "Local database design for mobile apps." },
    { name: "Machine Learning", icon: <BrainCircuit className="h-5 w-5" />, desc: "Supervised learning, model workflow." },
    { name: "Data Structures", icon: <Cpu className="h-5 w-5" />, desc: "Arrays, trees, graphs, complexity." },
    { name: "Git & GitHub", icon: <Github className="h-5 w-5" />, desc: "Version control, branching, PRs." },
  ];
  return (
    <Section id="skills" eyebrow="Technical Skills" title="What I work with" subtitle="Languages, tools and concepts I use to build real software.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.name}
            className="reveal glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 hover:border-white/20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
              style={{ background: "var(--gradient-accent)" }}
            />
            <div className="relative">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20 transition-transform duration-500 group-hover:scale-110">
                {c.icon}
              </div>
              <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------- tools & tech -------------------------- */

function ToolsTech() {
  const tools = ["Python", "Java", "Android Studio", "Git", "GitHub", "SQLite", "VS Code", "Machine Learning"];
  return (
    <Section id="tools" eyebrow="Tools & Technologies" title="My daily stack" subtitle="The tools I reach for every day.">
      <div className="reveal flex flex-wrap gap-3">
        {tools.map((t, i) => (
          <div
            key={t}
            className="group flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-foreground/90 transition-all duration-300 hover:-translate-y-1 hover:text-accent hover:shadow-[0_0_24px_-4px_#00F5FFaa]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent transition-transform group-hover:scale-150" />
            {t}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------- currently learning -------------------------- */

function CurrentlyLearning() {
  const items = [
    { icon: <BrainCircuit className="h-5 w-5" />, name: "Machine Learning", desc: "Classification, regression, model evaluation." },
    { icon: <Cpu className="h-5 w-5" />, name: "Deep Learning", desc: "Neural networks, activation, backprop intuition." },
    { icon: <Code2 className="h-5 w-5" />, name: "Data Structures & Algorithms", desc: "Patterns, complexity, problem solving." },
    { icon: <Github className="h-5 w-5" />, name: "Git & GitHub", desc: "Branching, PR workflow, open source basics." },
  ];
  return (
    <Section id="learning" eyebrow="Currently Learning" title="Growing every day" subtitle="Active learning tracks I'm working through right now.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.name} className="reveal glass group rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_-6px_#7C3AED88]">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-accent-2/15 text-[#c4b5fd] transition-transform group-hover:rotate-6 group-hover:scale-110" style={{ background: "color-mix(in oklab, #7C3AED 20%, transparent)" }}>
              {it.icon}
            </div>
            <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{it.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------- projects -------------------------- */

type Project = {
  title: string;
  date: string;
  short: string;
  long: string;
  tech: string[];
  github: string;
  demo?: string;
  highlights: string[];
};

const PROJECTS: Project[] = [
  {
    title: "Smart QR Attendance System",
    date: "Jan 2026 – Mar 2026",
    short:
      "A full-stack Android app that automates attendance for a class of 60+ students using real-time QR code scanning — replacing manual roll-call entirely.",
    long:
      "End-to-end Android application built solo over a 2-month cycle. Uses the device camera for real-time QR scanning, an SQLite backend for offline-first data integrity, and student verification logic to prevent duplicate scans. Reduced attendance time from ~8 minutes to under 2 minutes across a class of 60+.",
    tech: ["Android Studio", "Java", "SQLite", "QR Scanning"],
    github: "https://github.com/taufeeqms",
    highlights: [
      "Real-time QR camera pipeline",
      "Zero duplicate scans",
      "Offline-first SQLite storage",
      "500+ scan events validated",
      "70% attendance time reduction",
    ],
  },
];

function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-4px)`;
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-300 will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  return (
    <Section id="projects" eyebrow="Projects" title="Selected work" subtitle="Independent, end-to-end builds with a bias toward shipping. Click any card to open.">
      <div className="grid gap-6 lg:grid-cols-2">
        {PROJECTS.map((p) => (
          <TiltCard key={p.title}>
            <button
              onClick={() => setOpen(p)}
              className="reveal group relative w-full overflow-hidden rounded-3xl glass p-6 text-left transition-all hover:shadow-[0_30px_80px_-30px_#00F5FF88]"
              style={{ boxShadow: "0 0 0 1px #00F5FF22" }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40 blur-3xl transition-opacity group-hover:opacity-80"
                style={{ background: "var(--gradient-accent)" }}
              />
              <div className="relative">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  Featured · {p.date}
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-white/10 aspect-[16/9] bg-[#0F172A]">
                  <div
                    aria-hidden
                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, #00F5FF33, transparent 50%), radial-gradient(circle at 70% 70%, #7C3AED44, transparent 55%), linear-gradient(135deg, #0F172A, #050816)",
                    }}
                  />
                  <div className="absolute inset-0 grid place-items-center">
                    <QrCode className="h-24 w-24 text-accent drop-shadow-[0_0_30px_#00F5FF]" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050816] to-transparent" />
                </div>
                <h3 className="mt-4 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.short}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span key={t} className="rounded-lg border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs text-accent">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[#050816]"
                    style={{ background: "linear-gradient(120deg, #00F5FF, #7C3AED)" }}
                  >
                    <ExternalLink className="h-4 w-4" /> View Details
                  </span>
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-medium hover:text-accent"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                </div>
              </div>
            </button>
          </TiltCard>
        ))}

        <TiltCard>
          <div className="reveal glass relative overflow-hidden rounded-3xl p-6 h-full flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-2/10 px-3 py-1 text-xs font-medium" style={{ color: "#c4b5fd" }}>
                In Progress
              </div>
              <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>More projects on the way</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Currently exploring ML fundamentals and small applied projects —
                from data preprocessing pipelines to lightweight Android ML
                integrations. Check back soon or reach out for early builds.
              </p>
            </div>
            <div className="mt-6 self-start rounded-2xl bg-accent/10 p-4 text-accent">
              <BrainCircuit className="h-8 w-8" />
            </div>
          </div>
        </TiltCard>
      </div>

      <AnimatePresence>
        {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </Section>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl glass p-6 sm:p-8"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ boxShadow: "0 40px 120px -20px #00F5FF55" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full glass text-foreground/80 hover:text-accent"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-xs font-medium text-accent">{project.date}</div>
        <h3 className="mt-1 text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
          {project.title}
        </h3>
        <p className="mt-4 text-sm text-foreground/90">{project.long}</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {project.highlights.map((h) => (
            <div key={h} className="flex items-start gap-2 rounded-xl bg-white/[0.03] p-3 text-sm">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{h}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span key={t} className="rounded-lg border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs text-accent">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[#050816]"
            style={{ background: "linear-gradient(120deg, #00F5FF, #7C3AED)" }}
          >
            <Github className="h-4 w-4" /> View on GitHub
          </a>
          <a
            href="#contact"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-medium hover:text-accent"
          >
            <Mail className="h-4 w-4" /> Request Live Demo
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------- certifications -------------------------- */

type Cert = {
  title: string;
  org: string;
  date: string;
  desc: string;
  icon: ReactNode;
};

const CERTS: Cert[] = [
  {
    title: "Certificate of Appreciation",
    org: "IET JEC On Campus",
    date: "Sep 2025",
    desc: "Awarded for active technical contribution across 3+ student-led events.",
    icon: <Award className="h-6 w-6" />,
  },
  {
    title: "CODEQUEST 2.0 — AI Meets IoT",
    org: "Inter-team competition participant",
    date: "Feb 2026",
    desc: "Ranked among participating teams, developing an AI + IoT problem-solving prototype.",
    icon: <Cpu className="h-6 w-6" />,
  },
  {
    title: "JEC ZENTRIX — Technical Paper",
    org: "Jeppiaar Engineering College",
    date: "Mar 2026",
    desc: "Presented original research to 50+ attendees at the inter-college symposium.",
    icon: <BrainCircuit className="h-6 w-6" />,
  },
];

function Certifications() {
  const [open, setOpen] = useState<Cert | null>(null);
  return (
    <Section id="certifications" eyebrow="Certifications" title="Recognitions & credentials" subtitle="Awards, papers, and competitions. Hover to flip, click to open.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CERTS.map((c) => (
          <button
            key={c.title}
            onClick={() => setOpen(c)}
            className="reveal group relative h-56 [perspective:1200px] text-left"
          >
            <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              {/* front */}
              <div className="absolute inset-0 glass rounded-2xl p-5 [backface-visibility:hidden]"
                   style={{ boxShadow: "0 0 0 1px #00F5FF22" }}>
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent glow-ring">
                  {c.icon}
                </div>
                <div className="text-xs font-medium text-accent">{c.date}</div>
                <h3 className="mt-1 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{c.title}</h3>
                <div className="text-sm text-muted-foreground">{c.org}</div>
              </div>
              {/* back */}
              <div className="absolute inset-0 glass rounded-2xl p-5 [transform:rotateY(180deg)] [backface-visibility:hidden]"
                   style={{ background: "linear-gradient(135deg, #0F172Acc, #050816cc)", boxShadow: "0 0 40px -6px #7C3AED77" }}>
                <div className="flex h-full flex-col">
                  <div className="text-xs font-medium text-accent">{c.date}</div>
                  <p className="mt-2 text-sm text-foreground/90">{c.desc}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-xs text-accent">
                    <ExternalLink className="h-3.5 w-3.5" /> Click to open
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && <CertModal cert={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </Section>
  );
}

function CertModal({ cert, onClose }: { cert: Cert; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-xl"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl glass p-8 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.35 }}
        style={{ boxShadow: "0 40px 120px -20px #7C3AED66" }}
      >
        <button onClick={onClose} aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full glass hover:text-accent">
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent glow-ring">
          {cert.icon}
        </div>
        <div className="text-xs font-medium text-accent">{cert.date}</div>
        <h3 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{cert.title}</h3>
        <div className="text-sm text-muted-foreground">{cert.org}</div>
        <p className="mt-4 text-sm text-foreground/90">{cert.desc}</p>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------- achievements -------------------------- */

function Achievements() {
  const items = [
    { icon: <Trophy className="h-5 w-5" />, title: "Technical Symposium Speaker", desc: "Presented original research to 50+ attendees at JEC ZENTRIX inter-college symposium (Mar 2026).", stat: 50, statLabel: "attendees" },
    { icon: <Cpu className="h-5 w-5" />, title: "AI + IoT Competition", desc: "Competed in CODEQUEST 2.0 'AI Meets IoT' developing a working solution to an IoT problem statement (Feb 2026).", stat: 2, statLabel: "prototypes" },
    { icon: <Users className="h-5 w-5" />, title: "Peer Mentor & Study Lead", desc: "Mentor first-year students on Python and Git/GitHub, and collaborate weekly with a 4-member AI/ML study group.", stat: 10, statLabel: "mentees" },
    { icon: <Award className="h-5 w-5" />, title: "IET JEC Recognition", desc: "Awarded a Certificate of Appreciation for active technical contribution across 3+ student-led events (Sep 2025).", stat: 3, statLabel: "events" },
  ];
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!wrapRef.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.2 });
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);
  return (
    <Section id="achievements" eyebrow="Achievements" title="Milestones worth marking" subtitle="Technical symposiums, coding competitions, and academic contributions.">
      <div ref={wrapRef} className="relative">
        <div className="absolute left-4 top-0 h-full w-px sm:left-6"
             style={{ background: "linear-gradient(180deg, #00F5FF, #7C3AED 50%, transparent)" }} />
        <div className="space-y-6">
          {items.map((a) => (
            <AchievementRow key={a.title} item={a} inView={inView} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function AchievementRow({ item, inView }: { item: { icon: ReactNode; title: string; desc: string; stat: number; statLabel: string }; inView: boolean }) {
  const v = useCountUp(item.stat, 1400, inView);
  return (
    <div className="reveal relative pl-12 sm:pl-16">
      <div className="absolute left-1.5 top-2 grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent glow-ring sm:left-3.5">
        {item.icon}
      </div>
      <div className="glass rounded-2xl p-5 sm:p-6 transition-transform hover:-translate-y-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-3xl font-bold text-gradient-cyber" style={{ fontFamily: "var(--font-heading)" }}>{v}+</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{item.statLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- resume -------------------------- */

function ResumeSection() {
  return (
    <section id="resume" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="reveal relative overflow-hidden rounded-3xl glass p-8 sm:p-12"
             style={{ boxShadow: "0 30px 80px -30px #00F5FF66" }}>
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
            style={{ background: "var(--gradient-accent)" }}
          />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Resume
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
                <span className="text-gradient-cyber">Grab the full story.</span>
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Download my up-to-date, ATS-friendly resume. One page, no
                fluff — the exact story recruiters and interviewers need.
              </p>
            </div>
            <a
              href={RESUME_URL}
              download
              {...magneticProps()}
              className="btn-magnetic inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 font-medium text-background transition-all hover:opacity-90"
            >
              <Download className="h-5 w-5" /> Download Resume (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- contact -------------------------- */

function Contact() {
  const items = [
    { icon: <Mail className="h-5 w-5" />, label: "Email", value: "taufeeq.ms2007@gmail.com", href: "mailto:taufeeq.ms2007@gmail.com", external: false },
    { icon: <Phone className="h-5 w-5" />, label: "Phone", value: "+91 8122844807", href: "tel:+918122844807", external: false },
    { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn", value: "linkedin.com/in/taufeeq-ms-19aa07377", href: "https://www.linkedin.com/in/taufeeq-ms-19aa07377", external: true },
    { icon: <Github className="h-5 w-5" />, label: "GitHub", value: "github.com/taufeeqms", href: "https://github.com/taufeeqms", external: true },
  ];
  return (
    <Section id="contact" eyebrow="Contact" title="Let's build something together" subtitle="Best way to reach me is email. I usually respond within 24 hours.">
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.external ? "_blank" : undefined}
            rel={c.external ? "noreferrer" : undefined}
            className="reveal group glass flex items-center gap-4 rounded-2xl p-5 transition-all hover:-translate-y-1 hover:text-accent hover:shadow-[0_20px_60px_-20px_#00F5FF66]"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent transition-transform group-hover:scale-110 group-hover:rotate-6">
              {c.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
              <div className="truncate font-medium">{c.value}</div>
            </div>
            {c.external && (
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </a>
        ))}
      </div>

      <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href="https://www.linkedin.com/in/taufeeq-ms-19aa07377"
          target="_blank"
          rel="noreferrer"
          {...magneticProps()}
          className="btn-magnetic inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-6 py-3 font-medium text-white shadow-[0_10px_30px_-10px_rgba(10,102,194,0.55)] transition-shadow hover:shadow-[0_20px_40px_-10px_rgba(10,102,194,0.7)]"
        >
          <Linkedin className="h-5 w-5" />
          Visit LinkedIn Profile
        </a>
        <a
          href="https://github.com/taufeeqms"
          target="_blank"
          rel="noreferrer"
          {...magneticProps()}
          className="btn-magnetic inline-flex items-center gap-2 rounded-xl glass px-6 py-3 font-medium text-foreground transition-all hover:text-accent"
        >
          <Github className="h-5 w-5" />
          Visit GitHub Profile
        </a>
      </div>

      {/* GitHub contribution preview */}
      <div className="reveal mt-10 rounded-3xl glass p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>GitHub Contributions</h3>
            <p className="text-sm text-muted-foreground">Live commit activity from @taufeeqms.</p>
          </div>
          <a
            href="https://github.com/taufeeqms"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-lg glass px-3 py-1.5 text-sm hover:text-accent sm:inline-flex"
          >
            <Github className="h-4 w-4" /> Visit Profile
          </a>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-2">
          <img
            src="https://ghchart.rshah.org/00F5FF/taufeeqms"
            alt="GitHub contribution chart for taufeeqms"
            loading="lazy"
            className="w-full"
          />
        </div>
      </div>
    </Section>
  );
}

/* -------------------------- footer -------------------------- */

function Footer() {
  return (
    <footer className="relative border-t border-white/5 px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #00F5FF, #7C3AED, transparent)" }}
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium">
            Designed &amp; Developed by{" "}
            <span className="text-gradient-cyber font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Taufeeq M S</span>
          </p>
          <p className="text-xs text-muted-foreground">© 2026 All Rights Reserved.</p>
        </div>
        <div className="flex items-center gap-2">
          <SocialIcon href="https://github.com/taufeeqms" external label="GitHub"><Github className="h-4 w-4" /></SocialIcon>
          <SocialIcon href="https://www.linkedin.com/in/taufeeq-ms-19aa07377" external label="LinkedIn"><Linkedin className="h-4 w-4" /></SocialIcon>
          <SocialIcon href="mailto:taufeeq.ms2007@gmail.com" label="Email"><Mail className="h-4 w-4" /></SocialIcon>
          <SocialIcon href="tel:+918122844807" label="Phone"><Phone className="h-4 w-4" /></SocialIcon>
        </div>
      </div>
    </footer>
  );
}