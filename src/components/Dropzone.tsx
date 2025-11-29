import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  compact?: boolean;
}

export function Dropzone({ onDrop, compact = true }: DropzoneProps) {
  const onDropCallback = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    }
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "group flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed cursor-pointer",
          "transition-all duration-200 ease-out",
          isDragActive 
            ? "border-primary bg-primary/10 text-primary scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-accent/50 text-muted-foreground hover:text-foreground"
        )}
      >
        <input {...getInputProps()} />
        <ImagePlus className={cn(
          "w-4 h-4 transition-transform duration-200",
          isDragActive ? "scale-110" : "group-hover:scale-110"
        )} />
        <span className="text-sm font-medium">
          {isDragActive ? "Drop here" : "Add images"}
        </span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group flex flex-col items-center justify-center gap-5 p-16 rounded-2xl border-2 border-dashed cursor-pointer",
        "transition-all duration-300 ease-out max-w-md",
        isDragActive 
          ? "border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10" 
          : "border-border hover:border-primary/50 hover:bg-accent/20 hover:shadow-md"
      )}
    >
      <input {...getInputProps()} />
      <div className={cn(
        "p-5 rounded-2xl transition-all duration-300",
        isDragActive 
          ? "bg-primary/15 scale-110" 
          : "bg-muted group-hover:bg-primary/10 group-hover:scale-105"
      )}>
        <Upload className={cn(
          "w-10 h-10 transition-colors duration-200",
          isDragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
        )} />
      </div>
      <div className="text-center space-y-2">
        <p className={cn(
          "text-lg font-semibold transition-colors duration-200",
          isDragActive ? "text-primary" : "group-hover:text-foreground"
        )}>
          {isDragActive ? "Drop images here" : "Drag & drop images"}
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse
        </p>
        <p className="text-xs text-muted-foreground/60 pt-1">
          PNG, JPG, JPEG, WebP
        </p>
      </div>
    </div>
  );
}
