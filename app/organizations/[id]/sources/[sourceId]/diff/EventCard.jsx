'use client';

export default function EventCard({ 
  event, 
  type, 
  changes = null,
  previousEvent = null,
  isSelected,
  onSelect,
  onViewDetails 
}) {
  // Helper to get card styling based on event type
  const getCardStyle = () => {
    switch (type) {
      case 'new': return 'border-success border-2';
      case 'modified': return 'border-warning border-2';
      case 'removed': return 'border-error border-2';
      case 'unchanged': return 'border-info border-2';
      default: return '';
    }
  };
  
  // Helper to get badge styling
  const getBadgeStyle = () => {
    switch (type) {
      case 'new': return 'badge-success';
      case 'modified': return 'badge-warning';
      case 'removed': return 'badge-error';
      case 'unchanged': return 'badge-info';
      default: return 'badge-neutral';
    }
  };
  
  // For selectable events, determine accept/reject state
  const getSelectionState = () => {
    // Allow selection for all event types including unchanged
    if (isSelected === undefined) return null;
    
    return isSelected === true ? 'accept' : isSelected === false ? 'reject' : null;
  };
  
  const selectionState = getSelectionState();

  return (
    <div className={`card shadow bg-base-200 ${getCardStyle()} p-4 space-y-2`}>
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold">{event.eventName}</h3>
        
        <div className="flex gap-2 items-center">
          {onSelect && (
            <div className="flex">
              <button
                className={`btn btn-xs ${selectionState === 'accept' ? 'btn-success' : 'btn-outline'}`}
                onClick={() => onSelect(true)}
                aria-label="Accept"
              >
                ✓
              </button>
              <button
                className={`btn btn-xs ${selectionState === 'reject' ? 'btn-error' : 'btn-outline'}`}
                onClick={() => onSelect(false)}
                aria-label="Reject"
              >
                ✗
              </button>
            </div>
          )}
          
          <span className={`badge ${getBadgeStyle()}`}>
            {type}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>
        
        {event.endDate && (
          <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
        )}
        
        <p><strong>Price:</strong> {event.price || 'Unknown'}</p>
        
        {/* Show indicators for modified fields */}
        {changes && Object.keys(changes).length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">Changes:</p>
            <ul className="list-disc list-inside">
              {Object.keys(changes).map(field => (
                <li key={field} className="text-warning">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card-actions justify-end mt-2">
        <button 
          className="btn btn-xs btn-primary"
          onClick={onViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  );
}