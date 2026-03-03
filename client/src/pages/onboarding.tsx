import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Scale,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: "welcome" },
  { id: "how-it-works" },
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
        <Scale className="w-12 h-12 text-primary-foreground" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" data-testid="text-onboarding-welcome">
          Welcome to PlainLegal
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Your AI-powered legal translator. Understand any contract before you sign it.
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
      icon: CheckCircle,
      title: "Get Clear Results",
      description: "See risk flags, key terms, and a full translation you can actually understand.",
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
        <p className="text-muted-foreground">Three simple steps to understand any legal document</p>
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
      description: "Potential problems highlighted",
      color: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      icon: Shield,
      title: "Key Terms Defined",
      description: "Legal jargon decoded for you",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      icon: MessageSquare,
      title: "AI Q&A Chat",
      description: "Ask questions about your document",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
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
          Powerful Features
        </h2>
        <p className="text-muted-foreground">Everything you need to understand legal documents</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 400 }}
            className="p-4 rounded-xl border bg-card text-center space-y-2"
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
              "AI Q&A chat",
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
          Upload your first legal document and see PlainLegal in action.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Shield className="w-4 h-4" />
        Your documents are private and secure
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
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">PlainLegal</span>
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
