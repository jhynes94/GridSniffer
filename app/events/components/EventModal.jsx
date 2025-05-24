'use client';

import { useState, useEffect } from 'react';
import { editEvent } from '../actions';

export default function EventModal({ 
  event, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    eventName: '',
    startDate: '',
    endDate: '',
    price: '',
    location: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (event) {
      setFormData({
        eventName: event.eventName || '',
        startDate: event.startDate ? formatDateForInput(new Date(event.startDate)) : '',
        endDate: event.endDate ? formatDateForInput(new Date(event.endDate)) : '',
        price: event.price || '',
        location: event.location || {}
      });
    }
  }, [event]);

  // Format date to YYYY-MM-DDTHH:MM format for input elements
  const formatDateForInput = (date) => {
    return date.toISOString().slice(0, 16);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await editEvent(event.id, formData);
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to update event');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Event</h2>
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Event Name</span>
            </label>
            <input 
              type="text" 
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Start Date & Time</span>
            </label>
            <input 
              type="datetime-local" 
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">End Date & Time (Optional)</span>
            </label>
            <input 
              type="datetime-local" 
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="input input-bordered"
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Price (Optional)</span>
            </label>
            <input 
              type="text" 
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="e.g., Free, $10, $5-$20"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button 
              type="button" 
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}