import React, { useCallback, useState } from "react";

interface ImageUploadProps {
    files: File[];
    onFilesChanged: (files: File[]) => void;
}

export function ImageUpload({ files, onFilesChanged }: ImageUploadProps) {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
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
        <div className="flex flex-col gap-4">
            <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:bg-gray-800 transition-colors"
            >
                <p className="text-gray-300 mb-4">Drag and drop up to 2 images here, or click to select</p>
                <input 
                    type="file" 
                    multiple 
                    accept=".tif,.tiff,.png,.jpg,.jpeg" 
                    onChange={handleChange} 
                    className="hidden" 
                    id="file-upload"
                    aria-label="Upload satellite images"
                />
                <label htmlFor="file-upload" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded cursor-pointer">
                    Browse Files
                </label>
            </div>

            {files.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-gray-200">Uploaded Inputs</h3>
                    {files.map((file, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                            <div>
                                <span className="font-bold text-gray-200">Input {index + 1}: </span>
                                <span className="text-gray-400">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <button 
                                onClick={() => removeFile(index)}
                                className="text-red-400 hover:text-red-300 px-2 py-1"
                                aria-label={`Remove ${file.name}`}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
