import React from "react";

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
        <div className="flex flex-col gap-3">
            <label htmlFor="query-input" className="text-lg font-semibold text-gray-200">
                Natural-Language Query
            </label>
            <textarea
                id="query-input"
                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[100px]"
                placeholder="Ask a question about the uploaded satellite imagery..."
                value={query}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 self-center">Suggestions:</span>
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => onChange(s)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-3 rounded-full border border-gray-700"
                        aria-label={`Use suggestion: ${s}`}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}
