import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Loader2,
  AlertTriangle,
  FileText,
  User,
  Mail,
} from "lucide-react";
import SignaturePad from "@/components/signature-pad";
import { apiRequest } from "@/lib/queryClient";
import type { SignatureRequest } from "@shared/schema";

interface SignRequestData {
  request: SignatureRequest;
  documentTitle: string;
  documentSummary: string;
  senderName: string;
}

const fadeSlide = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 },
};

export default function SignRequestPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [actionCompleted, setActionCompleted] = useState<"signed" | "declined" | null>(null);

  const { data, isLoading, error } = useQuery<SignRequestData>({
    queryKey: ["/api/sign", token],
    enabled: !!token,
  });

  const signMutation = useMutation({
    mutationFn: async (payload: { signatureData: string; signerName: string; type: string }) => {
      const res = await apiRequest("POST", `/api/sign/${token}`, payload);
      return res.json();
    },
    onSuccess: () => {
      setActionCompleted("signed");
      setShowSignaturePad(false);
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/sign/${token}/decline`);
      return res.json();
    },
    onSuccess: () => {
      setActionCompleted("declined");
      setShowDeclineDialog(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="icon-loading" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div {...fadeSlide}>
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-md bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl font-semibold" data-testid="text-error-title">
              Invalid or Expired Link
            </h2>
            <p className="text-muted-foreground text-sm" data-testid="text-error-message">
              This signature request link is invalid, has expired, or does not exist.
              Please contact the sender for a new link.
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  const { request, documentTitle, documentSummary, senderName } = data;

  const isAlreadySigned = request.status === "signed" || actionCompleted === "signed";
  const isDeclined = request.status === "declined" || actionCompleted === "declined";

  if (isAlreadySigned) {
    return (
      <PageWrapper>
        <AnimatePresence mode="wait">
          <motion.div key="signed" {...fadeSlide}>
            <Card className="max-w-lg w-full p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-md bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-xl font-semibold" data-testid="text-signed-title">
                Document Signed
              </h2>
              <p className="text-muted-foreground text-sm" data-testid="text-signed-message">
                This document has been successfully signed.
              </p>
              {request.signedAt && (
                <p className="text-xs text-muted-foreground" data-testid="text-signed-date">
                  Signed on {new Date(request.signedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              <div className="pt-2">
                <Badge variant="default" className="bg-green-600 text-white" data-testid="badge-signed">
                  <CheckCircle2 className="w-3 h-3" />
                  Signed
                </Badge>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </PageWrapper>
    );
  }

  if (isDeclined) {
    return (
      <PageWrapper>
        <AnimatePresence mode="wait">
          <motion.div key="declined" {...fadeSlide}>
            <Card className="max-w-lg w-full p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-md bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-destructive" />
                </div>
              </div>
              <h2 className="text-xl font-semibold" data-testid="text-declined-title">
                Signature Declined
              </h2>
              <p className="text-muted-foreground text-sm" data-testid="text-declined-message">
                This signature request has been declined. The sender has been notified.
              </p>
              <div className="pt-2">
                <Badge variant="destructive" data-testid="badge-declined">
                  <XCircle className="w-3 h-3" />
                  Declined
                </Badge>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <AnimatePresence mode="wait">
        <motion.div key="pending" {...fadeSlide} className="max-w-2xl w-full space-y-5">
          <Card className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1 min-w-0">
                <h2 className="font-semibold text-lg truncate" data-testid="text-document-title">
                  {documentTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Sent by {senderName}
                  </span>
                </div>
              </div>
            </div>

            {request.message && (
              <div className="bg-muted/40 dark:bg-muted/20 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground" data-testid="text-request-message">
                    {request.message}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Requested for:</span>
              <span className="font-medium text-foreground" data-testid="text-recipient-name">
                {request.recipientName}
              </span>
              <span className="text-muted-foreground" data-testid="text-recipient-email">
                ({request.recipientEmail})
              </span>
            </div>
          </Card>

          {documentSummary && (
            <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
              <Card className="p-0">
                <CollapsibleTrigger asChild>
                  <button
                    className="w-full flex items-center justify-between gap-2 p-4 text-left hover-elevate rounded-md"
                    data-testid="button-toggle-summary"
                  >
                    <span className="font-medium text-sm">Document Summary</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${summaryOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-document-summary">
                      {documentSummary}
                    </p>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {showSignaturePad ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Sign Document</h3>
                <SignaturePad
                  onSave={(signatureData, type, signerName) => {
                    signMutation.mutate({ signatureData, signerName, type });
                  }}
                  onCancel={() => setShowSignaturePad(false)}
                />
                {signMutation.isError && (
                  <p className="text-sm text-destructive mt-2" data-testid="text-sign-error">
                    {signMutation.error?.message || "Failed to sign document. Please try again."}
                  </p>
                )}
              </Card>
            </motion.div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => setShowSignaturePad(true)}
                disabled={signMutation.isPending}
                data-testid="button-sign-document"
              >
                {signMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                Sign Document
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 text-destructive border-destructive/30"
                onClick={() => setShowDeclineDialog(true)}
                disabled={declineMutation.isPending}
                data-testid="button-decline"
              >
                {declineMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Decline
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-decline-dialog-title">Decline Signature Request</DialogTitle>
            <DialogDescription data-testid="text-decline-dialog-description">
              Are you sure you want to decline this signature request? The sender will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
              data-testid="button-decline-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending}
              data-testid="button-decline-confirm"
            >
              {declineMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-[100]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight" data-testid="text-header-logo">
            SignSafe
          </span>
          <Badge variant="secondary" className="text-xs" data-testid="badge-signature-request">
            Signature Request
          </Badge>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
        {children}
      </main>
    </div>
  );
}
