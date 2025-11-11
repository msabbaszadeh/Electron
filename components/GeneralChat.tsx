import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageSender, Settings, ChatSession } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useSessions } from '../hooks/useSessions';
import ChatWindow from './ChatWindow';
import InputBar from './InputBar';
import SessionManager from './SessionManager';
import { runGeneralChatAgent, runGeneralChatAgentStream } from '../services/api';
import { useTheme, themes } from '../context/ThemeContext';
import ProfileCreator from './ProfileCreator';
import ProfileExplorer from './ProfileExplorer';
import SettingsModal from './SettingsModal';
import { SparklesIcon, ChatBubbleLeftRightIcon, UserPlusIcon } from './icons/Icons';
import { PlusIcon } from '@heroicons/react/24/solid';
import { CogIcon } from '@heroicons/react/24/outline';
import { sessionManager } from '../services/sessionManager';

type ViewMode = 'chat' | 'create' | 'explore' | 'recommendation';

const GeneralChat: React.FC = () => {
    const { sessions, activeSession, createSession, switchSession, deleteSession, updateSession } = useSessions();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { settings } = useSettings();
    const { theme } = useTheme();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentView, setCurrentView] = useState<ViewMode>('chat');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);


    const activeSessionMessages = sessions.find(s => s.id === activeSession)?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Session Management Functions
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateSessionTitle = (firstMessage: string) => {
    return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
  };

  const createNewSession = () => {
    const newSession = createSession('New Chat', []);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    return newSession.id;
  };

  const saveSession = (sessionId: string, messages: Message[]) => {
    if (messages.length === 0) return;

    const title = generateSessionTitle(messages[0].text);
    const session: ChatSession = {
      id: sessionId,
      title,
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateSession(sessionId, messages);
  };

  const loadSessionData = (sessionId: string) => {
    const session = loadSession(sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    } else {
      setMessages([]);
      setCurrentSessionId(sessionId);
    }
  };

  const deleteSessionData = (sessionId: string) => {
    deleteSession(sessionId);
    if (currentSessionId === sessionId) {
      createNewSession();
    }
  };

  const renameSessionData = (sessionId: string, newTitle: string) => {
    renameSession(sessionId, newTitle);
  };

  const reorderSessionsData = (sessionIds: string[]) => {
    reorderSessions(sessionIds);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (input: string, files?: File[]) => {
        if (!input.trim() && (!files || files.length === 0)) return;

        // Create new session if none exists
        let sessionId = activeSession;
        if (!sessionId) {
            const newSession = createSession('New Chat', []);
            switchSession(newSession.id);
            sessionId = newSession.id;
        }

        // Handle file attachments
        let fileContent = '';
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const text = await extractTextFromFile(file);
                    fileContent += `\n[File: ${file.name}]\n${text}\n`;
                } catch (error) {
                    console.error('Error processing file:', error);
                    fileContent += `\n[File: ${file.name}]\n[Error processing file]\n`;
                }
            }
        }

        const fullInput = input + (fileContent ? '\n\nAttached Files:' + fileContent : '');

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: MessageSender.USER,
            text: fullInput,
            timestamp: new Date().toISOString()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Create a placeholder AI message for streaming
            const aiMessageId = (Date.now() + 1).toString();
            const aiMessage: Message = {
                id: aiMessageId,
                sender: MessageSender.AI,
                text: '',
                timestamp: new Date().toISOString()
            };

            const updatedMessages = [...newMessages, aiMessage];
            setMessages(updatedMessages);

            // Use streaming API
            let fullResponse = '';
            for await (const chunk of runGeneralChatAgentStream(messages, fullInput, settings)) {
                fullResponse += chunk;
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === aiMessageId 
                            ? { ...msg, text: fullResponse }
                            : msg
                    )
                );
            }

            // Save session after successful response
            const finalMessages = [...updatedMessages];
            finalMessages[finalMessages.length - 1].text = fullResponse;
            saveSession(sessionId, finalMessages);

        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: MessageSender.AI,
                text: 'Sorry, I encountered an error while processing your request.',
                timestamp: new Date().toISOString()
            };
            const finalMessages = [...newMessages, errorMessage];
            setMessages(finalMessages);
            // saveSession(sessionId, finalMessages); // decide if you want to save errors
        } finally {
            setIsLoading(false);
        }
    };

  const clearChat = () => {
    // Create a new session instead of just clearing messages
    const newSession = createSession('New Chat', []);
    switchSession(newSession.id);
    setMessages([]);
  };

  // Function to extract text from different file types
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();
    
    // Handle .docx files - currently not supported without external library
    if (fileName.endsWith('.docx')) {
      return '[Word documents (.docx) are not currently supported. Please convert to .txt format or copy/paste the text directly.]';
    }
    
    // Handle .pdf files - currently not supported
    if (fileName.endsWith('.pdf')) {
      return '[PDF files are not currently supported for text extraction. Please convert to .txt format or copy/paste the text directly.]';
    }
    
    // Handle text-based files (.txt, .md, .csv, etc.)
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv') || 
        fileName.endsWith('.js') || fileName.endsWith('.py') || fileName.endsWith('.json') ||
        fileName.endsWith('.xml') || fileName.endsWith('.html')) {
      try {
        const text = await file.text();
        // Check if text contains Persian characters and might have encoding issues
        if (text.includes('Ù') || text.includes('Ø') || text.includes('â')) {
          return '[File appears to have encoding issues. Please try converting to UTF-8 format or copy/paste the text directly.]';
        }
        return text;
      } catch (error) {
        console.error('Error reading text file:', error);
        return '[Error reading text file]';
      }
    }
    
    // Default: try to read as text
    try {
      const text = await file.text();
      // Check for potential encoding issues
      if (text.includes('Ù') || text.includes('Ø') || text.includes('â')) {
        return '[File appears to have encoding issues. Please convert to UTF-8 format or copy/paste the text directly.]';
      }
      return text;
    } catch (error) {
      console.error('Error reading file:', error);
      return `[Could not extract text from ${file.name}. Please convert to .txt format or copy/paste the text directly.]`;
    }
  };

  const hasReferenceDataset = settings.referenceDataset && settings.referenceDataset.trim().length > 0;
  const datasetName = hasReferenceDataset ? 'Reference Dataset' : null;

  // Create initial session if none exists
  useEffect(() => {
    if (!activeSession) {
      const newSession = createSession('New Chat', []);
      switchSession(newSession.id);
    }
  }, []);

  useEffect(() => {
    setMessages(activeSessionMessages);
  }, [activeSession, sessions]);

  console.log('Messages:', messages);

  const handleGetRecommendation = async () => {
    if (currentView !== 'chat') {
        setCurrentView('chat');
    }

    const userMessage: Message = {
        id: Date.now().toString(),
        sender: MessageSender.USER,
        text: "Get me a recommendation",
        timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: Message = {
            id: aiMessageId,
            sender: MessageSender.AI,
            text: '',
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);

        let fullResponse = '';
        for await (const chunk of runGeneralChatAgentStream(messages, "Get me a recommendation", settings)) {
            fullResponse += chunk;
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId
                        ? { ...msg, text: fullResponse }
                        : msg
                )
            );
        }
    } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: MessageSender.AI,
            text: 'Sorry, I encountered an error while processing your request.',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
        setIsLoading(false);
    }
};


  return (
    <div className={`flex h-screen ${themes[theme].colors.text}`}>
        {/* Collapsible Sidebar */}
        <div className={`fixed top-0 left-0 h-full ${themes[theme].colors.sidebarBackground} backdrop-blur-sm ${themes[theme].colors.border} p-4 transition-all duration-300 ease-in-out z-20 ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
            <div className="flex flex-col h-full">
                <div className={`p-6 border-b ${themes[theme].colors.border}`}>
                    <div className="flex items-center justify-between">
                        <div className={`${isSidebarOpen ? 'block' : 'hidden'}`}>
                          <h1 className={`text-4xl font-bold ${themes[theme].colors.text}`}>Electron</h1>
                          <p className={`text-xs mt-1 ${themes[theme].colors.textSecondary}`}>
                            personolized recommendation<br /> system powered by RAG and LMs
                          </p>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`p-2 rounded-lg transition-colors ${themes[theme].colors.textSecondary} ${themes[theme].colors.hover} ${themes[theme].colors.textHover}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 mb-6">
                    <button
                        onClick={() => setCurrentView('create')}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            currentView === 'create' ? `${themes[theme].colors.selected} ${themes[theme].colors.text}` : `${themes[theme].colors.textSecondary} ${themes[theme].colors.hover} ${themes[theme].colors.textHover}`
                        }`}
                    >
                        <UserPlusIcon className="w-6 h-6" />
                        {isSidebarOpen && <span className="font-medium">Create Persona</span>}
                    </button>
                    <button
                        onClick={() => setCurrentView('recommendation')}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            currentView === 'recommendation' ? `${themes[theme].colors.selected} ${themes[theme].colors.text}` : `${themes[theme].colors.textSecondary} ${themes[theme].colors.hover} ${themes[theme].colors.textHover}`
                        }`}
                    >
                        <SparklesIcon className="w-6 h-6" />
                        {isSidebarOpen && <span className="font-medium">Get Recommendation</span>}
                    </button>
                    <button
                        onClick={() => setCurrentView('chat')}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            currentView === 'chat' ? `${themes[theme].colors.selected} ${themes[theme].colors.text}` : `${themes[theme].colors.textSecondary} ${themes[theme].colors.hover} ${themes[theme].colors.textHover}`
                        }`}
                    >
                        <ChatBubbleLeftRightIcon className="w-6 h-6" />
                        {isSidebarOpen && <span className="font-medium">Chat with LLM</span>}
                    </button>
                </nav>

                <div className="flex-1 overflow-y-auto">
                    {isSidebarOpen && (currentView === 'chat' || currentView === 'recommendation') && (
                        <SessionManager 
                            sessions={sessions}
                            currentSessionId={activeSession}
                            onSessionSelect={(id) => {
                                switchSession(id);
                                setCurrentView('chat');
                            }}
                            onSessionDelete={deleteSession}
                            onSessionRename={() => {}}
                            onSessionReorder={() => {}}
                            onSessionCreate={() => {
                                const newSession = createSession('New Chat', []);
                                switchSession(newSession.id);
                                setCurrentView('chat');
                            }}
                        />
                    )}
                </div>

                {/* Settings Button - Always visible at bottom */}
                <div className={`mt-auto pt-4 mb-16 border-t ${themes[theme].colors.border}`}>
                     <button
                         onClick={() => setIsSettingsModalOpen(true)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full ${themes[theme].colors.textSecondary} ${themes[theme].colors.hover} ${themes[theme].colors.textHover}`}
                     >
                         <CogIcon className="w-6 h-6" />
                         {isSidebarOpen && <span className="font-medium">Settings</span>}
                     </button>
                 </div>
             </div>
         </div>

         {/* Main Content Area */}
         <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-20'} pb-8`}>
             {currentView === 'chat' && (
                 <div className="flex flex-col h-full">
                     {/* Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${themes[theme].colors.border} ${themes[theme].colors.componentBg}`}>
                         <div className="flex items-center gap-3">
                            <h2 className={`text-lg font-semibold ${themes[theme].colors.text}`}>
                                 {sessions.find(s => s.id === activeSession)?.title || 'New Chat'}
                             </h2>
                             
                             {/* Dataset indicator */}
                             {hasReferenceDataset && (
                                <div className={`flex items-center gap-2 px-3 py-1 ${themes[theme].colors.success} border ${themes[theme].colors.successBorder} rounded-full`}>
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className={`text-xs ${themes[theme].colors.successText}`}>{datasetName}</span>
                                 </div>
                             )}
                         </div>
                         
                         <div className="flex items-center gap-2">
                             {messages.length > 0 && (
                                 <button
                                     onClick={clearChat}
                                    className={`px-3 py-1 text-sm ${themes[theme].colors.textSecondary} ${themes[theme].colors.hover} ${themes[theme].colors.textHover} rounded transition-colors`}
                                 >
                                     Clear Chat
                                 </button>
                             )}
                         </div>
                     </div>

                     {/* Chat Window */}
                     <div className="flex-1 flex flex-col">
                         <div className="flex-1 overflow-y-auto">
                             <ChatWindow messages={messages} isLoading={isLoading} />

                             <div ref={messagesEndRef} />
                         </div>
                         
                         <InputBar
                             onSendMessage={handleSendMessage}
                             disabled={isLoading}
                             placeholder={hasReferenceDataset ? "Ask your question..." : "Ask your question..."}
                             enableFileUpload={true}
                         />
                     </div>
                 </div>
               )}
             {currentView === 'create' && <ProfileCreator onProfileCreated={() => { console.log('Profile created'); setCurrentView('explore'); }} />}
             {currentView === 'explore' && <ProfileExplorer />}
             {currentView === 'recommendation' && (
                 <ProfileExplorer />
             )}

             {/* Settings Modal */}
             <SettingsModal 
                 isOpen={isSettingsModalOpen} 
                 onClose={() => setIsSettingsModalOpen(false)} 
             />

             {/* Signature Footer */}
            <footer className={`text-center text-xs ${themes[theme].colors.textSecondary} py-2 ${themes[theme].colors.componentBg} w-full fixed bottom-0 left-0 z-30`}>
                 open source rag recomenadtion system designed and built by Mohammad sadegh abbaszadeh
             </footer>
         </div>
     </div>
   );
};

export default GeneralChat;