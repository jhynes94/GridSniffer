'use client';

export default function DiffControls({ 
  activeFilter, 
  onFilterChange, 
  onBulkAction,
  onSubmitChanges,
  hasSelected,
  isSubmitting
}) {
  return (
    <div className="card bg-base-200 shadow p-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          <button 
            className={`btn btn-sm ${activeFilter === 'all' ? 'btn-neutral' : 'btn-outline'}`}
            onClick={() => onFilterChange('all')}
          >
            All
          </button>
          
          <button 
            className={`btn btn-sm ${activeFilter === 'new' ? 'btn-success' : 'btn-outline'}`}
            onClick={() => onFilterChange('new')}
          >
            New
          </button>
          
          <button 
            className={`btn btn-sm ${activeFilter === 'modified' ? 'btn-warning' : 'btn-outline'}`}
            onClick={() => onFilterChange('modified')}
          >
            Modified
          </button>
          
          <button 
            className={`btn btn-sm ${activeFilter === 'removed' ? 'btn-error' : 'btn-outline'}`}
            onClick={() => onFilterChange('removed')}
          >
            Removed
          </button>
          
          <button 
            className={`btn btn-sm ${activeFilter === 'unchanged' ? 'btn-info' : 'btn-outline'}`}
            onClick={() => onFilterChange('unchanged')}
          >
            Unchanged
          </button>
        </div>
        
        {/* Bulk Action Controls */}
        <div className="flex flex-wrap gap-2">
          <button 
            className="btn btn-sm btn-success"
            onClick={() => onBulkAction('accept', activeFilter)}
            disabled={isSubmitting}
          >
            Accept All Visible
          </button>
          
          <button 
            className="btn btn-sm btn-error"
            onClick={() => onBulkAction('reject', activeFilter)}
            disabled={isSubmitting}
          >
            Reject All Visible
          </button>
        </div>
      </div>
      
      {/* Apply Changes Button */}
      <div className="flex justify-end mt-4">
        <button 
          className="btn btn-primary"
          onClick={onSubmitChanges}
          disabled={!hasSelected || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Applying changes...
            </>
          ) : (
            'Apply Selected Changes'
          )}
        </button>
      </div>
    </div>
  );
}