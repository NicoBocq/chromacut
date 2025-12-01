import {
	ChevronDown,
	Crop as CropIcon,
	Download,
	Eraser,
	Layers,
	PanelLeftClose,
	PanelLeftOpen,
	Pipette,
	Redo2,
	Undo2,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { ColorPicker } from "@/components/ColorPicker";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { ChromaSettings } from "@/store/useStore";

type Tool = "crop" | "eraser";

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
	isLayer?: boolean;
	hasCropSelection?: boolean;
	onApplyCrop?: () => void;
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
	isLayer = false,
	hasCropSelection = false,
	onApplyCrop,
}: ToolbarProps) {
	const { toggleSidebar, open } = useSidebar();

	return (
		<div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 max-w-[calc(100%-2rem)]">
			<div className="inline-flex items-center gap-1 bg-card/95 backdrop-blur-xl rounded-2xl p-2 shadow-lg shadow-black/5 border border-border">
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 shrink-0"
					onClick={toggleSidebar}
				>
					{open ? (
						<PanelLeftClose className="w-4 h-4" />
					) : (
						<PanelLeftOpen className="w-4 h-4" />
					)}
				</Button>

				<Separator orientation="vertical" className="h-6 mx-1" />

				<div
					className={cn(
						"flex items-center gap-2 px-2",
						isLayer && "opacity-40 pointer-events-none",
					)}
				>
					<div className="flex items-center gap-1.5">
						<Pipette className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
						<ColorPicker
							value={chromaSettings.color}
							onChange={(color) => {
								onChromaSettingsChange({ color });
								onApplyChroma();
							}}
						/>
					</div>

					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground hidden sm:inline">
							Tol
						</span>
						<Slider
							value={[chromaSettings.tolerance]}
							onValueChange={([v]: number[]) =>
								onChromaSettingsChange({ tolerance: v })
							}
							onValueCommit={() => onApplyChroma()}
							min={0}
							max={200}
							step={1}
							className="w-16 sm:w-20"
							disabled={isLayer}
						/>
						<span className="text-xs w-6 text-right font-mono">
							{chromaSettings.tolerance}
						</span>
					</div>
				</div>

				<Separator
					orientation="vertical"
					className="h-6 mx-1 hidden sm:block"
				/>

				<div className="flex gap-0.5 bg-secondary rounded-md p-0.5">
					<Button
						variant={tool === "crop" ? "default" : "ghost"}
						size="sm"
						className={cn("h-8 w-8 p-0", tool === "crop" && "bg-primary")}
						onClick={() => setTool("crop")}
					>
						<CropIcon className="w-4 h-4" />
					</Button>

					<Button
						variant={tool === "eraser" ? "default" : "ghost"}
						size="sm"
						className={cn("h-8 w-8 p-0", tool === "eraser" && "bg-primary")}
						onClick={() => setTool("eraser")}
					>
						<Eraser className="w-4 h-4" />
					</Button>
				</div>

				<Separator
					orientation="vertical"
					className="h-6 mx-1 hidden sm:block"
				/>

				<div className="hidden sm:flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => setZoom(Math.max(10, zoom - 25))}
					>
						<ZoomOut className="w-4 h-4" />
					</Button>
					<span className="text-xs w-10 text-center">{zoom}%</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => setZoom(Math.min(400, zoom + 25))}
					>
						<ZoomIn className="w-4 h-4" />
					</Button>
				</div>

				<Separator
					orientation="vertical"
					className="h-6 mx-1 hidden sm:block"
				/>

				<div className="hidden sm:flex items-center gap-0.5">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={onUndo}
						disabled={!canUndo}
					>
						<Undo2 className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={onRedo}
						disabled={!canRedo}
					>
						<Redo2 className="w-4 h-4" />
					</Button>
				</div>

				<Separator
					orientation="vertical"
					className="h-6 mx-1 hidden sm:block"
				/>

				<div className="flex items-center shrink-0">
					<Button
						size="sm"
						className="h-8 rounded-r-none"
						onClick={() => onDownload()}
					>
						<Download className="w-4 h-4" />
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="sm"
								className="h-8 px-1.5 rounded-l-none border-l border-primary-foreground/20"
							>
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
											{Math.round(imageDimensions.width * size.scale)}×
											{Math.round(imageDimensions.height * size.scale)}
										</span>
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{tool === "eraser" && (
				<div className="flex items-center gap-3 bg-card/95 backdrop-blur-xl rounded-xl px-4 py-2 shadow-lg shadow-black/5 border border-border">
					<Eraser className="w-4 h-4 text-muted-foreground" />
					<span className="text-xs text-muted-foreground hidden sm:inline">
						Brush size
					</span>
					<Slider
						value={[brushSize]}
						onValueChange={([v]: number[]) => setBrushSize(v)}
						min={5}
						max={100}
						step={1}
						className="w-24 sm:w-32"
					/>
					<span className="text-xs w-8 text-right font-mono">
						{brushSize}px
					</span>
				</div>
			)}

			{tool === "crop" && hasCropSelection && (
				<div className="flex items-center bg-card/95 backdrop-blur-xl rounded-xl px-4 py-2 shadow-lg shadow-black/5 border border-border">
					<Button size="sm" onClick={onApplyCrop}>
						<Layers className="w-4 h-4 mr-1.5" />
						{isLayer ? "Update" : "Create Layer"}
					</Button>
				</div>
			)}
		</div>
	);
}
