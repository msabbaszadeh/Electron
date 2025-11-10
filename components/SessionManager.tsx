import React, { useState, useRef, useEffect } from 'react';
import { TrashIcon, PencilIcon, PlusIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface Session {
  id: string;
  title: string;
  timestamp: number;
  messages?: any[];
}

interface SessionManagerProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onSessionCreate: () => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newTitle: string) => void;
  onSessionReorder: (sessionIds: string[]) => void;
}

export default function SessionManager({
  sessions,
  currentSessionId,
  onSessionSelect,
  onSessionCreate,
  onSessionDelete,
  onSessionRename,
  onSessionReorder
}: SessionManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const handleRenameStart = (session: Session) => {
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const handleRenameSave = (sessionId: string) => {
    if (editingTitle.trim()) {
      onSessionRename(sessionId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDragStart = (e: React.DragEvent, sessionId: string) => {
    setDraggedItem(sessionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, sessionId: string) => {
    e.preventDefault();
    dragOverItem.current = sessionId;
  };

  const handleDragEnd = () => {
    if (draggedItem && dragOverItem.current && draggedItem !== dragOverItem.current) {
      const newSessions = [...sessions];
      const draggedIndex = newSessions.findIndex(s => s.id === draggedItem);
      const targetIndex = newSessions.findIndex(s => s.id === dragOverItem.current);
      
      const [draggedSession] = newSessions.splice(draggedIndex, 1);
      newSessions.splice(targetIndex, 0, draggedSession);
      
      onSessionReorder(newSessions.map(s => s.id));
    }
    setDraggedItem(null);
    dragOverItem.current = null;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-white">Chat Sessions</h3>
        <button
          onClick={onSessionCreate}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          title="New Chat"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500">
            <ChatBubbleLeftRightIcon className="w-8 h-8 mb-2" />
            <p className="text-sm text-center">No chat sessions yet</p>
            <p className="text-xs text-center mt-1">Click + to start a new chat</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              draggable
              onDragStart={(e) => handleDragStart(e, session.id)}
              onDragOver={(e) => handleDragOver(e, session.id)}
              onDragEnd={handleDragEnd}
              className={`group relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                currentSessionId === session.id
                  ? 'bg-teal-600/20 border border-teal-500/30'
                  : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
              } ${draggedItem === session.id ? 'opacity-50' : ''}`}
            >
              {/* Drag Handle */}
              <div className="flex-shrink-0 mr-2 text-slate-500 group-hover:text-slate-300">
                <Bars3Icon className="w-4 h-4" />
              </div>

              {/* Session Info */}
              <div
                className="flex-1 min-w-0"
                onClick={() => onSessionSelect(session.id)}
              >
                {editingId === session.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSave(session.id);
                        if (e.key === 'Escape') handleRenameCancel();
                      }}
                      className="flex-1 px-2 py-1 text-sm bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameSave(session.id)}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleRenameCancel}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-teal-300">
                      {session.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(session.timestamp)}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId !== session.id && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameStart(session);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Rename"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionDelete(session.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Add missing icon component
function ChatBubbleLeftRightIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}