import { useRef, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
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
  Upload,
  Cpu,
  Download,
  Sun,
  Moon,
  Star,
  Quote,
  Menu,
  X,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
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

const howItWorks = [
  {
    step: 1,
    icon: Upload,
    title: "Upload Your Contract",
    description: "Drag and drop any PDF, DOCX, or image. Or import directly from Google Drive.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    step: 2,
    icon: Cpu,
    title: "AI Analyzes Everything",
    description: "In under 60 seconds, every clause is translated, risks are flagged, and key terms are highlighted.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    step: 3,
    icon: Download,
    title: "Understand & Sign",
    description: "Ask follow-up questions, sign electronically, or send for signatures — all in one place.",
    gradient: "from-green-500 to-green-600",
  },
];

const testimonials = [
  {
    quote: "I almost signed a lease with a hidden auto-renewal clause. SignSafe caught it in seconds. This tool is a lifesaver.",
    name: "Jordan M.",
    role: "Freelance Designer",
    rating: 5,
  },
  {
    quote: "As a small business owner, I can't afford a lawyer for every contract. SignSafe gives me the confidence to sign knowing exactly what I'm agreeing to.",
    name: "Priya K.",
    role: "E-commerce Founder",
    rating: 5,
  },
  {
    quote: "The AI follow-up chat is what sets this apart. I asked 'what happens if I miss a payment?' and got a clear answer referencing the exact clause.",
    name: "Marcus T.",
    role: "Real Estate Investor",
    rating: 5,
  },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white overflow-hidden">
      <Helmet>
        <title>SignSafe — Understand Any Contract Before You Sign | AI Legal Document Analysis</title>
        <meta name="description" content="SignSafe uses AI to translate complex legal contracts into plain English. Instantly flag risky clauses, ask follow-up questions, and e-sign — all in one platform. Free to start." />
        <meta property="og:title" content="SignSafe — Understand Any Contract Before You Sign" />
        <meta property="og:description" content="Upload any contract, get a plain English translation with risk flags, then ask follow-up questions. AI-powered legal document analysis with built-in e-signatures." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SignSafe" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SignSafe — AI Contract Analysis & E-Signatures" />
        <meta name="twitter:description" content="Translate legal jargon to plain English. Flag risks. Sign documents. All in one place." />
        <meta name="keywords" content="AI contract analysis, legal document translator, plain English contracts, risk detection, e-signature, contract review, legal tech" />
        <link rel="canonical" href="https://signsafe.replit.app/" />
      </Helmet>

      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-gray-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/landing">
            <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" data-testid="link-landing-logo">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight">SignSafe</span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
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

          <div className="flex sm:hidden items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className="text-gray-500 dark:text-white/60"
              data-testid="button-theme-toggle-mobile"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-white/80"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden overflow-hidden border-t border-gray-200/60 dark:border-white/[0.06]"
            >
              <div className="px-4 py-4 space-y-3 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-xl">
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-white/70" data-testid="button-sign-in-mobile">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gray-900 text-white dark:bg-white dark:text-black font-semibold" data-testid="button-get-started-mobile">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="relative pt-24 pb-14 sm:pt-40 sm:pb-28 md:pt-48 md:pb-36">
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30" data-testid="icon-hero-shield">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
            </motion.div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]" data-testid="text-hero-headline">
                <span className="block">Understand Every Clause.</span>
                <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">Before You Sign.</span>
              </h1>

              <p className="text-gray-500 dark:text-white/50 max-w-2xl mx-auto text-base sm:text-xl md:text-2xl leading-relaxed font-light px-2 sm:px-0" data-testid="text-hero-subheadline">
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

      <section className="relative py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <AnimatedSection>
            <div className="relative rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] p-1 shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10">
              <div className="rounded-xl overflow-hidden bg-white dark:bg-[#12121a] p-4 sm:p-6" data-testid="product-mockup">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-4 flex-1 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center px-3">
                    <span className="text-xs text-gray-400 dark:text-white/30 font-mono">signsafe.app/analysis</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-white/70">Employment Agreement — Analysis</span>
                    </div>

                    <div className="rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-white/60">Clause 3: Compensation</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">
                        You'll be paid $85,000 per year, split into bi-weekly paychecks. Bonuses are discretionary — your employer can choose whether or not to give one.
                      </p>
                    </div>

                    <div className="rounded-lg bg-red-50 dark:bg-red-500/[0.08] border border-red-100 dark:border-red-500/[0.15] p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">Risk: Non-Compete Clause</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">
                        You cannot work for any competing company for 2 years after leaving. This is unusually long and could limit your career options.
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-white/60">Clause 7: Termination</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">
                        Either party can end the agreement with 30 days written notice. If fired for cause, no severance is provided.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-500/[0.08] border border-blue-100 dark:border-blue-500/[0.15] p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">AI Chat</span>
                      </div>
                      <div className="space-y-2">
                        <div className="rounded-md bg-white dark:bg-white/[0.06] p-2">
                          <p className="text-xs text-gray-600 dark:text-white/50">"Can they really stop me from freelancing?"</p>
                        </div>
                        <div className="rounded-md bg-blue-100 dark:bg-blue-500/20 p-2">
                          <p className="text-xs text-blue-700 dark:text-blue-300">Based on Clause 12, the non-compete applies to "any business in the same industry" within a 50-mile radius...</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600 dark:text-white/60">Risk Score</span>
                        <span className="text-xs font-bold text-orange-500">Medium</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/10">
                        <div className="w-3/5 h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-400 dark:text-white/30">Low</span>
                        <span className="text-[10px] text-gray-400 dark:text-white/30">High</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-green-50 dark:bg-green-500/[0.08] border border-green-100 dark:border-green-500/[0.15] p-3">
                      <div className="flex items-center gap-2">
                        <PenTool className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">Ready to Sign</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-white/40 mt-1">Draw, type, or upload your signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
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

      <section className="relative py-16 sm:py-24 md:py-32" data-testid="section-how-it-works">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <AnimatedSection className="text-center mb-16 sm:mb-20">
            <p className="text-blue-500 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight" data-testid="text-how-heading">
              Three steps to
              <br />
              <span className="text-gray-400 dark:text-white/40">total clarity</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-green-500/10" />

            {howItWorks.map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 0.15}>
                <div className="text-center space-y-5 relative" data-testid={`step-${item.step}`}>
                  <div className="flex justify-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg relative`}>
                      <item.icon className="w-7 h-7 text-white" />
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-[#0a0a0f] border-2 border-gray-200 dark:border-white/10 flex items-center justify-center">
                        <span className="text-xs font-black text-gray-700 dark:text-white/80">{item.step}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold" data-testid={`text-step-title-${item.step}`}>{item.title}</h3>
                  <p className="text-gray-500 dark:text-white/50 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-24 md:py-32 border-t border-gray-200/60 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <AnimatedSection className="mb-10 sm:mb-16 md:mb-20">
            <p className="text-blue-500 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">Why Switch</p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight" data-testid="text-why-heading">
              What your current tools
              <br />
              <span className="text-gray-400 dark:text-white/40">can't do</span>
            </h2>
          </AnimatedSection>

          <div className="space-y-6">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.number} delay={i * 0.1}>
                <div className="group relative rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100/50 dark:hover:bg-white/[0.04] transition-all duration-500 p-5 sm:p-8 md:p-10" data-testid={`card-feature-${feature.number}`}>
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

      <section className="relative py-16 sm:py-24 md:py-32 border-t border-gray-200/60 dark:border-white/[0.06]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
          <AnimatedSection className="mb-10 sm:mb-16">
            <p className="text-blue-500 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">The SignSafe Edge</p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight" data-testid="text-edge-heading">
              Built to replace
              <br />
              <span className="text-gray-400 dark:text-white/40">manual review</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {capabilities.map((cap, i) => (
              <AnimatedSection key={cap.title} delay={i * 0.08}>
                <div className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100/50 dark:hover:bg-white/[0.05] transition-all duration-300 p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 group" data-testid={`card-capability-${i}`}>
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

      <section className="relative py-16 sm:py-24 md:py-32 border-t border-gray-200/60 dark:border-white/[0.06]" data-testid="section-testimonials">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <AnimatedSection className="text-center mb-10 sm:mb-16">
            <p className="text-blue-500 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">What People Say</p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight" data-testid="text-testimonials-heading">
              Trusted by people who
              <br />
              <span className="text-gray-400 dark:text-white/40">read before they sign</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1}>
                <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] p-6 sm:p-8 space-y-5 h-full flex flex-col" data-testid={`card-testimonial-${i}`}>
                  <Quote className="w-8 h-8 text-blue-500/20 dark:text-blue-400/20" />
                  <p className="text-gray-600 dark:text-white/60 text-sm sm:text-base leading-relaxed flex-1">
                    "{t.quote}"
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-sm" data-testid={`text-testimonial-name-${i}`}>{t.name}</p>
                      <p className="text-gray-400 dark:text-white/40 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-24 md:py-32 border-t border-gray-200/60 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <AnimatedSection className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight" data-testid="text-cta-heading">
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

      <section className="relative py-14 sm:py-20 md:py-24 border-t border-gray-200/60 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <AnimatedSection className="space-y-4">
            <p className="text-gray-400 dark:text-white/30 text-base sm:text-xl font-light">
              Still reading contracts the hard way?
            </p>
            <p className="text-gray-500 dark:text-white/60 text-xl sm:text-3xl font-bold">
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

      <footer className="border-t border-gray-200/60 dark:border-white/[0.06] py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold" data-testid="text-footer-logo">SignSafe</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400 dark:text-white/40">
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
