import React from "react";
import { Search, Sparkles } from "lucide-react";

interface QueryBoxProps {
    query: string;
    onChange: (q: string) => void;
}

export function QueryBox({ query, onChange }: QueryBoxProps) {
    const suggestions = [
        "Is there water in this image?",
        "Where is the water body?",
        "What changed between these two images?",
        "Use optical and SAR images together to identify built-up areas."
    ];

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-satquery-primary flex items-center justify-center text-white font-bold text-sm">
                    2
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Query Section</h2>
                    <p className="text-satquery-text-muted text-sm">Natural-Language Query</p>
                </div>
            </div>

            <div className="relative">
                <textarea
                    id="query-input"
                    className="w-full p-4 bg-satquery-bg border border-satquery-border rounded-xl text-white placeholder-satquery-text-muted focus:outline-none focus:border-satquery-cyan focus:ring-1 focus:ring-satquery-cyan transition-colors min-h-[120px] resize-none"
                    placeholder="Ask a question about the uploaded satellite imagery..."
                    value={query}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={500}
                />
                <div className="absolute bottom-3 right-4 text-xs text-satquery-text-muted">
                    {query.length}/500
                </div>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-satquery-cyan" />
                    <span className="text-sm font-semibold text-satquery-text-main">Suggested Questions</span>
                </div>
                <div className="flex flex-col gap-2">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => onChange(s)}
                            className="text-left text-xs bg-satquery-bg hover:bg-satquery-border text-satquery-text-main py-2 px-3 rounded-lg border border-satquery-border flex items-center gap-2 transition-colors"
                            aria-label={`Use suggestion: ${s}`}
                        >
                            <Search className="w-3 h-3 text-satquery-cyan" />
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
