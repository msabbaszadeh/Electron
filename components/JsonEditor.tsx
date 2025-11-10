
import React, { useState } from 'react';

interface JsonEditorProps {
    initialJson: Record<string, any>;
    onSave: (newJson: Record<string, any>) => void;
    onCancel: () => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ initialJson, onSave, onCancel }) => {
    const [jsonString, setJsonString] = useState(JSON.stringify(initialJson, null, 2));
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        try {
            const parsedJson = JSON.parse(jsonString);
            setError(null);
            onSave(parsedJson);
        } catch (e: any) {
            setError(`Invalid JSON: ${e.message}`);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 bg-slate-950">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Profile JSON</h3>
            <textarea
                value={jsonString}
                onChange={(e) => setJsonString(e.target.value)}
                className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="JSON Editor"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
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
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default JsonEditor;