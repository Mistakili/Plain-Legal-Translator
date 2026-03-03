import { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eraser, Pen, Type, Upload } from "lucide-react";

interface SignaturePadProps {
  onSave: (signatureData: string, type: "draw" | "type" | "upload", signerName: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const [mode, setMode] = useState<"draw" | "type" | "upload">("draw");
  const [signerName, setSignerName] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedSignature, setTypedSignature] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const getCanvasCoords = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getCanvasCoords(e);
  }, [getCanvasCoords]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current || !lastPosRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const pos = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPosRef.current = pos;
    setHasDrawn(true);
  }, [getCanvasCoords]);

  const stopDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = 600;
        const maxH = 200;
        let w = img.width;
        let h = img.height;
        if (w > maxW) { h = (h * maxW) / w; w = maxW; }
        if (h > maxH) { w = (w * maxH) / h; h = maxH; }

        const offscreen = document.createElement("canvas");
        offscreen.width = w;
        offscreen.height = h;
        const octx = offscreen.getContext("2d");
        if (octx) {
          octx.drawImage(img, 0, 0, w, h);
          setUploadedImage(offscreen.toDataURL("image/png"));
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const renderTypedToCanvas = (): string => {
    const offscreen = document.createElement("canvas");
    offscreen.width = 600;
    offscreen.height = 150;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 150);
    ctx.fillStyle = "#000000";
    ctx.font = "32px 'Dancing Script', 'Segoe Script', 'Comic Sans MS', cursive";
    ctx.textBaseline = "middle";
    ctx.fillText(typedSignature, 20, 75);
    return offscreen.toDataURL("image/png");
  };

  const hasSignatureData =
    (mode === "draw" && hasDrawn) ||
    (mode === "type" && typedSignature.trim().length > 0) ||
    (mode === "upload" && uploadedImage !== null);

  const canSave = hasSignatureData && signerName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    let data = "";
    if (mode === "draw") {
      data = canvasRef.current?.toDataURL("image/png") || "";
    } else if (mode === "type") {
      data = renderTypedToCanvas();
    } else if (mode === "upload") {
      data = uploadedImage || "";
    }
    onSave(data, mode, signerName.trim());
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signer-name">Full Legal Name</Label>
        <Input
          id="signer-name"
          data-testid="input-signer-name"
          placeholder="Enter your full name"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
        />
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "draw" | "type" | "upload")}>
        <TabsList className="w-full">
          <TabsTrigger value="draw" data-testid="tab-draw" className="flex-1 gap-1">
            <Pen className="w-4 h-4" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="type" data-testid="tab-type" className="flex-1 gap-1">
            <Type className="w-4 h-4" />
            Type
          </TabsTrigger>
          <TabsTrigger value="upload" data-testid="tab-upload" className="flex-1 gap-1">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-2">
          <div className="border rounded-md overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              data-testid="canvas-signature"
              width={600}
              height={150}
              className="w-full cursor-crosshair touch-none"
              style={{ minWidth: 300, height: 150 }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-clear-signature"
              onClick={clearCanvas}
            >
              <Eraser className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="type" className="space-y-2">
          <Input
            data-testid="input-type-signature"
            placeholder="Type your signature"
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
          />
          {typedSignature && (
            <div
              className="border rounded-md bg-white p-4 flex items-center justify-center"
              style={{ minHeight: 100 }}
              data-testid="text-typed-signature-preview"
            >
              <span
                style={{
                  fontFamily: "'Dancing Script', 'Segoe Script', 'Comic Sans MS', cursive",
                  fontSize: 32,
                  color: "#000",
                }}
              >
                {typedSignature}
              </span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-2">
          <Input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            data-testid="input-upload-signature"
            onChange={handleUpload}
          />
          {uploadedImage && (
            <div
              className="border rounded-md bg-white p-4 flex items-center justify-center"
              data-testid="img-uploaded-signature-preview"
            >
              <img
                src={uploadedImage}
                alt="Uploaded signature"
                className="max-h-[150px] object-contain"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          data-testid="button-cancel-signature"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          data-testid="button-save-signature"
          disabled={!canSave}
          onClick={handleSave}
        >
          Save Signature
        </Button>
      </div>
    </div>
  );
}
