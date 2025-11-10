import React, { useState, useCallback } from 'react';
import { Message, MessageSender, Profile, ExplorationChat } from '../types';
import { runInterviewerAgent, runJsonMakerAgent } from '../services/api';
// Fix: Import from relative path
import { FINAL_PHRASE } from '../constants';
import ChatWindow from './ChatWindow';
import InputBar from './InputBar';
import { useSettings } from '../context/SettingsContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Papa from 'papaparse';

interface ProfileCreatorProps {
  onProfileCreated: (profile: Profile) => void;
}

const InfoBox = ({ onClose, onDontShowAgain }: { onClose: () => void; onDontShowAgain: () => void; }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-30">
        <div className="bg-slate-800 bg-opacity-80 text-white p-8 rounded-xl shadow-2xl z-20 border border-slate-700 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-teal-400">Persona Creation Guide</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-teal-500">What's the Goal?</h4>
                    <p className="text-sm text-gray-300">The purpose of this chat is to understand your taste in movies and music to create a personalized profile. This profile will help us find the best recommendations for you.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-teal-500">How do RAG-based recommendation systems work?</h4>
                    <p className="text-sm text-gray-300">These systems use an advanced method called "Retrieval-Augmented Generation" (RAG). In this approach, a Large Language Model (LLM) is connected to an external knowledge base. Before responding, it retrieves relevant information and uses it to generate more accurate and personalized answers.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-teal-500">Why is this technology effective?</h4>
                    <p className="text-sm text-gray-300">RAG allows the model to combine its general knowledge with your specific information. This means recommendations are not just based on generic data, but are precisely tailored to your taste and the content of your reference dataset, leading to smarter suggestions.</p>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-600 bg-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-2"
                        onChange={(e) => {
                            if (e.target.checked) {
                                onDontShowAgain();
                            }
                        }}
                    />
                    Don't show this message again
                </label>
                <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    </div>
);

const ProfileCreator: React.FC<ProfileCreatorProps> = ({ onProfileCreated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial_message',
      sender: MessageSender.AI,
      text: "Hello! I'm here to learn about your taste in movies and music to create a personalized profile for you. To start, what is your first and last name?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [dontShowInfoAgain, setDontShowInfoAgain] = useLocalStorage('dontShowPersonaInfoAgain', false);
  const [showInfoBox, setShowInfoBox] = useState(!dontShowInfoAgain);
  const { settings } = useSettings();

  const handleDontShowAgain = () => {
    setDontShowInfoAgain(true);
  };

  const saveJsonToFile = (jsonData: Record<string, any>, profileName: string) => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profileName.replace(/ /g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = useCallback(async (text: string, files?: File[]) => {
    if (showInfoBox) {
        setShowInfoBox(false);
    }
    setIsLoading(true);
    
    const userMessage: Message = { 
      id: Date.now().toString(),
      sender: MessageSender.USER, 
      text, 
      timestamp: new Date().toISOString() 
    };
    const newMessages = [...messages, userMessage];

    if (files && files.length > 0) {
      const summaryMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: MessageSender.SYSTEM,
        text: `Attached ${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
        timestamp: new Date().toISOString()
      };
      newMessages.push(summaryMessage);
    }
    
    setMessages(newMessages);

    let aggregatedFileContent: string | undefined;
    if (files && files.length > 0) {
      const parts: string[] = [];
      for (const file of files) {
        try {
          if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
            const parsed = await new Promise<string>((resolve, reject) => {
              Papa.parse(file, {
                complete: (result) => resolve(JSON.stringify(result.data)),
                error: (error) => reject(error.message),
              });
            });
            parts.push(`\n[File: ${file.name}]\n${parsed}`);
          } else if (file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name.toLowerCase())) {
            parts.push(`\n[Image attached: ${file.name} (${file.type || 'unknown type'}) – content not parsed]`);
          } else {
            const text = await file.text();
            if (text.includes('Ù') || text.includes('Ø') || text.includes('â')) {
              parts.push(`\n[File: ${file.name}]\n[Encoding issues detected; please convert to UTF-8.]`);
            } else {
              parts.push(`\n[File: ${file.name}]\n${text}`);
            }
          }
        } catch (e) {
          parts.push(`\n[File: ${file.name}]\n[Error processing file]`);
        }
      }
      aggregatedFileContent = parts.join('\n');
    }

    const aiResponseText = await runInterviewerAgent(newMessages, text, settings, aggregatedFileContent);
    const aiMessage: Message = { 
      id: (Date.now() + 2).toString(),
      sender: MessageSender.AI, 
      text: aiResponseText, 
      timestamp: new Date().toISOString() 
    };
    const finalMessages = [...newMessages, aiMessage];
    setMessages(finalMessages);
    setIsLoading(false);
    
    if (aiResponseText.includes(FINAL_PHRASE)) {
      setIsLoading(true);
      setMessages(msgs => [...msgs, { 
        id: (Date.now() + 3).toString(),
        sender: MessageSender.SYSTEM, 
        text: "Generating profile data...", 
        timestamp: new Date().toISOString() 
      }]);
      const jsonData = await runJsonMakerAgent(finalMessages, settings);
      if (jsonData) {
        const profileName = `${jsonData.firstName || ''} ${jsonData.lastName || ''}`.trim() || 'Untitled Profile';

        // Save the JSON file
        saveJsonToFile(jsonData, profileName);

        let initialExplorationChat: ExplorationChat | undefined = undefined;
    
        if (settings.referenceDataset && settings.referenceDataset.length > 0) {
            initialExplorationChat = {
                id: `chat_${Date.now()}`,
                title: 'Recommendations',
                createdAt: new Date().toISOString(),
                messages: [{
                    id: `exploration_message_${Date.now()}`,
                    sender: MessageSender.AI,
                    text: `I see you have a reference dataset loaded (${settings.referenceDatasetName}). Would you like me to recommend some items based on your new profile?`,
                    timestamp: new Date().toISOString(),
                }]
            };
        }

        const newProfile: Profile = {
          id: `profile_${Date.now()}`,
          name: profileName,
          createdAt: new Date().toISOString(),
          creationChat: finalMessages,
          jsonData,
          explorationChats: initialExplorationChat ? [initialExplorationChat] : [],
        };
        onProfileCreated(newProfile);
      } else {
        setMessages(msgs => [...msgs, { 
          id: (Date.now() + 4).toString(),
          sender: MessageSender.SYSTEM, 
          text: "Error: Could not generate JSON data.", 
          timestamp: new Date().toISOString() 
        }]);
      }
      setIsLoading(false);
    }
  }, [messages, onProfileCreated, settings, showInfoBox]);

  return (
    <div className="relative flex flex-col h-full">
      {showInfoBox && <InfoBox onClose={() => setShowInfoBox(false)} onDontShowAgain={handleDontShowAgain} />}
      <ChatWindow messages={messages} isLoading={isLoading} />
      <InputBar onSendMessage={handleSendMessage} disabled={isLoading} enableFileUpload={true} />
    </div>
  );
};

export default ProfileCreator;