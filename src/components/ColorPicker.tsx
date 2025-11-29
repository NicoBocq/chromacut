import { useState } from 'react';
import { Pipette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const presetColors = [
  '#00ff00', // Green screen
  '#00b140', // Darker green
  '#0000ff', // Blue screen
  '#0047ab', // Darker blue
  '#ffffff', // White
  '#000000', // Black
  '#ff00ff', // Magenta
  '#808080', // Gray
];

// Check if EyeDropper API is available
const isEyeDropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

  const pickColorFromScreen = async () => {
    if (!isEyeDropperSupported) return;
    
    try {
      setIsPicking(true);
      // @ts-expect-error EyeDropper is not in TypeScript types yet
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onChange(result.sRGBHex);
      setIsOpen(false);
    } catch {
      // User cancelled or error
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 w-8 p-0 border-2", className)}
          style={{ backgroundColor: value }}
        >
          <span className="sr-only">Pick color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          {/* Eyedropper button */}
          {isEyeDropperSupported && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={pickColorFromScreen}
                  disabled={isPicking}
                >
                  <Pipette className="w-4 h-4 mr-2" />
                  {isPicking ? 'Picking...' : 'Pick from screen'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Click then select any color on screen</TooltipContent>
            </Tooltip>
          )}

          {/* Preset colors */}
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "w-8 h-8 rounded-md border-2 transition-all",
                  value === color ? "border-primary ring-2 ring-primary/50" : "border-border hover:border-muted-foreground"
                )}
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Custom:</label>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 h-8 px-2 text-xs bg-secondary border border-border rounded-md font-mono uppercase"
              maxLength={7}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
