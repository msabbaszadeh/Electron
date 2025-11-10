
import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from './icons/Icons';
import { useTheme } from '../context/ThemeContext';

interface InputBarProps {
  onSendMessage: (text: string, files?: File[]) => void;
  disabled?: boolean;
  enableFileUpload?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, disabled, enableFileUpload }) => {
  const { theme, themes } = useTheme();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((text.trim() || files.length > 0) && !disabled) {
      onSendMessage(text.trim(), files.length > 0 ? files : undefined);
      setText('');
      setFiles([]);
      setInputError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      const newFiles = Array.from(e.target.files);
      const accepted: File[] = [];
      for (const f of newFiles) {
        if (f.size > MAX_SIZE) {
          setInputError(`File too large: ${f.name}. Max 10MB.`);
          continue;
        }
        accepted.push(f);
      }
      if (accepted.length) {
        setFiles(prev => [...prev, ...accepted]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllFiles = () => {
    setFiles([]);
    setInputError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('text')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    return '📎';
  };

  return (
    <div className={`border-t ${themes[theme].colors.border} p-4 ${themes[theme].colors.inputBg}`}>
      {inputError && (
        <div className={`mb-2 text-xs ${themes[theme].colors.error}`}>{inputError}</div>
      )}
      {files.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${themes[theme].colors.textSecondary}`}>Attached Files ({files.length}):</span>
            <button 
              onClick={removeAllFiles} 
              className={`text-xs ${themes[theme].colors.error} ${themes[theme].colors.errorHover}`}
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className={`flex items-center gap-2 px-3 py-1 ${themes[theme].colors.componentBgSolid} rounded-lg text-sm`}>
                <span>{getFileIcon(file.type)}</span>
                <span className={`${themes[theme].colors.textSecondary} max-w-32 truncate`}>{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className={`${themes[theme].colors.error} ${themes[theme].colors.errorHover} ml-1`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={`relative flex items-center ${themes[theme].colors.componentBgSolid} rounded-lg`}>
        {enableFileUpload && (
            <>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-3 ${themes[theme].colors.textSecondary} ${themes[theme].colors.textHover} disabled:${themes[theme].colors.textSecondary}`}
                    disabled={disabled}
                    aria-label="Attach file"
                >
                    <PaperClipIcon />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept=".txt,.pdf,.doc,.docx,.csv,.xlsx,.xls,.json,.md,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg"
                />
            </>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
          className={`flex-1 bg-transparent p-3 text-sm ${themes[theme].colors.text} placeholder:text-gray-500 resize-none focus:outline-none`}
          rows={1}
          disabled={disabled}
          style={{ maxHeight: '100px', overflowY: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && files.length === 0)}
          className={`p-3 ${themes[theme].colors.textSecondary} ${themes[theme].colors.textHover} disabled:${themes[theme].colors.textSecondary} disabled:cursor-not-allowed`}
          aria-label="Send message"
        >
          <PaperAirplaneIcon />
        </button>
      </div>
    </div>
  );
};

export default InputBar;