import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PenTool, Type, Loader2, Eraser, CheckCircle2, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SignaturePadProps {
  onSave: (signatureData: string, type: string, signerName: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [typedSignature, setTypedSignature] = useState("");
  const [activeTab, setActiveTab] = useState("draw");
  const [isSaving, setIsSaving] = useState(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (!signerName.trim()) return;
    setIsSaving(true);

    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL("image/png");
      onSave(dataUrl, "draw", signerName.trim());
    } else {
      if (!typedSignature.trim()) return;
      onSave(typedSignature.trim(), "type", signerName.trim());
    }
  };

  const canSave =
    signerName.trim().length > 0 &&
    ((activeTab === "draw" && hasDrawn) ||
      (activeTab === "type" && typedSignature.trim().length > 0));

  return (
    <div className="space-y-4" data-testid="signature-pad">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Your Full Name</label>
        <Input
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="Enter your full name"
          data-testid="input-signer-name"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="draw" className="flex-1 gap-1.5" data-testid="tab-draw">
            <PenTool className="w-3.5 h-3.5" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="flex-1 gap-1.5" data-testid="tab-type">
            <Type className="w-3.5 h-3.5" />
            Type
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-2 mt-3">
          <div className="relative border rounded-lg bg-white dark:bg-gray-950 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-40 cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
              data-testid="canvas-signature"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm text-gray-400">Draw your signature here</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCanvas}
            className="text-xs gap-1"
            data-testid="button-clear-signature"
          >
            <Eraser className="w-3.5 h-3.5" />
            Clear
          </Button>
        </TabsContent>

        <TabsContent value="type" className="mt-3">
          <div className="space-y-2">
            <Input
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              placeholder="Type your signature"
              className="text-center text-xl italic font-serif"
              data-testid="input-typed-signature"
            />
            {typedSignature && (
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-950 text-center">
                <span className="text-2xl italic font-serif" data-testid="text-signature-preview">
                  {typedSignature}
                </span>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          data-testid="button-cancel-signature"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="flex-1"
          data-testid="button-save-signature"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Signature"}
        </Button>
      </div>
    </div>
  );
}

interface SignaturePanelProps {
  documentId: string;
  documentTitle: string;
  documentContent?: string;
}

export function SignaturePanel({ documentId, documentTitle }: SignaturePanelProps) {
  const [showPad, setShowPad] = useState(false);
  const [signed, setSigned] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: signatures } = useQuery<any[]>({
    queryKey: ["/api/documents", documentId, "signatures"],
  });

  const signMutation = useMutation({
    mutationFn: async (payload: { signatureData: string; signerName: string; signatureType: string; documentId: string }) => {
      const res = await apiRequest("POST", `/api/documents/${documentId}/sign`, payload);
      return res.json();
    },
    onSuccess: () => {
      setSigned(true);
      setShowPad(false);
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "signatures"] });
      toast({ title: "Document signed", description: `Successfully signed "${documentTitle}"` });
    },
    onError: (err: Error) => {
      toast({ title: "Signing failed", description: err.message, variant: "destructive" });
    },
  });

  if (signed || (signatures && signatures.length > 0)) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20" data-testid="signature-complete">
        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Document Signed</p>
          <p className="text-xs text-green-600/80 dark:text-green-400/80">
            {signatures?.[0]?.signerName ? `Signed by ${signatures[0].signerName}` : "Signature recorded"}
          </p>
        </div>
        <Badge variant="outline" className="border-green-500/30 text-green-600 dark:text-green-400 text-xs">
          <CheckCircle2 className="w-3 h-3" />
          Signed
        </Badge>
      </div>
    );
  }

  if (showPad) {
    return (
      <div className="space-y-3" data-testid="signature-panel-pad">
        <SignaturePad
          onSave={(signatureData, type, signerName) => {
            signMutation.mutate({
              signatureData,
              signerName,
              signatureType: type,
              documentId,
            });
          }}
          onCancel={() => setShowPad(false)}
        />
        {signMutation.isError && (
          <p className="text-sm text-destructive" data-testid="text-signature-error">
            {signMutation.error?.message || "Failed to sign. Please try again."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="signature-panel">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4" />
        <span>E-Signature</span>
      </div>
      <Button
        onClick={() => setShowPad(true)}
        className="w-full gap-2"
        data-testid="button-open-signature"
      >
        <PenTool className="w-4 h-4" />
        Sign This Document
      </Button>
    </div>
  );
}
