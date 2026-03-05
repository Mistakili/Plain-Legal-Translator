import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PenTool,
  Type,
  Eraser,
  FileDown,
  Loader2,
  Plus,
  X,
  Calendar,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface Point {
  x: number;
  y: number;
}

interface Overlay {
  id: string;
  type: "signature" | "text" | "date";
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  fontSize?: number;
}

export function PDFSigner({
  documentId,
  documentTitle,
}: {
  documentId: string;
  documentTitle: string;
}) {
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [pageDimensions, setPageDimensions] = useState<
    Array<{ width: number; height: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [showSignatureCreator, setShowSignatureCreator] = useState(false);
  const [showTextCreator, setShowTextCreator] = useState(false);
  const [signMode, setSignMode] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [textValue, setTextValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPointRef = useRef<Point | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPdf();
  }, [documentId]);

  const loadPdf = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/documents/${documentId}/pdf`, {
        credentials: "include",
      });
      if (!response.ok) {
        setError("No PDF available for visual signing");
        setLoading(false);
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];
      const dims: Array<{ width: number; height: number }> = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 2;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        pages.push(canvas.toDataURL("image/png"));
        dims.push({
          width: viewport.width / scale,
          height: viewport.height / scale,
        });
      }

      setPdfPages(pages);
      setPageDimensions(dims);
      setLoading(false);
    } catch (err) {
      console.error("PDF load error:", err);
      setError("Failed to load PDF for signing");
      setLoading(false);
    }
  };

  const initSignatureCanvas = useCallback(() => {
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
    ctx.strokeStyle = "#1a1a1a";
  }, []);

  useEffect(() => {
    if (showSignatureCreator && signMode === "draw") {
      setTimeout(initSignatureCanvas, 100);
    }
  }, [showSignatureCreator, signMode, initSignatureCanvas]);

  const getCanvasPosition = (
    e: React.MouseEvent | React.TouchEvent
  ): Point => {
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
    lastPointRef.current = getCanvasPosition(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !lastPointRef.current) return;
    const point = getCanvasPosition(e);
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

  const addSignatureOverlay = () => {
    let value = "";
    if (signMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        toast({
          title: "Draw your signature",
          description: "Please draw on the pad first.",
          variant: "destructive",
        });
        return;
      }
      value = canvas.toDataURL("image/png");
    } else {
      if (!typedSignature.trim()) {
        toast({
          title: "Type your signature",
          description: "Please enter your signature text.",
          variant: "destructive",
        });
        return;
      }
      value = typedSignature.trim();
    }

    const overlay: Overlay = {
      id: `sig-${Date.now()}`,
      type: "signature",
      page: currentPage,
      x: 0.1,
      y: 0.7,
      width: 0.25,
      height: 0.06,
      value,
    };
    setOverlays((prev) => [...prev, overlay]);
    setActiveOverlay(overlay.id);
    setShowSignatureCreator(false);
    setTypedSignature("");
    clearCanvas();
    toast({ title: "Signature added", description: "Drag it to the right position on the document." });
  };

  const addTextOverlay = () => {
    if (!textValue.trim()) {
      toast({
        title: "Enter text",
        description: "Please enter the text to add.",
        variant: "destructive",
      });
      return;
    }
    const overlay: Overlay = {
      id: `text-${Date.now()}`,
      type: "text",
      page: currentPage,
      x: 0.1,
      y: 0.5,
      width: 0.3,
      height: 0.03,
      value: textValue.trim(),
      fontSize: 12,
    };
    setOverlays((prev) => [...prev, overlay]);
    setActiveOverlay(overlay.id);
    setShowTextCreator(false);
    setTextValue("");
    toast({ title: "Text added", description: "Drag it to position." });
  };

  const addDateOverlay = () => {
    const today = new Date().toLocaleDateString();
    const overlay: Overlay = {
      id: `date-${Date.now()}`,
      type: "date",
      page: currentPage,
      x: 0.1,
      y: 0.5,
      width: 0.15,
      height: 0.025,
      value: today,
      fontSize: 11,
    };
    setOverlays((prev) => [...prev, overlay]);
    setActiveOverlay(overlay.id);
    toast({ title: "Date added", description: "Drag it to position." });
  };

  const removeOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (activeOverlay === id) setActiveOverlay(null);
  };

  const handleOverlayMouseDown = (
    e: React.MouseEvent | React.TouchEvent,
    overlayId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveOverlay(overlayId);
    setDragging(overlayId);

    const container = pageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const overlay = overlays.find((o) => o.id === overlayId);
    if (!overlay) return;

    const containerW = rect.width;
    const containerH = rect.height;
    const overlayScreenX = overlay.x * containerW;
    const overlayScreenY = overlay.y * containerH;

    setDragOffset({
      x: clientX - rect.left - overlayScreenX,
      y: clientY - rect.top - overlayScreenY,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const container = pageContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const newX = (clientX - rect.left - dragOffset.x) / rect.width;
      const newY = (clientY - rect.top - dragOffset.y) / rect.height;

      setOverlays((prev) =>
        prev.map((o) =>
          o.id === dragging
            ? {
                ...o,
                x: Math.max(0, Math.min(newX, 1 - o.width)),
                y: Math.max(0, Math.min(newY, 1 - o.height)),
              }
            : o
        )
      );
    };

    const handleUp = () => {
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, dragOffset]);

  const generateSignedPDF = async () => {
    if (overlays.length === 0) {
      toast({
        title: "Nothing to sign",
        description:
          "Add at least one signature, text, or date before downloading.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/documents/${documentId}/generate-signed-pdf`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overlays }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeTitle = documentTitle
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-");
      a.download = `${safeTitle}-signed.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "PDF downloaded",
        description: "Your signed document has been saved.",
      });
    } catch {
      toast({
        title: "Download failed",
        description: "Could not generate the signed PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentPageOverlays = overlays.filter(
    (o) => o.page === currentPage
  );

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-3"
        data-testid="pdf-signer-loading"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading PDF pages...</p>
      </div>
    );
  }

  if (error || pdfPages.length === 0) {
    return (
      <div className="text-center py-12 space-y-3" data-testid="pdf-signer-error">
        <p className="text-sm text-muted-foreground">
          {error || "This document doesn't have an original PDF for visual signing."}
        </p>
        <p className="text-xs text-muted-foreground">
          Visual signing is available for uploaded PDF files. For pasted text documents, use the basic signature feature below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="pdf-signer">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSignatureCreator(true)}
            data-testid="button-add-signature"
          >
            <PenTool className="w-3.5 h-3.5 mr-1.5" />
            Add Signature
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTextCreator(true)}
            data-testid="button-add-text"
          >
            <Type className="w-3.5 h-3.5 mr-1.5" />
            Add Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addDateOverlay}
            data-testid="button-add-date"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Add Date
          </Button>
        </div>
        <Button
          onClick={generateSignedPDF}
          disabled={isGenerating || overlays.length === 0}
          data-testid="button-download-signed-pdf"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              Download Signed PDF
            </>
          )}
        </Button>
      </div>

      {overlays.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {overlays.map((o) => (
            <div
              key={o.id}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border cursor-pointer transition-colors ${
                activeOverlay === o.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/50"
              }`}
              onClick={() => {
                setActiveOverlay(o.id);
                setCurrentPage(o.page);
              }}
              data-testid={`overlay-tag-${o.id}`}
            >
              {o.type === "signature" && <PenTool className="w-3 h-3" />}
              {o.type === "text" && <Type className="w-3 h-3" />}
              {o.type === "date" && <Calendar className="w-3 h-3" />}
              <span className="max-w-[100px] truncate">
                {o.type === "signature"
                  ? o.value.startsWith("data:")
                    ? "Drawn"
                    : o.value
                  : o.value}
              </span>
              <span className="text-muted-foreground">p{o.page + 1}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOverlay(o.id);
                }}
                className="ml-0.5 hover:text-destructive"
                data-testid={`button-remove-overlay-${o.id}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showSignatureCreator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Create Signature</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSignatureCreator(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Tabs
                value={signMode}
                onValueChange={(v) => setSignMode(v as "draw" | "type")}
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="draw" data-testid="tab-draw-sig">
                    <PenTool className="w-3.5 h-3.5 mr-1.5" />
                    Draw
                  </TabsTrigger>
                  <TabsTrigger value="type" data-testid="tab-type-sig">
                    <Type className="w-3.5 h-3.5 mr-1.5" />
                    Type
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="draw" className="space-y-2 mt-3">
                  <div className="relative border-2 border-dashed rounded-md bg-white overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full cursor-crosshair touch-none"
                      style={{ height: "120px" }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      data-testid="canvas-signature-draw"
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-sm text-muted-foreground/50">
                          Draw your signature
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCanvas}
                    >
                      <Eraser className="w-3.5 h-3.5 mr-1.5" />
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={addSignatureOverlay}
                      disabled={!hasDrawn}
                      data-testid="button-confirm-signature"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add to Document
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="type" className="space-y-2 mt-3">
                  <Input
                    placeholder="Type your signature"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    data-testid="input-type-signature"
                  />
                  {typedSignature && (
                    <div className="border-2 border-dashed rounded-md p-4 bg-white text-center">
                      <p className="text-2xl italic font-serif">
                        {typedSignature}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={addSignatureOverlay}
                      disabled={!typedSignature.trim()}
                      data-testid="button-confirm-typed-signature"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add to Document
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        )}

        {showTextCreator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Add Text</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTextCreator(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Input
                placeholder="Enter text (name, title, etc.)"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                data-testid="input-add-text"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={addTextOverlay}
                  disabled={!textValue.trim()}
                  data-testid="button-confirm-text"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add to Document
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2 bg-muted/30 rounded-lg px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-2" data-testid="text-page-number">
            Page {currentPage + 1} of {pdfPages.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(pdfPages.length - 1, currentPage + 1))
            }
            disabled={currentPage === pdfPages.length - 1}
            data-testid="button-next-page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            disabled={zoom <= 0.5}
            data-testid="button-zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            disabled={zoom >= 2}
            data-testid="button-zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-auto border rounded-lg bg-gray-100 dark:bg-gray-900" style={{ maxHeight: "70vh" }}>
        <div
          className="relative mx-auto"
          ref={pageContainerRef}
          style={{
            width: pageDimensions[currentPage]
              ? `${pageDimensions[currentPage].width * zoom}px`
              : "100%",
            height: pageDimensions[currentPage]
              ? `${pageDimensions[currentPage].height * zoom}px`
              : "auto",
          }}
          data-testid="pdf-page-container"
        >
          <img
            src={pdfPages[currentPage]}
            alt={`Page ${currentPage + 1}`}
            className="w-full h-full select-none"
            draggable={false}
            data-testid={`img-pdf-page-${currentPage}`}
          />

          {currentPageOverlays.map((overlay) => {
            const containerW = pageDimensions[currentPage]?.width * zoom || 600;
            const containerH = pageDimensions[currentPage]?.height * zoom || 800;

            return (
              <div
                key={overlay.id}
                className={`absolute cursor-move select-none ${
                  activeOverlay === overlay.id
                    ? "ring-2 ring-primary ring-offset-1"
                    : "ring-1 ring-blue-400/50"
                }`}
                style={{
                  left: `${overlay.x * 100}%`,
                  top: `${overlay.y * 100}%`,
                  width: `${overlay.width * 100}%`,
                  height: `${overlay.height * 100}%`,
                  touchAction: "none",
                }}
                onMouseDown={(e) => handleOverlayMouseDown(e, overlay.id)}
                onTouchStart={(e) => handleOverlayMouseDown(e, overlay.id)}
                data-testid={`overlay-${overlay.id}`}
              >
                <div className="w-full h-full flex items-center relative bg-white/30">
                  {overlay.type === "signature" &&
                    overlay.value.startsWith("data:image") && (
                      <img
                        src={overlay.value}
                        alt="Signature"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    )}
                  {overlay.type === "signature" &&
                    !overlay.value.startsWith("data:image") && (
                      <span
                        className="text-lg italic font-serif pointer-events-none px-1 text-black"
                        style={{
                          fontSize: `${Math.min((overlay.height * containerH) * 0.6, 28)}px`,
                        }}
                      >
                        {overlay.value}
                      </span>
                    )}
                  {(overlay.type === "text" || overlay.type === "date") && (
                    <span
                      className="pointer-events-none px-1 text-black"
                      style={{
                        fontSize: `${(overlay.fontSize || 12) * zoom}px`,
                      }}
                    >
                      {overlay.value}
                    </span>
                  )}
                  {activeOverlay === overlay.id && (
                    <button
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs hover:bg-destructive/80 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOverlay(overlay.id);
                      }}
                      data-testid={`button-delete-overlay-${overlay.id}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {activeOverlay === overlay.id && (
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center z-10">
                      <Move className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Click "Add Signature", "Add Text", or "Add Date" to place elements on the document. Drag to position them exactly where needed.
      </p>
    </div>
  );
}
