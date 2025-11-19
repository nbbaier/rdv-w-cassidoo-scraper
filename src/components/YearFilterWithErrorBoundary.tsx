import { ErrorBoundary } from "./ErrorBoundary";
import YearFilter from "./YearFilter";

interface YearFilterWithErrorBoundaryProps {
	years: number[];
	className?: string;
}

export default function YearFilterWithErrorBoundary({
	years,
	className,
}: YearFilterWithErrorBoundaryProps) {
	return (
		<ErrorBoundary>
			<YearFilter years={years} className={className} />
		</ErrorBoundary>
	);
}
