

import React, { useState } from 'react';
import { Message, MessageSender } from '../types';
import { UserCircleIcon, SparklesIcon, CogIcon, ClipboardIcon } from './icons/Icons';
import { useTheme } from '../context/ThemeContext';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { theme, themes } = useTheme();
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === MessageSender.USER;
  const isSystem = message.sender === MessageSender.SYSTEM;
  
  const bubbleStyles = isUser
    ? `${themes[theme].colors.primary} ${themes[theme].colors.text} rounded-br-none`
    : isSystem 
    ? `bg-transparent ${themes[theme].colors.textSecondary} text-center text-xs italic`
    : `${themes[theme].colors.componentBg} ${themes[theme].colors.text} rounded-bl-none border ${themes[theme].colors.border}`;
    
  const alignment = isUser ? 'justify-end' : isSystem ? 'justify-center' : 'justify-start';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // Silently fail; clipboard may be unavailable
    }
  };

  if (isSystem) {
    return (
        <div className={`w-full`}>
          <div className={`flex ${alignment} w-full`}>
            <div className="flex items-center gap-2 px-4 py-2">
              <CogIcon />
              <p>{message.text}</p>
            </div>
          </div>
          <div className={`flex ${alignment} mt-1`}>
            <button onClick={handleCopy} className={`flex items-center gap-1 text-xs ${themes[theme].colors.textSecondary} ${themes[theme].colors.hover} ${themes[theme].colors.textHover} px-2 py-1 rounded`}> 
              <ClipboardIcon className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className={`w-full`}>
      <div className={`flex items-start gap-3 ${alignment}`}>
        {!isUser && <div className={`w-8 h-8 flex-shrink-0 ${themes[theme].colors.componentBgSolid} rounded-full flex items-center justify-center ${themes[theme].colors.primaryHover}`}><SparklesIcon /></div>}
        <div className="flex flex-col gap-1">
          <div
            className={`px-4 py-3 rounded-2xl max-w-xl md:max-w-2xl whitespace-pre-wrap break-words ${bubbleStyles}`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
          {/* Model type indicator for AI messages */}
          {!isUser && !isSystem && message.modelType && (
            <div className={`text-xs ${themes[theme].colors.textSecondary} px-2 py-1 rounded ${themes[theme].colors.componentBg} border ${themes[theme].colors.border} inline-block self-start`}>
              {message.modelType === 'knowledge' && '🧠 Knowledge-Based'}
              {message.modelType === 'rag' && '📚 RAG-Based'}
              {message.modelType === 'explorer' && '🔍 Explorer'}
            </div>
          )}
        </div>
         {isUser && <div className={`w-8 h-8 flex-shrink-0 ${themes[theme].colors.componentBgSolid} rounded-full flex items-center justify-center ${themes[theme].colors.textSecondary}`}><UserCircleIcon /></div>}
      </div>
      <div className={`flex ${alignment} mt-1`}>
        <button onClick={handleCopy} className={`flex items-center gap-1 text-xs ${themes[theme].colors.textSecondary} ${themes[theme].colors.hover} ${themes[theme].colors.textHover} px-2 py-1 rounded`}>
          <ClipboardIcon className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export default MessageBubble;