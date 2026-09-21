import React from "react";
import { SpecialistResult } from "../lib/types";

interface AnswerPanelProps {
    result: SpecialistResult;
}

export function AnswerPanel({ result }: AnswerPanelProps) {
    const isMock = result.provenance?.synthetic || result.model.name.includes("test");

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative overflow-hidden">
            {isMock && (
                <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    TEST / DEMO SPECIALIST
                </div>
            )}
            
            <h2 className="text-xl font-bold text-gray-100 mb-4 border-b border-gray-700 pb-2">Analysis Result</h2>
            
            <div className="mb-4">
                <span className="block text-sm text-gray-400 mb-1">Task</span>
                <span className="inline-block bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                    {result.task}
                </span>
            </div>

            <div className="mb-4">
                <span className="block text-sm text-gray-400 mb-1">Answer</span>
                <p className="text-lg text-white font-medium bg-gray-900 p-4 rounded-lg border border-gray-700">
                    {result.answer}
                </p>
            </div>

            <div className="flex flex-wrap gap-8 mb-4 border-b border-gray-700 pb-4">
                <div>
                    <span className="block text-sm text-gray-400 mb-1">Confidence</span>
                    <span className="text-gray-200">
                        {result.confidence !== null && result.confidence !== undefined ? `${(result.confidence * 100).toFixed(1)}%` : "Not provided"}
                    </span>
                </div>
                {result.uncertainty !== undefined && result.uncertainty !== null && (
                    <div>
                        <span className="block text-sm text-gray-400 mb-1">Uncertainty</span>
                        <span className="text-gray-200">
                            {(result.uncertainty * 100).toFixed(1)}%
                        </span>
                    </div>
                )}
                <div>
                    <span className="block text-sm text-gray-400 mb-1">Model</span>
                    <span className="text-gray-200 font-mono text-sm">
                        {result.model.name} v{result.model.version}
                    </span>
                </div>
            </div>
            
            <div>
                <span className="block text-sm text-gray-400 mb-2">Provenance</span>
                <div className="text-xs text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-700 grid grid-cols-2 gap-2">
                    <div><span className="text-gray-500">Real Data:</span> {result.provenance.is_real_data ? "Yes" : "No"}</div>
                    <div><span className="text-gray-500">Synthetic:</span> {result.provenance.synthetic ? "Yes" : "No"}</div>
                    {result.provenance.dataset && <div><span className="text-gray-500">Dataset:</span> {result.provenance.dataset}</div>}
                    {result.provenance.sample_id && <div><span className="text-gray-500">Sample ID:</span> {result.provenance.sample_id}</div>}
                    {result.provenance.metadata && Object.entries(result.provenance.metadata).map(([k, v]) => (
                        <div key={k}><span className="text-gray-500">{k}:</span> {String(v)}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
