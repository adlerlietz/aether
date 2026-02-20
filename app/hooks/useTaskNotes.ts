'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TaskNote {
  id: string;
  taskId: string;
  content: string;
  author: 'user' | 'charles' | 'dexter' | 'oliver' | 'henry' | 'victor';
  timestamp: string;
  version: number;
}

export interface TaskNoteVersion {
  noteId: string;
  content: string;
  timestamp: string;
  author: string;
  version: number;
}

interface NoteStorage {
  current: TaskNote;
  versions: TaskNoteVersion[];
  lastModified: string;
}

export function useTaskNotes(taskId: string) {
  const storageKey = `aether-notes-${taskId}`;
  
  const [note, setNote] = useState<TaskNote | null>(null);
  const [versions, setVersions] = useState<TaskNoteVersion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: NoteStorage = JSON.parse(saved);
        setNote(parsed.current);
        setVersions(parsed.versions);
        setLastSaved(new Date(parsed.lastModified));
      } catch {
        // Invalid data, start fresh
      }
    }
  }, [taskId, storageKey]);

  // Auto-save with debounce
  const saveNote = useCallback((content: string, author: TaskNote['author'] = 'user') => {
    setIsSaving(true);
    
    const now = new Date().toISOString();
    const newNote: TaskNote = {
      id: `${taskId}-${Date.now()}`,
      taskId,
      content,
      author,
      timestamp: now,
      version: (note?.version || 0) + 1,
    };

    const newVersion: TaskNoteVersion = {
      noteId: newNote.id,
      content,
      timestamp: now,
      author,
      version: newNote.version,
    };

    const updatedVersions = [...versions, newVersion];
    
    const storage: NoteStorage = {
      current: newNote,
      versions: updatedVersions,
      lastModified: now,
    };

    localStorage.setItem(storageKey, JSON.stringify(storage));
    setNote(newNote);
    setVersions(updatedVersions);
    setLastSaved(new Date(now));
    setIsSaving(false);
  }, [taskId, note, versions, storageKey]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (note && !isSaving) {
        // Auto-save indicator handled by parent
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [note, isSaving]);

  const restoreVersion = useCallback((versionNumber: number) => {
    const version = versions.find(v => v.version === versionNumber);
    if (!version) return;

    const now = new Date().toISOString();
    const restoredNote: TaskNote = {
      id: `${taskId}-${Date.now()}`,
      taskId,
      content: version.content,
      author: 'user',
      timestamp: now,
      version: (note?.version || 0) + 1,
    };

    const newVersion: TaskNoteVersion = {
      noteId: restoredNote.id,
      content: version.content,
      timestamp: now,
      author: 'user (restored)',
      version: restoredNote.version,
    };

    const updatedVersions = [...versions, newVersion];
    
    const storage: NoteStorage = {
      current: restoredNote,
      versions: updatedVersions,
      lastModified: now,
    };

    localStorage.setItem(storageKey, JSON.stringify(storage));
    setNote(restoredNote);
    setVersions(updatedVersions);
    setLastSaved(new Date(now));
  }, [taskId, note, versions, storageKey]);

  const deleteNote = useCallback(() => {
    localStorage.removeItem(storageKey);
    setNote(null);
    setVersions([]);
    setLastSaved(null);
  }, [storageKey]);

  return {
    note,
    versions,
    isSaving,
    lastSaved,
    saveNote,
    restoreVersion,
    deleteNote,
    hasNote: !!note && note.content.length > 0,
  };
}
