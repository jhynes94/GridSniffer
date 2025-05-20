'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categorizeEvents } from '@/lib/event-utils';
import { applyDiffChanges } from './actions';
import DiffSummary from './DiffSummary';
import DiffControls from './DiffControls';
import DiffEventList from './DiffEventList';

export default function DiffContainer({ 
  organizationId, 
  sourceId, 
  latestScrape, 
  previousScrape 
}) {
  const router = useRouter();
  
  // State for diff results
  const [diffResults, setDiffResults] = useState({
    newEvents: [],
    modifiedEvents: [],
    unchangedEvents: [],
    removedEvents: [],
  });

  // State for selected events to approve/reject
  const [selectedEvents, setSelectedEvents] = useState({
    newSelected: {},
    modifiedSelected: {},
    removedSelected: {},
    unchangedSelected: {}, // Add state for unchanged events
  });

  // State for filter view
  const [activeFilter, setActiveFilter] = useState('all');
  
  // State for loading state during submissions
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Process the diffs on component mount
  useEffect(() => {
    // Categorize events using the utility function
    const results = categorizeEvents(latestScrape.events, previousScrape.events);
    setDiffResults(results);
  }, [latestScrape, previousScrape]);

  // Event handlers for selection
  const handleSelectEvent = (eventId, category, isSelected) => {
    setSelectedEvents(prev => ({
      ...prev,
      [`${category}Selected`]: {
        ...prev[`${category}Selected`],
        [eventId]: isSelected,
      }
    }));
  };

  // Handler for accepting/rejecting all changes in a category
  const handleBulkAction = (action, category = 'all') => {
    const newSelected = { ...selectedEvents };
    
    // Helper to select/deselect all events in a category
    const updateCategory = (categoryName, events) => {
      const categoryKey = `${categoryName}Selected`;
      newSelected[categoryKey] = { ...newSelected[categoryKey] };
      
      events.forEach(event => {
        // For modified events, the latest event is what we want to track
        const eventId = categoryName === 'modified' ? event.latest.id : event.id;
        newSelected[categoryKey][eventId] = action === 'accept';
      });
    };
    
    // Apply to specific or all categories
    if (category === 'all' || category === 'new') {
      updateCategory('new', diffResults.newEvents);
    }
    
    if (category === 'all' || category === 'modified') {
      updateCategory('modified', diffResults.modifiedEvents);
    }
    
    if (category === 'all' || category === 'removed') {
      updateCategory('removed', diffResults.removedEvents);
    }
    
    if (category === 'all' || category === 'unchanged') {
      updateCategory('unchanged', diffResults.unchangedEvents);
    }
    
    setSelectedEvents(newSelected);
  };

  // Submit changes to the server
  const handleSubmitChanges = async () => {
    setIsSubmitting(true);
    
    try {
      // Collect IDs for different action categories
      const acceptedNew = Object.entries(selectedEvents.newSelected)
        .filter(([_id, isAccepted]) => isAccepted)
        .map(([id]) => id);
        
      const rejectedNew = Object.entries(selectedEvents.newSelected)
        .filter(([_id, isAccepted]) => !isAccepted)
        .map(([id]) => id);
        
      const acceptedModified = Object.entries(selectedEvents.modifiedSelected)
        .filter(([_id, isAccepted]) => isAccepted)
        .map(([id]) => id);
        
      const rejectedModified = Object.entries(selectedEvents.modifiedSelected)
        .filter(([_id, isAccepted]) => !isAccepted)
        .map(([id]) => id);
        
      const acceptedRemoved = Object.entries(selectedEvents.removedSelected)
        .filter(([_id, isAccepted]) => isAccepted)
        .map(([id]) => id);
        
      const rejectedRemoved = Object.entries(selectedEvents.removedSelected)
        .filter(([_id, isAccepted]) => !isAccepted)
        .map(([id]) => id);
      
      // Get unchanged event IDs so they can be preserved
      const unchangedEventIds = diffResults.unchangedEvents.map(event => event.id);
      
      // Submit all changes in one request
      const result = await applyDiffChanges(organizationId, sourceId, {
        acceptedNew,
        rejectedNew,
        acceptedModified,
        rejectedModified,
        acceptedRemoved,
        rejectedRemoved,
        unchangedEventIds // Pass the unchanged event IDs to the server action
      });
      
      if (result.success) {
        // Navigate to events page on success
        router.push(`/organizations/${organizationId}/sources/${sourceId}/events?updated=1`);
      } else {
        // Handle errors
        alert(`Error: ${result.error}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting changes:', error);
      alert('An error occurred while applying changes');
      setIsSubmitting(false);
    }
  };

  // Filter displayed events based on activeFilter
  const getFilteredEvents = () => {
    switch (activeFilter) {
      case 'new':
        return { 
          newEvents: diffResults.newEvents,
          modifiedEvents: [],
          unchangedEvents: [],
          removedEvents: [] 
        };
      case 'modified':
        return { 
          newEvents: [],
          modifiedEvents: diffResults.modifiedEvents,
          unchangedEvents: [],
          removedEvents: [] 
        };
      case 'unchanged':
        return { 
          newEvents: [],
          modifiedEvents: [],
          unchangedEvents: diffResults.unchangedEvents,
          removedEvents: [] 
        };
      case 'removed':
        return { 
          newEvents: [],
          modifiedEvents: [],
          unchangedEvents: [],
          removedEvents: diffResults.removedEvents 
        };
      case 'all':
      default:
        return diffResults;
    }
  };

  // Check if any events are selected
  const hasSelectedEvents = () => {
    return Object.values(selectedEvents).some(category => 
      Object.values(category).some(isSelected => isSelected === true || isSelected === false)
    );
  };

  return (
    <div className="space-y-6">
      <DiffSummary 
        counts={{
          new: diffResults.newEvents.length,
          modified: diffResults.modifiedEvents.length,
          unchanged: diffResults.unchangedEvents.length,
          removed: diffResults.removedEvents.length,
        }}
        scrapeInfo={{
          latest: {
            id: latestScrape.id,
            date: latestScrape.createdAt,
          },
          previous: {
            id: previousScrape.id,
            date: previousScrape.createdAt,
          }
        }}
      />

      <DiffControls 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onBulkAction={handleBulkAction}
        onSubmitChanges={handleSubmitChanges}
        hasSelected={hasSelectedEvents()}
        isSubmitting={isSubmitting}
      />

      <DiffEventList 
        events={getFilteredEvents()}
        selectedEvents={selectedEvents}
        onSelectEvent={handleSelectEvent}
      />
    </div>
  );
}