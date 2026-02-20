import React, { useState } from 'react';
import MarkdownPreview from './MarkdownPreview';

type TaskNotesProps = {
  taskId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
};

const TaskNotes: React.FC<TaskNotesProps> = ({ taskId, initialContent = '', onSave }) => {
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    if (onSave) onSave(content);
  };

  const highlightedContent = content.replace(/@[\w]+/g, (match) => `<span style="color: cyan">${match}</span>`);

  return (
    <div>
      <div>
        <button onClick={() => setIsPreview(!isPreview)}>
          {isPreview ? 'Edit' : 'Preview'}
        </button>
        {!isPreview && (
          <button onClick={handleSave} disabled={content === initialContent}>
            Save
          </button>
        )}
      </div>
      {isPreview ? (
        <MarkdownPreview content={highlightedContent} />
      ) : (
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Add your notes here..."
        />
      )}
    </div>
  );
};

export default TaskNotes;