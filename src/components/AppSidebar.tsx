import { Layers } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Dropzone } from '@/components/Dropzone';
import { ImageList } from '@/components/ImageList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useStore } from '@/store/useStore';

export function AppSidebar() {
  const {
    items,
    selectedId,
    selectedLayerId,
    addFiles,
    selectItem,
    removeItem,
    removeLayer,
    renameLayer
  } = useStore();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight">Chroma Studio</h1>
            <p className="text-xs text-muted-foreground">Background remover</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Import</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <Dropzone onDrop={addFiles} compact />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <ImageList
              items={items}
              selectedId={selectedId}
              selectedLayerId={selectedLayerId}
              onSelectItem={selectItem}
              onDeleteItem={removeItem}
              onDeleteLayer={removeLayer}
              onRenameLayer={renameLayer}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">Appearance</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
