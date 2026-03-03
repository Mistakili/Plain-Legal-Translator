import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Shield,
  Zap,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Eye,
  Scale,
} from "lucide-react";
import { type Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    low: { variant: "secondary", label: "Low Risk" },
    medium: { variant: "outline", label: "Medium Risk" },
    high: { variant: "destructive", label: "High Risk" },
    critical: { variant: "destructive", label: "Critical Risk" },
  };
  const c = config[level] || config.low;
  return <Badge variant={c.variant} data-testid={`badge-risk-${level}`}>{c.label}</Badge>;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "analyzing") return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  if (status === "complete") return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
  if (status === "error") return <XCircle className="w-4 h-4 text-destructive" />;
  return <Clock className="w-4 h-4 text-muted-foreground" />;
}

export default function Home() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: documents = [], isLoading: loadingDocs } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    refetchInterval: 3000,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { title: string; originalText: string }) => {
      const res = await apiRequest("POST", "/api/documents", data);
      return res.json();
    },
    onSuccess: (doc: Document) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setText("");
      setTitle("");
      toast({ title: "Document submitted", description: "Analysis is in progress. This may take a minute." });
      navigate(`/analysis/${doc.id}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit document for analysis.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({ title: "Missing text", description: "Please paste your legal document text.", variant: "destructive" });
      return;
    }
    const docTitle = title.trim() || `Document ${new Date().toLocaleDateString()}`;
    analyzeMutation.mutate({ title: docTitle, originalText: text.trim() });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">PlainLegal</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI Legal Document Translator</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Powered by DigitalOcean Gradient AI
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 py-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Legal Analysis
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-hero-heading">
            Understand Any Legal Document
            <br />
            <span className="text-muted-foreground">in Plain English</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Paste your contract, lease, or legal agreement below. Our AI breaks it down into
            simple language and flags potential risks so you know exactly what you're signing.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Upload Your Document</span>
            </div>
            <Input
              data-testid="input-document-title"
              placeholder="Document title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              data-testid="input-document-text"
              placeholder="Paste your legal document text here... (contracts, leases, NDAs, terms of service, etc.)"
              className="min-h-[200px] resize-y text-sm leading-relaxed"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-xs text-muted-foreground">
                {text.length > 0 ? `${text.split(/\s+/).filter(Boolean).length} words` : "No text entered"}
              </p>
              <Button
                data-testid="button-analyze"
                onClick={handleSubmit}
                disabled={analyzeMutation.isPending || !text.trim()}
                size="lg"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Analyze Document
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.section>

        <section className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              title: "Plain English",
              description: "Complex legal jargon translated into simple, everyday language anyone can understand.",
            },
            {
              icon: AlertTriangle,
              title: "Risk Flags",
              description: "Potential risks and unfavorable terms highlighted with severity levels and suggestions.",
            },
            {
              icon: Shield,
              title: "Key Terms",
              description: "Important legal terms defined clearly so you know exactly what each clause means.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            >
              <Card className="p-5 space-y-3 h-full hover-elevate">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm" data-testid={`text-feature-${feature.title.toLowerCase().replace(/\s/g, "-")}`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </section>

        {(loadingDocs || documents.length > 0) && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold" data-testid="text-history-heading">Recent Analyses</h3>
              <Badge variant="secondary">{documents.length} document{documents.length !== 1 ? "s" : ""}</Badge>
            </div>

            {loadingDocs ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {documents.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      layout
                    >
                      <Card
                        className="p-4 hover-elevate cursor-pointer"
                        data-testid={`card-document-${doc.id}`}
                        onClick={() => {
                          if (doc.status === "complete") navigate(`/analysis/${doc.id}`);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm truncate" data-testid={`text-doc-title-${doc.id}`}>
                                {doc.title}
                              </p>
                              <StatusIcon status={doc.status} />
                              {doc.riskLevel && <RiskBadge level={doc.riskLevel} />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {doc.status === "analyzing"
                                ? "Analysis in progress..."
                                : doc.status === "error"
                                  ? "Analysis failed"
                                  : new Date(doc.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {doc.status === "complete" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                data-testid={`button-view-${doc.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/analysis/${doc.id}`);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  data-testid={`button-delete-${doc.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    data-testid="button-confirm-delete"
                                    onClick={() => deleteMutation.mutate(doc.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.section>
        )}
      </main>

      <footer className="border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" />
            <span>PlainLegal — AI Legal Document Translator</span>
          </div>
          <p>Built with DigitalOcean Gradient AI</p>
        </div>
      </footer>
    </div>
  );
}
