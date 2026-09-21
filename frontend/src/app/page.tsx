"use client";

import React, { useState } from "react";
import { Header } from "../components/Header";
import { ImageUpload } from "../components/upload/ImageUpload";
import { QueryBox } from "../components/QueryBox";
import { AnalyzeButton } from "../components/AnalyzeButton";
import { ExecutionStatus } from "../components/ExecutionStatus";
import { AnswerPanel } from "../components/AnswerPanel";
import { ExecutionTracePanel } from "../components/ExecutionTrace";
import { ImageEvidenceViewer } from "../components/viewer/ImageEvidenceViewer";
import { CapabilityTags } from "../components/CapabilityTags";
import { analyze } from "../lib/api";
import { ExecutionResult } from "../lib/types";
import { BarChart3, Satellite } from "lucide-react";

export default function Home() {
    const [files, setFiles] = useState<File[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("WAITING");

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
        setStatus("QUEUED");

        let configType = "SINGLE_IMAGE";
        if (files.length === 2) {
            configType = query.toLowerCase().includes("change") ? "BI_TEMPORAL" : "OPTICAL_SAR";
        }

        try {
            setStatus("RUNNING_SPECIALIST");
            const res = await analyze(query, configType, files);
            setResult(res);
            
            if (res.errors && res.errors.length > 0) {
                setError(res.errors.join(", "));
                setStatus(res.errors[0] || "FAILED");
            } else {
                setStatus("COMPLETED");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred connecting to the server.");
            setStatus("INTERNAL_ERROR");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFiles([]);
        setQuery("");
        setResult(null);
        setError(null);
        setStatus("WAITING");
    };

    const isAnalyzeDisabled = files.length === 0 || !query.trim();

    return (
        <main className="min-h-screen p-4 md:p-8 font-sans overflow-x-hidden">
            <div className="max-w-[1920px] mx-auto">
                <Header />

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {/* LEFT COLUMN: Inputs & Controls */}
                    <div className="flex flex-col gap-6">
                        <ImageUpload files={files} onFilesChanged={setFiles} />
                        <QueryBox query={query} onChange={setQuery} />

                        {error && (
                            <div className="bg-satquery-danger/20 border border-satquery-danger text-red-200 p-4 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                {error}
                            </div>
                        )}

                        <AnalyzeButton onAnalyze={handleAnalyze} onClear={handleClear} disabled={isAnalyzeDisabled} loading={loading} />
                    </div>

                    {/* CENTER COLUMN: Analysis Results & Status */}
                    <div className="flex flex-col">
                        <div className="glass-card flex-grow flex flex-col overflow-hidden">
                            {!result?.response && !loading && status === "WAITING" ? (
                                <div className="flex-grow p-6 flex flex-col items-center justify-center text-center">
                                    <div className="flex items-center gap-3 mb-10 w-full border-b border-satquery-border pb-4">
                                        <BarChart3 className="w-5 h-5 text-satquery-cyan" />
                                        <h2 className="text-xl font-bold text-white">Analysis Results</h2>
                                    </div>
                                    
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-satquery-primary/20 blur-[50px] rounded-full"></div>
                                        <Satellite className="w-24 h-24 text-satquery-cyan relative z-10 opacity-80 animate-[pulse_4s_ease-in-out_infinite]" strokeWidth={1} />
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        Upload imagery and ask a question<br />to begin analysis
                                    </h3>
                                    <p className="text-satquery-text-muted max-w-md mx-auto leading-relaxed">
                                        SatQuery AI will understand your query, select the appropriate
                                        specialist model(s), and provide detailed analysis with visual evidence.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col bg-satquery-bg">
                                    {result?.response && <AnswerPanel result={result.response} />}
                                </div>
                            )}

                            {/* Status Panel at the bottom of the center column */}
                            <div className="p-6 bg-satquery-bg mt-auto border-t border-satquery-border">
                                <ExecutionStatus status={status} trace={result?.trace} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Visual Evidence */}
                    <div className="flex flex-col h-[600px] xl:h-auto">
                        <ImageEvidenceViewer files={files} evidence={result?.response?.evidence || []} />
                        <CapabilityTags />
                    </div>
                </div>

                {/* BOTTOM ROW: Execution Trace */}
                {(result?.trace || loading) && (
                    <ExecutionTracePanel steps={result?.trace?.steps || []} />
                )}
            </div>
        </main>
    );
}
