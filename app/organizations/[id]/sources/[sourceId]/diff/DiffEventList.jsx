'use client';

import { useState } from 'react';
import EventCard from './EventCard';
import EventDetailModal from './EventDetailModal';

export default function DiffEventList({ 
  events, 
  selectedEvents, 
  onSelectEvent
}) {
  const [detailModalData, setDetailModalData] = useState(null);

  const handleViewDetails = (event, category) => {
    setDetailModalData({ event, category });
  };

  const closeModal = () => {
    setDetailModalData(null);
  };

  const { newEvents, modifiedEvents, unchangedEvents, removedEvents } = events;

  // Helper to show empty state message
  const showEmptyState = () => {
    if (
      newEvents.length === 0 && 
      modifiedEvents.length === 0 && 
      unchangedEvents.length === 0 && 
      removedEvents.length === 0
    ) {
      return (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No events to display with the current filter.</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {showEmptyState()}
      
      {/* New Events Section */}
      {newEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-success mb-4">
            New Events ({newEvents.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {newEvents.map(event => (
              <EventCard 
                key={event.id}
                event={event}
                type="new"
                isSelected={selectedEvents.newSelected[event.id]}
                onSelect={(isSelected) => onSelectEvent(event.id, 'new', isSelected)}
                onViewDetails={() => handleViewDetails(event, 'new')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modified Events Section */}
      {modifiedEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-warning mb-4">
            Modified Events ({modifiedEvents.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modifiedEvents.map(event => (
              <EventCard 
                key={event.latest.id}
                event={event.latest}
                changes={event.changes}
                previousEvent={event.previous}
                type="modified"
                isSelected={selectedEvents.modifiedSelected[event.latest.id]}
                onSelect={(isSelected) => onSelectEvent(event.latest.id, 'modified', isSelected)}
                onViewDetails={() => handleViewDetails(event, 'modified')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Removed Events Section */}
      {removedEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-error mb-4">
            Removed Events ({removedEvents.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {removedEvents.map(event => (
              <EventCard 
                key={event.id}
                event={event}
                type="removed"
                isSelected={selectedEvents.removedSelected[event.id]}
                onSelect={(isSelected) => onSelectEvent(event.id, 'removed', isSelected)}
                onViewDetails={() => handleViewDetails(event, 'removed')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unchanged Events Section */}
      {unchangedEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-info mb-4">
            Unchanged Events ({unchangedEvents.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unchangedEvents.map(event => (
              <EventCard 
                key={event.id}
                event={event}
                type="unchanged"
                isSelected={selectedEvents.unchangedSelected?.[event.id]}
                onSelect={(isSelected) => onSelectEvent(event.id, 'unchanged', isSelected)}
                onViewDetails={() => handleViewDetails(event, 'unchanged')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalData && (
        <EventDetailModal 
          data={detailModalData}
          onClose={closeModal}
          onSelect={onSelectEvent}
        />
      )}
    </div>
  );
}