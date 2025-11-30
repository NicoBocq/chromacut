import { ImagePlus, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface DropzoneProps {
	onDrop: (files: File[]) => void;
	compact?: boolean;
}

export function Dropzone({ onDrop, compact = true }: DropzoneProps) {
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".webp"],
		},
	});

	if (compact) {
		return (
			<div
				{...getRootProps()}
				className={cn(
					"group flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed cursor-pointer",
					"transition-all duration-200 ease-out",
					isDragActive
						? "border-primary bg-primary/10 text-primary scale-[1.02]"
						: "border-border hover:border-primary/50 hover:bg-accent/50 text-muted-foreground hover:text-foreground",
				)}
			>
				<input {...getInputProps()} />
				<ImagePlus
					className={cn(
						"w-4 h-4 transition-transform duration-200",
						isDragActive ? "scale-110" : "group-hover:scale-110",
					)}
				/>
				<span className="text-sm font-medium">
					{isDragActive ? "Drop here" : "Add images"}
				</span>
			</div>
		);
	}

	return (
		<div
			{...getRootProps()}
			className={cn(
				"group relative flex flex-col items-center justify-center gap-6 p-12 rounded-2xl cursor-pointer",
				"transition-all duration-300 ease-out max-w-md overflow-hidden",
				isDragActive ? "scale-[1.02]" : "hover:scale-[1.01]",
			)}
		>
			<input {...getInputProps()} />

			<div
				className={cn(
					"absolute inset-0 rounded-2xl border-2 border-dashed transition-colors duration-300",
					isDragActive
						? "border-primary animate-border-dance"
						: "border-border group-hover:border-primary/50",
				)}
			/>

			<div
				className={cn(
					"absolute inset-0 rounded-2xl transition-opacity duration-500",
					isDragActive
						? "opacity-100 bg-primary/5 shadow-[inset_0_0_60px_rgba(16,185,129,0.15)]"
						: "opacity-0 group-hover:opacity-100 group-hover:bg-primary/5",
				)}
			/>

			<div className="relative">
				<div
					className={cn(
						"absolute inset-0 rounded-2xl blur-xl transition-all duration-500",
						isDragActive
							? "bg-primary/40 scale-150"
							: "bg-primary/0 group-hover:bg-primary/20 group-hover:scale-125",
					)}
				/>
				<div
					className={cn(
						"relative p-5 rounded-2xl transition-all duration-300",
						isDragActive
							? "bg-primary/20 scale-110"
							: "bg-muted/80 group-hover:bg-primary/10 group-hover:scale-105",
					)}
				>
					<Upload
						className={cn(
							"w-10 h-10 transition-all duration-300",
							isDragActive
								? "text-primary scale-110"
								: "text-muted-foreground group-hover:text-primary",
						)}
					/>
				</div>
			</div>

			<div className="relative text-center space-y-2">
				<p
					className={cn(
						"text-lg font-semibold transition-colors duration-200",
						isDragActive ? "text-primary" : "text-foreground",
					)}
				>
					{isDragActive ? "Release to upload" : "Drop images here"}
				</p>
				<p className="text-sm text-muted-foreground">
					or{" "}
					<span className="text-primary font-medium underline-offset-2 group-hover:underline">
						browse files
					</span>
				</p>
			</div>

			<div className="relative flex items-center gap-2">
				{["PNG", "JPG", "WebP"].map((format) => (
					<span
						key={format}
						className={cn(
							"px-2 py-0.5 rounded text-[10px] font-medium transition-colors duration-200",
							isDragActive
								? "bg-primary/20 text-primary"
								: "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary/80",
						)}
					>
						{format}
					</span>
				))}
			</div>
		</div>
	);
}
