import { useState, useEffect } from 'react';
import { ChatSession, Message } from '../types';
import { sessionManager } from '../services/sessionManager';

export function useSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    const unsubscribe = sessionManager.subscribe((updatedSessions) => {
      setSessions(updatedSessions);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const createSession = (title: string, messages: Message[] = []) => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    sessionManager.saveSession(newSession);
    return newSession;
  };

  const updateSession = (sessionId: string, messages: Message[]) => {
    const session = sessionManager.getSession(sessionId);
    if (session) {
      session.messages = messages;
      session.updatedAt = new Date().toISOString();
      sessionManager.saveSession(session);
    }
  };

  const deleteSession = (sessionId: string) => {
    sessionManager.deleteSession(sessionId);
  };

  const renameSession = (sessionId: string, newTitle: string) => {
    sessionManager.updateSessionTitle(sessionId, newTitle);
  };

  const reorderSessions = (sessionIds: string[]) => {
    sessionManager.reorderSessions(sessionIds);
  };

  const loadSession = (sessionId: string): ChatSession | undefined => {
    return sessionManager.getSession(sessionId);
  };

  const switchSession = (sessionId: string) => {
    sessionManager.setActiveSession(sessionId);
  };

  const getActiveSession = () => {
    return sessionManager.getActiveSession();
  };

  return {
    sessions,
    activeSession: getActiveSession(),
    createSession,
    updateSession,
    deleteSession,
    renameSession,
    reorderSessions,
    loadSession,
    switchSession
  };
}