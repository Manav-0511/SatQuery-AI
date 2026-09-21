import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Maximize2 } from "lucide-react";
import { EvidenceItem } from "../../lib/types";

interface ImageEvidenceViewerProps {
    files: File[];
    evidence: EvidenceItem[];
}

export function ImageEvidenceViewer({ files, evidence }: ImageEvidenceViewerProps) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    
    useEffect(() => {
        const urls = files.map(f => URL.createObjectURL(f));
        setImageUrls(urls);
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    const hasFiles = files.length > 0;
    const hasEvidence = evidence && evidence.length > 0;

    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-satquery-border flex justify-between items-center bg-satquery-bg/50">
                <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-satquery-cyan" />
                    <h2 className="text-lg font-bold text-white">Visual Evidence</h2>
                </div>
                <button className="p-1.5 hover:bg-satquery-card-hover rounded-md text-satquery-text-muted hover:text-white transition-colors" aria-label="Fullscreen">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex-grow relative bg-[#02050A] flex flex-col items-center justify-center min-h-[300px]">
                {/* Subtle map/grid background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(#1E2D4A 1px, transparent 1px), linear-gradient(90deg, #1E2D4A 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}></div>

                {!hasEvidence ? (
                    <div className="text-center z-10 p-6 flex flex-col items-center max-w-md">
                        <div className="w-20 h-20 bg-satquery-card border border-satquery-border rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                            <ImageIcon className="w-10 h-10 text-satquery-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Visual evidence will appear here</h3>
                        <p className="text-satquery-text-muted text-sm">
                            Upload images and run analysis to view satellite imagery, annotations and results.
                        </p>
                    </div>
                ) : (
                    <div className="w-full h-full p-4 relative z-10 flex items-center justify-center">
                        {imageUrls[0] && (
                            <div className="relative max-w-full max-h-full">
                                <img src={imageUrls[0]} alt="Satellite input" className="max-w-full max-h-full object-contain rounded border border-satquery-border shadow-2xl" />
                                {/* Render evidence boxes as simplistic absolute divs for MVP */}
                                {evidence.filter(e => e.type === "BOUNDING_BOX" && e.coordinates).map((item, idx) => {
                                    // Dummy rendering assuming coordinates are [ymin, xmin, ymax, xmax] relative 0-1
                                    const coords = item.coordinates as number[];
                                    if(coords.length === 4) {
                                        const top = `${coords[0]*100}%`;
                                        const left = `${coords[1]*100}%`;
                                        const height = `${(coords[2] - coords[0])*100}%`;
                                        const width = `${(coords[3] - coords[1])*100}%`;
                                        return (
                                            <div key={idx} className="absolute border-2 border-satquery-primary bg-satquery-primary/20" style={{top, left, width, height}}>
                                                {item.label && <span className="absolute -top-5 left-0 bg-satquery-primary text-white text-xs px-1 whitespace-nowrap">{item.label}</span>}
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Scale placeholder */}
                <div className="absolute bottom-4 right-6 flex flex-col items-end opacity-70">
                    <div className="flex gap-4 text-[10px] text-satquery-text-muted mb-1 px-1 w-full justify-between">
                        <span>0</span>
                        <span>25</span>
                        <span>50</span>
                        <span>100 km</span>
                    </div>
                    <div className="w-32 h-[1px] bg-satquery-text-muted relative">
                        <div className="absolute left-0 -top-1 w-[1px] h-2 bg-satquery-text-muted"></div>
                        <div className="absolute left-1/4 -top-1 w-[1px] h-2 bg-satquery-text-muted"></div>
                        <div className="absolute left-2/4 -top-1 w-[1px] h-2 bg-satquery-text-muted"></div>
                        <div className="absolute right-0 -top-1 w-[1px] h-2 bg-satquery-text-muted"></div>
                    </div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 glass-card p-3 flex flex-col gap-2">
                    <LegendItem color="bg-satquery-primary" label="Bounding Box" />
                    <LegendItem color="bg-satquery-success" label="Detected Region" />
                    <LegendItem color="bg-satquery-danger" label="Change Area" />
                    <LegendItem color="bg-satquery-warning" label="Reference Area" />
                </div>

                {/* Screen reader / test support for evidence items */}
                {hasEvidence && (
                    <div className="sr-only">
                        <ul>
                            {evidence.map((item, idx) => (
                                <li key={idx}>
                                    {item.type} {item.label ? `- ${item.label}` : ''}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-xs text-satquery-text-muted">{label}</span>
        </div>
    );
}
