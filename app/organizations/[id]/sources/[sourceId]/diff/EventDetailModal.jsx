'use client';

export default function EventDetailModal({ data, onClose, onSelect }) {
  const { event, category } = data;
  
  // For modified events, we have both versions
  const isModified = category === 'modified';
  
  const handleAccept = () => {
    if (category === 'modified') {
      onSelect(event.latest.id, 'modified', true);
    } else if (category === 'new') {
      onSelect(event.id, 'new', true);
    } else if (category === 'removed') {
      onSelect(event.id, 'removed', true);
    }
    onClose();
  };
  
  const handleReject = () => {
    if (category === 'modified') {
      onSelect(event.latest.id, 'modified', false);
    } else if (category === 'new') {
      onSelect(event.id, 'new', false);
    } else if (category === 'removed') {
      onSelect(event.id, 'removed', false);
    }
    onClose();
  };

  // Helper to format field based on whether it changed
  const renderModifiedField = (fieldName, label) => {
    const hasChanged = isModified && event.changes[fieldName];
    const oldValue = isModified ? event.previous[fieldName] : null;
    const newValue = isModified ? event.latest[fieldName] : event[fieldName];
    
    // Format dates
    const formatValue = (value, field) => {
      if (field.includes('Date') && value) {
        return new Date(value).toLocaleString();
      }
      return value || 'Not set';
    };
    
    return (
      <div className={`${hasChanged ? 'bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded' : ''}`}>
        <p>
          <strong>{label}:</strong> {formatValue(newValue, fieldName)}
          {hasChanged && (
            <span className="block text-sm text-gray-500">
              Previous: {formatValue(oldValue, fieldName)}
            </span>
          )}
        </p>
      </div>
    );
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-2xl flex items-center gap-2">
          Event Details
          <span 
            className={`badge ${
              category === 'new' ? 'badge-success' : 
              category === 'modified' ? 'badge-warning' : 
              category === 'removed' ? 'badge-error' : 
              'badge-info'
            }`}
          >
            {category}
          </span>
        </h3>
        
        <div className="mt-4 p-4 border rounded-lg bg-base-300 space-y-3">
          {isModified ? (
            // For modified events - highlight changes
            <>
              {renderModifiedField('eventName', 'Name')}
              {renderModifiedField('startDate', 'Start Date')}
              {renderModifiedField('endDate', 'End Date')}
              {renderModifiedField('price', 'Price')}
            </>
          ) : (
            // For other events - simple display
            <>
              <p><strong>Name:</strong> {event.eventName}</p>
              <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>
              {event.endDate && (
                <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
              )}
              <p><strong>Price:</strong> {event.price || 'Unknown'}</p>
            </>
          )}
          
          <p className="text-sm mt-4">
            <strong>Event ID:</strong> {isModified ? event.latest.id : event.id}
          </p>
        </div>
        
        <div className="modal-action">
          {category !== 'unchanged' && (
            <>
              <button 
                className="btn btn-success"
                onClick={handleAccept}
              >
                {category === 'new' ? 'Accept New Event' : 
                 category === 'modified' ? 'Accept Changes' : 
                 'Accept Removal'}
              </button>
              
              <button 
                className="btn btn-error"
                onClick={handleReject}
              >
                {category === 'new' ? 'Reject New Event' : 
                 category === 'modified' ? 'Reject Changes' : 
                 'Keep Event (Reject Removal)'}
              </button>
            </>
          )}
          
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}