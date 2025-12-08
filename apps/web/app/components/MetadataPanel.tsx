import React, { useState, useEffect } from 'react';

interface MetadataPanelProps {
    context: string[];
    jobDescription: string;
    onUpdate: (context: string[], jobDescription: string) => void;
}

export function MetadataPanel({ context, jobDescription, onUpdate }: MetadataPanelProps) {
    const [localContext, setLocalContext] = useState(context.join('\n'));
    const [localJobDesc, setLocalJobDesc] = useState(jobDescription);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setLocalContext(context.join('\n'));
        setLocalJobDesc(jobDescription);
    }, [context, jobDescription]);

    const handleSave = () => {
        onUpdate(localContext.split('\n').filter(line => line.trim() !== ''), localJobDesc);
    };

    return (
        <div className={`border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ${isOpen ? 'w-80' : 'w-12'}`}>
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title={isOpen ? "Collapse" : "Expand Metadata"}
                >
                    {isOpen ? '→' : '←'}
                </button>
                {isOpen && <h2 className="font-semibold text-gray-700 dark:text-gray-200">Context & Job</h2>}
            </div>

            {isOpen && (
                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-50px)]">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Context (one per line)
                        </label>
                        <textarea
                            value={localContext}
                            onChange={(e) => setLocalContext(e.target.value)}
                            className="w-full h-32 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="Enter context details..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Job Description
                        </label>
                        <textarea
                            value={localJobDesc}
                            onChange={(e) => setLocalJobDesc(e.target.value)}
                            className="w-full h-48 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            placeholder="Paste job description..."
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
}
