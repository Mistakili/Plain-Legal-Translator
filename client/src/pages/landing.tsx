import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Mail,
} from "lucide-react";
import { motion, useInView } from "framer-motion";

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const stats = [
  { value: "< 1min", label: "Analysis Time" },
  { value: "50+", label: "Risk Patterns Detected" },
  { value: "24/7", label: "AI Assistant" },
  { value: "Free", label: "To Start" },
];

const features = [
  {
    number: "01",
    icon: FileText,
    title: "AI Document Analysis",
    description: "Upload any contract and get a plain English translation of every clause, section by section.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    number: "02",
    icon: AlertTriangle,
    title: "Risk Flag Detection",
    description: "Automatic identification of risky clauses with severity levels so you know exactly what to watch out for.",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "AI Follow-Up Chat",
    description: "Ask questions about your document and get instant, context-aware answers — like having a lawyer on call.",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    number: "04",
    icon: PenTool,
    title: "E-Signatures",
    description: "Sign documents and send for signatures right from the platform — no extra tools needed.",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
];

const capabilities = [
  { icon: Search, title: "AI Analysis", description: "Deep clause-by-clause review" },
  { icon: Zap, title: "Instant Results", description: "Analysis in under a minute" },
  { icon: AlertTriangle, title: "Risk Detection", description: "Flag dangerous clauses" },
  { icon: Languages, title: "Plain English", description: "No more legal jargon" },
  { icon: MessageSquare, title: "Interactive Q&A", description: "Ask follow-up questions" },
  { icon: Lock, title: "Privacy First", description: "Your documents stay private" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-[100]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight" data-testid="text-landing-logo">SignSafe</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button variant="ghost" data-testid="button-sign-in">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button data-testid="button-get-started-nav">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 md:py-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary flex items-center justify-center" data-testid="icon-hero-shield">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </div>
            </motion.div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
              data-testid="text-hero-headline"
            >
              Understand Every Clause.
              <br />
              <span className="text-muted-foreground">Before You Sign.</span>
            </h1>

            <p
              className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed"
              data-testid="text-hero-subheadline"
            >
              AI-powered contract analysis that translates legal jargon into plain English,
              flags risky clauses, and lets you ask follow-up questions — like having a lawyer on call.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
            >
              <Link href="/auth">
                <Button size="lg" data-testid="button-hero-get-started">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" data-testid="button-hero-try-sample">
                  Try a Sample
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1}>
              <Card className="p-5 text-center space-y-1">
                <p className="text-2xl sm:text-3xl font-bold text-foreground" data-testid={`text-stat-value-${i}`}>{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground" data-testid={`text-stat-label-${i}`}>{stat.label}</p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <AnimatedSection className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-why-heading">
            Why SignSafe
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Four powerful tools to help you navigate any legal document with confidence.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.number} delay={i * 0.1}>
              <Card className="p-6 space-y-4 h-full">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">{feature.number}</span>
                    <div className={`w-11 h-11 rounded-md flex items-center justify-center ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-base" data-testid={`text-feature-title-${feature.number}`}>{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 dark:bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <AnimatedSection className="text-center space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-edge-heading">
              The SignSafe Edge
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
              Everything you need to understand and manage your contracts.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {capabilities.map((cap, i) => (
              <AnimatedSection key={cap.title} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center space-y-3 p-5 rounded-md">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <cap.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm" data-testid={`text-capability-${i}`}>{cap.title}</p>
                    <p className="text-xs text-muted-foreground">{cap.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <AnimatedSection>
          <Card className="p-8 sm:p-12 text-center space-y-6 bg-primary/5 border-primary/20">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-cta-heading">
              Still reading contracts the hard way?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg">
              Join thousands of users who understand their contracts in minutes, not hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth">
                <Button size="lg" data-testid="button-cta-switch">
                  Make The Switch
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </AnimatedSection>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold" data-testid="text-footer-logo">SignSafe</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">
                Terms of Service
              </Link>
              <a href="mailto:support@signsafe.app" className="flex items-center gap-1.5 hover:text-foreground transition-colors" data-testid="link-footer-email">
                <Mail className="w-3.5 h-3.5" />
                support@signsafe.app
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
