import { create } from "zustand";
import { removeColorBackground, removeColorFromUrl } from "@/lib/processor";

export interface Layer {
	id: string;
	name: string;
	url: string;
}

export interface ImageItem {
	id: string;
	file: File | null;
	status: "pending" | "processing" | "completed" | "error";
	originalUrl: string;
	processedUrl?: string;
	error?: string;
	layers: Layer[];
	isDefault?: boolean;
}

export interface ChromaSettings {
	color: string;
	tolerance: number;
}

export type Tool = "crop" | "eraser";

export interface EditorSettings {
	tool: Tool;
	zoom: number;
	brushSize: number;
}

interface Store {
	items: ImageItem[];
	selectedId: string | null;
	selectedLayerId: string | null;
	chromaSettings: ChromaSettings;
	editorSettings: EditorSettings;
	expandedItems: Set<string>;

	addFiles: (files: File[]) => void;
	removeItem: (id: string) => void;
	selectItem: (id: string, layerId?: string | null) => void;
	processItem: (id: string) => Promise<void>;
	reprocessAll: () => void;
	addLayer: (itemId: string, blob: Blob, name: string) => Layer;
	updateLayer: (itemId: string, layerId: string, blob: Blob) => void;
	removeLayer: (itemId: string, layerId: string) => void;
	renameLayer: (itemId: string, layerId: string, name: string) => void;
	updateChromaSettings: (settings: Partial<ChromaSettings>) => void;
	updateEditorSettings: (settings: Partial<EditorSettings>) => void;
	toggleExpandItem: (id: string) => void;
	expandItem: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(7);

export const useStore = create<Store>((set, get) => ({
	items: [],
	selectedId: null,
	selectedLayerId: null,
	chromaSettings: {
		color: "#00ff00",
		tolerance: 0,
	},
	editorSettings: {
		tool: "crop",
		zoom: 100,
		brushSize: 20,
	},
	expandedItems: new Set<string>(),

	addFiles: (files) => {
		const newItems = files.map((file) => ({
			id: generateId(),
			file,
			status: "completed" as const,
			originalUrl: URL.createObjectURL(file),
			processedUrl: URL.createObjectURL(file),
			layers: [],
		}));

		set((state) => ({
			items: [...state.items, ...newItems],
			selectedId: newItems[0]?.id ?? state.selectedId,
			selectedLayerId: null,
		}));
	},

	removeItem: (id) => {
		const state = get();
		const item = state.items.find((i) => i.id === id);
		if (item) {
			URL.revokeObjectURL(item.originalUrl);
			if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
			for (const l of item.layers) URL.revokeObjectURL(l.url);
		}

		const newItems = state.items.filter((i) => i.id !== id);

		set({
			items: newItems,
			selectedId:
				state.selectedId === id ? (newItems[0]?.id ?? null) : state.selectedId,
			selectedLayerId: state.selectedId === id ? null : state.selectedLayerId,
		});
	},

	selectItem: (id, layerId = null) => {
		set({ selectedId: id, selectedLayerId: layerId });
	},

	processItem: async (id) => {
		const state = get();
		const item = state.items.find((i) => i.id === id);
		if (!item) return;

		const oldUrl = item.processedUrl;

		try {
			const blob = item.file
				? await removeColorBackground(item.file, get().chromaSettings)
				: await removeColorFromUrl(item.originalUrl, get().chromaSettings);
			const url = URL.createObjectURL(blob);

			set((state) => ({
				items: state.items.map((i) =>
					i.id === id
						? { ...i, status: "completed" as const, processedUrl: url }
						: i,
				),
			}));

			if (oldUrl && oldUrl !== item.originalUrl) {
				URL.revokeObjectURL(oldUrl);
			}
		} catch (err) {
			console.error(err);
			set((state) => ({
				items: state.items.map((i) =>
					i.id === id
						? { ...i, status: "error" as const, error: "Failed to process" }
						: i,
				),
			}));
		}
	},

	reprocessAll: () => {
		const state = get();
		for (const item of state.items) {
			if (
				item.file &&
				(item.status === "completed" || item.status === "error")
			) {
				get().processItem(item.id);
			}
		}
	},

	addLayer: (itemId, blob, name) => {
		const url = URL.createObjectURL(blob);
		const newLayer: Layer = { id: generateId(), name, url };

		set((state) => {
			const newExpanded = new Set(state.expandedItems);
			newExpanded.add(itemId);
			return {
				items: state.items.map((item) =>
					item.id === itemId
						? { ...item, layers: [...item.layers, newLayer] }
						: item,
				),
				selectedLayerId: newLayer.id,
				expandedItems: newExpanded,
			};
		});

		return newLayer;
	},

	updateLayer: (itemId, layerId, blob) => {
		const url = URL.createObjectURL(blob);
		set((state) => ({
			items: state.items.map((item) =>
				item.id === itemId
					? {
							...item,
							layers: item.layers.map((l) =>
								l.id === layerId ? { ...l, url } : l,
							),
						}
					: item,
			),
		}));
	},

	removeLayer: (itemId, layerId) => {
		const state = get();
		const item = state.items.find((i) => i.id === itemId);
		const layer = item?.layers.find((l) => l.id === layerId);
		if (layer) URL.revokeObjectURL(layer.url);

		set((state) => ({
			items: state.items.map((item) =>
				item.id === itemId
					? { ...item, layers: item.layers.filter((l) => l.id !== layerId) }
					: item,
			),
			selectedLayerId:
				state.selectedLayerId === layerId ? null : state.selectedLayerId,
		}));
	},

	renameLayer: (itemId, layerId, name) => {
		set((state) => ({
			items: state.items.map((item) =>
				item.id === itemId
					? {
							...item,
							layers: item.layers.map((l) =>
								l.id === layerId ? { ...l, name } : l,
							),
						}
					: item,
			),
		}));
	},

	updateChromaSettings: (settings) => {
		set((state) => ({
			chromaSettings: { ...state.chromaSettings, ...settings },
		}));
	},

	updateEditorSettings: (settings) => {
		set((state) => ({
			editorSettings: { ...state.editorSettings, ...settings },
		}));
	},

	toggleExpandItem: (id) => {
		set((state) => {
			const newExpanded = new Set(state.expandedItems);
			if (newExpanded.has(id)) newExpanded.delete(id);
			else newExpanded.add(id);
			return { expandedItems: newExpanded };
		});
	},

	expandItem: (id) => {
		set((state) => {
			const newExpanded = new Set(state.expandedItems);
			newExpanded.add(id);
			return { expandedItems: newExpanded };
		});
	},
}));
