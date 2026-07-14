import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Mail,
  Phone,
  Linkedin,
  Github,
  MapPin,
  ArrowUp,
  Code2,
  Cpu,
  Wrench,
  GraduationCap,
  Award,
  Trophy,
  QrCode,
  Sparkles,
  ExternalLink,
  Rocket,
  BrainCircuit,
  ShieldCheck,
  Users,
} from "lucide-react";
import portraitAsset from "@/assets/profile.jpg.asset.json";
const portrait = portraitAsset.url;
import resumeAsset from "@/assets/resume.pdf.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
];

const RESUME_URL = resumeAsset.url;

const TYPING_ROLES = [
  "AI/ML Engineer",
  "Python Developer",
  "Android Developer",
  "Lifelong Learner",
];

function useTyping(words: string[], speed = 90, pause = 1400) {
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

function Index() {
  useReveal();
  const ids = useMemo(() => NAV.map((n) => n.id), []);
  const active = useActiveSection(ids);
  const typed = useTyping(TYPING_ROLES);

  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 600);
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
      {/* Ambient gradient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
        }}
      />

      <Nav active={active} scrolled={scrolled} />

      <main>
        <Hero typed={typed} />
        <About statsRef={statsRef} statsIn={statsIn} />
        <Education />
        <Skills />
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
        className={`fixed bottom-6 right-6 z-50 grid h-11 w-11 place-items-center rounded-full glass text-accent transition-all hover:scale-110 hover:text-accent-foreground hover:bg-accent ${
          showTop ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}

function Nav({ active, scrolled }: { active: string; scrolled: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div
          className={`glass flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all ${
            scrolled ? "shadow-[0_10px_40px_-20px_rgba(56,189,248,0.35)]" : ""
          }`}
        >
          <a href="#home" className="flex items-center gap-2 font-display font-bold tracking-tight">
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
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active === n.id
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
                {active === n.id && (
                  <span className="mx-auto mt-0.5 block h-0.5 w-4 rounded-full bg-accent" />
                )}
              </a>
            ))}
          </nav>
          <a
            href={RESUME_URL}
            download
            className="hidden items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.03] md:inline-flex"
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
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
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
  children: React.ReactNode;
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
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            <span className="text-gradient">{title}</span>
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

function Hero({ typed }: { typed: string }) {
  return (
    <section id="home" className="relative min-h-screen scroll-mt-24 px-4 pt-32 pb-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-fade-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-glow" />
            Available for Summer 2027 Internships
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
            Hi, I'm <span className="text-gradient">Taufeeq M S</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
            Artificial Intelligence & Machine Learning Student
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-lg sm:text-xl">
            <span className="text-muted-foreground">Aspiring</span>
            <span className="min-h-[1.6em] font-display font-semibold text-accent">
              {typed}
              <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-0.5 bg-accent animate-caret" />
            </span>
          </div>
          <p className="mt-6 max-w-xl text-muted-foreground">
            Second-year B.E. student with 1+ years of Python and Android development
            experience. I build practical, real-world systems — from QR-based
            attendance apps to ML explorations — with a bias toward shipping.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={RESUME_URL}
              download
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-medium text-accent-foreground shadow-[0_10px_30px_-10px_rgba(56,189,248,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-10px_rgba(56,189,248,0.7)]"
            >
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Download Resume
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-medium text-foreground transition-all hover:-translate-y-0.5 hover:text-accent"
            >
              <Mail className="h-4 w-4" />
              Contact Me
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-muted-foreground">
            <a aria-label="GitHub" href="https://github.com/taufeeqms" target="_blank" rel="noreferrer" className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-accent">
              <Github className="h-5 w-5" />
            </a>
            <a aria-label="LinkedIn" href="https://www.linkedin.com/in/taufeeq-ms-19aa07377" target="_blank" rel="noreferrer" className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-accent">
              <Linkedin className="h-5 w-5" />
            </a>
            <a aria-label="Email" href="mailto:taufeeq.ms2007@gmail.com" className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-accent">
              <Mail className="h-5 w-5" />
            </a>
            <a aria-label="Phone" href="tel:+918122844807" className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-accent">
              <Phone className="h-5 w-5" />
            </a>
            <span className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 text-accent" /> Chennai, India
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[2rem] opacity-70 blur-2xl"
            style={{ background: "var(--gradient-accent)" }}
          />
          <div className="relative rounded-full glass p-2 animate-float-slow aspect-square">
            <div className="relative overflow-hidden rounded-full h-full w-full ring-1 ring-accent/30">
              <img
                src={portrait}
                alt="Portrait of Taufeeq M S"
                width={1024}
                height={1024}
                className="h-full w-full object-cover object-top brightness-110 contrast-105 saturate-105"
              />
              <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl glass px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-glow" />
                <span>Open to Internships</span>
              </div>
              <span className="font-mono text-accent">B.E. AI & ML</span>
            </div>
          </div>
          <FloatingChip className="-left-4 top-6" icon={<BrainCircuit className="h-3.5 w-3.5" />} label="Machine Learning" />
          <FloatingChip className="-right-4 bottom-16" icon={<Code2 className="h-3.5 w-3.5" />} label="Python · Java · C" />
        </div>
      </div>
    </section>
  );
}

function FloatingChip({
  className,
  icon,
  label,
}: {
  className?: string;
  icon: React.ReactNode;
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
            <span className="text-accent"> Android development</span>. I love turning ideas into working products — starting from the fundamentals and staying curious about how systems actually behave.
          </p>
          <p className="mt-4 text-muted-foreground">
            I've independently designed and shipped a QR-based attendance system that cut manual attendance time by 70% for a class of 60+ students, presented original research at a technical symposium, and competed in AI/IoT hackathons. I mentor first-year students on Python and Git and collaborate weekly with a peer study group.
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
            <div key={s.l} className="glass rounded-2xl p-5">
              <div className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
                {s.i}
              </div>
              <div className="font-display text-3xl font-bold text-gradient">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

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
        <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-accent/60 via-accent/20 to-transparent sm:left-6" />
        {items.map((it) => (
          <div key={it.title} className="reveal relative pl-12 sm:pl-16">
            <div className="absolute left-1.5 top-1 grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent glow-ring sm:left-3.5">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="mb-1 text-xs font-medium text-accent">{it.date}</div>
              <h3 className="font-display text-lg font-semibold">{it.title}</h3>
              <div className="mt-1 text-sm text-muted-foreground">{it.org}</div>
              <p className="mt-3 text-sm text-foreground/80">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Skills() {
  const langs = [
    { name: "Python", level: 85 },
    { name: "C", level: 75 },
    { name: "Java (Basics)", level: 55 },
  ];
  const tools = [
    "Android Studio",
    "Git",
    "GitHub",
    "SQLite",
    "Local DB Design",
  ];
  const concepts = [
    "Machine Learning Fundamentals",
    "Artificial Intelligence Fundamentals",
    "Data Structures",
    "Algorithmic Problem Solving",
    "Object-Oriented Programming",
    "Database Management",
  ];
  return (
    <Section id="skills" eyebrow="Technical Skills" title="What I work with" subtitle="Programming languages, developer tools, and the core CS concepts behind them.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="reveal glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2 text-accent">
            <Code2 className="h-5 w-5" />
            <h3 className="font-display font-semibold text-foreground">Programming Languages</h3>
          </div>
          <div className="space-y-4">
            {langs.map((l) => (
              <div key={l.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-foreground/90">{l.name}</span>
                  <span className="text-muted-foreground">{l.level}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent shadow-[0_0_16px_rgba(56,189,248,0.6)]"
                    style={{ width: `${l.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2 text-accent">
            <Wrench className="h-5 w-5" />
            <h3 className="font-display font-semibold text-foreground">Developer Tools</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tools.map((t) => (
              <span
                key={t}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-foreground/90 transition-colors hover:border-accent/40 hover:text-accent"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            1+ year of hands-on Android and tooling experience.
          </div>
        </div>

        <div className="reveal glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2 text-accent">
            <Cpu className="h-5 w-5" />
            <h3 className="font-display font-semibold text-foreground">Core Concepts</h3>
          </div>
          <ul className="space-y-2">
            {concepts.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-foreground/90">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Projects() {
  return (
    <Section id="projects" eyebrow="Projects" title="Selected work" subtitle="Independent, end-to-end builds with a bias toward shipping.">
      <div className="grid gap-6">
        <article className="reveal group relative overflow-hidden rounded-3xl glass p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40 blur-3xl transition-opacity group-hover:opacity-70"
            style={{ background: "var(--gradient-accent)" }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Featured Project · Jan 2026 – Mar 2026
              </div>
              <h3 className="font-display text-2xl font-bold sm:text-3xl">
                Smart QR Attendance System
              </h3>
              <p className="mt-3 text-muted-foreground">
                A full-stack Android app that automates attendance for a class of
                60+ students using real-time QR code scanning — replacing manual
                roll-call entirely.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Android Studio", "Java", "SQLite", "QR Scanning"].map((t) => (
                  <span key={t} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-foreground/90">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://github.com/taufeeqms"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-transform hover:-translate-y-0.5"
                >
                  <Github className="h-4 w-4" /> View on GitHub
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-medium hover:text-accent"
                >
                  <ExternalLink className="h-4 w-4" /> Request Demo
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FeatureCard icon={<Rocket className="h-4 w-4" />} title="Features" items={[
                "Real-time QR scanning",
                "Student verification module",
                "SQLite-backed storage",
                "Zero duplicate scans",
              ]} />
              <FeatureCard icon={<BrainCircuit className="h-4 w-4" />} title="Challenges" items={[
                "QR + camera pipeline",
                "Duplicate-scan prevention",
                "Offline data integrity",
                "Solo 2-month cycle",
              ]} />
              <FeatureCard icon={<ShieldCheck className="h-4 w-4" />} title="Impact" items={[
                "8 min → under 2 min",
                "70% time reduction",
                "500+ scans validated",
                "60+ students served",
              ]} />
              <FeatureCard icon={<Sparkles className="h-4 w-4" />} title="What I Learned" items={[
                "End-to-end Android arch",
                "Local DB design & testing",
                "Shipping under constraints",
                "Presenting to faculty",
              ]} />
            </div>
          </div>
        </article>

        <article className="reveal glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                In Progress
              </div>
              <h3 className="font-display text-xl font-semibold">More projects on the way</h3>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Currently exploring ML fundamentals and small applied projects
                — from data preprocessing pipelines to lightweight Android ML
                integrations. Check back soon or reach out for early builds.
              </p>
            </div>
            <div className="hidden shrink-0 rounded-2xl bg-accent/10 p-4 text-accent sm:block">
              <QrCode className="h-8 w-8" />
            </div>
          </div>
        </article>
      </div>
    </Section>
  );
}

function FeatureCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
        {icon}
        {title}
      </div>
      <ul className="space-y-1.5 text-sm text-foreground/90">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-accent" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Certifications() {
  const items = [
    {
      title: "Certificate of Appreciation",
      org: "IET JEC On Campus",
      date: "Sep 2025",
      desc: "Awarded for active technical contribution across 3+ student-led events.",
      icon: <Award className="h-5 w-5" />,
    },
    {
      title: "CODEQUEST 2.0 — AI Meets IoT",
      org: "Inter-team competition participant",
      date: "Feb 2026",
      desc: "Ranked among participating teams, developing an AI + IoT problem-solving prototype.",
      icon: <Cpu className="h-5 w-5" />,
    },
    {
      title: "JEC ZENTRIX — Technical Paper",
      org: "Jeppiaar Engineering College",
      date: "Mar 2026",
      desc: "Presented original research to 50+ attendees at the inter-college symposium.",
      icon: <BrainCircuit className="h-5 w-5" />,
    },
  ];
  return (
    <Section id="certifications" eyebrow="Certifications" title="Recognitions & credentials" subtitle="A snapshot of the awards, papers, and competitions I've been part of.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <div key={c.title} className="reveal group glass relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-60"
              style={{ background: "var(--gradient-accent)" }}
            />
            <div className="relative">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent glow-ring">
                {c.icon}
              </div>
              <div className="text-xs font-medium text-accent">{c.date}</div>
              <h3 className="mt-1 font-display font-semibold">{c.title}</h3>
              <div className="text-sm text-muted-foreground">{c.org}</div>
              <p className="mt-3 text-sm text-foreground/85">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Achievements() {
  const items = [
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Technical Symposium Speaker",
      desc: "Presented original research to 50+ attendees at JEC ZENTRIX inter-college symposium (Mar 2026).",
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      title: "AI + IoT Competition",
      desc: "Competed in CODEQUEST 2.0 'AI Meets IoT' developing a working solution to an IoT problem statement (Feb 2026).",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Peer Mentor & Study Lead",
      desc: "Mentor first-year students on Python and Git/GitHub, and collaborate weekly with a 4-member AI/ML study group.",
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "IET JEC Recognition",
      desc: "Awarded a Certificate of Appreciation for active technical contribution across 3+ student-led events (Sep 2025).",
    },
  ];
  return (
    <Section id="achievements" eyebrow="Achievements" title="Milestones worth marking" subtitle="Technical symposiums, coding competitions, and academic contributions.">
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((a) => (
          <div key={a.title} className="reveal glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                {a.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ResumeSection() {
  return (
    <section id="resume" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="reveal relative overflow-hidden rounded-3xl glass p-8 sm:p-12">
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
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                <span className="text-gradient">Grab the full story.</span>
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Download my up-to-date, ATS-friendly resume. One page, no
                fluff — the exact story recruiters and interviewers need.
              </p>
            </div>
            <a
              href={RESUME_URL}
              download
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-accent-foreground shadow-[0_10px_30px_-10px_rgba(56,189,248,0.6)] transition-transform hover:-translate-y-0.5"
            >
              <Download className="h-5 w-5" /> Download Resume (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

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
            className="reveal group glass flex items-center gap-4 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:text-accent"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent transition-transform group-hover:scale-110">
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
          className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-6 py-3 font-medium text-white shadow-[0_10px_30px_-10px_rgba(10,102,194,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-10px_rgba(10,102,194,0.7)]"
        >
          <Linkedin className="h-5 w-5" />
          Visit LinkedIn Profile
        </a>
        <a
          href="https://github.com/taufeeqms"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 font-medium text-foreground transition-all hover:-translate-y-0.5 hover:text-accent"
        >
          <Github className="h-5 w-5" />
          Visit GitHub Profile
        </a>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Taufeeq M S. Built with care.
        </p>
        <div className="flex items-center gap-2 text-muted-foreground">
          <a aria-label="GitHub" href="https://github.com/taufeeqms" target="_blank" rel="noreferrer" className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-accent">
            <Github className="h-4 w-4" />
          </a>
          <a aria-label="LinkedIn" href="https://www.linkedin.com/in/taufeeq-ms-19aa07377" target="_blank" rel="noreferrer" className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-accent">
            <Linkedin className="h-4 w-4" />
          </a>
          <a aria-label="Email" href="mailto:taufeeq.ms2007@gmail.com" className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-accent">
            <Mail className="h-4 w-4" />
          </a>
          <a aria-label="Phone" href="tel:+918122844807" className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-accent">
            <Phone className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
