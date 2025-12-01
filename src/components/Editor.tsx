import type React from "react";
import { useEffect, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Toolbar } from "@/components/Toolbar";
import { type ChromaSettings, useStore } from "@/store/useStore";

interface EditorProps {
	imageUrl: string;
	fileName: string;
	onSave?: (blob: Blob) => void;
	onOutputChange?: (dataUrl: string) => void;
	isLayer?: boolean;
	chromaSettings: ChromaSettings;
	onChromaSettingsChange: (settings: Partial<ChromaSettings>) => void;
	onApplyChroma: () => void;
	onApplyAI: () => void;
	isAIProcessing: boolean;
}

export function Editor({
	imageUrl,
	fileName,
	onSave,
	onOutputChange,
	isLayer,
	chromaSettings,
	onChromaSettingsChange,
	onApplyChroma,
	onApplyAI,
	isAIProcessing,
}: EditorProps) {
	const { editorSettings, updateEditorSettings } = useStore();
	const { tool, zoom, brushSize } = editorSettings;

	const setTool = (t: typeof tool) => {
		// Si on quitte l'eraser, sauvegarder l'état du canvas
		if (tool === "eraser" && t !== "eraser" && canvasRef.current) {
			const dataUrl = canvasRef.current.toDataURL("image/png");
			setOutputUrl(dataUrl);
			// Notifier le parent pour persister dans le store
			onOutputChange?.(dataUrl);
		}
		updateEditorSettings({ tool: t });
	};
	const setZoom = (z: number) => updateEditorSettings({ zoom: z });
	const setBrushSize = (s: number) => updateEditorSettings({ brushSize: s });

	const [crop, setCrop] = useState<Crop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
	const [outputUrl, setOutputUrl] = useState(imageUrl);
	const [isDrawing, setIsDrawing] = useState(false);
	const [showCursor, setShowCursor] = useState(false);
	const [imageDimensions, setImageDimensions] = useState<{
		width: number;
		height: number;
	} | null>(null);

	const [history, setHistory] = useState<string[]>([imageUrl]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const maxHistory = 10;

	const canUndo = historyIndex > 0;
	const canRedo = historyIndex < history.length - 1;

	const exportName = fileName.replace(/\.[^/.]+$/, "");

	const imgRef = useRef<HTMLImageElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const cursorRef = useRef<HTMLDivElement>(null);
	const prevFileNameRef = useRef(fileName);
	const historyRef = useRef(history);
	historyRef.current = history;

	const pushHistory = (url: string) => {
		setHistory((prev) => {
			const newHistory = prev.slice(0, historyIndex + 1);
			newHistory.push(url);
			if (newHistory.length > maxHistory) {
				URL.revokeObjectURL(newHistory[0]);
				newHistory.shift();
				return newHistory;
			}
			return newHistory;
		});
		setHistoryIndex((prev) => Math.min(prev + 1, maxHistory - 1));
	};

	const handleUndo = () => {
		if (canUndo) {
			const newIndex = historyIndex - 1;
			setHistoryIndex(newIndex);
			setOutputUrl(history[newIndex]);
		}
	};

	const handleRedo = () => {
		if (canRedo) {
			const newIndex = historyIndex + 1;
			setHistoryIndex(newIndex);
			setOutputUrl(history[newIndex]);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <no need>
	useEffect(() => {
		const isNewFile = prevFileNameRef.current !== fileName;
		if (isNewFile) {
			setOutputUrl(imageUrl);
			setCrop(undefined);
			setCompletedCrop(undefined);
			setHistory([imageUrl]);
			setHistoryIndex(0);
			prevFileNameRef.current = fileName;
		} else if (imageUrl !== outputUrl) {
			const currentHistoryUrl = historyRef.current[historyIndex];
			if (imageUrl !== currentHistoryUrl) {
				setOutputUrl(imageUrl);
				pushHistory(imageUrl);
			}
		}
	}, [imageUrl, fileName, historyIndex, outputUrl]);

	useEffect(() => {
		return () => {
			for (const url of historyRef.current) {
				if (url !== imageUrl && url.startsWith("blob:")) {
					URL.revokeObjectURL(url);
				}
			}
		};
	}, [imageUrl]);

	useEffect(() => {
		const img = new Image();
		img.src = outputUrl;
		img.onload = () => {
			setImageDimensions({ width: img.width, height: img.height });
			if (tool === "eraser" && canvasRef.current) {
				const canvas = canvasRef.current;
				const ctx = canvas.getContext("2d");
				canvas.width = img.width;
				canvas.height = img.height;
				ctx?.drawImage(img, 0, 0);
			}
		};
	}, [tool, outputUrl]);

	const exportSizes = [
		{ label: "Original", scale: 1 },
		{ label: "2x", scale: 2 },
		{ label: "0.5x", scale: 0.5 },
		{ label: "0.25x", scale: 0.25 },
		{ label: "64px", size: 64 },
		{ label: "128px", size: 128 },
		{ label: "256px", size: 256 },
		{ label: "512px", size: 512 },
	];

	const handleDownload = (scale?: number, targetSize?: number) => {
		const img = new Image();
		img.src = outputUrl;
		img.onload = () => {
			let newWidth = img.width;
			let newHeight = img.height;

			if (targetSize) {
				const ratio = img.width / img.height;
				if (ratio > 1) {
					newWidth = targetSize;
					newHeight = Math.round(targetSize / ratio);
				} else {
					newHeight = targetSize;
					newWidth = Math.round(targetSize * ratio);
				}
			} else if (scale && scale !== 1) {
				newWidth = Math.round(img.width * scale);
				newHeight = Math.round(img.height * scale);
			}

			if (newWidth === img.width && newHeight === img.height) {
				const link = document.createElement("a");
				link.href = outputUrl;
				link.download = `${exportName}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				return;
			}

			const canvas = document.createElement("canvas");
			canvas.width = newWidth;
			canvas.height = newHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.drawImage(img, 0, 0, newWidth, newHeight);

			canvas.toBlob((blob) => {
				if (blob) {
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = `${exportName}_${newWidth}x${newHeight}.png`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);
				}
			}, "image/png");
		};
	};

	const getVisibleBoundingBox = (
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	) => {
		const imageData = ctx.getImageData(0, 0, width, height);
		const data = imageData.data;
		let minX = width,
			minY = height,
			maxX = 0,
			maxY = 0;
		let found = false;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const alpha = data[(y * width + x) * 4 + 3];
				if (alpha > 0) {
					if (x < minX) minX = x;
					if (x > maxX) maxX = x;
					if (y < minY) minY = y;
					if (y > maxY) maxY = y;
					found = true;
				}
			}
		}

		return found
			? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
			: null;
	};

	const applyCrop = () => {
		if (!imgRef.current) return;

		const canvas = document.createElement("canvas");
		const rect = imgRef.current.getBoundingClientRect();
		const scaleX = imgRef.current.naturalWidth / rect.width;
		const scaleY = imgRef.current.naturalHeight / rect.height;

		let sourceX = 0,
			sourceY = 0;
		let sourceWidth = imgRef.current.naturalWidth;
		let sourceHeight = imgRef.current.naturalHeight;

		if (completedCrop) {
			sourceX = completedCrop.x * scaleX;
			sourceY = completedCrop.y * scaleY;
			sourceWidth = completedCrop.width * scaleX;
			sourceHeight = completedCrop.height * scaleY;
		}

		const canvasWidth = Math.ceil(sourceWidth);
		const canvasHeight = Math.ceil(sourceHeight);

		const tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvasWidth;
		tempCanvas.height = canvasHeight;
		const tempCtx = tempCanvas.getContext("2d");
		if (!tempCtx) return;

		tempCtx.drawImage(
			imgRef.current,
			sourceX,
			sourceY,
			sourceWidth,
			sourceHeight,
			0,
			0,
			canvasWidth,
			canvasHeight,
		);

		const bbox = getVisibleBoundingBox(tempCtx, canvasWidth, canvasHeight);

		if (bbox) {
			canvas.width = bbox.width;
			canvas.height = bbox.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.drawImage(
				tempCanvas,
				bbox.x,
				bbox.y,
				bbox.width,
				bbox.height,
				0,
				0,
				bbox.width,
				bbox.height,
			);
		} else {
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.drawImage(tempCanvas, 0, 0);
		}

		canvas.toBlob((blob) => {
			if (blob) {
				if (onSave) {
					onSave(blob);
				} else {
					const newUrl = URL.createObjectURL(blob);
					setOutputUrl(newUrl);
					pushHistory(newUrl);
				}
				setCrop(undefined);
				setCompletedCrop(undefined);
			}
		}, "image/png");
	};

	const erase = (
		e:
			| React.MouseEvent<HTMLCanvasElement>
			| React.TouchEvent<HTMLCanvasElement>,
	) => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

		const x = (clientX - rect.left) * scaleX;
		const y = (clientY - rect.top) * scaleY;

		ctx.globalCompositeOperation = "destination-out";
		ctx.beginPath();
		ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
		ctx.fill();
	};

	const startErasing = (
		e:
			| React.MouseEvent<HTMLCanvasElement>
			| React.TouchEvent<HTMLCanvasElement>,
	) => {
		setIsDrawing(true);
		erase(e);
	};

	const stopErasing = () => {
		setIsDrawing(false);
		if (canvasRef.current) {
			canvasRef.current.toBlob((blob) => {
				if (blob) {
					if (onSave && isLayer) {
						onSave(blob);
					} else {
						const newUrl = URL.createObjectURL(blob);
						setOutputUrl(newUrl);
						pushHistory(newUrl);
					}
				}
			}, "image/png");
		}
	};

	const handleEraseMove = (
		e:
			| React.MouseEvent<HTMLCanvasElement>
			| React.TouchEvent<HTMLCanvasElement>,
	) => {
		if (isDrawing) erase(e);
	};

	return (
		<div className="flex flex-col h-full bg-canvas relative">
			<Toolbar
				tool={tool}
				setTool={setTool}
				brushSize={brushSize}
				setBrushSize={setBrushSize}
				zoom={zoom}
				setZoom={setZoom}
				chromaSettings={chromaSettings}
				onChromaSettingsChange={onChromaSettingsChange}
				onApplyChroma={onApplyChroma}
				onApplyAI={onApplyAI}
				isAIProcessing={isAIProcessing}
				onUndo={handleUndo}
				onRedo={handleRedo}
				canUndo={canUndo}
				canRedo={canRedo}
				onDownload={handleDownload}
				exportSizes={exportSizes}
				imageDimensions={imageDimensions}
				isLayer={isLayer}
				hasCropSelection={
					!!completedCrop && completedCrop.width > 0 && completedCrop.height > 0
				}
				onApplyCrop={applyCrop}
			/>

			<div className="flex-1 overflow-auto no-scrollbar checkerboard flex items-center justify-center p-8">
				{imageUrl &&
					(tool === "eraser" ? (
						<div className="relative">
							<div
								role="application"
								className="relative shadow-2xl rounded-xl overflow-hidden ring-1 ring-border/50 transition-transform duration-200"
								style={{
									transform: `scale(${zoom / 100})`,
									transformOrigin: "center",
								}}
								onMouseEnter={() => setShowCursor(true)}
								onMouseLeave={() => setShowCursor(false)}
							>
								<canvas
									ref={canvasRef}
									onMouseDown={startErasing}
									onMouseUp={stopErasing}
									onMouseLeave={stopErasing}
									onMouseMove={(e) => {
										if (cursorRef.current) {
											const rect = e.currentTarget.getBoundingClientRect();
											const x = e.clientX - rect.left;
											const y = e.clientY - rect.top;
											cursorRef.current.style.transform = `translate(${x - brushSize / 2}px, ${y - brushSize / 2}px)`;
										}
										handleEraseMove(e);
									}}
									onTouchStart={startErasing}
									onTouchEnd={stopErasing}
									onTouchMove={handleEraseMove}
									className="max-w-full max-h-[70vh] cursor-none touch-none block"
								/>
								<div
									ref={cursorRef}
									className="pointer-events-none absolute top-0 left-0 border-2 border-primary bg-primary/20 rounded-full"
									style={{
										width: brushSize,
										height: brushSize,
										opacity: showCursor ? 1 : 0,
									}}
								/>
							</div>
							{imageDimensions && (
								<div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
									<span className="text-xs font-mono text-foreground/60 bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border/50 shadow-sm whitespace-nowrap">
										{imageDimensions.width} × {imageDimensions.height}
									</span>
								</div>
							)}
						</div>
					) : (
						<div className="relative">
							<div
								className="relative shadow-2xl rounded-xl ring-1 ring-border/50 transition-transform duration-200"
								style={{
									transform: `scale(${zoom / 100})`,
									transformOrigin: "center",
								}}
							>
								<ReactCrop
									crop={crop}
									onChange={(_: PixelCrop, percentCrop: Crop) =>
										setCrop(percentCrop)
									}
									onComplete={(c: PixelCrop) => setCompletedCrop(c)}
									className="block rounded-xl overflow-hidden"
								>
									<img
										ref={imgRef}
										alt="Edit"
										src={outputUrl}
										className="max-w-full max-h-[70vh] block"
									/>
								</ReactCrop>
							</div>

							{imageDimensions && (
								<div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
									<span className="text-xs font-mono text-foreground/60 bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border/50 shadow-sm whitespace-nowrap">
										{imageDimensions.width} × {imageDimensions.height}
									</span>
								</div>
							)}
						</div>
					))}
			</div>
		</div>
	);
}
