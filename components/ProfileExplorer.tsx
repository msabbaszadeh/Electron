
import React, { useState, useCallback } from 'react';
import { Profile, Message, MessageSender, ExplorationChat } from '../types';
import ChatWindow from './ChatWindow';
import InputBar from './InputBar';
import { runExplorerAgent, runKnowledgeBasedAgent, runRAGBasedAgent } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { CodeBracketIcon, InformationCircleIcon, PlusIcon, ChatBubbleLeftRightIcon, ArrowLeftIcon, TrashIcon, UserCircleIcon, FolderOpenIcon } from './icons/Icons';
import JsonEditor from './JsonEditor';

type ExplorerView = 'chat' | 'info' | 'json';

const ProfileExplorer: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<ExplorerView>('chat');
  const { settings } = useSettings();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatTitle, setEditingChatTitle] = useState('');
  const activeChat = selectedProfile?.explorationChats.find(c => c.id === activeChatId);


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const loadedProfiles: Profile[] = [];
    for (const file of Array.from(files)) {
      if (file.name.endsWith('.json')) {
        try {
          const content = await file.text();
          const profileData = JSON.parse(content);
          if (profileData.id && profileData.name && profileData.creationChat) {
            loadedProfiles.push(profileData);
          }
        } catch (error) {
          console.error("Error reading or parsing profile file:", file.name, error);
        }
      }
    }
    setProfiles(loadedProfiles);
    setSelectedProfile(null); // Reset selection
    setActiveChatId(null);
  };

  const handleSendMessage = useCallback(async (text: string, file?: File) => {
    if (!activeChat || !selectedProfile) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: `user_message_${Date.now()}`,
      sender: MessageSender.USER,
      text,
      timestamp: new Date().toISOString()
    };

    const updatedChat = {
        ...activeChat,
        messages: [...activeChat.messages, userMessage],
    };

    const updatedSelectedProfile = {
        ...selectedProfile,
        explorationChats: selectedProfile.explorationChats.map(c => c.id === activeChatId ? updatedChat : c),
    };

    setSelectedProfile(updatedSelectedProfile);
     // Update the profile in the main list as well
    setProfiles(profiles.map(p => p.id === updatedSelectedProfile.id ? updatedSelectedProfile : p));

    // Array to collect AI responses
    const aiMessages: Message[] = [];

    // Run Knowledge-Based Agent if enabled
    if (settings.contentGeneration?.knowledgeBased?.enabled !== false) {
      try {
        const knowledgeResponse = await runKnowledgeBasedAgent(selectedProfile, updatedChat, text, settings);
        aiMessages.push({
          id: `ai_knowledge_${Date.now()}_${Math.random()}`,
          sender: MessageSender.AI,
          text: knowledgeResponse,
          timestamp: new Date().toISOString(),
          modelType: 'knowledge'
        });
      } catch (error) {
        console.error('Knowledge-based agent failed:', error);
        aiMessages.push({
          id: `ai_knowledge_error_${Date.now()}_${Math.random()}`,
          sender: MessageSender.AI,
          text: 'Sorry, the knowledge-based recommendation system encountered an error.',
          timestamp: new Date().toISOString(),
          modelType: 'knowledge'
        });
      }
    }

    // Run RAG-Based Agent if enabled
    if (settings.contentGeneration?.ragBased?.enabled !== false) {
      try {
        const ragResponse = await runRAGBasedAgent(selectedProfile, updatedChat, text, settings);
        aiMessages.push({
          id: `ai_rag_${Date.now()}_${Math.random()}`,
          sender: MessageSender.AI,
          text: ragResponse,
          timestamp: new Date().toISOString(),
          modelType: 'rag'
        });
      } catch (error) {
        console.error('RAG-based agent failed:', error);
        aiMessages.push({
          id: `ai_rag_error_${Date.now()}_${Math.random()}`,
          sender: MessageSender.AI,
          text: 'Sorry, the RAG-based recommendation system encountered an error.',
          timestamp: new Date().toISOString(),
          modelType: 'rag'
        });
      }
    }

    // Fallback to explorer agent if both new models are disabled
    if (aiMessages.length === 0) {
      try {
        const explorerResponse = await runExplorerAgent(selectedProfile, updatedChat, text, settings);
        aiMessages.push({
          id: `ai_explorer_${Date.now()}_${Math.random()}`,
          sender: MessageSender.AI,
          text: explorerResponse,
          timestamp: new Date().toISOString(),
          modelType: 'explorer'
        });
      } catch (error) {
        console.error('Explorer agent failed:', error);
        aiMessages.push({
          id: `ai_explorer_error_${Date.now()}_${Math.random()}`,
          sender: MessageSender.AI,
          text: 'Sorry, the recommendation system encountered an error.',
          timestamp: new Date().toISOString(),
          modelType: 'explorer'
        });
      }
    }

    const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, ...aiMessages],
    };

    const finalProfile = {
        ...updatedSelectedProfile,
        explorationChats: selectedProfile.explorationChats.map(c => c.id === activeChatId ? finalChat : c),
    };

    setSelectedProfile(finalProfile);
    setProfiles(profiles.map(p => p.id === finalProfile.id ? finalProfile : p));
    setIsLoading(false);

  }, [selectedProfile, activeChat, activeChatId, profiles, settings]);

  const handleJsonSave = (newJson: Record<string, any>) => {
    if (!selectedProfile) return;
    const updatedProfile = { ...selectedProfile, jsonData: newJson };
    setSelectedProfile(updatedProfile);
    setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setView('chat');
  };

  const createNewChat = () => {
    if (!selectedProfile) return;
    const newChat: ExplorationChat = {
        id: `chat_${Date.now()}`,
        title: `Conversation ${selectedProfile.explorationChats.length + 1}`,
        createdAt: new Date().toISOString(),
        messages: [{
            id: `new_chat_message_${Date.now()}`,
            sender: MessageSender.AI,
            text: "Hello! How can I help you explore recommendations for this profile?",
            timestamp: new Date().toISOString(),
        }],
    };
    const updatedProfile = {
        ...selectedProfile,
        explorationChats: [...selectedProfile.explorationChats, newChat],
    };
    setSelectedProfile(updatedProfile);
    setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setActiveChatId(newChat.id);
    setView('chat');
  };

  const deleteChat = (chatId: string) => {
    if (!selectedProfile) return;
    const updatedChats = selectedProfile.explorationChats.filter(c => c.id !== chatId);
    const updatedProfile = {
        ...selectedProfile,
        explorationChats: updatedChats,
    };
    setSelectedProfile(updatedProfile);
    setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));

    if (activeChatId === chatId) {
        setActiveChatId(updatedChats[0]?.id || null);
    }
  };

  const renameChat = (chatId: string, newTitle: string) => {
    if (!selectedProfile || !newTitle.trim()) return;
    
    const updatedChats = selectedProfile.explorationChats.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle.trim() } : chat
    );
    
    const updatedProfile = {
        ...selectedProfile,
        explorationChats: updatedChats,
    };
    
    setSelectedProfile(updatedProfile);
    setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const handleChatRenameStart = (chat: ExplorationChat) => {
    setEditingChatId(chat.id);
    setEditingChatTitle(chat.title);
  };

  const handleChatRenameSave = (chatId: string) => {
    if (editingChatTitle.trim()) {
      renameChat(chatId, editingChatTitle.trim());
    }
    setEditingChatId(null);
    setEditingChatTitle('');
  };

  const handleChatRenameCancel = () => {
    setEditingChatId(null);
    setEditingChatTitle('');
  };

  const handleProfileSelect = (profile: Profile) => {
      setSelectedProfile(profile);
      // Automatically select the first chat or set to null if no chats exist
      setActiveChatId(profile.explorationChats[0]?.id || null);
      setView('chat');
  }

  return (
    <div className="flex h-full">
        {/* Profile List Sidebar */}
        <div className="w-64 bg-slate-950 flex flex-col border-r border-slate-700/50">
            <div className="p-4 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold text-white">Personas</h3>
                <p className="text-xs text-slate-400">Select a persona to start</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                 <nav className="p-2">
                    {profiles.map(profile => (
                        <a
                            href="#"
                            key={profile.id}
                            onClick={(e) => {
                                e.preventDefault();
                                handleProfileSelect(profile);
                            }}
                             className={`group flex items-center justify-between gap-2 p-2.5 rounded-lg text-sm transition-colors ${
                                selectedProfile?.id === profile.id ? 'bg-teal-600/20 text-teal-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <UserCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate flex-1">{profile.name}</span>
                        </a>
                    ))}
                    {profiles.length === 0 && (
                        <div className="text-center text-slate-500 p-4 text-sm">
                            No personas loaded.
                        </div>
                    )}
                </nav>
            </div>
             <div className="p-2 border-t border-slate-700/50">
                <input
                    type="file"
                    multiple
                    webkitdirectory="true"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".json"
                />
                 <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    <FolderOpenIcon />
                    Load Personas
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-slate-900">
            {!selectedProfile ? (
                 <div className="flex-1 flex items-center justify-center text-slate-500">
                    <p>Select a persona from the list to get started.</p>
                </div>
            ) : (
            <>
                {/* Sub-header */}
                <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 p-2 flex items-center justify-between">
                    <div className="p-2 text-sm text-slate-400">
                       {activeChat ? `Viewing Chat: ${activeChat.title}` : 'Select a chat or create one.'}
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setView('info')} className={`p-2 rounded-md ${view === 'info' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`} title="Profile Info">
                            <InformationCircleIcon />
                        </button>
                        <button onClick={() => setView('json')} className={`p-2 rounded-md ${view === 'json' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`} title="View/Edit JSON">
                            <CodeBracketIcon />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {view === 'chat' && (
                    <div className="flex h-full">
                         {/* Chat List for the selected profile */}
                        <div className="w-64 bg-slate-950/50 flex flex-col border-r border-slate-700/50">
                            <div className="p-4 border-b border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white truncate">{selectedProfile.name}</h3>
                                <p className="text-xs text-slate-400">Chats</p>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <nav className="p-2">
                                    {selectedProfile.explorationChats.map(chat => (
                                        <a
                                            href="#"
                                            key={chat.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveChatId(chat.id);
                                            }}
                                            className={`group flex items-center justify-between gap-2 p-2.5 rounded-lg text-sm transition-colors ${
                                                activeChatId === chat.id ? 'bg-teal-600/20 text-teal-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            <ChatBubbleLeftRightIcon className="w-5 h-5 flex-shrink-0" />
                                            {editingChatId === chat.id ? (
                                                <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={editingChatTitle}
                                                        onChange={(e) => setEditingChatTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleChatRenameSave(chat.id);
                                                            if (e.key === 'Escape') handleChatRenameCancel();
                                                        }}
                                                        className="flex-1 px-2 py-1 text-sm bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleChatRenameSave(chat.id)}
                                                        className="p-1 text-green-400 hover:text-green-300"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={handleChatRenameCancel}
                                                        className="p-1 text-red-400 hover:text-red-300"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="truncate flex-1">{chat.title}</span>
                                            )}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {editingChatId !== chat.id && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleChatRenameStart(chat);
                                                            }}
                                                            className="p-1 text-slate-500 hover:text-white rounded"
                                                            title="Rename Chat"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={(e) => {e.stopPropagation(); deleteChat(chat.id)}} className="p-1 text-slate-500 hover:text-red-400 rounded-full hover:bg-slate-700">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </a>
                                    ))}
                                </nav>
                            </div>
                            <div className="p-2 border-t border-slate-700/50">
                                <button onClick={createNewChat} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                                    <PlusIcon />
                                    New Chat
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            {activeChat ? (
                                <>
                                    <ChatWindow messages={activeChat.messages} isLoading={isLoading} />
                                    <InputBar onSendMessage={handleSendMessage} disabled={isLoading} />
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-500">
                                    <p>Select a chat or create a new one to begin.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {view === 'info' && (
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-slate-800 rounded-lg p-6 mb-6">
                                <h2 className="text-2xl font-bold text-white mb-4">Profile Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-teal-400 mb-2">{selectedProfile.name}</h3>
                                        <p className="text-sm text-slate-400">Created: {new Date(selectedProfile.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-md font-medium text-white mb-2">Profile Data</h4>
                                        <div className="bg-slate-900 rounded p-4 max-h-64 overflow-y-auto">
                                            <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                                                {JSON.stringify(selectedProfile.jsonData, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-md font-medium text-white mb-2">Statistics</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="bg-slate-900 rounded p-3">
                                                <span className="text-slate-400">Total Chats:</span>
                                                <span className="text-white ml-2 font-semibold">{selectedProfile.explorationChats.length}</span>
                                            </div>
                                            <div className="bg-slate-900 rounded p-3">
                                                <span className="text-slate-400">Total Messages:</span>
                                                <span className="text-white ml-2 font-semibold">
                                                    {selectedProfile.explorationChats.reduce((total, chat) => total + chat.messages.length, 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {view === 'json' && (
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            <JsonEditor
                                jsonData={selectedProfile.jsonData}
                                onSave={handleJsonSave}
                                onCancel={() => setView('chat')}
                            />
                        </div>
                    </div>
                )}
            </>
            )}
        </div>
    </div>
  );
};
export default ProfileExplorer;
