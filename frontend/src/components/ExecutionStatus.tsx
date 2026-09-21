import React from "react";
import { Activity, User, Settings, Loader2 } from "lucide-react";
// No type imports needed here that are used as values

export function ExecutionStatus({ status, trace }: { status: string, trace?: any }) {
    // Derive state from status and trace
    const isCompleted = status === "COMPLETED";
    
    // Array of failure statuses instead of Object.values on a type
    const failureStatuses = [
        "VALIDATION_FAILED", "UNSUPPORTED_TASK", "SPECIALIST_UNAVAILABLE", 
        "SPECIALIST_FAILED", "EVIDENCE_FAILED", "INTERNAL_ERROR", 
        "EMPTY_QUERY", "NO_INPUT", "INVALID_INPUT_COUNT", "UNSUPPORTED_FORMAT", 
        "INVALID_CONFIGURATION", "MISSING_MODALITY", "TEMPORAL_PAIR_REQUIRED", 
        "OPTICAL_SAR_PAIR_REQUIRED", "UNSUPPORTED_TASK_CONFIGURATION"
    ];
    
    const isFailed = failureStatuses.includes(status);
    const isRunning = !isCompleted && !isFailed && status !== "QUEUED" && status !== "WAITING";

    let agentText = "-";
    let capabilityText = "-";
    let statusText = "Waiting for input...";

    if (isRunning) {
        statusText = "Processing";
        agentText = "Executing";
    } else if (isCompleted) {
        statusText = "Completed";
        agentText = "Finished";
    } else if (isFailed) {
        statusText = "Failed";
        agentText = "Error";
    }

    if (trace && trace.steps) {
        const lastStep = trace.steps[trace.steps.length - 1];
        if (lastStep && lastStep.details?.rationale) {
            agentText = "Selected specialist";
        }
        
        // Find capability step
        const capabilityStep = trace.steps.find((s: any) => s.details?.capability_id);
        if (capabilityStep) {
            capabilityText = capabilityStep.details.capability_id;
        }
    }

    return (
        <div className="glass-card mt-6 p-5">
            <div className="flex items-center gap-2 mb-4 text-satquery-cyan border-b border-satquery-border pb-3">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Execution Status</h3>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-satquery-text-main">
                        <User className="w-4 h-4 text-satquery-text-muted" />
                        <span className="text-sm">Agent</span>
                    </div>
                    <span className="text-sm font-medium">{agentText}</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-satquery-text-main">
                        <Settings className="w-4 h-4 text-satquery-text-muted" />
                        <span className="text-sm">Selected Capability</span>
                    </div>
                    <span className="text-sm font-medium text-satquery-text-muted">{capabilityText === "-" ? "Not selected" : capabilityText}</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-satquery-text-main">
                        {isRunning ? (
                            <Loader2 className="w-4 h-4 text-satquery-cyan animate-spin" />
                        ) : (
                            <Circle className={`w-4 h-4 ${isCompleted ? "text-satquery-success" : isFailed ? "text-satquery-danger" : "text-satquery-text-muted"}`} />
                        )}
                        <span className="text-sm">Processing Status</span>
                    </div>
                    <span className={`text-sm font-medium ${isCompleted ? "text-satquery-success" : isFailed ? "text-satquery-danger" : ""}`}>
                        {statusText}
                    </span>
                </div>
            </div>
        </div>
    );
}

function Circle({ className }: { className: string }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle></svg>;
}
