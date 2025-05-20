import crypto from 'crypto';

/**
 * Generates a unique fingerprint for an event based on its core properties
 * Used for identifying the same event across different scrapes
 * 
 * @param {Object} event - The event object
 * @returns {String} - MD5 hash based on event properties
 */
export function generateEventFingerprint(event) {
  // Create a string that uniquely identifies this event
  // using eventName and startDate as the core identity
  const identityString = `${event.eventName}||${event.startDate.toISOString()}`;
  
  // Create a hash of this string
  return crypto.createHash('md5').update(identityString).digest('hex');
}

/**
 * Compares two events to determine if they're the same event but with differences
 * 
 * @param {Object} event1 - First event
 * @param {Object} event2 - Second event
 * @returns {Object} - Object with changed fields and comparison result
 */
export function compareEvents(event1, event2) {
  // Check if they have the same fingerprint
  if (event1.eventFingerprint !== event2.eventFingerprint) {
    return { 
      isSameEvent: false,
      changes: {}
    };
  }

  const changes = {};
  
  // Compare event properties
  if (event1.eventName !== event2.eventName) {
    changes.eventName = {
      old: event1.eventName,
      new: event2.eventName
    };
  }
  
  // Compare dates - convert to ISO strings for comparison
  const startDate1 = event1.startDate.toISOString();
  const startDate2 = event2.startDate.toISOString();
  if (startDate1 !== startDate2) {
    changes.startDate = {
      old: startDate1,
      new: startDate2
    };
  }
  
  // Compare end dates if they exist
  const endDate1 = event1.endDate ? event1.endDate.toISOString() : null;
  const endDate2 = event2.endDate ? event2.endDate.toISOString() : null;
  if (endDate1 !== endDate2) {
    changes.endDate = {
      old: endDate1,
      new: endDate2
    };
  }
  
  // Compare price
  if (event1.price !== event2.price) {
    changes.price = {
      old: event1.price,
      new: event2.price
    };
  }
  
  return {
    isSameEvent: true,
    changes: changes,
    hasChanges: Object.keys(changes).length > 0
  };
}

/**
 * Categorizes events into new, modified, unchanged, and removed
 * 
 * @param {Array} latestEvents - Array of events from the latest scrape
 * @param {Array} previousEvents - Array of events from a previous scrape
 * @returns {Object} - Categorized events
 */
export function categorizeEvents(latestEvents, previousEvents) {
  const newEvents = [];
  const modifiedEvents = [];
  const unchangedEvents = [];
  
  // Create a map of previous events by fingerprint for quick lookup
  const previousEventsMap = new Map();
  for (const event of previousEvents) {
    previousEventsMap.set(event.eventFingerprint, event);
  }
  
  // Check each latest event against previous events
  for (const latestEvent of latestEvents) {
    const previousEvent = previousEventsMap.get(latestEvent.eventFingerprint);
    
    if (!previousEvent) {
      // Event is new
      newEvents.push(latestEvent);
    } else {
      // Event exists, check for changes
      const { hasChanges, changes } = compareEvents(previousEvent, latestEvent);
      
      if (hasChanges) {
        // Event is modified
        modifiedEvents.push({
          previous: previousEvent,
          latest: latestEvent,
          changes
        });
      } else {
        // Event is unchanged
        unchangedEvents.push(latestEvent);
      }
      
      // Mark this previous event as processed
      previousEventsMap.delete(latestEvent.eventFingerprint);
    }
  }
  
  // Any remaining previous events are considered removed
  const removedEvents = Array.from(previousEventsMap.values());
  
  return {
    newEvents,
    modifiedEvents,
    unchangedEvents,
    removedEvents
  };
}