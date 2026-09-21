import React, { useState, useEffect } from "react";
import { EvidenceItem } from "../../lib/types";

interface ImageEvidenceViewerProps {
    files: File[];
    evidence: EvidenceItem[];
}

export function ImageEvidenceViewer({ files, evidence }: ImageEvidenceViewerProps) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    
    // We only support 1-2 files based on our upload limits
    useEffect(() => {
        const urls = files.map(f => URL.createObjectURL(f));
        setImageUrls(urls);
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    if (files.length === 0) return null;

    const hasEvidence = evidence && evidence.length > 0;

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-100 mb-4 border-b border-gray-700 pb-2">Visual Evidence</h2>
            
            <div className="flex-grow flex flex-col items-center justify-center bg-gray-900 rounded-lg overflow-hidden border border-gray-700 relative min-h-[300px]">
                {/* For MVP, just display the first uploaded image as a placeholder for the viewer */}
                {imageUrls[0] ? (
                    <img src={imageUrls[0]} alt="Satellite input" className="max-w-full max-h-full object-contain opacity-75" />
                ) : (
                    <div className="text-gray-500">Image Preview Not Available</div>
                )}
                
                {/* Overlay Evidence Status */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {!hasEvidence && (
                        <div className="bg-black/70 text-gray-200 px-6 py-3 rounded-lg backdrop-blur-sm border border-gray-600 shadow-xl">
                            No spatial evidence was provided by the specialist.
                        </div>
                    )}
                </div>
            </div>
            
            {hasEvidence && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Evidence Items</h3>
                    <ul className="space-y-2">
                        {evidence.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-200 flex justify-between bg-gray-800 p-2 rounded">
                                <span><span className="font-mono text-blue-400">{item.type}</span> {item.label ? `- ${item.label}` : ''}</span>
                                {item.coordinate_space && <span className="text-gray-500">Space: {item.coordinate_space}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
