import React from "react";
import { Info, Database, Beaker, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";
import { SpecialistResult } from "../lib/types";

interface AnswerPanelProps {
    result: SpecialistResult;
}

export function AnswerPanel({ result }: AnswerPanelProps) {
    const isMock = result.provenance?.synthetic || result.model.name.includes("test");

    return (
        <div className="glass-card flex flex-col overflow-hidden">
            <div className="p-4 border-b border-satquery-border flex justify-between items-center bg-satquery-bg/50">
                <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-satquery-cyan" />
                    <h2 className="text-lg font-bold text-white">Analysis Result</h2>
                </div>
                {isMock && (
                    <div className="bg-satquery-warning/20 text-satquery-warning text-xs font-bold px-3 py-1 rounded-full border border-satquery-warning/30 flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3" />
                        TEST / DEMO
                    </div>
                )}
            </div>
            
            <div className="p-6 flex flex-col gap-6">
                <div>
                    <h3 className="text-sm font-semibold text-satquery-text-muted mb-2 uppercase tracking-wider">Answer</h3>
                    <div className="bg-satquery-bg border border-satquery-border rounded-xl p-5 shadow-inner">
                        <p className="text-xl text-white font-medium leading-relaxed">
                            {result.answer}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBox label="Task" value={result.task} icon={<CheckCircle2 className="w-4 h-4 text-satquery-success" />} />
                    <StatBox 
                        label="Confidence" 
                        value={result.confidence !== null && result.confidence !== undefined ? `${(result.confidence * 100).toFixed(1)}%` : "N/A"} 
                        icon={<span className="text-satquery-cyan font-bold">%</span>} 
                    />
                    {result.uncertainty !== undefined && result.uncertainty !== null && (
                        <StatBox 
                            label="Uncertainty" 
                            value={`${(result.uncertainty * 100).toFixed(1)}%`} 
                            icon={<span className="text-satquery-warning font-bold">±</span>} 
                        />
                    )}
                    <StatBox 
                        label="Model" 
                        value={`${result.model.name} v${result.model.version}`} 
                        icon={<Cpu className="w-4 h-4 text-satquery-primary" />} 
                    />
                </div>
                
                {result.provenance && (
                    <div>
                        <h3 className="text-sm font-semibold text-satquery-text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Database className="w-4 h-4" /> Provenance
                        </h3>
                        <div className="bg-satquery-bg border border-satquery-border p-4 rounded-xl grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <ProvenanceItem label="Real Data" value={result.provenance.is_real_data ? "Yes" : "No"} />
                            <ProvenanceItem label="Synthetic" value={result.provenance.synthetic ? "Yes" : "No"} />
                            {result.provenance.dataset && <ProvenanceItem label="Dataset" value={result.provenance.dataset} />}
                            {result.provenance.sample_id && <ProvenanceItem label="Sample ID" value={result.provenance.sample_id} />}
                            {result.provenance.metadata && Object.entries(result.provenance.metadata).map(([k, v]) => (
                                <ProvenanceItem key={k} label={k} value={String(v)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value, icon }: { label: string, value: React.ReactNode, icon: React.ReactNode }) {
    return (
        <div className="bg-satquery-bg border border-satquery-border p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-satquery-text-muted">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-lg font-bold text-white truncate" title={String(value)}>{value}</span>
        </div>
    );
}

function ProvenanceItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center border-b border-satquery-border/50 pb-1 last:border-0 last:pb-0">
            <span className="text-satquery-text-muted">{label}</span>
            <span className="text-white font-medium text-right truncate max-w-[60%]" title={value}>{value}</span>
        </div>
    );
}
