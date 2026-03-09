import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  FileText,
  Shield,
  AlertTriangle,
  MessageSquare,
  ScanLine,
  Zap,
  ArrowRight,
  ArrowLeft,
  Crown,
  Check,
  Sparkles,
  Upload,
  Brain,
  CheckCircle,
  Send,
  MessagesSquare,
  BotMessageSquare,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: "welcome" },
  { id: "how-it-works" },
  { id: "ai-chat" },
  { id: "features" },
  { id: "pricing" },
  { id: "ready" },
];

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`rounded-full transition-colors ${
            i === current ? "bg-primary w-8 h-2" : "bg-muted-foreground/30 w-2 h-2"
          }`}
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      ))}
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 px-6 py-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center shadow-lg"
      >
        <ShieldCheck className="w-12 h-12 text-primary-foreground" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-onboarding-welcome">
          Welcome to SignSafe
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Understand any contract before you sign — then ask it anything.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
      >
        <Sparkles className="w-4 h-4" />
        Let's get you set up in 30 seconds
      </motion.div>
    </div>
  );
}

function HowItWorksStep() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Document",
      description: "Drop a PDF, snap a photo, or paste text — any legal document works.",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: Brain,
      title: "AI Analyzes It",
      description: "Our AI reads every clause and translates legalese into plain English.",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      icon: MessagesSquare,
      title: "Ask Follow-Up Questions",
      description: "Have a conversation with AI about your document — dig into any clause or concern.",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-8 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-onboarding-howitworks">
          How It Works
        </h2>
        <p className="text-muted-foreground">Three steps to fully understand any legal document</p>
      </motion.div>
      <div className="grid gap-4 w-full max-w-sm">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.15, type: "spring", stiffness: 300 }}
            className="flex items-start gap-4 text-left p-4 rounded-xl border bg-card"
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {i + 1}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AIChatStep() {
  const sampleQuestions = [
    "Can I terminate this lease early?",
    "What happens if I miss a payment?",
    "Is the non-compete clause enforceable?",
    "What are my obligations under Section 4?",
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-6 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold"
          >
            OUR #1 FEATURE
          </motion.div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-onboarding-aichat">
          Ask Your Document Anything
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Other tools just translate. SignSafe lets you have a real conversation about your contract.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/50 flex items-center gap-2">
            <BotMessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Document Chat</span>
          </div>
          <div className="p-4 space-y-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end"
            >
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-left">Can the landlord raise rent during my lease?</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-left">Based on Section 3.2 of your lease, rent is fixed for the 12-month term. The landlord can only increase rent upon renewal with 60 days written notice. This is a standard and favorable clause for you.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="flex justify-end"
            >
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-left">What if I need to break the lease?</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-left">Section 7.1 requires 60 days notice plus a penalty of 2 months rent. I'd flag this as a <span className="font-semibold text-amber-600 dark:text-amber-400">medium risk</span> — you may want to negotiate this down.</p>
              </div>
            </motion.div>
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5">
              <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground flex-1 text-left">Ask anything about your document...</span>
              <Send className="w-4 h-4 text-primary shrink-0" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="space-y-2 w-full max-w-sm"
      >
        <p className="text-xs font-medium text-muted-foreground">PEOPLE ALSO ASK</p>
        <div className="flex flex-wrap justify-center gap-2">
          {sampleQuestions.map((q, i) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6 + i * 0.1 }}
              className="px-3 py-1.5 rounded-full border bg-card text-xs text-muted-foreground"
            >
              {q}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function FeaturesStep() {
  const features = [
    {
      icon: FileText,
      title: "Plain English Translation",
      description: "Every section explained simply",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: AlertTriangle,
      title: "Risk Flags",
      description: "Problems highlighted with severity",
      color: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      icon: Shield,
      title: "Key Terms Defined",
      description: "Legal jargon decoded for you",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      icon: ScanLine,
      title: "Document Scanner",
      description: "Snap a photo to scan text",
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Analysis in under a minute",
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-8 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-onboarding-features">
          Everything You Need
        </h2>
        <p className="text-muted-foreground">Powerful tools to understand any legal document</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 400 }}
            className={`p-4 rounded-xl border bg-card text-center space-y-2 ${i === features.length - 1 && features.length % 2 !== 0 ? "col-span-2 max-w-[50%] mx-auto" : ""}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto ${feature.color}`}>
              <feature.icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-xs">{feature.title}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PricingStep() {
  return (
    <div className="flex flex-col items-center text-center space-y-8 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-onboarding-pricing">
          Start Free
        </h2>
        <p className="text-muted-foreground">No credit card needed to get started</p>
      </motion.div>
      <div className="grid gap-4 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-xl border-2 border-primary/20 bg-card space-y-4"
        >
          <div className="space-y-1">
            <p className="font-bold text-lg">Free Plan</p>
            <p className="text-2xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </div>
          <div className="space-y-2 text-left">
            {[
              "3 document analyses per month",
              "Plain English translations",
              "Risk flags & key terms",
              "AI follow-up chat on every document",
              "Document scanning",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 rounded-xl border-2 border-primary bg-primary/5 space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              <Crown className="w-3 h-3" />
              Premium
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-lg">Premium</p>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
          <div className="space-y-2 text-left">
            {[
              "Unlimited analyses",
              "Unlimited AI chat conversations",
              "Multi-file upload",
              "Export & share reports",
              "Priority processing",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ReadyStep() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 px-6 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center"
      >
        <CheckCircle className="w-10 h-10 text-green-500" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-onboarding-ready">
          You're All Set!
        </h2>
        <p className="text-lg text-muted-foreground max-w-md">
          Upload your first document, get a plain English breakdown, then ask it anything.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          Your documents are private and secure
        </div>
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <MessageSquare className="w-4 h-4" />
          Ask unlimited follow-up questions on any analysis
        </div>
      </motion.div>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [, navigate] = useLocation();
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const [finishing, setFinishing] = useState(false);

  const isLastStep = step === STEPS.length - 1;

  const finishOnboarding = async () => {
    setFinishing(true);
    try {
      await updateUser({ onboardingCompleted: true } as any);
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Failed to complete onboarding.", variant: "destructive" });
    } finally {
      setFinishing(false);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      finishOnboarding();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const goNext = () => {
    setDirection(1);
    handleNext();
  };

  const goBack = () => {
    setDirection(-1);
    handleBack();
  };

  const renderStep = () => {
    switch (STEPS[step].id) {
      case "welcome": return <WelcomeStep />;
      case "how-it-works": return <HowItWorksStep />;
      case "ai-chat": return <AIChatStep />;
      case "features": return <FeaturesStep />;
      case "pricing": return <PricingStep />;
      case "ready": return <ReadyStep />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">SignSafe</span>
        </div>
        {!isLastStep && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground"
            data-testid="button-skip-onboarding"
          >
            Skip
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 space-y-4">
        <StepDots current={step} total={STEPS.length} />
        <div className="flex items-center gap-3 max-w-sm mx-auto w-full">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={goBack}
              className="flex-1"
              data-testid="button-onboarding-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <Button
            size="lg"
            onClick={goNext}
            disabled={finishing}
            className="flex-1"
            data-testid="button-onboarding-next"
          >
            {finishing ? (
              "Starting..."
            ) : isLastStep ? (
              <>
                Analyze My First Document
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
