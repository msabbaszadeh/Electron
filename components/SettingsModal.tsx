import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTheme, themes, ThemeName } from '../context/ThemeContext';
import { Settings } from '../types';
// Import defaultSettings for factory reset
import { defaultSettings } from '../context/SettingsContext';
import { XMarkIcon, UploadIcon, TrashIcon, DocumentTextIcon } from './icons/Icons';
// Fix: Import from relative path
import { fetchOllamaModels } from '../services/ollamaService';
import PromptEditor from './PromptEditor';
import { testEmbeddingService } from '../services/embeddingBridge';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'basic' | 'storage' | 'rag' | 'advanced' | 'about';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, saveSettings, resetPrompts, updatePrompt, resetToFactoryDefaults } = useSettings();
  const { theme, setTheme } = useTheme();
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [datasetStatus, setDatasetStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [datasetError, setDatasetError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [embedStatus, setEmbedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [embedInfo, setEmbedInfo] = useState<any>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);
  
  const handleOllamaTest = useCallback(async () => {
    setStatus('loading');
    try {
      const models = await fetchOllamaModels(localSettings.ollama.baseUrl);
      setOllamaModels(models);
      if (models.length > 0 && !models.includes(localSettings.ollama.model)) {
        handleSettingChange('ollama.model', models[0]);
      }
      setStatus('success');
    } catch (error) {
      console.error(error);
      setOllamaModels([]);
      setStatus('error');
    }
  }, [localSettings.ollama.baseUrl, localSettings.ollama.model]);

  useEffect(() => {
      if(localSettings.provider === 'ollama' && status === 'idle') {
          handleOllamaTest();
      }
  }, [localSettings.provider, status, handleOllamaTest]);

  const handleSave = () => {
    saveSettings(localSettings);
    onClose();
  };

  const handleSettingChange = (path: string, value: any) => {
    setLocalSettings(prev => {
        const keys = path.split('.');
        const newSettings = JSON.parse(JSON.stringify(prev)); // Deep copy
        let current = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newSettings;
    });
  };
  
  const handlePromptSave = (key: string, value: string) => {
    updatePrompt(key, value); // Directly update context to avoid stale state issues
    setEditingPrompt(null);
  }
  
  const handleDatasetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDatasetStatus('loading');
    setDatasetError(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') {
            throw new Error('File could not be read as a string.');
        }
        setLocalSettings(prev => ({
            ...prev,
            referenceDataset: result,
            referenceDatasetName: file.name
        }));
        setDatasetStatus('idle');
      } catch (error: any) {
        setDatasetError(error.message || 'Failed to process file.');
        setDatasetStatus('error');
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
        setDatasetError('An error occurred while reading the file.');
        setDatasetStatus('error');
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
    } else if (file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.xlsx')) {
        reader.readAsDataURL(file);
    } else {
        setDatasetError('Unsupported file type. Please use CSV or Excel files.');
        setDatasetStatus('error');
    }
  };


  const handleRemoveDataset = () => {
    setLocalSettings(prev => ({
        ...prev,
        referenceDataset: undefined,
        referenceDatasetName: undefined,
    }));
    setDatasetError(null);
    setDatasetStatus('idle');
  };

  if (!isOpen) return null;
  
  if (editingPrompt && localSettings.prompts) {
      return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div className="w-full h-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-lg shadow-xl border border-slate-700">
              <PromptEditor 
                promptKey={editingPrompt} 
                initialValue={localSettings.prompts[editingPrompt]}
                onSave={handlePromptSave}
                onCancel={() => setEditingPrompt(null)} 
              />
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl rounded-lg shadow-xl border ${themes[theme].colors.modalBg} ${themes[theme].colors.border} flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
        <div className={`flex justify-between items-center p-4 border-b ${themes[theme].colors.border}`}>
          <h2 className={`text-xl font-semibold ${themes[theme].colors.text}`}>Settings</h2>
          <button onClick={onClose} className={`p-1 rounded-full ${themes[theme].colors.hover} ${themes[theme].colors.textSecondary} ${themes[theme].colors.textHover}`}>
            <XMarkIcon />
          </button>
        </div>
        
        <div className={`p-4 border-b ${themes[theme].colors.border}`}>
            <div className={`flex ${themes[theme].colors.componentBgSolid} rounded-lg p-1`}>
                <button onClick={() => setActiveTab('basic')} className={`w-1/5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'basic' ? `${themes[theme].colors.primary} ${themes[theme].colors.text}` : `${themes[theme].colors.textSecondary} ${themes[theme].colors.hover}`}`}>Basic</button>
                <button onClick={() => setActiveTab('storage')} className={`w-1/5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'storage' ? `${themes[theme].colors.primary} ${themes[theme].colors.text}` : `${themes[theme].colors.textSecondary} ${themes[theme].colors.hover}`}`}>Storage</button>
                <button onClick={() => setActiveTab('rag')} className={`w-1/5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'rag' ? `${themes[theme].colors.primary} ${themes[theme].colors.text}` : `${themes[theme].colors.textSecondary} ${themes[theme].colors.hover}`}`}>RAG</button>
                <button onClick={() => setActiveTab('advanced')} className={`w-1/5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'advanced' ? `${themes[theme].colors.primary} ${themes[theme].colors.text}` : `${themes[theme].colors.textSecondary} ${themes[theme].colors.hover}`}`}>Advanced</button>
                <button onClick={() => setActiveTab('about')} className={`w-1/5 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'about' ? `${themes[theme].colors.primary} ${themes[theme].colors.text}` : `${themes[theme].colors.textSecondary} ${themes[theme].colors.hover}`}`}>About</button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'basic' && (
            <>
                <div>
                    <label className={`block text-sm font-medium ${themes[theme].colors.textSecondary} mb-2`}>Theme</label>
                    <div className="flex gap-2">
                        {Object.keys(themes).map((themeKey) => (
                            <button
                                key={themeKey}
                                onClick={() => setTheme(themeKey as ThemeName)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    theme === themeKey
                                        ? `${themes[theme].colors.primary} ${themes[theme].colors.text}`
                                        : `${themes[theme].colors.componentBgSolid} ${themes[theme].colors.textSecondary} ${themes[theme].colors.hover}`
                                }`}
                            >
                                {themes[themeKey as ThemeName].name}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">AI Provider</label>
                    <select value={localSettings.provider} onChange={(e) => handleSettingChange('provider', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500">
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI</option>
                        <option value="alibaba">Alibaba Cloud</option>
                        <option value="huggingface">Hugging Face</option>
                        <option value="ollama">Ollama (Local)</option>
                    </select>
                </div>

                {localSettings.provider === 'gemini' && (
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Google Gemini Settings</h3>
                        <div>
                            <label htmlFor="gemini-api-key" className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
                            <input 
                                type="password" 
                                id="gemini-api-key" 
                                value={localSettings.gemini?.apiKey || ''} 
                                onChange={(e) => handleSettingChange('gemini.apiKey', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="Enter your Gemini API key"
                            />
                        </div>
                        <div>
                            <label htmlFor="gemini-model" className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                            <input 
                                type="text" 
                                id="gemini-model" 
                                value={localSettings.gemini?.model || 'gemini-1.5-flash'} 
                                onChange={(e) => handleSettingChange('gemini.model', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="gemini-1.5-flash"
                            />
                        </div>
                    </div>
                )}

                {localSettings.provider === 'openai' && (
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">OpenAI Settings</h3>
                        <div>
                            <label htmlFor="openai-api-key" className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
                            <input 
                                type="password" 
                                id="openai-api-key" 
                                value={localSettings.openai?.apiKey || ''} 
                                onChange={(e) => handleSettingChange('openai.apiKey', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="Enter your OpenAI API key"
                            />
                        </div>
                        <div>
                            <label htmlFor="openai-model" className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                            <select 
                                id="openai-model" 
                                value={localSettings.openai?.model || 'gpt-3.5-turbo'} 
                                onChange={(e) => handleSettingChange('openai.model', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                <option value="gpt-4">GPT-4</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                <option value="gpt-4o">GPT-4o</option>
                                <option value="gpt-4o-mini">GPT-4o Mini</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="openai-base-url" className="block text-sm font-medium text-slate-300 mb-2">Base URL (Optional)</label>
                            <input 
                                type="text" 
                                id="openai-base-url" 
                                value={localSettings.openai?.baseUrl || ''} 
                                onChange={(e) => handleSettingChange('openai.baseUrl', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="https://api.openai.com/v1"
                            />
                        </div>
                    </div>
                )}

                {localSettings.provider === 'alibaba' && (
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Alibaba Cloud Settings</h3>
                        <div>
                            <label htmlFor="alibaba-api-key" className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
                            <input 
                                type="password" 
                                id="alibaba-api-key" 
                                value={localSettings.alibaba?.apiKey || ''} 
                                onChange={(e) => handleSettingChange('alibaba.apiKey', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="Enter your Alibaba Cloud API key"
                            />
                        </div>
                        <div>
                            <label htmlFor="alibaba-model" className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                            <select 
                                id="alibaba-model" 
                                value={localSettings.alibaba?.model || 'qwen-turbo'} 
                                onChange={(e) => handleSettingChange('alibaba.model', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                                <option value="qwen-turbo">Qwen Turbo</option>
                                <option value="qwen-plus">Qwen Plus</option>
                                <option value="qwen-max">Qwen Max</option>
                                <option value="qwen-max-longcontext">Qwen Max Long Context</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="alibaba-base-url" className="block text-sm font-medium text-slate-300 mb-2">Base URL (Optional)</label>
                            <input 
                                type="text" 
                                id="alibaba-base-url" 
                                value={localSettings.alibaba?.baseUrl || ''} 
                                onChange={(e) => handleSettingChange('alibaba.baseUrl', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="https://dashscope.aliyuncs.com/api/v1"
                            />
                        </div>
                    </div>
                )}

                {localSettings.provider === 'huggingface' && (
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Hugging Face Settings</h3>
                        <div>
                            <label htmlFor="huggingface-api-key" className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
                            <input 
                                type="password" 
                                id="huggingface-api-key" 
                                value={localSettings.huggingface?.apiKey || ''} 
                                onChange={(e) => handleSettingChange('huggingface.apiKey', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="Enter your Hugging Face API key"
                            />
                        </div>
                        <div>
                            <label htmlFor="huggingface-model" className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                            <input 
                                type="text" 
                                id="huggingface-model" 
                                value={localSettings.huggingface?.model || 'microsoft/DialoGPT-medium'} 
                                onChange={(e) => handleSettingChange('huggingface.model', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="microsoft/DialoGPT-medium"
                            />
                            <p className="text-xs text-slate-400 mt-1">Enter any Hugging Face model name (e.g., microsoft/DialoGPT-medium, meta-llama/Llama-2-7b-chat-hf)</p>
                        </div>
                        <div>
                            <label htmlFor="huggingface-model-path" className="block text-sm font-medium text-slate-300 mb-2">Model Download Path</label>
                            <input 
                                type="text" 
                                id="huggingface-model-path" 
                                value={localSettings.huggingface?.modelPath || ''} 
                                onChange={(e) => handleSettingChange('huggingface.modelPath', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="./models/huggingface"
                            />
                            <p className="text-xs text-slate-400 mt-1">Local path where Hugging Face models will be downloaded and cached. Auto-downloads if model is not present.</p>
                        </div>
                        <div>
                            <label htmlFor="huggingface-base-url" className="block text-sm font-medium text-slate-300 mb-2">Base URL (Optional)</label>
                            <input 
                                type="text" 
                                id="huggingface-base-url" 
                                value={localSettings.huggingface?.baseUrl || ''} 
                                onChange={(e) => handleSettingChange('huggingface.baseUrl', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" 
                                placeholder="https://api-inference.huggingface.co"
                            />
                        </div>
                    </div>
                )}

                {localSettings.provider === 'ollama' && (
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Ollama Settings</h3>
                        <div>
                            <label htmlFor="ollama-url" className="block text-sm font-medium text-slate-300 mb-2">Ollama Base URL</label>
                            <input type="text" id="ollama-url" value={localSettings.ollama.baseUrl} onChange={(e) => handleSettingChange('ollama.baseUrl', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                        </div>
                         <div>
                            <label htmlFor="ollama-model" className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                            <div className="flex gap-2">
                                <select id="ollama-model" value={localSettings.ollama.model} onChange={(e) => handleSettingChange('ollama.model', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" disabled={status === 'loading' || ollamaModels.length === 0}>
                                    {ollamaModels.map(model => <option key={model} value={model}>{model}</option>)}
                                    {ollamaModels.length === 0 && status !== 'loading' && <option>No models found</option>}
                                </select>
                                <button onClick={handleOllamaTest} disabled={status === 'loading'} className="py-2 px-4 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-wait transition-colors">
                                    {status === 'loading' ? 'Testing...' : 'Refresh'}
                                </button>
                            </div>
                            {status === 'success' && <p className="text-xs text-green-400 mt-2">Successfully connected to Ollama. Found {ollamaModels.length} models.</p>}
                            {status === 'error' && <p className="text-xs text-red-400 mt-2">Could not connect to Ollama. Check the URL and ensure Ollama is running.</p>}
                        </div>
                    </div>
                )}
            </>
            )}

            {activeTab === 'storage' && (
                <div className="space-y-6">
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Storage Paths</h3>
                        <p className="text-sm text-slate-400">Configure local storage paths for database, chat logs, and model cache.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Database Directory</label>
                                <input type="text" value={localSettings.storage?.databaseDir || ''} onChange={(e) => handleSettingChange('storage.databaseDir', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="e.g., data/qdrant" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Chat Logs Directory</label>
                                <input type="text" value={localSettings.storage?.chatLogsDir || ''} onChange={(e) => handleSettingChange('storage.chatLogsDir', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="e.g., data/chats" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Model Cache Directory</label>
                                <input type="text" value={localSettings.storage?.modelCacheDir || ''} onChange={(e) => handleSettingChange('storage.modelCacheDir', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="e.g., models_cache" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">Note: The model cache path is used by the embedding service to download and cache models in the selected location.</p>
                    </div>
                    
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Reference Dataset</h3>
                        <p className="text-sm text-slate-400">Upload a CSV or Excel file to be used as a knowledge source for recommendations in all exploration chats.</p>
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleDatasetUpload}
                            className="hidden"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        />
                        {!localSettings.referenceDatasetName ? (
                            <button onClick={() => fileInputRef.current?.click()} disabled={datasetStatus === 'loading'} className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-wait transition-colors">
                               <UploadIcon />
                               <span>{datasetStatus === 'loading' ? 'Processing...' : 'Upload Dataset'}</span>
                            </button>
                        ) : (
                             <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-md text-sm">
                                <div className="flex items-center gap-2 text-slate-300 truncate">
                                    <DocumentTextIcon className="w-5 h-5 text-teal-400 flex-shrink-0" />
                                    <span className="truncate">{localSettings.referenceDatasetName}</span>
                                </div>
                                <button onClick={handleRemoveDataset} className="p-1 rounded-full hover:bg-slate-600 text-slate-400 hover:text-white flex-shrink-0">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        {datasetStatus === 'error' && <p className="text-xs text-red-400 mt-2">{datasetError}</p>}
                    </div>

                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Embedding Service</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Service URL</label>
                                <input type="text" value={localSettings.embedding?.serviceUrl || ''} onChange={(e) => handleSettingChange('embedding.serviceUrl', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Embedding Model</label>
                                <input type="text" value={localSettings.embedding?.modelName || ''} onChange={(e) => handleSettingChange('embedding.modelName', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Rerank Model</label>
                                <input type="text" value={localSettings.embedding?.rerankModelName || ''} onChange={(e) => handleSettingChange('embedding.rerankModelName', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button onClick={async () => { setEmbedStatus('loading'); const res = await testEmbeddingService(localSettings); if(res.ok){ setEmbedStatus('success'); setEmbedInfo(res.info);} else { setEmbedStatus('error'); setEmbedInfo(res.error);} }} className="py-2 px-4 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition-colors">{embedStatus === 'loading' ? 'Testing...' : 'Test Embedding Service'}</button>
                            {embedStatus === 'success' && <span className="text-xs text-green-400">Connected. {embedInfo?.embed_model || ''}</span>}
                            {embedStatus === 'error' && <span className="text-xs text-red-400">Failed to connect.</span>}
                        </div>
                    </div>

                    <div className="space-y-4 p-4 rounded-lg border border-red-800 bg-red-900/20">
                        <h3 className="text-md font-semibold text-red-400">Factory Reset</h3>
                        <p className="text-sm text-slate-400 mb-4">Reset all settings to their default values. This will clear all your custom configurations including API keys, models, and preferences.</p>
                        <button 
                            onClick={() => {
                                if (confirm('Are you sure you want to reset all settings to factory defaults? This action cannot be undone.')) {
                                    resetToFactoryDefaults();
                                    setLocalSettings(defaultSettings);
                                }
                            }} 
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Reset to Factory Settings
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'rag' && (
                <div className="space-y-6">
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Qdrant Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Qdrant URL</label>
                                <input type="text" value={localSettings.qdrant?.url || ''} onChange={(e) => handleSettingChange('qdrant.url', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">API Key (optional)</label>
                                <input type="text" value={localSettings.qdrant?.apiKey || ''} onChange={(e) => handleSettingChange('qdrant.apiKey', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Collection</label>
                                <input type="text" value={localSettings.qdrant?.collection || ''} onChange={(e) => handleSettingChange('qdrant.collection', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Content Generation Models</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="knowledge-based" checked={localSettings.contentGeneration?.knowledgeBased ?? true} onChange={(e) => handleSettingChange('contentGeneration.knowledgeBased', e.target.checked)} />
                                <label htmlFor="knowledge-based" className="text-sm text-slate-300">Enable Knowledge-Based Recommendations</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="rag-based" checked={localSettings.contentGeneration?.ragBased ?? true} onChange={(e) => handleSettingChange('contentGeneration.ragBased', e.target.checked)} />
                                <label htmlFor="rag-based" className="text-sm text-slate-300">Enable RAG-Based Recommendations</label>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">Both models can run simultaneously. Knowledge-based uses only model knowledge, while RAG-based combines vector search with model knowledge.</p>
                    </div>

                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">RAG Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">TopK</label>
                                <input type="number" value={localSettings.rag?.topK ?? 30} onChange={(e) => handleSettingChange('rag.topK', Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Dense Weight</label>
                                <input type="number" step="0.05" value={localSettings.rag?.hybridWeights?.dense ?? 0.6} onChange={(e) => handleSettingChange('rag.hybridWeights.dense', Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Sparse Weight</label>
                                <input type="number" step="0.05" value={localSettings.rag?.hybridWeights?.sparse ?? 0.4} onChange={(e) => handleSettingChange('rag.hybridWeights.sparse', Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="rag-rerank" checked={localSettings.rag?.rerank ?? true} onChange={(e) => handleSettingChange('rag.rerank', e.target.checked)} />
                                <label htmlFor="rag-rerank" className="text-sm text-slate-300">Enable Reranking</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="allow-duplicate-retrieval" checked={localSettings.rag?.allowDuplicateRetrieval ?? false} onChange={(e) => handleSettingChange('rag.allowDuplicateRetrieval', e.target.checked)} />
                                <label htmlFor="allow-duplicate-retrieval" className="text-sm text-slate-300">Allow Duplicate Data Retrieval</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Required Keywords (comma-separated)</label>
                                <input type="text" value={(localSettings.rag?.requiredKeywords || []).join(', ')} onChange={(e) => handleSettingChange('rag.requiredKeywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Multi-Value Columns (comma-separated)</label>
                                <input type="text" value={(localSettings.rag?.multiValueColumns || []).join(', ')} onChange={(e) => handleSettingChange('rag.multiValueColumns', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'advanced' && (
                <div className="space-y-6">
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Advanced Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Creativity Temperature</label>
                                <input type="range" min="0" max="2" step="0.1" value={localSettings.advanced?.creativityTemperature ?? 0.7} onChange={(e) => handleSettingChange('advanced.creativityTemperature', Number(e.target.value))} className="w-full accent-teal-500" />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Conservative (0.0)</span>
                                    <span>Current: {localSettings.advanced?.creativityTemperature ?? 0.7}</span>
                                    <span>Creative (2.0)</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Top-P (Nucleus Sampling)</label>
                                <input type="range" min="0" max="1" step="0.05" value={localSettings.advanced?.topP ?? 0.9} onChange={(e) => handleSettingChange('advanced.topP', Number(e.target.value))} className="w-full accent-teal-500" />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Deterministic (0.0)</span>
                                    <span>Current: {localSettings.advanced?.topP ?? 0.9}</span>
                                    <span>Diverse (1.0)</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Max Tokens (0 = unlimited)</label>
                                <input type="number" min="0" max="32768" value={localSettings.advanced?.maxTokens ?? 0} onChange={(e) => handleSettingChange('advanced.maxTokens', e.target.value === '0' ? null : Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" />
                                <p className="text-xs text-slate-400 mt-1">Set to 0 for unlimited token generation</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Report Export Format</label>
                                <select value={localSettings.advanced?.reportExport?.format ?? 'json'} onChange={(e) => handleSettingChange('advanced.reportExport.format', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500">
                                    <option value="json">JSON</option>
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="auto-cleanup" checked={localSettings.advanced?.autoHistoryCleanup?.enabled ?? false} onChange={(e) => handleSettingChange('advanced.autoHistoryCleanup.enabled', e.target.checked)} />
                                <label htmlFor="auto-cleanup" className="text-sm text-slate-300">Enable Auto History Cleanup</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Days to Keep History</label>
                                <input type="number" min="1" max="365" value={localSettings.advanced?.autoHistoryCleanup?.daysToKeep ?? 30} onChange={(e) => handleSettingChange('advanced.autoHistoryCleanup.daysToKeep', Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" disabled={!(localSettings.advanced?.autoHistoryCleanup?.enabled ?? false)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="include-metadata" checked={localSettings.advanced?.reportExport?.includeMetadata ?? true} onChange={(e) => handleSettingChange('advanced.reportExport.includeMetadata', e.target.checked)} />
                                <label htmlFor="include-metadata" className="text-sm text-slate-300">Include Metadata</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Backup Directory</label>
                                <input type="text" value={localSettings.storage?.backupDir || ''} onChange={(e) => handleSettingChange('storage.backupDir', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="e.g., data/backups" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">System Prompts</h3>
                        <p className="text-sm text-slate-400 mb-4">Customize the system prompts used by different agents.</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Explorer Agent</span>
                                <button onClick={() => setEditingPrompt('explorerAgent')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors">Edit</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Knowledge-Based Agent</span>
                                <button onClick={() => setEditingPrompt('knowledgeBasedAgent')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors">Edit</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">RAG-Based Agent</span>
                                <button onClick={() => setEditingPrompt('ragBasedAgent')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors">Edit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'about' && (
                <div className="space-y-6">
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">About This Project</h3>
                        <p className="text-sm text-slate-400">This is an open-source project designed to provide intelligent chat exploration capabilities with support for multiple AI providers, RAG (Retrieval-Augmented Generation), and advanced customization options.</p>
                        <p className="text-sm text-slate-400">Key features include:</p>
                        <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                            <li>Multi-provider AI support (OpenAI, Google Gemini, Alibaba Cloud, Hugging Face, Ollama)</li>
                            <li>Advanced RAG capabilities with vector search</li>
                            <li>Customizable system prompts</li>
                            <li>Reference dataset integration</li>
                            <li>Flexible storage and backup options</li>
                        </ul>
                    </div>
                    <div className="space-y-4 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-white">Open Source & Collaboration</h3>
                        <p className="text-sm text-slate-400">This project is open source and welcomes contributions. If you'd like to collaborate or contribute to the project, feel free to reach out or submit pull requests.</p>
                        <p className="text-sm text-slate-400">For professional collaborations or inquiries, you can connect with me on LinkedIn.</p>
                        <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            Connect on LinkedIn
                        </a>
                    </div>
                </div>
            )}
        </div>
        
        <div className={`flex justify-end gap-3 p-4 border-t ${themes[theme].colors.border}`}>
          <button onClick={onClose} className={`px-4 py-2 rounded-lg ${themes[theme].colors.componentBgSolid} ${themes[theme].colors.textSecondary} ${themes[theme].colors.textHover} transition-colors`}>
            Cancel
          </button>
          <button onClick={handleSave} className={`px-4 py-2 rounded-lg ${themes[theme].colors.primary} ${themes[theme].colors.text} font-medium transition-colors`}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;