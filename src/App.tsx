import { Dropzone } from '@/components/Dropzone';
import { Editor } from '@/components/Editor';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
        {/* Credit link */}
        <a 
          href="https://1h12.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          1h12.com
        </a>
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
          <div className="flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-auto">
            <div className="max-w-2xl text-center space-y-4 sm:space-y-6">
              {/* Hero */}
              <div className="space-y-2 sm:space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Chroma Key Tool
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Turn AI generations into <span className="text-primary">transparent PNGs</span>
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                  Remove colored backgrounds instantly with chroma key.
                </p>
              </div>

              {/* Steps - responsive grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6">
                <div className="flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30">
                  <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden">
                    <img src="/steps/step1.png" alt="Step 1" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium">1. Import</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Drop your image</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30">
                  <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden">
                    <img src="/steps/step2.png" alt="Step 2" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium">2. Chroma</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Remove background</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30">
                  <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden checkerboard">
                    <img src="/steps/step3.png" alt="Step 3" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium">3. Export</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Transparent PNG</p>
                  </div>
                </div>
              </div>

              {/* Dropzone */}
              <Dropzone onDrop={addFiles} compact={false} />
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
