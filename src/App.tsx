import { Dropzone } from '@/components/Dropzone';
import { Editor } from '@/components/Editor';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useStore } from '@/store/useStore';

function App() {
  const {
    items,
    selectedId,
    selectedLayerId,
    chromaSettings,
    addFiles,
    addLayer,
    updateLayer,
    processItem,
    reprocessAll,
    updateChromaSettings
  } = useStore();

  const selectedItem = items.find(i => i.id === selectedId);
  const selectedLayer = selectedItem?.layers.find(l => l.id === selectedLayerId);

  const handleSave = (blob: Blob) => {
    if (!selectedItem) return;

    if (selectedLayerId) {
      updateLayer(selectedItem.id, selectedLayerId, blob);
    } else {
      const name = `Layer ${selectedItem.layers.length + 1}`;
      addLayer(selectedItem.id, blob, name);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-canvas relative">
        <SidebarTrigger className="absolute top-4 left-4 z-20" />
        {selectedItem && selectedItem.status === 'completed' ? (
          <Editor
            key={selectedLayerId || selectedItem.id}
            imageUrl={selectedLayer ? selectedLayer.url : (selectedItem.processedUrl || '')}
            fileName={selectedLayer ? `${selectedLayer.name}.png` : (selectedItem.file?.name || 'generated.png')}
            onSave={handleSave}
            isLayer={!!selectedLayerId}
            chromaSettings={chromaSettings}
            onChromaSettingsChange={updateChromaSettings}
            onApplyChroma={() => processItem(selectedItem.id)}
            onReprocess={reprocessAll}
          />
        ) : selectedItem ? (
          <div className="flex-1 h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              {selectedItem.status === 'processing' ? (
                <>
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground font-medium">Processing image...</p>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-destructive/10 mx-auto w-fit">
                    <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Error processing image</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 h-full flex flex-col items-center justify-center gap-6">
            <Dropzone onDrop={addFiles} compact={false} />
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
