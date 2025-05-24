'use client';

import { useState } from 'react';
import { deleteEvent } from '../actions';

export default function DeleteEventModal({ 
  event, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteEvent(event.id);
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to delete event');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Delete Event</h2>
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <p className="mb-6">
          Are you sure you want to delete the event <strong>"{event.eventName}"</strong>?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-error"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner"></span> : 'Delete Event'}
          </button>
        </div>
      </div>
    </div>
  );
}