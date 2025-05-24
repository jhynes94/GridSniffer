'use client';

import { useState } from 'react';
import EventModal from './EventModal';
import DeleteEventModal from './DeleteEventModal';

function statusColor(status) {
  switch (status) {
    case 'RUNNING': return 'badge-warning';
    case 'SUCCESS': return 'badge-success';
    case 'ERROR': return 'badge-error';
    default: return 'badge-ghost'; // PENDING or undefined
  }
}

export default function EventList({ events, organizationId, sourceId }) {
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (event) => {
    setDeletingEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    // Increment refreshKey to force a refetch of data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      {events.length === 0 ? (
        <p className="text-gray-500">No events scraped yet.</p>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="card shadow bg-base-200 card-bordered p-4">
              <div className="flex justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">{event.eventName}</h2>

                  <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>

                  {event.endDate && (
                    <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
                  )}

                  <p><strong>Price:</strong> {event.price || 'Unknown'}</p>

                  <p>
                    <strong>Scraped:</strong>{' '}
                    {new Date(event.scrapeDate).toLocaleString()}
                  </p>

                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`badge ${statusColor(event.scrapeStatus)}`}>
                      {event.scrapeStatus}
                    </span>
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEditClick(event)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={() => handleDeleteClick(event)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingEvent && (
        <EventModal
          event={editingEvent}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          organizationId={organizationId}
          sourceId={sourceId}
          onSuccess={handleSuccess}
        />
      )}

      {deletingEvent && (
        <DeleteEventModal
          event={deletingEvent}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          organizationId={organizationId}
          sourceId={sourceId}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}