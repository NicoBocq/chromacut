export interface ProcessedImage {
	original: File;
	processedBlob: Blob;
	processedUrl: string;
}

export interface ChromaKeyOptions {
	color: string; // hex color like "#00ff00"
	tolerance: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: { r: 0, g: 255, b: 0 };
}

export async function removeColorBackground(
	file: File,
	options: ChromaKeyOptions,
): Promise<Blob> {
	const { color, tolerance } = options;
	const targetColor = hexToRgb(color);

	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			const ctx = canvas.getContext("2d", { willReadFrequently: true });
			if (!ctx) {
				URL.revokeObjectURL(url);
				reject(new Error("Could not get canvas context"));
				return;
			}

			ctx.drawImage(img, 0, 0);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			const toleranceSquared = tolerance * tolerance;
			const tr = targetColor.r;
			const tg = targetColor.g;
			const tb = targetColor.b;

			for (let i = 0; i < data.length; i += 4) {
				const dr = data[i] - tr;
				const dg = data[i + 1] - tg;
				const db = data[i + 2] - tb;

				if (dr * dr + dg * dg + db * db <= toleranceSquared) {
					data[i + 3] = 0;
				}
			}

			ctx.putImageData(imageData, 0, 0);

			canvas.toBlob((blob) => {
				URL.revokeObjectURL(url);
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Could not create blob from canvas"));
				}
			}, "image/png");
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("Failed to load image"));
		};

		img.src = url;
	});
}

// Process from URL (for default/static images)
export async function removeColorFromUrl(
	imageUrl: string,
	options: ChromaKeyOptions,
): Promise<Blob> {
	const { color, tolerance } = options;
	const targetColor = hexToRgb(color);

	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			const ctx = canvas.getContext("2d", { willReadFrequently: true });
			if (!ctx) {
				reject(new Error("Could not get canvas context"));
				return;
			}

			ctx.drawImage(img, 0, 0);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			const toleranceSquared = tolerance * tolerance;
			const tr = targetColor.r;
			const tg = targetColor.g;
			const tb = targetColor.b;

			for (let i = 0; i < data.length; i += 4) {
				const dr = data[i] - tr;
				const dg = data[i + 1] - tg;
				const db = data[i + 2] - tb;

				if (dr * dr + dg * dg + db * db <= toleranceSquared) {
					data[i + 3] = 0;
				}
			}

			ctx.putImageData(imageData, 0, 0);

			canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Could not create blob from canvas"));
				}
			}, "image/png");
		};

		img.onerror = () => {
			reject(new Error("Failed to load image"));
		};

		img.src = imageUrl;
	});
}

// Legacy function for backward compatibility
export async function removeGreenBackground(
	file: File,
	tolerance: number = 50,
): Promise<Blob> {
	return removeColorBackground(file, { color: "#00ff00", tolerance });
}
