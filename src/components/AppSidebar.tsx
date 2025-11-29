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
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-(--brand-purple) flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight">Chroma Studio</h1>
            <p className="text-[10px] text-muted-foreground">Background remover</p>
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
