import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-8 w-8"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
		>
			{theme === "dark" ? (
				<Sun className="h-4 w-4" />
			) : (
				<Moon className="h-4 w-4" />
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
