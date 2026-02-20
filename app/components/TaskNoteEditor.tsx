'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, Code, Link, List, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskNotes } from '@/app/hooks/useTaskNotes';
import { MentionDropdown } from './MentionDropdown';

interface TaskNoteEditorProps {
  taskId: string;
  expanded?: boolean;
  onExpand?: () => void;
}

export function TaskNoteEditor({ taskId, expanded = false, onExpand }: TaskNoteEditorProps) {
  const { note, saveNote, isSaving, lastSaved, hasNote } = useTaskNotes(taskId);
  const [content, setContent] = useState(note?.content || '');
  const [isPreview, setIsPreview] = useState(false);
  const [showMention, setShowMention] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(expanded);

  useEffect(() => {
    if (note) {
      setContent(note.content);
    }
  }, [note?.id]);

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== (note?.content || '')) {
        saveNote(content);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [content, note?.content, saveNote]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Check for @ mention
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newContent.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && cursorPosition - lastAtIndex <= 20) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ')) {
        // Show mention dropdown
        const rect = e.target.getBoundingClientRect();
        setMentionPosition({
          top: rect.top + e.target.scrollTop + 30,
          left: rect.left + 20,
        });
        setShowMention(true);
      } else {
        setShowMention(false);
      }
    } else {
      setShowMention(false);
    }
  };

  const handleMentionSelect = (markdown: string) => {
    if (!textareaRef.current) return;
    
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newContent = 
      content.slice(0, lastAtIndex) + 
      markdown + 
      content.slice(cursorPosition);
    
    setContent(newContent);
    setShowMention(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPosition = lastAtIndex + markdown.length;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertMarkdown = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.slice(start, end);
    
    const newContent = 
      content.slice(0, start) + 
      before + selectedText + after + 
      content.slice(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      onExpand?.();
    }
  };

  return (
    <div className={`glass overflow-hidden transition-all ${isExpanded ? 'p-4' : 'p-3'}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertMarkdown('**', '**')}
            className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white/90"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white/90"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertMarkdown('`', '`')}
            className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white/90"
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertMarkdown('[', '](url)')}
            className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white/90"
            title="Link"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertMarkdown('\n- ')}
            className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white/90"
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <span className="text-white/20 mx-1">|</span>
          <span className="text-xs text-white/40">Type @ to mention</span>
        </div>
        
        <button
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/90 text-sm"
        >
          {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div className="min-h-[120px] max-h-[400px] overflow-y-auto prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || '*No notes yet*'}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="Write notes... Use @ to mention agents"
          className={`w-full bg-transparent text-white/90 placeholder:text-white/30 resize-none outline-none ${
            isExpanded ? 'min-h-[200px]' : 'min-h-[60px]'
          }`}
          maxLength={5000}
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-white/40">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </>
          ) : lastSaved ? (
            <>Auto-saved {lastSaved.toLocaleTimeString()}</>
          ) : (
            'Not saved yet'
          )}
        </div>
        <span className={`text-xs ${content.length > 4500 ? 'text-orange-400' : 'text-white/40'}`}>
          {content.length}/5000
        </span>
      </div>

      {/* Mention Dropdown */}
      {showMention && (
        <MentionDropdown
          position={mentionPosition}
          onSelect={handleMentionSelect}
        />
      )}
    </div>
  );
}
