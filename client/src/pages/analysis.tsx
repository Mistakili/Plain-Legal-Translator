import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  FileText,
  Shield,
  AlertTriangle,
  BookOpen,
  Loader2,
  Scale,
  CheckCircle,
  Info,
  XCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Trash2,
  MessageSquare,
  Send,
  Sun,
  Moon,
  Sparkles,
  User,
  Bot,
  PenTool,
} from "lucide-react";
import { SiDigitalocean } from "react-icons/si";
import { type Document, type Analysis, type ChatMessage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import { SignaturePanel } from "@/components/signature-pad";

const severityConfig = {
  low: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    label: "Low",
    icon: Info,
    barColor: "bg-blue-500",
  },
  medium: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    label: "Medium",
    icon: AlertTriangle,
    barColor: "bg-amber-500",
  },
  high: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    label: "High",
    icon: AlertTriangle,
    barColor: "bg-orange-500",
  },
  critical: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    label: "Critical",
    icon: XCircle,
    barColor: "bg-red-500",
  },
};

function RiskMeter({ level }: { level: string }) {
  const values: Record<string, number> = { low: 25, medium: 50, high: 75, critical: 100 };
  const val = values[level] || 0;
  const config = severityConfig[level as keyof typeof severityConfig] || severityConfig.low;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Overall Risk Level</span>
        <Badge variant={level === "critical" || level === "high" ? "destructive" : level === "medium" ? "outline" : "secondary"}>
          {config.label}
        </Badge>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${config.barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${val}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
        <span>Critical</span>
      </div>
    </div>
  );
}

function RiskFlagCard({ flag, index }: { flag: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[flag.severity as keyof typeof severityConfig] || severityConfig.low;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Card
        className={`p-4 border ${config.border} ${config.bg} cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
        data-testid={`card-risk-${index}`}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 shrink-0 ${config.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-medium ${config.color}`}>{flag.clause}</p>
                <Badge variant={flag.severity === "high" || flag.severity === "critical" ? "destructive" : flag.severity === "medium" ? "outline" : "secondary"} className="text-[10px]">
                  {config.label}
                </Badge>
              </div>
              <Button size="icon" variant="ghost" className="shrink-0" data-testid={`button-expand-risk-${index}`} onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            </div>
            <p className="text-sm leading-relaxed">{flag.explanation}</p>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 mt-2 border-t border-current/10 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Suggestion</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{flag.suggestion}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function SectionCard({ section, index }: { section: any; index: number }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Card className="p-5 space-y-3" data-testid={`card-section-${index}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{index + 1}</span>
            </div>
            <h4 className="font-semibold text-sm">{section.section}</h4>
          </div>
          <Button
            size="sm"
            variant="ghost"
            data-testid={`button-toggle-original-${index}`}
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-xs"
          >
            {showOriginal ? "Hide Original" : "Show Original"}
          </Button>
        </div>
        <AnimatePresence>
          {showOriginal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-md bg-muted/50 text-xs text-muted-foreground leading-relaxed font-mono border border-border/50">
                {section.original}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-sm leading-relaxed">{section.translated}</p>
      </Card>
    </motion.div>
  );
}

function ChatPanel({ documentId }: { documentId: string }) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/documents", documentId, "chat"],
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/documents/${documentId}/chat`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "chat"] });
      setMessage("");
    },
    onError: () => {},
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMutation.isPending]);

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate(message.trim());
  };

  const suggestedQuestions = [
    "What are the most important things I should know?",
    "Can I negotiate any of the risky clauses?",
    "What happens if I want to exit this agreement early?",
    "Are there any hidden fees or penalties?",
  ];

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center gap-2 pb-3">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">Ask About Your Document</p>
          <p className="text-xs text-muted-foreground">AI-powered Q&A using DigitalOcean Gradient AI</p>
        </div>
      </div>
      <Separator />
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && !sendMutation.isPending && (
          <div className="space-y-4">
            <div className="text-center py-6 space-y-2">
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Ask any question about your legal document</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Suggested questions:</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  className="w-full text-left text-sm p-3 rounded-md bg-muted/50 text-muted-foreground transition-colors border border-transparent"
                  onClick={() => {
                    setMessage(q);
                  }}
                  data-testid={`button-suggested-question-${i}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] p-3 rounded-md text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/70"
              }`}
              data-testid={`chat-message-${i}`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {sendMutation.isPending && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="p-3 rounded-md bg-muted/70 text-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        {sendMutation.isError && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <XCircle className="w-3.5 h-3.5 text-destructive" />
            </div>
            <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20 text-sm text-destructive">
              Failed to get a response. Please try again.
            </div>
          </div>
        )}
      </div>
      <Separator />
      <div className="flex gap-2 pt-3">
        <Input
          data-testid="input-chat-message"
          placeholder="Ask a question about this document..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={sendMutation.isPending}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
          data-testid="button-send-chat"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-5 w-1/3 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function AnalyzingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <Scale className="w-10 h-10 text-primary" />
      </motion.div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Analyzing Your Document</h3>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          Our AI is reading through your legal document, translating legal jargon,
          identifying risks, and defining key terms. This usually takes 30-60 seconds.
        </p>
      </div>
      <div className="w-64 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "85%" }}
          transition={{ duration: 50, ease: "linear" }}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <SiDigitalocean className="w-3.5 h-3.5" />
        Powered by DigitalOcean Gradient AI
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { data: doc, isLoading } = useQuery<Document>({
    queryKey: ["/api/documents", id],
    refetchInterval: (query) => {
      const d = query.state.data as Document | undefined;
      if (d?.status === "analyzing" || d?.status === "pending") return 2000;
      return false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      navigate("/");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <AnalysisSkeleton />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Document Not Found</h2>
          <Button onClick={() => navigate("/")} data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const analysis = doc.analysis as Analysis | null;
  const isAnalyzing = doc.status === "analyzing" || doc.status === "pending";
  const isError = doc.status === "error";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate" data-testid="text-doc-title">{doc.title}</h1>
              <p className="text-xs text-muted-foreground">
                {analysis?.documentType || "Legal Document"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {doc.riskLevel && <Badge variant={doc.riskLevel === "high" || doc.riskLevel === "critical" ? "destructive" : doc.riskLevel === "medium" ? "outline" : "secondary"}>
              {doc.riskLevel.charAt(0).toUpperCase() + doc.riskLevel.slice(1)} Risk
            </Badge>}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid="button-delete-doc"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Document</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this document and its analysis? This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    data-testid="button-confirm-delete"
                    onClick={() => deleteMutation.mutate()}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {isAnalyzing && <AnalyzingState />}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <XCircle className="w-12 h-12 text-destructive" />
            <h3 className="text-lg font-semibold">Analysis Failed</h3>
            <p className="text-sm text-muted-foreground">
              Something went wrong during analysis. Please try submitting your document again.
            </p>
            <Button onClick={() => navigate("/")} data-testid="button-try-again">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        )}

        {analysis && doc.status === "complete" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <section className="space-y-4">
              <Card className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold" data-testid="text-summary-heading">Summary</h3>
                      <Badge variant="outline" className="text-[10px]">{analysis.documentType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-summary">
                      {analysis.summary}
                    </p>
                  </div>
                </div>
                <Separator />
                <RiskMeter level={analysis.overallRiskLevel} />
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-md bg-muted/50">
                    <p className="text-2xl font-bold" data-testid="text-section-count">{analysis.plainEnglish.length}</p>
                    <p className="text-xs text-muted-foreground">Sections</p>
                  </div>
                  <div className="text-center p-3 rounded-md bg-muted/50">
                    <p className="text-2xl font-bold" data-testid="text-risk-count">{analysis.riskFlags.length}</p>
                    <p className="text-xs text-muted-foreground">Risk Flags</p>
                  </div>
                  <div className="text-center p-3 rounded-md bg-muted/50">
                    <p className="text-2xl font-bold" data-testid="text-terms-count">{analysis.keyTerms.length}</p>
                    <p className="text-xs text-muted-foreground">Key Terms</p>
                  </div>
                </div>
              </Card>
            </section>

            <Tabs defaultValue="translation" className="space-y-4">
              <TabsList className="w-full grid grid-cols-5" data-testid="tabs-analysis">
                <TabsTrigger value="translation" data-testid="tab-translation">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                  Translation
                </TabsTrigger>
                <TabsTrigger value="risks" data-testid="tab-risks">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                  Risks ({analysis.riskFlags.length})
                </TabsTrigger>
                <TabsTrigger value="terms" data-testid="tab-terms">
                  <Shield className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                  Terms
                </TabsTrigger>
                <TabsTrigger value="chat" data-testid="tab-chat">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                  Ask AI
                </TabsTrigger>
                <TabsTrigger value="sign" data-testid="tab-sign">
                  <PenTool className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                  Sign
                </TabsTrigger>
              </TabsList>

              <TabsContent value="translation" className="space-y-3">
                {analysis.plainEnglish.map((section, i) => (
                  <SectionCard key={i} section={section} index={i} />
                ))}
              </TabsContent>

              <TabsContent value="risks" className="space-y-3">
                {analysis.riskFlags.length === 0 ? (
                  <Card className="p-8 text-center space-y-3">
                    <CheckCircle className="w-10 h-10 text-green-500 dark:text-green-400 mx-auto" />
                    <h4 className="font-semibold">No Risk Flags Found</h4>
                    <p className="text-sm text-muted-foreground">
                      This document appears to have no significant risk factors. However, always consult a legal professional for important agreements.
                    </p>
                  </Card>
                ) : (
                  analysis.riskFlags.map((flag, i) => (
                    <RiskFlagCard key={i} flag={flag} index={i} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="terms" className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {analysis.keyTerms.map((term, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Card className="p-4 space-y-2 h-full" data-testid={`card-term-${i}`}>
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          {term.term}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{term.definition}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <Card className="p-5">
                  <ChatPanel documentId={doc.id} />
                </Card>
              </TabsContent>

              <TabsContent value="sign">
                <Card className="p-5">
                  <SignaturePanel documentId={doc.id} documentTitle={doc.title} />
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This analysis is generated by AI and is for informational purposes only.
                  It does not constitute legal advice. Always consult with a qualified legal
                  professional before making decisions based on legal documents.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
