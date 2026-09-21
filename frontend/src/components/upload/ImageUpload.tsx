import React, { useCallback, useState } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";

interface ImageUploadProps {
    files: File[];
    onFilesChanged: (files: File[]) => void;
}

export function ImageUpload({ files, onFilesChanged }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFiles = Array.from(e.dataTransfer.files);
            addFiles(droppedFiles);
        },
        [files]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const validExtensions = ["image/tiff", "image/png", "image/jpeg", "image/jpg"];
        const validFiles = newFiles.filter(f => validExtensions.includes(f.type) || f.name.endsWith(".tif") || f.name.endsWith(".tiff"));
        const combined = [...files, ...validFiles].slice(0, 2); // Max 2
        onFilesChanged(combined);
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChanged(newFiles);
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-satquery-primary flex items-center justify-center text-white font-bold text-sm">
                    1
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Input Section</h2>
                    <p className="text-satquery-text-muted text-sm">Upload satellite imagery (up to 2 images)</p>
                </div>
            </div>

            <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-satquery-cyan bg-satquery-cyan/5' : 'border-satquery-border hover:border-satquery-cyan/50 hover:bg-satquery-card-hover'}`}
            >
                <UploadCloud className="w-10 h-10 text-satquery-cyan mb-3" />
                <p className="text-white font-medium mb-1">Drag & drop satellite images here</p>
                <p className="text-satquery-text-muted text-sm mb-5">(up to 2 images)</p>
                
                <input 
                    type="file" 
                    multiple 
                    accept=".tif,.tiff,.png,.jpg,.jpeg" 
                    onChange={handleChange} 
                    className="hidden" 
                    id="file-upload"
                    aria-label="Upload satellite images"
                />
                <label htmlFor="file-upload" className="bg-gradient-to-r from-satquery-primary to-blue-500 hover:from-satquery-primary-hover hover:to-blue-400 text-white font-semibold py-2 px-8 rounded-lg cursor-pointer shadow-lg transition-all active:scale-95">
                    Browse Files
                </label>
                
                <p className="text-satquery-text-muted text-xs mt-6 mt-4">Supports JPG, PNG, TIFF | Optical, SAR | Max 20MB each</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
                {[0, 1].map((index) => {
                    const file = files[index];
                    return (
                        <div key={index} className={`border rounded-lg p-3 flex items-center gap-3 ${file ? 'border-satquery-border bg-satquery-card' : 'border-satquery-border/50 bg-transparent opacity-60 border-dashed'}`}>
                            <div className="w-10 h-10 rounded bg-satquery-bg border border-satquery-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                {file ? (
                                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-satquery-text-muted" />
                                )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="text-sm font-medium text-white truncate">Image {index + 1}</p>
                                <p className="text-xs text-satquery-text-muted truncate">
                                    {file ? file.name : "Not selected"}
                                </p>
                            </div>
                            {file && (
                                <button 
                                    onClick={() => removeFile(index)}
                                    className="text-satquery-text-muted hover:text-satquery-danger transition-colors p-1"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
