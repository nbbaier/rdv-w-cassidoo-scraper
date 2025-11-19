import { useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface YearFilterProps {
	years: number[];
	onValueChange?: (value: string) => void;
	className?: string;
}

export default function YearFilter({
	years,
	onValueChange,
	className,
}: YearFilterProps) {
	useEffect(() => {
		console.log("YearFilter mounted");
		return () => {
			console.log("YearFilter unmounting");
		};
	}, []);

	useEffect(() => {
		console.log("YearFilter: years prop changed", years.length);
	}, [years]);

	const handleValueChange = (newValue: string) => {
		console.log("YearFilter: value changed to", newValue);
		const actualValue = newValue === "all" ? "" : newValue;

		if (onValueChange) {
			onValueChange(actualValue);
		}
		const hiddenSelect = document.getElementById(
			"year-filter",
		) as HTMLSelectElement;
		if (hiddenSelect) {
			hiddenSelect.value = actualValue;
			hiddenSelect.dispatchEvent(new Event("change", { bubbles: true }));
		}
	};

	try {
		return (
			<Select defaultValue="all" onValueChange={handleValueChange}>
				<SelectTrigger className={className}>
					<SelectValue placeholder="All Years" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Years</SelectItem>
					{years.map((year) => (
						<SelectItem key={year} value={String(year)}>
							{year}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	} catch (error) {
		console.error("YearFilter render error:", error);
		throw error;
	}
}
