import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  MessageSquare,
  PenTool,
  Zap,
  Search,
  Languages,
  Lock,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    number: "01",
    icon: FileText,
    title: "AI Document Analysis",
    description: "Stop squinting at legal jargon. Upload any contract and get a plain English breakdown of every single clause. No law degree needed.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    number: "02",
    icon: AlertTriangle,
    title: "Risk Flag Detection",
    description: "Hidden fees? Auto-renewal traps? Non-compete overreach? SignSafe catches what you'd miss and tells you exactly why it matters.",
    gradient: "from-orange-500 to-red-400",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "AI Follow-Up Chat",
    description: "\"What happens if I break this clause?\" Just ask. Get instant, context-aware answers about YOUR document — like a lawyer on speed dial.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    number: "04",
    icon: PenTool,
    title: "E-Signatures Built In",
    description: "Understand it, sign it, send it — all in one place. Draw, type, or upload your signature and request signatures from others.",
    gradient: "from-purple-500 to-pink-400",
  },
];

const capabilities = [
  { icon: Search, title: "AI That Gets You", description: "Deep clause-by-clause analysis powered by advanced AI" },
  { icon: Zap, title: "Instant Results", description: "Full contract analysis in under 60 seconds" },
  { icon: AlertTriangle, title: "Zero Missed Risks", description: "50+ risk patterns detected automatically" },
  { icon: Languages, title: "Plain English", description: "Every clause translated to everyday language" },
  { icon: MessageSquare, title: "Ask Anything", description: "Interactive Q&A about your specific document" },
  { icon: Lock, title: "Privacy First", description: "Your documents are encrypted and never shared" },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-gray-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link href="/landing">
            <div className="flex items-center gap-3 cursor-pointer" data-testid="link-landing-logo">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">SignSafe</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link href="/auth">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10" data-testid="button-sign-in">
                Log In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold" data-testid="button-get-started-nav">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 md:pt-48 md:pb-36">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/8 dark:bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-cyan-500/6 dark:bg-cyan-500/8 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30" data-testid="icon-hero-shield">
                <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]" data-testid="text-hero-headline">
                <span className="block">Understand Every Clause.</span>
                <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">Before You Sign.</span>
              </h1>

              <p className="text-gray-500 dark:text-white/50 max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl leading-relaxed font-light" data-testid="text-hero-subheadline">
                AI-powered contract analysis that translates legal jargon into plain English,
                flags risky clauses, and lets you ask follow-up questions — like having a lawyer on call.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/auth">
                <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-bold text-base px-8 h-13 rounded-xl shadow-xl shadow-gray-900/10 dark:shadow-white/10" data-testid="button-hero-get-started">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10 font-semibold text-base px-8 h-13 rounded-xl bg-transparent" data-testid="button-hero-try-sample">
                  Try Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 border-y border-gray-200/60 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: "< 1min", label: "To analyze a contract" },
              { value: "50+", label: "Risk patterns detected" },
              { value: "24/7", label: "AI assistant" },
              { value: "Free", label: "To start" },
            ].map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className="text-center space-y-2" data-testid={`stat-${i}`}>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-white/60 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-gray-400 dark:text-white/40 text-sm sm:text-base">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <AnimatedSection className="mb-16 sm:mb-20">
            <p className="text-blue-500 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">Why Switch</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight" data-testid="text-why-heading">
              What your current tools
              <br />
              <span className="text-gray-400 dark:text-white/40">can't do</span>
            </h2>
          </AnimatedSection>

          <div className="space-y-6">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.number} delay={i * 0.1}>
                <div className="group relative rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100/50 dark:hover:bg-white/[0.04] transition-all duration-500 p-8 sm:p-10" data-testid={`card-feature-${feature.number}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8">
                    <div className="flex items-center sm:items-start gap-5 sm:gap-0 sm:flex-col sm:shrink-0 sm:w-16">
                      <span className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                        {feature.number}
                      </span>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg sm:mt-4`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3 flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold" data-testid={`text-feature-title-${feature.number}`}>{feature.title}</h3>
                      <p className="text-gray-500 dark:text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32 border-t border-gray-200/60 dark:border-white/[0.06]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
          <AnimatedSection className="mb-16">
            <p className="text-blue-500 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">The SignSafe Edge</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight" data-testid="text-edge-heading">
              Built to replace
              <br />
              <span className="text-gray-400 dark:text-white/40">manual review</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {capabilities.map((cap, i) => (
              <AnimatedSection key={cap.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100/50 dark:hover:bg-white/[0.05] transition-all duration-300 p-6 sm:p-8 space-y-4 group" data-testid={`card-capability-${i}`}>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-blue-600/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:from-blue-500/30 dark:group-hover:to-blue-600/30 transition-all">
                    <cap.icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-base sm:text-lg" data-testid={`text-capability-${i}`}>{cap.title}</p>
                    <p className="text-gray-400 dark:text-white/40 text-sm leading-relaxed">{cap.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32 border-t border-gray-200/60 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <AnimatedSection className="space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" data-testid="text-cta-heading">
              Make The Switch
            </h2>
            <p className="text-gray-400 dark:text-white/40 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
              Your old contract process had its run. This is the upgrade you've been waiting for.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth">
                <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-bold text-base px-10 h-14 rounded-xl shadow-xl shadow-gray-900/10 dark:shadow-white/10" data-testid="button-cta-switch">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative py-20 sm:py-24 border-t border-gray-200/60 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <AnimatedSection className="space-y-4">
            <p className="text-gray-400 dark:text-white/30 text-lg sm:text-xl font-light">
              Still reading contracts the hard way?
            </p>
            <p className="text-gray-500 dark:text-white/60 text-2xl sm:text-3xl font-bold">
              They weren't built for this. <span className="text-gray-900 dark:text-white">SignSafe was.</span>
            </p>
            <div className="pt-4">
              <Link href="/auth">
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10 font-semibold rounded-xl bg-transparent" data-testid="button-final-cta">
                  Switch to SignSafe
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <footer className="border-t border-gray-200/60 dark:border-white/[0.06] py-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold" data-testid="text-footer-logo">SignSafe</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 dark:text-white/40">
              <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors" data-testid="link-footer-privacy">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors" data-testid="link-footer-terms">
                Terms of Service
              </Link>
              <a href="mailto:akinslaboratory@gmail.com" className="hover:text-gray-900 dark:hover:text-white transition-colors" data-testid="link-footer-email">
                akinslaboratory@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
