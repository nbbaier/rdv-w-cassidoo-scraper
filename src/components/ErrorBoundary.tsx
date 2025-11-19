import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="p-2 border border-red-300 bg-red-50 rounded text-red-700 text-sm">
						<p>Error loading component: {this.state.error?.message}</p>
						<button
							type="button"
							onClick={() => this.setState({ hasError: false, error: null })}
							className="mt-2 px-2 py-1 bg-red-200 rounded text-xs"
						>
							Retry
						</button>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
