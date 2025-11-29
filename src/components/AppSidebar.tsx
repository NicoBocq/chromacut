import { Scissors } from 'lucide-react';
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
        <div className="space-y-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                <Scissors className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-background rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none">
                Chroma<span className="text-primary">cut</span>
              </h1>
            </div>
          </div>
          {/* Tagline */}
          <p className="text-[11px] text-muted-foreground pl-0.5">
            Generate → Edit → <span className="text-primary font-medium">Profit</span>
          </p>
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
