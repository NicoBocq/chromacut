import { ChevronRight, Layers, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type ImageItem, useStore } from "@/store/useStore";

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
	onRenameLayer,
}: ImageListProps) {
	const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const { expandedItems, toggleExpandItem } = useStore();

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

	const getDisplayName = (fileName: string | undefined) => {
		if (!fileName) return "Untitled";
		return fileName.replace(/\.[^/.]+$/, "");
	};

	return (
		<ul className="flex w-full min-w-0 flex-col gap-1 px-2">
			{items.map((item) => {
				const isSelected = selectedId === item.id && !selectedLayerId;
				const isExpanded = expandedItems.has(item.id);
				const hasLayers = item.layers.length > 0;

				return (
					<li key={item.id} className="group/item">
						{/* Main Item wrapper */}
						<div className="relative">
							<button
								type="button"
								onClick={() => onSelectItem(item.id, null)}
								className={cn(
									"flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
									isSelected
										? "bg-sidebar-accent text-sidebar-accent-foreground"
										: "hover:bg-sidebar-accent/50",
								)}
							>
								{/* Expand toggle */}
								{hasLayers ? (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											toggleExpandItem(item.id);
										}}
										className="p-0.5 hover:bg-muted rounded cursor-pointer"
									>
										<ChevronRight
											className={cn(
												"w-3.5 h-3.5 text-muted-foreground transition-transform",
												isExpanded && "rotate-90",
											)}
										/>
									</button>
								) : (
									<div className="w-4.5" />
								)}

								{/* Thumbnail */}
								<div
									className={cn(
										"w-10 h-10 rounded-lg overflow-hidden shrink-0 checkerboard",
										isSelected
											? "ring-2 ring-primary/50"
											: "ring-1 ring-border/50",
									)}
								>
									<img
										src={item.processedUrl || item.originalUrl}
										alt={item.file?.name || "Sprite"}
										className="w-full h-full object-contain"
									/>
								</div>

								{/* Info */}
								<div className="flex-1 min-w-0 overflow-hidden pr-6">
									<p
										className={cn(
											"text-sm font-medium truncate",
											isSelected && "text-primary",
										)}
									>
										{getDisplayName(item.file?.name)}
									</p>
									<p className="text-[10px] text-muted-foreground truncate">
										{hasLayers
											? `${item.layers.length} layer${item.layers.length > 1 ? "s" : ""}`
											: "Source"}
									</p>
								</div>
							</button>

							{/* Delete button - always visible on mobile, hover on desktop */}
							{!item.isDefault && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onDeleteItem(item.id);
									}}
									className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity"
								>
									<Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
								</button>
							)}
						</div>

						{/* Layers */}
						{hasLayers && isExpanded && (
							<ul className="ml-6 mt-1 pl-2 border-l border-border/50 space-y-0.5">
								{item.layers.map((layer) => {
									const isLayerSelected =
										selectedId === item.id && selectedLayerId === layer.id;

									return (
										<li key={layer.id} className="group/layer relative">
											<button
												type="button"
												onClick={() => onSelectItem(item.id, layer.id)}
												onDoubleClick={(e) => {
													e.stopPropagation();
													startEditing(layer.id, layer.name);
												}}
												className={cn(
													"flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors",
													isLayerSelected
														? "bg-sidebar-accent text-sidebar-accent-foreground"
														: "hover:bg-sidebar-accent/50",
												)}
											>
												<Layers
													className={cn(
														"w-3.5 h-3.5 shrink-0",
														isLayerSelected
															? "text-primary"
															: "text-muted-foreground",
													)}
												/>

												<div className="w-7 h-7 rounded overflow-hidden shrink-0 checkerboard ring-1 ring-border/30">
													<img
														src={layer.url}
														alt={layer.name}
														className="w-full h-full object-contain"
													/>
												</div>

												{editingLayerId === layer.id ? (
													<Input
														value={editName}
														onChange={(e) => setEditName(e.target.value)}
														onBlur={() => finishEditing(item.id, layer.id)}
														onKeyDown={(e) => {
															if (e.key === "Enter")
																finishEditing(item.id, layer.id);
															if (e.key === "Escape") setEditingLayerId(null);
														}}
														className="h-6 text-xs flex-1"
														autoFocus
														onClick={(e) => e.stopPropagation()}
													/>
												) : (
													<span
														className={cn(
															"text-xs truncate flex-1 pr-12",
															isLayerSelected
																? "text-primary font-medium"
																: "text-foreground",
														)}
													>
														{layer.name}
													</span>
												)}
											</button>

											{/* Edit layer button */}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													startEditing(layer.id, layer.name);
												}}
												className="absolute right-7 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded hover:bg-muted opacity-100 sm:opacity-0 sm:group-hover/layer:opacity-100 transition-opacity"
											>
												<Pencil className="w-3 h-3 text-muted-foreground hover:text-foreground" />
											</button>

											{/* Delete layer button */}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													onDeleteLayer(item.id, layer.id);
												}}
												className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded hover:bg-muted opacity-100 sm:opacity-0 sm:group-hover/layer:opacity-100 transition-opacity"
											>
												<Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</li>
				);
			})}
		</ul>
	);
}
