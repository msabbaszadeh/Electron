import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Settings } from '../types';
// Fix: Import from relative path
import { INTERVIEWER_PROMPT, JSON_MAKER_PROMPT, EXPLORER_PROMPT, KNOWLEDGE_BASED_PROMPT, RAG_BASED_PROMPT } from '../constants';

const defaultPrompts = {
    INTERVIEWER_PROMPT,
    JSON_MAKER_PROMPT,
    EXPLORER_PROMPT,
    KNOWLEDGE_BASED_PROMPT,
    RAG_BASED_PROMPT,
};

export const defaultSettings: Settings = {
  provider: 'gemini',
  gemini: {},
  openai: {},
  alibaba: {},
  huggingface: {},
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama2',
  },
  prompts: defaultPrompts,
  referenceDataset: undefined,
  referenceDatasetName: undefined,
  embedding: {
    serviceUrl: 'http://localhost:8000',
    modelName: 'BAAI/bge-m3',
    rerankModelName: 'BAAI/bge-reranker-v2-m3',
  },
  qdrant: {
    url: 'http://localhost:6333',
    apiKey: '',
    collection: 'cag_dataset',
  },
  rag: {
    topK: 30,
    hybridWeights: { dense: 0.6, sparse: 0.4 },
    rerank: true,
    requiredKeywords: [],
    multiValueColumns: [],
    allowDuplicateRetrieval: false,
  },
  contentGeneration: {
    knowledgeBased: {
      enabled: true,
    },
    ragBased: {
      enabled: true,
    },
  },
  storage: {
    databaseDir: 'data/qdrant',
    chatLogsDir: 'data/chats',
    modelCacheDir: 'models_cache',
    backupDir: 'data/backups',
  },
  advanced: {
    creativityTemperature: 0.7,
    topP: 0.9,
    maxTokens: null, // null for unlimited
    autoHistoryCleanup: {
      enabled: false,
      daysToKeep: 30,
    },
    reportExport: {
      format: 'json',
      includeMetadata: true,
    },
  },
};

interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  saveSettings: (newSettings: Settings) => void;
  updatePrompt: (key: string, value: string) => void;
  resetPrompts: () => void;
  resetToFactoryDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<Settings>('electron-settings', defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ensure prompts are initialized
  useEffect(() => {
    if (!settings.prompts) {
      setSettings(s => ({...s, prompts: defaultPrompts}));
    }
  }, [settings.prompts, setSettings]);


  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const updatePrompt = (key: string, value: string) => {
    setSettings(prev => ({
        ...prev,
        prompts: {
            ...(prev.prompts || defaultPrompts),
            [key]: value
        }
    }));
  };
  
  const resetPrompts = () => {
    setSettings(prev => ({
        ...prev,
        prompts: defaultPrompts
    }));
  }

  const resetToFactoryDefaults = () => {
    setSettings(defaultSettings);
  }

  const value = {
      settings,
      setSettings,
      isSettingsOpen,
      setIsSettingsOpen,
      saveSettings,
      updatePrompt,
      resetPrompts,
      resetToFactoryDefaults
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};