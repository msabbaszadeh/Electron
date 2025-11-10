import { ChatSession } from '../types';

export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, ChatSession> = new Map();
  private activeSessionId: string | null = null;
  private listeners: Set<(sessions: ChatSession[], activeSessionId: string | null) => void> = new Set();

  private constructor() {
    this.loadFromStorage();
    this.setupStorageListener();
    this.activeSessionId = localStorage.getItem('active_session_id');
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key && (e.key.startsWith('chat_session_') || e.key === 'active_session_id')) {
        this.loadFromStorage();
        this.activeSessionId = localStorage.getItem('active_session_id');
        this.notifyListeners();
      }
    });
  }

  private loadFromStorage() {
    this.sessions.clear();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_session_')) {
        try {
          const sessionData = localStorage.getItem(key);
          if (sessionData) {
            const session: ChatSession = JSON.parse(sessionData);
            this.sessions.set(session.id, session);
          }
        } catch (error) {
          console.error('Error loading session from storage:', error);
        }
      }
    }
  }

  private saveToStorage(session: ChatSession) {
    localStorage.setItem(`chat_session_${session.id}`, JSON.stringify(session));
  }

  private removeFromStorage(sessionId: string) {
    localStorage.removeItem(`chat_session_${sessionId}`);
  }

  private notifyListeners() {
    const sessionsArray = Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    this.listeners.forEach(listener => listener(sessionsArray, this.activeSessionId));
  }

  subscribe(callback: (sessions: ChatSession[], activeSessionId: string | null) => void) {
    this.listeners.add(callback);
    // Immediately call with current sessions and active session
    callback(
      Array.from(this.sessions.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
      this.activeSessionId
    );
    return () => {
      this.listeners.delete(callback);
    };
  }

  getSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  saveSession(session: ChatSession) {
    this.sessions.set(session.id, session);
    this.saveToStorage(session);
    this.notifyListeners();
  }

  deleteSession(sessionId: string) {
    this.sessions.delete(sessionId);
    this.removeFromStorage(sessionId);
    if (this.activeSessionId === sessionId) {
      this.setActiveSession(null);
    }
    this.notifyListeners();
  }

  updateSessionTitle(sessionId: string, newTitle: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = newTitle;
      session.updatedAt = new Date().toISOString();
      this.sessions.set(sessionId, session);
      this.saveToStorage(session);
      this.notifyListeners();
    }
  }

  reorderSessions(sessionIds: string[]) {
    const reorderedSessions = sessionIds.map(id => this.sessions.get(id)).filter(Boolean) as ChatSession[];
    
    // Clear existing sessions and rebuild
    this.sessions.clear();
    reorderedSessions.forEach(session => {
      this.sessions.set(session.id, session);
    });

    // Save all sessions to maintain order
    reorderedSessions.forEach(session => {
      this.saveToStorage(session);
    });

    this.notifyListeners();
  }

  setActiveSession(sessionId: string | null) {
    this.activeSessionId = sessionId;
    if (sessionId) {
      localStorage.setItem('active_session_id', sessionId);
    } else {
      localStorage.removeItem('active_session_id');
    }
    this.notifyListeners();
  }

  getActiveSession(): string | null {
    return this.activeSessionId;
  }

  clearAllSessions() {
    const sessionIds = Array.from(this.sessions.keys());
    sessionIds.forEach(sessionId => {
      this.removeFromStorage(sessionId);
    });
    this.sessions.clear();
    this.notifyListeners();
  }
}

export const sessionManager = SessionManager.getInstance();