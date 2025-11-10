import React, { useState } from 'react';

interface PromptEditorProps {
    promptKey: string;
    initialValue: string;
    onSave: (promptKey: string, newValue: string) => void;
    onCancel: () => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ promptKey, initialValue, onSave, onCancel }) => {
    const [value, setValue] = useState(initialValue);

    const handleSave = () => {
        onSave(promptKey, value);
    };

    return (
        <div className="flex flex-col h-full p-4 bg-slate-950">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Prompt: <span className="font-mono text-teal-400">{promptKey}</span></h3>
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Prompt Editor"
            />
            <div className="flex justify-end gap-4 mt-4">
                <button
                    onClick={onCancel}
                    className="py-2 px-4 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="py-2 px-4 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-colors"
                >
                    Save Prompt
                </button>
            </div>
        </div>
    );
};

export default PromptEditor;
