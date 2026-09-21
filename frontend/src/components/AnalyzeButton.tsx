import React from "react";

interface AnalyzeButtonProps {
    onClick: () => void;
    disabled: boolean;
    loading: boolean;
}

export function AnalyzeButton({ onClick, disabled, loading }: AnalyzeButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            aria-label="Analyze imagery"
            className={`w-full py-4 text-xl font-bold rounded-lg shadow-lg transition-all ${
                disabled || loading
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/50 hover:shadow-blue-500/70"
            }`}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                </span>
            ) : (
                "Analyze"
            )}
        </button>
    );
}
