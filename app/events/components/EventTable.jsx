'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import EventModal from './EventModal';
import DeleteEventModal from './DeleteEventModal';

export default function EventTable({ events }) {
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const getStatusBadge = (event) => {
    if (event.isDeleted) {
      return <span className="badge badge-error">Deleted</span>;
    } else if (event.isApproved) {
      return <span className="badge badge-success">Approved</span>;
    } else {
      return <span className="badge badge-warning">Pending</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const toggleExpand = (id) => {
    if (expandedEvent === id) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(id);
    }
  };

  const handleEditClick = (event, e) => {
    e.stopPropagation();
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (event, e) => {
    e.stopPropagation();
    setDeletingEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    // Increment refreshKey to force a refetch of data
    setRefreshKey(prev => prev + 1);
    // Reload the page to get fresh data
    window.location.reload();
  };

  return (
    <>
      <div className="overflow-x-auto bg-base-200 rounded-lg">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th></th>
              <th>Event Name</th>
              <th>Organization</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Source</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <Fragment key={event.id}>
                <tr className="hover">
                  <td>
                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => toggleExpand(event.id)}
                    >
                      {expandedEvent === event.id ? '▼' : '▶'}
                    </button>
                  </td>
                  <td className="font-medium">{event.eventName}</td>
                  <td>{event.scrapeJob.eventSource.organization.name}</td>
                  <td className="whitespace-nowrap">{formatDate(event.startDate)}</td>
                  <td>{getStatusBadge(event)}</td>
                  <td className="truncate max-w-[200px]" title={event.scrapeJob.eventSource.url}>
                    {event.scrapeJob.eventSource.url}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Link
                        href={`/organizations/${event.scrapeJob.eventSource.organizationId}/sources/${event.scrapeJob.eventSourceId}/events`}
                        className="btn btn-xs btn-primary"
                      >
                        View Source
                      </Link>
                      <button
                        className="btn btn-xs btn-secondary"
                        onClick={(e) => handleEditClick(event, e)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={(e) => handleDeleteClick(event, e)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedEvent === event.id && (
                  <tr>
                    <td colSpan="7" className="p-0">
                      <div className="p-4 bg-base-100 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-bold text-lg mb-2">{event.eventName}</h3>

                            <p><strong>Start Date:</strong> {formatDate(event.startDate)}</p>
                            {event.endDate && (
                              <p><strong>End Date:</strong> {formatDate(event.endDate)}</p>
                            )}
                            <p><strong>Price:</strong> {event.price || 'Unknown'}</p>
                            <p><strong>Status:</strong> {getStatusBadge(event)}</p>
                          </div>

                          <div>
                            <p><strong>Organization:</strong> {event.scrapeJob.eventSource.organization.name}</p>
                            <p><strong>Source URL:</strong> {event.scrapeJob.eventSource.url}</p>
                            <p><strong>Scrape Date:</strong> {formatDate(event.scrapeJob.createdAt)}</p>
                            <p><strong>Fingerprint:</strong> <code className="text-xs">{event.eventFingerprint}</code></p>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4 gap-2">
                          <Link
                            href={`/organizations/${event.scrapeJob.eventSource.organizationId}/sources/${event.scrapeJob.eventSourceId}/events`}
                            className="btn btn-sm btn-primary"
                          >
                            View All Events
                          </Link>
                          <Link
                            href={`/organizations/${event.scrapeJob.eventSource.organizationId}/sources/${event.scrapeJob.eventSourceId}/diff`}
                            className="btn btn-sm btn-info"
                          >
                            Compare Changes
                          </Link>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={(e) => handleEditClick(event, e)}
                          >
                            Edit Event
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={(e) => handleDeleteClick(event, e)}
                          >
                            Delete Event
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {editingEvent && (
        <EventModal
          event={editingEvent}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {deletingEvent && (
        <DeleteEventModal
          event={deletingEvent}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}