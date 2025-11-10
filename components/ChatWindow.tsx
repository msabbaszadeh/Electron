
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import { LoadingSpinner } from './icons/Icons';
import { useTheme } from '../context/ThemeContext';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const { theme, themes } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${themes[theme].colors.mainContentBg}`}>
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
            <div className={`flex items-center gap-2 ${themes[theme].colors.componentBgSolid} ${themes[theme].colors.textSecondary} px-4 py-2 rounded-2xl rounded-bl-none max-w-lg`}>
                <LoadingSpinner />
                <span className="text-sm animate-pulse">AI is thinking...</span>
            </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;