import React from "react";

interface AnalysisStatusProps {
    status: string;
}

export function AnalysisStatus({ status }: AnalysisStatusProps) {
    if (!status) return null;

    const friendlyStatus: Record<string, string> = {
        "QUEUED": "Queued",
        "VALIDATING_INPUT": "Validating input",
        "INTERPRETING_QUERY": "Understanding query",
        "PLANNING": "Planning",
        "RUNNING_SPECIALIST": "Running specialist",
        "GENERATING_EVIDENCE": "Generating evidence",
        "COMPLETED": "Completed"
    };

    // If it's a recognized lifecycle status, use the friendly name, otherwise show it directly (might be an error like VALIDATION_FAILED)
    const displayStatus = friendlyStatus[status] || status;

    const isError = status.includes("FAILED") || status.includes("ERROR") || status.includes("UNAVAILABLE") || status === "NO_INPUT" || status === "EMPTY_QUERY";

    return (
        <div className={`p-4 rounded-lg font-mono text-sm border ${isError ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
            <span className="font-bold">Status:</span> {displayStatus}
        </div>
    );
}
