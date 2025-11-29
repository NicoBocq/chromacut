import { Download, Undo2, Redo2, Eraser, Crop as CropIcon, ZoomIn, ZoomOut, Pipette, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ColorPicker } from '@/components/ColorPicker';
import { cn } from '@/lib/utils';
import type { ChromaSettings } from '@/store/useStore';

type Tool = 'crop' | 'eraser';

interface ExportSize {
  label: string;
  scale?: number;
  size?: number;
}

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
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDownload: (scale?: number, targetSize?: number) => void;
  exportSizes: ExportSize[];
  imageDimensions: { width: number; height: number } | null;
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
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDownload,
  exportSizes,
  imageDimensions,
}: ToolbarProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
      {/* Main Toolbar */}
      <div className="flex items-center gap-1 bg-card backdrop-blur-xl rounded-2xl p-2 shadow-lg shadow-black/5 border border-border">
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

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (⌘Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Export with size options */}
        <div className="flex items-center">
          <Button size="sm" className="h-8 rounded-r-none" onClick={() => onDownload()}>
            <Download className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 px-1.5 rounded-l-none border-l border-primary-foreground/20">
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {imageDimensions && (
                <>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Current: {imageDimensions.width}×{imageDimensions.height}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              {exportSizes.map((size) => (
                <DropdownMenuItem 
                  key={size.label}
                  onClick={() => onDownload(size.scale, size.size)}
                >
                  {size.label}
                  {imageDimensions && size.scale && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {Math.round(imageDimensions.width * size.scale)}×{Math.round(imageDimensions.height * size.scale)}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Secondary Toolbar - Eraser Options */}
      <div 
        className={cn(
          "flex items-center gap-3 bg-card backdrop-blur-xl rounded-xl px-4 py-2 shadow-lg shadow-black/5 border border-border",
          "transition-all duration-300 ease-out",
          tool === 'eraser' 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <Eraser className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Brush size</span>
        <Slider
          value={[brushSize]}
          onValueChange={([v]: number[]) => setBrushSize(v)}
          min={5}
          max={100}
          step={1}
          className="w-32"
        />
        <span className="text-xs w-8 text-right font-mono">{brushSize}px</span>
      </div>
    </div>
  );
}
