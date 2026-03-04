import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PenTool,
  Type,
  Eraser,
  Download,
  CheckCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { type Signature } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Point {
  x: number;
  y: number;
}

export function SignaturePanel({ documentId, documentTitle }: { documentId: string; documentTitle: string }) {
  const [signerName, setSignerName] = useState("");
  const [typedSignature, setTypedSignature] = useState("");
  const [signMode, setSignMode] = useState<"draw" | "type">("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPointRef = useRef<Point | null>(null);
  const { toast } = useToast();

  const { data: existingSignatures = [] } = useQuery<Signature[]>({
    queryKey: ["/api/documents", documentId, "signatures"],
  });

  const signMutation = useMutation({
    mutationFn: async (data: { signerName: string; signatureData: string; signatureType: string; documentId: string }) => {
      const res = await apiRequest("POST", `/api/documents/${documentId}/signatures`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "signatures"] });
      setSignerName("");
      setTypedSignature("");
      clearCanvas();
      toast({ title: "Document signed", description: "Your signature has been recorded successfully." });
    },
    onError: () => {
      toast({ title: "Signing failed", description: "Failed to save your signature. Please try again.", variant: "destructive" });
    },
  });

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;

    const isDark = document.documentElement.classList.contains("dark");
    ctx.strokeStyle = isDark ? "#e5e7eb" : "#1a1a1a";
  }, []);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas]);

  const getPosition = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    const point = getPosition(e);
    lastPointRef.current = point;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !lastPointRef.current) return;

    const point = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = () => {
    if (!signerName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }

    let signatureData = "";
    if (signMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        toast({ title: "Signature required", description: "Please draw your signature on the pad.", variant: "destructive" });
        return;
      }
      signatureData = canvas.toDataURL("image/png");
    } else {
      if (!typedSignature.trim()) {
        toast({ title: "Signature required", description: "Please type your signature.", variant: "destructive" });
        return;
      }
      signatureData = typedSignature.trim();
    }

    signMutation.mutate({
      signerName: signerName.trim(),
      signatureData,
      signatureType: signMode,
      documentId,
    });
  };

  const downloadSignedSummary = (sig: Signature) => {
    const content = [
      "═══════════════════════════════════════════",
      "         SIGNED DOCUMENT CONFIRMATION",
      "═══════════════════════════════════════════",
      "",
      `Document: ${documentTitle}`,
      `Document ID: ${documentId}`,
      "",
      "───────────────────────────────────────────",
      "",
      `Signed by: ${sig.signerName}`,
      `Signature type: ${sig.signatureType === "draw" ? "Handwritten (digital)" : "Typed"}`,
      sig.signatureType === "type" ? `Typed signature: ${sig.signatureData}` : "",
      `Date signed: ${new Date(sig.signedAt).toLocaleString()}`,
      `Signature ID: ${sig.id}`,
      "",
      "───────────────────────────────────────────",
      "",
      "This document was electronically signed using PlainLegal.",
      "This confirmation serves as a record of the signing event.",
      "",
      "═══════════════════════════════════════════",
    ].filter(Boolean).join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signed-${documentTitle.replace(/[^a-zA-Z0-9]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {existingSignatures.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm font-semibold">Document Signed</p>
          </div>
          {existingSignatures.map((sig, i) => (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20" data-testid={`card-signature-${i}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-sm font-medium">{sig.signerName}</p>
                    <p className="text-xs text-muted-foreground">
                      Signed on {new Date(sig.signedAt).toLocaleString()} · {sig.signatureType === "draw" ? "Handwritten" : "Typed"}
                    </p>
                    {sig.signatureType === "draw" && sig.signatureData.startsWith("data:image") && (
                      <div className="mt-2 bg-white dark:bg-gray-900 rounded border p-2 inline-block">
                        <img src={sig.signatureData} alt="Signature" className="h-12 w-auto" data-testid={`img-signature-${i}`} />
                      </div>
                    )}
                    {sig.signatureType === "type" && (
                      <p className="text-lg italic font-serif mt-1" data-testid={`text-typed-signature-${i}`}>{sig.signatureData}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadSignedSummary(sig)}
                    data-testid={`button-download-signature-${i}`}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
          <Separator />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <PenTool className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{existingSignatures.length > 0 ? "Add Another Signature" : "Sign This Document"}</p>
            <p className="text-xs text-muted-foreground">Draw or type your signature below</p>
          </div>
        </div>

        <Input
          data-testid="input-signer-name"
          placeholder="Your full legal name"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
        />

        <Tabs value={signMode} onValueChange={(v) => setSignMode(v as "draw" | "type")} className="space-y-3">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="draw" data-testid="tab-draw-signature">
              <PenTool className="w-3.5 h-3.5 mr-1.5" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="type" data-testid="tab-type-signature">
              <Type className="w-3.5 h-3.5 mr-1.5" />
              Type
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-2">
            <div className="relative border-2 border-dashed rounded-md bg-white dark:bg-gray-950 overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full cursor-crosshair touch-none"
                style={{ height: "160px" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                data-testid="canvas-signature"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-sm text-muted-foreground/50">Sign here</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearCanvas} data-testid="button-clear-signature">
                <Eraser className="w-3.5 h-3.5 mr-1.5" />
                Clear
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-2">
            <div className="border-2 border-dashed rounded-md p-6 bg-white dark:bg-gray-950 text-center min-h-[160px] flex items-center justify-center">
              {typedSignature ? (
                <p className="text-3xl italic font-serif" data-testid="text-typed-preview">{typedSignature}</p>
              ) : (
                <p className="text-sm text-muted-foreground/50">Your typed signature will appear here</p>
              )}
            </div>
            <Input
              data-testid="input-typed-signature"
              placeholder="Type your signature exactly as you want it to appear"
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            By signing, you acknowledge that you have reviewed this document and its AI analysis.
          </p>
          <Button
            onClick={handleSign}
            disabled={signMutation.isPending}
            size="lg"
            data-testid="button-sign-document"
          >
            {signMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4" />
                Sign Document
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
