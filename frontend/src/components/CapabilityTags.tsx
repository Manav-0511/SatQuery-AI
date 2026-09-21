import React from "react";
import { Settings, Maximize, Clock, MessageSquare, MapPin } from "lucide-react";

export function CapabilityTags() {
    return (
        <div className="mt-8">
            <h3 className="text-sm font-semibold text-satquery-text-main mb-3">Supported Modalities & Capabilities</h3>
            <div className="flex flex-wrap gap-3">
                <Tag icon={<Settings className="w-4 h-4" />} label="Optical" color="blue" />
                <Tag icon={<Maximize className="w-4 h-4" />} label="SAR" color="blue" />
                <Tag icon={<Clock className="w-4 h-4" />} label="Temporal" color="purple" />
                <Tag icon={<MessageSquare className="w-4 h-4" />} label="VQA" color="cyan" />
                <Tag icon={<MapPin className="w-4 h-4" />} label="Grounding" color="green" />
            </div>
        </div>
    );
}

function Tag({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-400 border-blue-500/30 bg-blue-900/20",
        purple: "text-purple-400 border-purple-500/30 bg-purple-900/20",
        cyan: "text-satquery-cyan border-satquery-cyan/30 bg-satquery-cyan/10",
        green: "text-satquery-success border-satquery-success/30 bg-satquery-success/10",
    };
    
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide ${colorClasses[color]}`}>
            {icon}
            {label}
        </div>
    );
}
