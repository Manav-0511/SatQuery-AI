import React from "react";
import { Globe, Circle } from "lucide-react";

export function Header() {
    return (
        <header className="border-b border-satquery-border pb-6 mb-8 flex justify-between items-start">
            <div className="flex gap-4 items-center">
                <div className="p-3 bg-blue-900/20 rounded-full border border-blue-500/30">
                    <Globe className="text-satquery-cyan w-8 h-8" strokeWidth={1.5} />
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">SatQuery AI</h1>
                        <span className="bg-satquery-primary/20 text-satquery-primary px-3 py-1 rounded-full text-xs font-bold border border-satquery-primary/30 tracking-wider">
                            SIH26167
                        </span>
                    </div>
                    <p className="text-satquery-text-muted mt-1 text-sm">
                        Agentic Vision-Language Assistant for Remote-Sensing Analysis
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="glass-card px-4 py-2 flex flex-col justify-center items-center">
                    <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3 text-satquery-success fill-satquery-success animate-pulse" />
                        <span className="text-sm font-semibold text-satquery-text-main">System Ready</span>
                    </div>
                    <span className="text-xs text-satquery-text-muted mt-1">All services operational</span>
                </div>

                <div className="text-right border-l border-satquery-border pl-6">
                    <p className="text-sm text-satquery-text-main font-medium">From Space Data</p>
                    <p className="text-sm text-satquery-text-main font-medium">to Real-World Insights</p>
                    <p className="text-xs text-satquery-text-muted mt-1">ISRO | SIH 2026</p>
                </div>
            </div>
        </header>
    );
}
