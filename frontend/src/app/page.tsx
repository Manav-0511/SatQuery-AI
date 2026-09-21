"use client";

import React, { useState } from "react";
import { ImageUpload } from "../components/upload/ImageUpload";
import { QueryBox } from "../components/QueryBox";
import { AnalyzeButton } from "../components/AnalyzeButton";
import { AnalysisStatus } from "../components/AnalysisStatus";
import { AnswerPanel } from "../components/AnswerPanel";
import { ExecutionTracePanel } from "../components/ExecutionTrace";
import { ImageEvidenceViewer } from "../components/viewer/ImageEvidenceViewer";
import { analyze } from "../lib/api";
import { ExecutionResult } from "../lib/types";

export default function Home() {
    const [files, setFiles] = useState<File[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (files.length === 0) {
            setError("Upload at least one image.");
            return;
        }
        if (!query.trim()) {
            setError("Enter a question.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        let configType = "SINGLE_IMAGE";
        if (files.length === 2) {
            // Simplistic default for MVP frontend; the backend will re-validate anyway
            configType = query.toLowerCase().includes("change") ? "BI_TEMPORAL" : "OPTICAL_SAR";
        }

        try {
            const res = await analyze(query, configType, files);
            setResult(res);
            if (res.errors && res.errors.length > 0) {
                // Keep the result to show trace, but also display error message
                setError(res.errors.join(", "));
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred connecting to the server.");
        } finally {
            setLoading(false);
        }
    };

    const isAnalyzeDisabled = files.length === 0 || !query.trim();

    return (
        <main className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* HEADER */}
                <header className="border-b border-gray-800 pb-6 mb-8">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">SatQuery AI</h1>
                    <p className="text-xl text-gray-400">Agentic Vision-Language Assistant for Remote-Sensing Analysis</p>
                    <div className="mt-4 inline-block bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold tracking-wider">
                        SIH26167
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Inputs & Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Input Section</h2>
                            <ImageUpload files={files} onFilesChanged={setFiles} />
                        </div>

                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Query Section</h2>
                            <QueryBox query={query} onChange={setQuery} />
                        </div>

                        {error && (
                            <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg">
                                {error}
                            </div>
                        )}

                        <AnalyzeButton onClick={handleAnalyze} disabled={isAnalyzeDisabled} loading={loading} />
                        
                        {result && <AnalysisStatus status={result.status} />}
                    </div>

                    {/* RIGHT COLUMN: Results & Viewer */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
                        
                        {/* Results Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-grow">
                            <div className="flex flex-col gap-6">
                                {result?.response ? (
                                    <AnswerPanel result={result.response} />
                                ) : (
                                    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 flex items-center justify-center text-gray-500 h-full min-h-[300px]">
                                        Submit a query to view analysis results.
                                    </div>
                                )}
                            </div>
                            
                            <div className="h-full">
                                {result?.response ? (
                                    <ImageEvidenceViewer files={files} evidence={result.response.evidence} />
                                ) : (
                                    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 flex items-center justify-center text-gray-500 h-full min-h-[300px]">
                                        Visual evidence will appear here.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Execution Trace */}
                        {result?.trace && (
                            <ExecutionTracePanel steps={result.trace.steps} totalTimeMs={result.trace.total_time_ms} />
                        )}

                    </div>
                </div>

            </div>
        </main>
    );
}
