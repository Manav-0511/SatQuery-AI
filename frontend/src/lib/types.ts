export type TaskType = "VQA" | "GROUNDING" | "CHANGE" | "OPTICAL_SAR" | "UNKNOWN";
export type RunStatus = "QUEUED" | "VALIDATING_INPUT" | "INTERPRETING_QUERY" | "PLANNING" | "RUNNING_SPECIALIST" | "GENERATING_EVIDENCE" | "COMPLETED";
export type FailureStatus = "VALIDATION_FAILED" | "UNSUPPORTED_TASK" | "SPECIALIST_UNAVAILABLE" | "SPECIALIST_FAILED" | "EVIDENCE_FAILED" | "INTERNAL_ERROR" | "EMPTY_QUERY" | "NO_INPUT" | "INVALID_INPUT_COUNT" | "UNSUPPORTED_FORMAT" | "INVALID_CONFIGURATION" | "MISSING_MODALITY" | "TEMPORAL_PAIR_REQUIRED" | "OPTICAL_SAR_PAIR_REQUIRED" | "UNSUPPORTED_TASK_CONFIGURATION";

export type EvidenceType = "TEXT" | "BOUNDING_BOX" | "POLYGON" | "MASK" | "CHANGE_MAP" | "POINT";
export type CoordinateSpace = "PIXEL" | "NORMALIZED" | "GEO";

export interface ModelInfo {
    name: string;
    version: string;
}

export interface Provenance {
    dataset?: string;
    sample_id?: string;
    synthetic: boolean;
    is_real_data: boolean;
    file_hash?: string;
    metadata?: Record<string, any>;
}

export interface EvidenceItem {
    type: EvidenceType;
    coordinates?: number[];
    coordinate_space?: CoordinateSpace;
    label?: string;
    score?: number;
    mask_url?: string;
}

export interface SpecialistResult {
    status: string;
    task: TaskType;
    answer: string;
    model: ModelInfo;
    confidence: number | null;
    evidence: EvidenceItem[];
    provenance: Provenance;
}

export interface TraceStep {
    step: string;
    action: string;
    component: string;
    status: string;
    details: Record<string, any>;
}

export interface ExecutionTrace {
    run_id: string;
    steps: TraceStep[];
    total_time_ms: number;
}

export interface ExecutionResult {
    run_id: string;
    status: RunStatus | FailureStatus | string;
    response?: SpecialistResult;
    trace: ExecutionTrace;
    errors: string[];
    timings: Record<string, any>;
}
