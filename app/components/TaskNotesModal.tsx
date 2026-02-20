import React from 'react';
import TaskNotes from './TaskNotes';

type TaskNotesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  initialContent?: string;
};

const TaskNotesModal: React.FC<TaskNotesModalProps> = ({ isOpen, onClose, taskId, initialContent }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '80%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
            ×
          </button>
        </div>
        <TaskNotes taskId={taskId} initialContent={initialContent} />
      </div>
    </div>
  );
};

export default TaskNotesModal;