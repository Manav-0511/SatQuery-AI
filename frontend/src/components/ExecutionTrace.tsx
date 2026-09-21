import React from "react";
import { ListTree, Check } from "lucide-react";
import { TraceStep } from "../lib/types";

interface ExecutionTraceProps {
    steps: TraceStep[];
}

export function ExecutionTracePanel({ steps }: ExecutionTraceProps) {
    // Determine the current stage based on trace events
    // Stages: Input Validation (1), Agent Planning (2), Specialist Selection (3), Analysis (4), Evidence (5)
    
    let currentStage = 0;
    let hasError = false;

    if (steps && steps.length > 0) {
        currentStage = 1; // Default to first stage if started
        
        for (const step of steps) {
            if (step.status === "ERROR" || step.status.includes("FAILED")) {
                hasError = true;
            }
            if (step.action === "PLAN_CREATED" || step.action === "PLAN_VALIDATION_COMPLETED") currentStage = Math.max(currentStage, 2);
            if (step.action === "STEP_STARTED") currentStage = Math.max(currentStage, 3);
            if (step.action === "STEP_COMPLETED" && step.details?.capability_id !== "GROUNDING") currentStage = Math.max(currentStage, 4);
            if (step.action === "PLAN_COMPLETED" || (step.action === "STEP_COMPLETED" && step.details?.capability_id === "GROUNDING")) currentStage = Math.max(currentStage, 5);
        }
    }

    const stages = [
        { id: 1, title: "Input Validation", desc: "Validate inputs" },
        { id: 2, title: "Agent Planning", desc: "Understand query" },
        { id: 3, title: "Specialist Selection", desc: "Choose model(s)" },
        { id: 4, title: "Analysis", desc: "Execute inference" },
        { id: 5, title: "Evidence", desc: "Generate visual results" }
    ];

    return (
        <div className="glass-card p-6 mt-8">
            <div className="flex items-center gap-3 mb-6">
                <ListTree className="w-6 h-6 text-satquery-cyan" />
                <div>
                    <h2 className="text-xl font-bold text-white">Execution Trace</h2>
                    <p className="text-satquery-text-muted text-sm">Step-by-step execution flow {currentStage === 0 && "(will appear after analysis)"}</p>
                </div>
            </div>
            
            <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-0 w-full h-[1px] bg-satquery-border z-0"></div>
                
                <div className="relative z-10 flex justify-between">
                    {stages.map((stage) => {
                        const isCompleted = currentStage > stage.id;
                        const isActive = currentStage === stage.id && !hasError;
                        const isError = currentStage === stage.id && hasError;
                        const isPending = currentStage < stage.id;

                        let circleClass = "bg-satquery-bg border border-satquery-border text-satquery-text-muted";
                        if (isCompleted) circleClass = "bg-satquery-success border-satquery-success text-satquery-bg";
                        else if (isActive) circleClass = "bg-satquery-primary border-satquery-cyan text-white shadow-[0_0_15px_rgba(50,212,246,0.5)]";
                        else if (isError) circleClass = "bg-satquery-danger border-satquery-danger text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]";

                        return (
                            <div key={stage.id} className="flex flex-col items-center w-1/5">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-all duration-500 ${circleClass}`}>
                                    {isCompleted ? <Check className="w-5 h-5" /> : stage.id}
                                </div>
                                <div className="text-center">
                                    <p className={`text-sm font-semibold transition-colors ${isActive || isCompleted ? 'text-white' : isError ? 'text-satquery-danger' : 'text-satquery-text-muted'}`}>{stage.title}</p>
                                    <p className="text-xs text-satquery-text-muted mt-1 hidden md:block">{stage.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
