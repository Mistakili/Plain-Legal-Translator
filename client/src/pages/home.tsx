import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sun,
  Moon,
  ArrowRight,
  MessageSquare,
  Sparkles,
  BookOpen,
  FileCheck,
  FileUp,
  X,
  Camera,
  ScanLine,
} from "lucide-react";
import { SiDigitalocean } from "react-icons/si";
import { type Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import { sampleDocuments } from "@/lib/sample-documents";
import { useAuth } from "@/lib/auth";

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
  const [activeTab, setActiveTab] = useState("upload");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [scanImages, setScanImages] = useState<File[]>([]);
  const [scanPreviews, setScanPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const analysesRemaining = user ? (user.isPremium ? Infinity : Math.max(0, 3 - user.analysesUsedThisMonth)) : null;

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

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      return res.json();
    },
    onSuccess: (data: { documents: Document[]; errors: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setSelectedFiles([]);
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      const count = data.documents.length;
      if (data.errors.length > 0) {
        toast({
          title: `${count} file${count !== 1 ? "s" : ""} uploaded`,
          description: `${data.errors.length} file${data.errors.length !== 1 ? "s" : ""} failed: ${data.errors.join(", ")}`,
        });
      } else {
        toast({
          title: `${count} document${count !== 1 ? "s" : ""} uploaded`,
          description: "Analysis is in progress. This may take a minute.",
        });
      }
      if (data.documents.length === 1) {
        navigate(`/analysis/${data.documents[0].id}`);
      }
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
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

  const scanMutation = useMutation({
    mutationFn: async (images: File[]) => {
      const formData = new FormData();
      images.forEach((f) => formData.append("images", f));
      const res = await fetch("/api/documents/scan", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Scan failed");
      }
      return res.json();
    },
    onSuccess: (data: { documents: Document[]; errors: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setScanImages([]);
      setScanPreviews([]);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
      const count = data.documents.length;
      if (data.errors.length > 0) {
        toast({
          title: `${count} image${count !== 1 ? "s" : ""} processed`,
          description: `${data.errors.length} image${data.errors.length !== 1 ? "s" : ""} failed: ${data.errors.join(", ")}`,
        });
      } else {
        toast({
          title: "Document scanned",
          description: "Text extracted and analysis is in progress.",
        });
      }
      if (data.documents.length === 1) {
        navigate(`/analysis/${data.documents[0].id}`);
      }
    },
    onError: (err: Error) => {
      toast({ title: "Scan failed", description: err.message, variant: "destructive" });
    },
  });

  const addScanImages = useCallback((files: FileList | File[]) => {
    const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"];
    const validFiles: File[] = [];
    let skipped = 0;

    Array.from(files).forEach((file) => {
      if (!imageTypes.includes(file.type)) {
        skipped++;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        skipped++;
        return;
      }
      validFiles.push(file);
    });

    if (skipped > 0) {
      toast({
        title: `${skipped} file${skipped !== 1 ? "s" : ""} skipped`,
        description: "Only image files (JPEG, PNG, WebP, BMP, TIFF) under 10MB are accepted.",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      const startIndex = scanImages.length;
      const filesToAdd = validFiles.slice(0, 5 - startIndex);
      setScanImages((prev) => [...prev, ...filesToAdd].slice(0, 5));
      filesToAdd.forEach((file, i) => {
        const idx = startIndex + i;
        const reader = new FileReader();
        reader.onload = (e) => {
          setScanPreviews((prev) => {
            const updated = [...prev];
            updated[idx] = e.target?.result as string;
            return updated;
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }, [toast]);

  const removeScanImage = (index: number) => {
    setScanImages((prev) => prev.filter((_, i) => i !== index));
    setScanPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScanUpload = () => {
    if (scanImages.length === 0) {
      toast({ title: "No images", description: "Please capture or select an image first.", variant: "destructive" });
      return;
    }
    scanMutation.mutate(scanImages);
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({ title: "Missing text", description: "Please paste your legal document text.", variant: "destructive" });
      return;
    }
    const docTitle = title.trim() || `Document ${new Date().toLocaleDateString()}`;
    analyzeMutation.mutate({ title: docTitle, originalText: text.trim() });
  };

  const handleFileUpload = () => {
    if (selectedFiles.length === 0) {
      toast({ title: "No files selected", description: "Please select files to upload.", variant: "destructive" });
      return;
    }
    uploadMutation.mutate(selectedFiles);
  };

  const validateAndAddFiles = useCallback((newFiles: FileList | File[]) => {
    const allowed = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const validFiles: File[] = [];
    let skipped = 0;

    Array.from(newFiles).forEach((file) => {
      if (!allowed.includes(file.type)) {
        skipped++;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        skipped++;
        return;
      }
      validFiles.push(file);
    });

    if (skipped > 0) {
      toast({
        title: `${skipped} file${skipped !== 1 ? "s" : ""} skipped`,
        description: "Only PDF, TXT, DOC, and DOCX files under 10MB are accepted.",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => {
        const combined = [...prev, ...validFiles];
        return combined.slice(0, 10);
      });
    }
  }, [toast]);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, [validateAndAddFiles]);

  const loadSample = (sample: typeof sampleDocuments[0]) => {
    setTitle(sample.title);
    setText(sample.text);
    setActiveTab("paste");
    toast({ title: "Sample loaded", description: `"${sample.label}" loaded. Click Analyze to process it.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">PlainLegal</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI Legal Document Translator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && analysesRemaining !== null && !user.isPremium && (
              <Badge variant="outline" className="text-xs hidden sm:inline-flex gap-1" data-testid="badge-analyses-remaining">
                <Zap className="w-3 h-3" />
                {analysesRemaining}/3 analyses left
              </Badge>
            )}
            {user && (
              <span className="text-xs text-muted-foreground hidden md:inline" data-testid="text-user-display">
                {user.displayName || user.email}
              </span>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-xs"
                data-testid="button-logout"
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-5 pt-6 pb-2"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Legal Analysis
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight" data-testid="text-hero-heading">
            Understand Any Contract
            <br />
            <span className="text-muted-foreground">Before You Sign</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Upload any legal document, get a plain English translation with risk flags — then ask follow-up questions about any clause, like having a lawyer on call.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-5 pt-5 pb-0">
                <TabsList className="w-full grid grid-cols-4" data-testid="tabs-input-mode">
                  <TabsTrigger value="upload" data-testid="tab-upload">
                    <FileUp className="w-3.5 h-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Upload File</span>
                    <span className="sm:hidden">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="scan" data-testid="tab-scan">
                    <ScanLine className="w-3.5 h-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Scan Doc</span>
                    <span className="sm:hidden">Scan</span>
                  </TabsTrigger>
                  <TabsTrigger value="paste" data-testid="tab-paste">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Paste Text</span>
                    <span className="sm:hidden">Paste</span>
                  </TabsTrigger>
                  <TabsTrigger value="samples" data-testid="tab-samples">
                    <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Try a Sample</span>
                    <span className="sm:hidden">Sample</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="upload" className="p-5 pt-4 space-y-4">
                <div
                  className={`relative border-2 border-dashed rounded-md p-8 text-center transition-colors cursor-pointer ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : selectedFiles.length > 0
                        ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/20"
                        : "border-muted-foreground/25 hover:border-muted-foreground/40"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="dropzone-upload"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    multiple
                    className="hidden"
                    data-testid="input-file-upload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        validateAndAddFiles(e.target.files);
                      }
                    }}
                  />
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <FileUp className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {dragOver ? "Drop your files here" : "Drag & drop your documents here"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        or click to browse — PDF, TXT, DOC, DOCX (max 10MB each, up to 10 files)
                      </p>
                    </div>
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="space-y-2" data-testid="selected-files-list">
                    <p className="text-sm font-medium text-muted-foreground">
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                    </p>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                          data-testid={`selected-file-${index}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {(file.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            data-testid={`button-remove-file-${index}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end">
                  <Button
                    data-testid="button-upload-analyze"
                    onClick={handleFileUpload}
                    disabled={uploadMutation.isPending || selectedFiles.length === 0}
                    size="lg"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Analyze {selectedFiles.length > 1 ? `${selectedFiles.length} Documents` : "Document"}
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="scan" className="p-5 pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className="border-2 border-dashed rounded-md p-6 text-center transition-colors cursor-pointer border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                    onClick={() => cameraInputRef.current?.click()}
                    data-testid="button-camera-capture"
                  >
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      data-testid="input-camera-capture"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          addScanImages(e.target.files);
                        }
                      }}
                    />
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Take Photo</p>
                      <p className="text-xs text-muted-foreground">
                        Use your camera to capture a document
                      </p>
                    </div>
                  </div>
                  <div
                    className="border-2 border-dashed rounded-md p-6 text-center transition-colors cursor-pointer border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                    onClick={() => imageInputRef.current?.click()}
                    data-testid="button-image-upload"
                  >
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff"
                      multiple
                      className="hidden"
                      data-testid="input-image-upload"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          addScanImages(e.target.files);
                        }
                      }}
                    />
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <FileUp className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Choose Image</p>
                      <p className="text-xs text-muted-foreground">
                        Select an existing photo of a document
                      </p>
                    </div>
                  </div>
                </div>
                {scanImages.length > 0 && (
                  <div className="space-y-3" data-testid="scan-images-list">
                    <p className="text-sm font-medium text-muted-foreground">
                      {scanImages.length} image{scanImages.length !== 1 ? "s" : ""} ready to scan
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {scanPreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group rounded-md overflow-hidden border bg-muted"
                          data-testid={`scan-preview-${index}`}
                        >
                          <img
                            src={preview}
                            alt={`Scanned page ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1.5 right-1.5 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeScanImage(index)}
                            data-testid={`button-remove-scan-${index}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                            <p className="text-xs text-white truncate">{scanImages[index]?.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Supports JPEG, PNG, WebP, BMP, TIFF — up to 5 images, 10MB each. For best results, ensure the document is well-lit and text is clearly visible.
                </p>
                <div className="flex items-center justify-end">
                  <Button
                    data-testid="button-scan-analyze"
                    onClick={handleScanUpload}
                    disabled={scanMutation.isPending || scanImages.length === 0}
                    size="lg"
                  >
                    {scanMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scanning & Extracting Text...
                      </>
                    ) : (
                      <>
                        <ScanLine className="w-4 h-4" />
                        Scan & Analyze
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="paste" className="p-5 pt-4 space-y-4">
                <Input
                  data-testid="input-document-title"
                  placeholder="Document title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  data-testid="input-document-text"
                  placeholder="Paste your legal document text here...&#10;&#10;Contracts, leases, NDAs, terms of service, employment agreements, and more."
                  className="min-h-[220px] resize-y text-sm leading-relaxed"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-xs text-muted-foreground">
                    {text.length > 0
                      ? `${text.split(/\s+/).filter(Boolean).length} words`
                      : "Paste or type your document above"}
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
              </TabsContent>

              <TabsContent value="samples" className="p-5 pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Try PlainLegal with one of these real-world sample documents:
                </p>
                {sampleDocuments.map((sample, i) => (
                  <motion.div
                    key={sample.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                  >
                    <Card
                      className="p-4 hover-elevate cursor-pointer"
                      onClick={() => loadSample(sample)}
                      data-testid={`card-sample-${i}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{sample.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{sample.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Card className="p-5 hover-elevate border-primary/30 bg-primary/[0.03]">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm" data-testid="text-feature-ai-chat">AI Follow-Up Chat</h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">KEY FEATURE</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  After analysis, ask unlimited follow-up questions about any clause. Get specific answers about your rights, obligations, deadlines, and risks — like having a lawyer on call.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <section className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              title: "Plain English",
              description: "Complex jargon translated into simple language anyone can understand.",
            },
            {
              icon: AlertTriangle,
              title: "Risk Flags",
              description: "Potential risks highlighted with severity levels and actionable suggestions.",
            },
            {
              icon: Shield,
              title: "Key Terms",
              description: "Important legal terms defined clearly so you know what each clause means.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
            >
              <Card className="p-4 space-y-2.5 h-full hover-elevate">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm" data-testid={`text-feature-${feature.title.toLowerCase().replace(/\s/g, "-")}`}>
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
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
                                  ? "Analysis failed — try again"
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

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="pt-4"
        >
          <Card className="p-6 bg-primary/5 border-primary/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">How PlainLegal Works</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  PlainLegal uses DigitalOcean Gradient AI (Llama 3.3 70B) to read through your legal documents,
                  identify each section, translate it into plain English, flag potential risks with severity levels,
                  and define complex legal terms. You can then ask follow-up questions about any part of your document.
                </p>
              </div>
            </div>
          </Card>
        </motion.section>
      </main>

      <footer className="border-t mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" />
            <span>PlainLegal — AI Legal Document Translator</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:underline cursor-pointer" data-testid="link-privacy">Privacy Policy</a>
            <a href="/terms" className="hover:underline cursor-pointer" data-testid="link-terms">Terms of Service</a>
            <div className="flex items-center gap-1.5">
              <span>Built with</span>
              <SiDigitalocean className="w-3.5 h-3.5" />
              <span>DigitalOcean Gradient AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
