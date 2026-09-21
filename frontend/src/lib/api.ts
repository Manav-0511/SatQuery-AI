import { ExecutionResult } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function analyze(query: string, configType: string, files: File[]): Promise<ExecutionResult> {
    const formData = new FormData();
    formData.append("query", query);
    formData.append("input_configuration", JSON.stringify({ type: configType }));
    
    files.forEach(file => {
        formData.append("files", file);
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok && response.status !== 422) {
        throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
}

export async function getRun(runId: string): Promise<ExecutionResult> {
    const response = await fetch(`${API_BASE_URL}/api/v1/runs/${runId}`);
    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
}
