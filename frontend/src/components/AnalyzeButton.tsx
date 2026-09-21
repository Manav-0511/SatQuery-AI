import React from "react";
import { Play, Trash2, Loader2 } from "lucide-react";

interface AnalyzeButtonProps {
    onAnalyze: () => void;
    onClear: () => void;
    disabled: boolean;
    loading: boolean;
}

export function AnalyzeButton({ onAnalyze, onClear, disabled, loading }: AnalyzeButtonProps) {
    return (
        <div className="flex gap-3">
            <button
                onClick={onAnalyze}
                disabled={disabled || loading}
                aria-label="Analyze imagery"
                className={`flex-grow py-3 flex items-center justify-center gap-2 font-bold rounded-lg shadow-lg transition-all ${
                    disabled || loading
                        ? "bg-satquery-bg text-satquery-text-muted border border-satquery-border cursor-not-allowed"
                        : "bg-gradient-to-r from-satquery-primary to-blue-500 hover:from-satquery-primary-hover hover:to-blue-400 text-white shadow-blue-500/50 hover:shadow-blue-500/70 active:scale-[0.98]"
                }`}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Play className="w-5 h-5 fill-current" />
                        Analyze
                    </>
                )}
            </button>
            <button
                onClick={onClear}
                disabled={loading}
                aria-label="Clear inputs"
                className="px-6 py-3 flex items-center justify-center gap-2 font-semibold bg-satquery-bg border border-satquery-border text-satquery-text-main hover:bg-satquery-card-hover hover:text-white rounded-lg transition-colors active:scale-[0.98]"
            >
                <Trash2 className="w-4 h-4" />
                Clear
            </button>
        </div>
    );
}
