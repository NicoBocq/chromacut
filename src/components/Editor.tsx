import { useState, useRef, useEffect } from 'react';
import type React from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toolbar } from '@/components/Toolbar';
import type { ChromaSettings } from '@/store/useStore';

interface EditorProps {
  imageUrl: string;
  fileName: string;
  onSave?: (blob: Blob) => void;
  isLayer?: boolean;
  chromaSettings: ChromaSettings;
  onChromaSettingsChange: (settings: Partial<ChromaSettings>) => void;
  onApplyChroma: () => void;
  onReprocess: () => void;
}

type Tool = 'crop' | 'eraser';

export function Editor({ 
  imageUrl, 
  fileName, 
  onSave, 
  isLayer,
  chromaSettings,
  onChromaSettingsChange,
  onApplyChroma,
  onReprocess
}: EditorProps) {
  const [tool, setTool] = useState<Tool>('crop');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [outputUrl, setOutputUrl] = useState(imageUrl);
  const [zoom, setZoom] = useState(100);
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  // Export name is derived from fileName (layer name)
  const exportName = fileName.replace(/\.[^/.]+$/, '');

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFileNameRef = useRef(fileName);

  // Update outputUrl when imageUrl changes (chroma processing)
  // But only reset zoom/crop when switching to a different file
  useEffect(() => {
    setOutputUrl(imageUrl);
    
    // Only reset zoom and crop when switching to a different file
    const isNewFile = prevFileNameRef.current !== fileName;
    if (isNewFile) {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setZoom(100);
      prevFileNameRef.current = fileName;
    }
  }, [imageUrl, fileName]);

  useEffect(() => {
    if (tool === 'eraser' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = outputUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
      };
    }
  }, [tool, outputUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `${exportName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOutputUrl(imageUrl);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const getVisibleBoundingBox = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }

    return found ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null;
  };

  const applyCrop = () => {
    if (!imgRef.current) return;
    
    const canvas = document.createElement('canvas');
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;
    
    let sourceX = 0, sourceY = 0;
    let sourceWidth = imgRef.current.naturalWidth;
    let sourceHeight = imgRef.current.naturalHeight;

    if (completedCrop) {
      sourceX = completedCrop.x * scaleX;
      sourceY = completedCrop.y * scaleY;
      sourceWidth = completedCrop.width * scaleX;
      sourceHeight = completedCrop.height * scaleY;
    }

    const canvasWidth = Math.ceil(sourceWidth);
    const canvasHeight = Math.ceil(sourceHeight);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(imgRef.current, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasWidth, canvasHeight);

    const bbox = getVisibleBoundingBox(tempCtx, canvasWidth, canvasHeight);
    
    if (bbox) {
      canvas.width = bbox.width;
      canvas.height = bbox.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(tempCanvas, bbox.x, bbox.y, bbox.width, bbox.height, 0, 0, bbox.width, bbox.height);
    } else {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(tempCanvas, 0, 0);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        if (onSave) {
          onSave(blob);
        } else {
          const newUrl = URL.createObjectURL(blob);
          setOutputUrl(newUrl);
        }
        setCrop(undefined);
      }
    }, 'image/png');
  };

  const erase = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const startErasing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    erase(e);
  };

  const stopErasing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          if (onSave && isLayer) {
            onSave(blob);
          } else {
            const newUrl = URL.createObjectURL(blob);
            setOutputUrl(newUrl);
          }
        }
      }, 'image/png');
    }
  };

  const handleEraseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isDrawing) erase(e);
  };

  return (
    <div className="flex flex-col h-full bg-canvas relative">
      <Toolbar
        tool={tool}
        setTool={setTool}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        zoom={zoom}
        setZoom={setZoom}
        chromaSettings={chromaSettings}
        onChromaSettingsChange={onChromaSettingsChange}
        onApplyChroma={onApplyChroma}
        onReprocess={onReprocess}
        onReset={handleReset}
        onDownload={handleDownload}
      />
      
      {/* Canvas Area */}
      <div className="flex-1 overflow-auto checkerboard flex items-center justify-center p-8">
        {imageUrl && (
          tool === 'eraser' ? (
            <div 
              className="relative shadow-2xl rounded-xl overflow-hidden ring-1 ring-border/50 transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startErasing}
                onMouseUp={stopErasing}
                onMouseLeave={stopErasing}
                onMouseMove={handleEraseMove}
                onTouchStart={startErasing}
                onTouchEnd={stopErasing}
                onTouchMove={handleEraseMove}
                className="max-w-full max-h-[70vh] cursor-crosshair touch-none block"
              />
            </div>
          ) : (
            <div 
              className="relative shadow-2xl rounded-xl overflow-hidden ring-1 ring-border/50 transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
            >
              <ReactCrop
                crop={crop}
                onChange={(_: PixelCrop, percentCrop: Crop) => setCrop(percentCrop)}
                onComplete={(c: PixelCrop) => setCompletedCrop(c)}
              >
                <img
                  ref={imgRef}
                  alt="Edit"
                  src={outputUrl}
                  className="max-w-full max-h-[70vh] block"
                />
              </ReactCrop>

              {/* Floating Create Layer button - positioned next to selection */}
              {completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && (
                <div 
                  className="absolute z-20"
                  style={{
                    left: `${completedCrop.x + completedCrop.width + 8}px`,
                    top: `${completedCrop.y}px`,
                  }}
                >
                  <Button
                    size="sm"
                    className="bg-(--brand-green) hover:bg-(--brand-green)/90 shadow-lg whitespace-nowrap transition-all duration-200"
                    onClick={applyCrop}
                  >
                    <Layers className="w-3.5 h-3.5 mr-1.5" />
                    {isLayer ? 'Update' : 'Create Layer'}
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
