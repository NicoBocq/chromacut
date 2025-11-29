/** biome-ignore-all lint/a11y/useSemanticElements: <find a better way> */
import { useState } from 'react';
import { Trash2, Layers, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useStore, type ImageItem } from '@/store/useStore';

interface ImageListProps {
  items: ImageItem[];
  selectedId: string | null;
  selectedLayerId: string | null;
  onSelectItem: (id: string, layerId?: string | null) => void;
  onDeleteItem: (id: string) => void;
  onDeleteLayer: (itemId: string, layerId: string) => void;
  onRenameLayer: (itemId: string, layerId: string, name: string) => void;
}

export function ImageList({ 
  items, 
  selectedId, 
  selectedLayerId, 
  onSelectItem,
  onDeleteItem,
  onDeleteLayer,
  onRenameLayer
}: ImageListProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { expandedItems, toggleExpandItem } = useStore();

  const toggleExpand = (id: string) => {
    toggleExpandItem(id);
  };

  const startEditing = (layerId: string, currentName: string) => {
    setEditingLayerId(layerId);
    setEditName(currentName);
  };

  const finishEditing = (itemId: string, layerId: string) => {
    if (editName.trim()) {
      onRenameLayer(itemId, layerId, editName.trim());
    }
    setEditingLayerId(null);
  };

  if (items.length === 0) {
    return null;
  }

  // Get display name without extension
  const getDisplayName = (fileName: string | undefined) => {
    if (!fileName) return 'Untitled';
    return fileName.replace(/\.[^/.]+$/, '');
  };

  return (
    <div className="space-y-1 px-2">
      {items.map((item) => {
        const isSelected = selectedId === item.id && !selectedLayerId;
        const isExpanded = expandedItems.has(item.id);
        const hasLayers = item.layers.length > 0;

        return (
          <div key={item.id} className="space-y-0.5">
            {/* Main Item */}
            <div
              className={cn(
                "group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all w-full",
                isSelected 
                  ? "bg-primary/15 ring-1 ring-primary/30" 
                  : "hover:bg-muted/50"
              )}
              onClick={() => onSelectItem(item.id, null)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSelectItem(item.id, null); }}
              role="button"
              tabIndex={0}
            >
              {/* Expand toggle */}
              {hasLayers ? (
                <span
                  onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleExpand(item.id); } }}
                  className="p-0.5 hover:bg-muted rounded cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <ChevronRight className={cn(
                    "w-3.5 h-3.5 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </span>
              ) : (
                <div className="w-4.5" />
              )}

              {/* Thumbnail */}
              <div className={cn(
                "w-10 h-10 rounded-lg overflow-hidden shrink-0 checkerboard",
                isSelected ? "ring-2 ring-primary/50" : "ring-1 ring-border/50"
              )}>
                <img 
                  src={item.processedUrl || item.originalUrl} 
                  alt={item.file?.name || 'Sprite'}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isSelected && "text-primary"
                )}>
                  {getDisplayName(item.file?.name)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {hasLayers ? `${item.layers.length} layer${item.layers.length > 1 ? 's' : ''}` : 'Source'}
                </p>
              </div>

              {/* Delete */}
              {!item.isDefault && (
                <span
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-muted rounded cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onDeleteItem(item.id); } }}
                  role="button"
                  tabIndex={0}
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </span>
              )}
            </div>

            {/* Layers */}
            {hasLayers && isExpanded && (
              <div className="ml-6 pl-2 border-l border-border/50 space-y-0.5">
                {item.layers.map((layer) => {
                  const isLayerSelected = selectedId === item.id && selectedLayerId === layer.id;

                  return (
                    <div
                      key={layer.id}
                      className={cn(
                        "group flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-all w-full",
                        isLayerSelected 
                          ? "bg-primary/10 ring-1 ring-primary/20" 
                          : "hover:bg-muted/40"
                      )}
                      onClick={() => onSelectItem(item.id, layer.id)}
                      onDoubleClick={(e) => { e.stopPropagation(); startEditing(layer.id, layer.name); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') onSelectItem(item.id, layer.id); }}
                      role="button"
                      tabIndex={0}
                    >
                      <Layers className={cn(
                        "w-3.5 h-3.5 shrink-0",
                        isLayerSelected ? "text-primary" : "text-muted-foreground"
                      )} />

                      {/* Thumbnail */}
                      <div className="w-7 h-7 rounded overflow-hidden shrink-0 checkerboard ring-1 ring-border/30">
                        <img 
                          src={layer.url} 
                          alt={layer.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Name */}
                      {editingLayerId === layer.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => finishEditing(item.id, layer.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') finishEditing(item.id, layer.id);
                            if (e.key === 'Escape') setEditingLayerId(null);
                          }}
                          className="h-6 text-xs flex-1"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className={cn(
                          "text-xs truncate flex-1",
                          isLayerSelected ? "text-primary font-medium" : "text-foreground"
                        )}>
                          {layer.name}
                        </span>
                      )}

                      {/* Delete */}
                      <span
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-muted rounded cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); onDeleteLayer(item.id, layer.id); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onDeleteLayer(item.id, layer.id); } }}
                        role="button"
                        tabIndex={0}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
