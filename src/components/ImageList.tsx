import { useState } from 'react';
import { Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { ImageItem } from '@/store/useStore';

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
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-3 rounded-xl bg-muted/50 mb-3">
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No images yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Import files to get started</p>
      </div>
    );
  }

  return (
    <SidebarMenu className="px-2">
      {items.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            isActive={selectedId === item.id && !selectedLayerId}
            onClick={() => onSelectItem(item.id, null)}
            className="h-10"
          >
            <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/50 shrink-0 ring-1 ring-border/50">
              <img 
                src={item.processedUrl || item.originalUrl} 
                alt={item.file?.name || 'Default'}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="truncate text-sm">{item.file?.name || 'generated.png'}</span>
          </SidebarMenuButton>
          
          {!item.isDefault && (
            <SidebarMenuAction
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(item.id);
              }}
              showOnHover
            >
              <Trash2 className="w-4 h-4" />
            </SidebarMenuAction>
          )}

          {/* Layers */}
          {item.layers.length > 0 && (
            <SidebarMenuSub>
              {item.layers.map((layer) => (
                <SidebarMenuSubItem key={layer.id} className="group">
                  {editingLayerId === layer.id ? (
                    <div className="flex items-center px-2 py-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => finishEditing(item.id, layer.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishEditing(item.id, layer.id);
                          if (e.key === 'Escape') setEditingLayerId(null);
                        }}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <SidebarMenuSubButton
                      asChild
                      isActive={selectedId === item.id && selectedLayerId === layer.id}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectItem(item.id, layer.id)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startEditing(layer.id, layer.name);
                        }}
                        className={cn(
                          "w-full justify-start",
                          selectedId === item.id && selectedLayerId === layer.id && "bg-primary/10"
                        )}
                      >
                        <div className="w-6 h-6 rounded overflow-hidden bg-muted/50 shrink-0 ring-1 ring-border/50">
                          <img 
                            src={layer.url} 
                            alt={layer.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="truncate text-sm">{layer.name}</span>
                      </button>
                    </SidebarMenuSubButton>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayer(item.id, layer.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
