import { Download, RotateCcw, Eraser, Crop as CropIcon, ZoomIn, ZoomOut, Pipette, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '@/components/ColorPicker';
import { cn } from '@/lib/utils';
import type { ChromaSettings } from '@/store/useStore';

type Tool = 'crop' | 'eraser';

interface ToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  chromaSettings: ChromaSettings;
  onChromaSettingsChange: (settings: Partial<ChromaSettings>) => void;
  onApplyChroma: () => void;
  onReprocess: () => void;
  onReset: () => void;
  onDownload: () => void;
}

export function Toolbar({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  zoom,
  setZoom,
  chromaSettings,
  onChromaSettingsChange,
  onApplyChroma,
  onReprocess,
  onReset,
  onDownload,
}: ToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 bg-card/95 backdrop-blur-md rounded-xl p-1.5 shadow-xl border border-border/50">
        {/* Chroma Key Settings */}
        <div className="flex items-center gap-2 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <Pipette className="w-3.5 h-3.5 text-muted-foreground" />
                <ColorPicker 
                  value={chromaSettings.color} 
                  onChange={(color) => {
                    onChromaSettingsChange({ color });
                    onApplyChroma();
                  }} 
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Chroma key color</TooltipContent>
          </Tooltip>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tol</span>
            <Slider
              value={[chromaSettings.tolerance]}
              onValueChange={([v]: number[]) => onChromaSettingsChange({ tolerance: v })}
              onValueCommit={() => onApplyChroma()}
              min={0}
              max={200}
              step={1}
              className="w-20"
            />
            <span className="text-xs w-6 text-right font-mono">{chromaSettings.tolerance}</span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onReprocess}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reprocess all images</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Tool Selection */}
        <div className="flex gap-0.5 bg-secondary rounded-md p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'crop' ? 'default' : 'ghost'}
                size="sm"
                className={cn("h-8 w-8 p-0", tool === 'crop' && "bg-primary")}
                onClick={() => setTool('crop')}
              >
                <CropIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Crop</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'eraser' ? 'default' : 'ghost'}
                size="sm"
                className={cn("h-8 w-8 p-0", tool === 'eraser' && "bg-primary")}
                onClick={() => setTool('eraser')}
              >
                <Eraser className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eraser</TooltipContent>
          </Tooltip>
        </div>

        {/* Eraser Size */}
        {tool === 'eraser' && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs text-muted-foreground">Size</span>
              <Slider
                value={[brushSize]}
                onValueChange={([v]: number[]) => setBrushSize(v)}
                min={5}
                max={100}
                step={1}
                className="w-20"
              />
              <span className="text-xs w-6 text-right">{brushSize}</span>
            </div>
          </>
        )}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(Math.max(10, zoom - 25))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>
          <span className="text-xs w-10 text-center">{zoom}%</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(Math.min(400, zoom + 25))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

          <Button size="sm" className="h-8" onClick={onDownload}>
            <Download className="w-4 h-4" />
          </Button>

      </div>
    </div>
  );
}
