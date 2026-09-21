import React, { useState } from "react";
import { TraceStep } from "../lib/types";

interface ExecutionTraceProps {
    steps: TraceStep[];
    totalTimeMs: number;
}

export function ExecutionTracePanel({ steps, totalTimeMs }: ExecutionTraceProps) {
    const [expanded, setExpanded] = useState(false);

    if (!steps || steps.length === 0) return null;

    return (
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden mt-4">
            <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
                aria-expanded={expanded}
            >
                <h3 className="text-lg font-semibold text-gray-200">Execution Trace</h3>
                <span className="text-gray-400 font-mono text-sm">
                    {totalTimeMs}ms {expanded ? "▲" : "▼"}
                </span>
            </button>
            
            {expanded && (
                <div className="p-4 bg-gray-900 font-mono text-sm">
                    <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        {steps.map((step, index) => (
                            <li key={index} className="flex justify-between items-start border-b border-gray-800 pb-2">
                                <div>
                                    <span className="font-bold text-gray-400 mr-2">[{step.component}]</span>
                                    <span className="text-gray-100">{step.action}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                    step.status.includes("FAILED") || step.status.includes("ERROR") 
                                        ? "bg-red-900 text-red-200" 
                                        : "bg-green-900 text-green-200"
                                }`}>
                                    {step.status}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
