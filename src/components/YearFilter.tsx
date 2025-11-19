import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface YearFilterProps {
	years: number[];
	selectedYear?: string;
	onYearChange?: (value: string) => void;
	className?: string;
}

export default function YearFilter({
	years,
	selectedYear = "",
	onYearChange,
	className,
}: YearFilterProps) {
	const handleValueChange = (newValue: string) => {
		const actualValue = newValue === "all" ? "" : newValue;
		if (onYearChange) {
			onYearChange(actualValue);
		}
	};

	return (
		<Select
			value={selectedYear || "all"}
			onValueChange={handleValueChange}
		>
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
}
