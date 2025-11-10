
import React from 'react';
import { UserPlusIcon } from './icons/Icons';

interface WelcomePlaceholderProps {
    onCreateNewProfile: () => void;
}

export const WelcomePlaceholder: React.FC<WelcomePlaceholderProps> = ({ onCreateNewProfile }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-8">
            <div className="max-w-md">
                <h2 className="text-4xl font-bold text-slate-200 mb-2">Welcome to Electron</h2>
                <p className="mb-6">
                    Your intelligent assistant for building and exploring your media preferences.
                    Get started by creating a new profile.
                </p>
                <button
                    onClick={onCreateNewProfile}
                    className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-500 transition-colors duration-200 text-lg"
                >
                    <UserPlusIcon />
                    <span>Create New Profile</span>
                </button>
            </div>
        </div>
    );
};