'use client';

export default function DiffSummary({ counts, scrapeInfo }) {
  return (
    <div className="card bg-base-200 shadow p-4">
      <h2 className="text-xl font-bold mb-2">Diff Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Scrape Information</h3>
          <div className="text-sm">
            <p>
              <strong>Latest Scrape:</strong> {new Date(scrapeInfo.latest.date).toLocaleString()}
            </p>
            <p>
              <strong>Previous Scrape:</strong> {new Date(scrapeInfo.previous.date).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="stats stats-vertical shadow w-full">
          <div className="stat">
            <div className="stat-title">New Events</div>
            <div className="stat-value text-success">{counts.new}</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Modified Events</div>
            <div className="stat-value text-warning">{counts.modified}</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Removed Events</div>
            <div className="stat-value text-error">{counts.removed}</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Unchanged Events</div>
            <div className="stat-value text-info">{counts.unchanged}</div>
          </div>
        </div>
      </div>
    </div>
  );
}