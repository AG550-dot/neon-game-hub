import GameTile from "@/components/GameTile";
import GameLogo from "@/components/GameLogo";
import NeonHeader from "@/components/NeonHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GAMES } from "@/lib/games";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Chrome,
  Gamepad2,
  Gift,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function Landing() {
  useEffect(() => {
    document.title = "NeonPlay Arcade — Unblocked Games for School";
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />

      <main className="flex-1">
        {/* ===================== HERO ===================== */}
        <section className="bg-grid relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          {/* Ambient glow orbs */}
          <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-[#ff2ea6]/15 blur-[130px]" />
          <div className="pointer-events-none absolute -right-24 top-40 size-96 rounded-full bg-[#00e5ff]/15 blur-[130px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 size-80 rounded-full bg-[#b026ff]/15 blur-[120px]" />

          <div className="relative mx-auto max-w-7xl">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center text-center"
            >
              <motion.div variants={item}>
                <Badge
                  variant="outline"
                  className="neon-chip mb-6 animate-neon-pulse border-none px-4 py-1.5 text-xs font-bold tracking-wide"
                >
                  <Sparkles className="mr-1.5 size-3.5" />
                  100% FREE · NO DOWNLOADS · NO SIGN-UP TO PLAY
                </Badge>
              </motion.div>

              <motion.h1
                variants={item}
                className="max-w-4xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
              >
                Play the best{" "}
                <span className="text-rainbow glow-text">unblocked games</span>
                <br className="hidden sm:block" /> at school
              </motion.h1>

              <motion.p
                variants={item}
                className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
              >
                Slope, Retro Bowl 25, Run 3, Cookie Clicker, Gladihoppers and
                Eaglercraft — legendary arcade classics, unblocked and running
                instantly in your browser. Built for Chromebooks, school
                laptops, and boring study halls.
              </motion.p>

              <motion.div
                variants={item}
                className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
              >
                <Button asChild size="lg" className="btn-neon h-12 px-8 text-base">
                  <Link to="/games">
                    <Gamepad2 className="mr-2 size-5" />
                    Start playing free
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="btn-ghost-neon h-12 px-8 text-base"
                >
                  <Link to="/play/slope">
                    <Zap className="mr-2 size-5 text-[#ffe14d]" />
                    Play Slope now
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                variants={item}
                className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-[#3dff8b]" /> Safe, no
                  shady ads
                </span>
                <span className="flex items-center gap-1.5">
                  <Chrome className="size-4 text-[#00e5ff]" /> Works on
                  Chromebooks
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 text-[#ffe14d]" /> {GAMES.length} legendary games
                </span>
              </motion.div>
            </motion.div>

            {/* Floating game tiles preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
              className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
            >
              {GAMES.slice(0, 8).map((game, i) => (
                <div
                  key={game.slug}
                  className={i % 2 === 1 ? "lg:translate-y-6" : ""}
                >
                  <GameTile game={game} />
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===================== RAINBOW MARQUEE ===================== */}
        <div className="relative overflow-hidden border-y border-[#b026ff33] py-3">
          <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex gap-8">
                {[
                  "SLOPE",
                  "RETRO BOWL 25",
                  "RUN 3",
                  "COOKIE CLICKER",
                  "GLADIHOPPERS",
                  "EAGLECRAFT",
                  "UNBLOCKED AT SCHOOL",
                  "NO DOWNLOADS",
                  "FREE FOREVER",
                  "CHROMEBOOK READY",
                ].map((text) => (
                  <span
                    key={`${copy}-${text}`}
                    className="flex items-center gap-8 font-display text-sm font-bold tracking-[0.25em] text-foreground/50"
                  >
                    {text}
                    <span className="size-1.5 rounded-full bg-rainbow" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ===================== FEATURED GAMES ===================== */}
        <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading
            kicker="The lineup"
            title={
              <>
                Legendary <span className="text-rainbow">unblocked games</span>
              </>
            }
            sub="Four icons. Zero downloads. Each one a certified school-day classic — pick your poison."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {GAMES.slice(0, 4).map((game, i) => (
              <motion.div
                key={game.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.08 }}
              >
                <FeaturedGameRow game={game} index={i} />
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" variant="ghost" className="btn-ghost-neon h-12 px-8">
              <Link to="/games">
                Browse the full arcade
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ===================== WHY NEONPLAY ===================== */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6">
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00e5ff]/60 to-transparent" />
          <SectionHeading
            kicker="Why NeonPlay"
            title={
              <>
                Built to beat{" "}
                <span className="text-rainbow">boredom</span>, not to beat you
              </>
            }
            sub="No pop-up avalanches, no fake play buttons, no five-click mazes. Just games that load and work."
          />
          <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="neon-card rounded-2xl p-6"
              >
                <span
                  className={`mb-4 flex size-11 items-center justify-center rounded-xl border ${f.tone}`}
                >
                  <f.icon className="size-5" />
                </span>
                <h3 className="font-display text-base font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            kicker="How it works"
            title={
              <>
                From zero to playing in{" "}
                <span className="text-rainbow">three clicks</span>
              </>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="relative"
              >
                <div className="neon-card h-full rounded-2xl p-6">
                  <span className="font-display text-4xl font-extrabold text-rainbow">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===================== STATS BAND ===================== */}
        <section className="border-y border-[#b026ff26] bg-[#0b0520]/60 px-4 py-10 sm:px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-extrabold text-rainbow sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== FAQ ===================== */}
        <section className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6">
          <SectionHeading
            kicker="Questions"
            title={
              <>
                Everything students{" "}
                <span className="text-rainbow">ask us</span>
              </>
            }
          />
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="neon-card group rounded-xl px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {faq.q}
                  <ChevronDown className="size-4 shrink-0 text-[#00e5ff] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ===================== FINAL CTA ===================== */}
        <section className="relative overflow-hidden px-4 pb-24 pt-6 sm:px-6">
          <div className="rainbow-ring relative mx-auto max-w-4xl rounded-3xl bg-[#100824]/80 p-10 text-center backdrop-blur-xl sm:p-14">
            <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-[#ff2ea6]/20 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full bg-[#00e5ff]/20 blur-[100px]" />
            <Gamepad2 className="animate-float mx-auto size-12 text-[#00e5ff]" />
            <h2 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">
              Your free period just got{" "}
              <span className="text-rainbow glow-text">a lot better</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Pick a game and hit play — no account needed. Want favorites and
              play stats? A free account takes ten seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="btn-neon h-12 px-8 text-base">
                <Link to="/games">
                  <Zap className="mr-2 size-5" />
                  Enter the arcade
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="btn-ghost-neon h-12 px-8 text-base"
              >
                <Link to="/auth">
                  Create free account
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-[#b026ff26] bg-[#0b0520]/70 px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-[#b026ff66] bg-[#0b0520] shadow-[0_0_18px_rgba(176,38,255,0.45)]">
                <Gamepad2 className="size-5 text-[#00e5ff]" />
              </span>
              <span className="font-display text-lg font-bold">
                <span className="text-rainbow">NeonPlay</span>{" "}
                <span className="text-foreground/80">Arcade</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The neon-drenched home of unblocked games for school. Free
              browser games that load instantly on Chromebooks and school
              laptops — no downloads, no sign-up walls.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Games
            </p>
            <ul className="space-y-2 text-sm">
              {GAMES.map((g) => (
                <li key={g.slug}>
                  <Link
                    to={`/play/${g.slug}`}
                    className="text-muted-foreground transition-colors hover:text-[#00e5ff]"
                  >
                    {g.title} unblocked
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Arcade
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/games"
                  className="text-muted-foreground transition-colors hover:text-[#00e5ff]"
                >
                  All games
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-muted-foreground transition-colors hover:text-[#00e5ff]"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-muted-foreground transition-colors hover:text-[#00e5ff]"
                >
                  Member hub
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-[#b026ff26] pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} NeonPlay Arcade. Free to play, always.</p>
          <p>Made with 💜 and questionable amounts of neon.</p>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Shared section heading ---------------- */
function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mx-auto mb-12 max-w-2xl text-center"
    >
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#00e5ff]">
        {kicker}
      </p>
      <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 leading-relaxed text-muted-foreground">{sub}</p>
      )}
    </motion.div>
  );
}

/* ---------------- Featured game row ---------------- */
function FeaturedGameRow({
  game,
  index,
}: {
  game: (typeof GAMES)[number];
  index: number;
}) {
  return (
    <Link
      to={`/play/${game.slug}`}
      className="neon-card group relative flex h-full flex-col overflow-hidden rounded-2xl sm:flex-row"
    >
      {/* Art panel */}
      <div
        className={`relative flex min-h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${game.artGradient} p-[2px] sm:w-2/5`}
      >
        <div className="flex h-full w-full items-center justify-center bg-[#0b0520]/85 p-4">
          <span className="flex h-32 items-center justify-center transition-transform duration-500 group-hover:scale-110">
            <GameLogo game={game} className="max-h-32 max-w-56" letterClassName="text-8xl" />
          </span>
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-[#070214]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/80">
          #{String(index + 1).padStart(2, "0")} · {game.players}
        </span>
        <div className="absolute inset-0 flex items-center justify-center bg-[#070214]/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background shadow-[0_0_24px_rgba(0,229,255,0.45)]">
            <Zap className="size-4 fill-current" />
            Play now
          </span>
        </div>
      </div>
      {/* Text panel */}
      <div className="flex flex-1 flex-col p-6">
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${game.accentText}`}>
          {game.genre}
        </p>
        <h3 className="mt-1.5 font-display text-2xl font-bold">
          {game.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {game.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-[#b026ff26] pt-4">
          <span className="text-xs text-muted-foreground">
            ⌨️ {game.controls}
          </span>
          <span
            className={`flex items-center gap-1.5 text-sm font-bold ${game.accentText}`}
          >
            Play free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------------- Data ---------------- */
const FEATURES = [
  {
    icon: Zap,
    tone: "border-[#ffe14d55] bg-[#ffe14d1a] text-[#ffe14d]",
    title: "Instant loading",
    body: "No launchers, no installers, no loading purgatory. Click a game and you're playing in under five seconds — even on the slowest school Wi-Fi.",
  },
  {
    icon: ShieldCheck,
    tone: "border-[#3dff8b55] bg-[#3dff8b1a] text-[#3dff8b]",
    title: "Safe & clean",
    body: "Curated games only, hosted on trusted pages. No shady redirects, no sketchy downloads, nothing that gets your school laptop in trouble.",
  },
  {
    icon: Chrome,
    tone: "border-[#00e5ff55] bg-[#00e5ff1a] text-[#00e5ff]",
    title: "Chromebook ready",
    body: "Every game is tested on school Chromebooks. Keyboard controls, fullscreen mode, and buttery performance on modest hardware.",
  },
  {
    icon: Lock,
    tone: "border-[#b026ff55] bg-[#b026ff1a] text-[#c04bff]",
    title: "Built-in, unblockable",
    body: "Every game is coded directly into the site — no third-party game hosts for a school filter to single out. If the page loads, the games load.",
  },
  {
    icon: MonitorSmartphone,
    tone: "border-[#ff2ea655] bg-[#ff2ea61a] text-[#ff2ea6]",
    title: "Any device",
    body: "Desktop, laptop, tablet or phone — the arcade scales to whatever screen you've got. Fullscreen mode makes small screens feel huge.",
  },
  {
    icon: Gift,
    tone: "border-[#ff7a1a55] bg-[#ff7a1a1a] text-[#ff9d5c]",
    title: "Free forever",
    body: "No paywalls, no energy meters, no 'watch an ad to continue'. The games are free and they stay free. That's the whole deal.",
  },
];

const STEPS = [
  {
    title: "Pick your game",
    body: "Slope for speed, Retro Bowl 25 for glory, Run 3 for puzzles, Cookie Clicker for idle zen, Gladihoppers for chaos, Eaglercraft for building. All one click away.",
  },
  {
    title: "Hit play",
    body: "The game loads instantly in your browser. No account, no download, no 'are you sure' dialogs between you and the fun.",
  },
  {
    title: "Go full neon",
    body: "Smash the fullscreen button for the full arcade experience. Esc pops you back to reality when the bell rings.",
  },
];

const STATS = [
  { value: String(GAMES.length), label: "Legendary games" },
  { value: "17", label: "Genres" },
  { value: "0", label: "Downloads needed" },
  { value: "100%", label: "Free to play" },
  { value: "∞", label: "Recess hours saved" },
];

const FAQS = [
  {
    q: "Are these games really unblocked at school?",
    a: "Yes. Every game on NeonPlay Arcade is built directly into the site itself, so it loads over standard web traffic with nothing extra to block — no third-party game hosts, no installs, no VPN, no sign-up required to play.",
  },
  {
    q: "Do I need to download or install anything?",
    a: "No. Every game runs directly in your browser — Chrome, Edge, Safari or Firefox — including school Chromebooks.",
  },
  {
    q: "Is NeonPlay Arcade free?",
    a: "Yes, completely free. You can create a free account to save favorites and track play stats, but the games themselves never require payment or a sign-up.",
  },
  {
    q: "Can I play on a Chromebook or school laptop?",
    a: "Absolutely. The whole arcade is built for Chromebooks — instant loading, keyboard controls, and a fullscreen mode for every game.",
  },
];
