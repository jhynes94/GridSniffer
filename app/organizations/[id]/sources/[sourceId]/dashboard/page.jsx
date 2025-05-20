import { prisma } from '@/lib/prisma';
import { categorizeEvents } from '@/lib/event-utils';
import Link from 'next/link';

function statusColor(status) {
  switch (status) {
    case 'RUNNING': return 'badge-warning';
    case 'SUCCESS': return 'badge-success';
    case 'ERROR': return 'badge-error';
    default: return 'badge-ghost'; // PENDING or undefined
  }
}

export default async function DashboardPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { id: organizationId, sourceId } = params;

  // Fetch source details
  const source = await prisma.eventSource.findUnique({
    where: { id: sourceId },
    include: { 
      organization: true 
    }
  });

  if (!source) {
    return <div className="p-6 text-red-500">Event Source not found.</div>;
  }

  // Fetch the latest successful scrape
  const latestScrape = await prisma.scrapeJob.findFirst({
    where: { 
      eventSourceId: sourceId,
      scrapeStatus: 'SUCCESS'
    },
    include: { events: true },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch the previous successful scrape (different from latest)
  const previousScrape = await prisma.scrapeJob.findFirst({
    where: { 
      eventSourceId: sourceId,
      scrapeStatus: 'SUCCESS',
      id: { not: latestScrape?.id || '' },
    },
    include: { events: true },
    orderBy: { createdAt: 'desc' },
  });

  // Get event counts for all events in the source
  const eventStats = await prisma.$queryRaw`
    SELECT 
      COUNT(*) filter (where "isApproved" = true AND "isDeleted" = false) as "approvedCount",
      COUNT(*) filter (where "isApproved" = false AND "isDeleted" = false) as "pendingCount",
      COUNT(*) filter (where "isDeleted" = true) as "deletedCount",
      COUNT(*) as "totalCount"
    FROM "Event" e
    JOIN "ScrapeJob" sj ON e."scrapeJobId" = sj.id
    WHERE sj."eventSourceId" = ${sourceId}
  `;

  // Calculate counts for comparison
  let diffResults = { 
    newEvents: [], 
    modifiedEvents: [], 
    unchangedEvents: [], 
    removedEvents: [] 
  };

  // Only calculate diffs if we have two successful scrapes
  if (latestScrape && previousScrape) {
    diffResults = categorizeEvents(latestScrape.events, previousScrape.events);
  }

  // Get total count of events across all scrapes
  const totalEventsCount = await prisma.event.count({
    where: {
      scrapeJob: {
        eventSourceId: sourceId
      }
    }
  });

  // Get scrape statistics
  const scrapeStats = await prisma.$queryRaw`
    SELECT 
      COUNT(*) filter (where "scrapeStatus" = 'SUCCESS') as "successCount",
      COUNT(*) filter (where "scrapeStatus" = 'ERROR') as "errorCount",
      COUNT(*) filter (where "scrapeStatus" = 'RUNNING') as "runningCount",
      COUNT(*) filter (where "scrapeStatus" = 'PENDING') as "pendingCount",
      COUNT(*) as "totalCount",
      MAX("createdAt") as "lastScrapeTime"
    FROM "ScrapeJob"
    WHERE "eventSourceId" = ${sourceId}
  `;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-lg">
            {source.organization.name} - {source.url}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/organizations/${organizationId}/sources`}
            className="btn btn-secondary"
          >
            ← Back to Sources
          </Link>
        </div>
      </div>

      {/* Event Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card shadow bg-base-200 card-bordered p-4">
          <h2 className="text-xl font-bold mb-2">Event Status</h2>
          <div className="stats stats-vertical shadow">
            <div className="stat">
              <div className="stat-title">Total Events</div>
              <div className="stat-value">{eventStats[0]?.totalCount || 0}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Approved</div>
              <div className="stat-value text-success">{eventStats[0]?.approvedCount || 0}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Pending Approval</div>
              <div className="stat-value text-warning">{eventStats[0]?.pendingCount || 0}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Deleted</div>
              <div className="stat-value text-error">{eventStats[0]?.deletedCount || 0}</div>
            </div>
          </div>
        </div>

        <div className="card shadow bg-base-200 card-bordered p-4">
          <h2 className="text-xl font-bold mb-2">Latest Comparison</h2>
          {latestScrape && previousScrape ? (
            <div className="stats stats-vertical shadow">
              <div className="stat">
                <div className="stat-title">New Events</div>
                <div className="stat-value text-success">{diffResults.newEvents.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Modified Events</div>
                <div className="stat-value text-warning">{diffResults.modifiedEvents.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Unchanged Events</div>
                <div className="stat-value text-info">{diffResults.unchangedEvents.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Removed Events</div>
                <div className="stat-value text-error">{diffResults.removedEvents.length}</div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Need at least two successful scrapes to show comparison.</span>
            </div>
          )}
        </div>

        <div className="card shadow bg-base-200 card-bordered p-4">
          <h2 className="text-xl font-bold mb-2">Scrape Status</h2>
          <div className="stats stats-vertical shadow">
            <div className="stat">
              <div className="stat-title">Total Scrapes</div>
              <div className="stat-value">{scrapeStats[0]?.totalCount || 0}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Successful</div>
              <div className="stat-value text-success">{scrapeStats[0]?.successCount || 0}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Failed</div>
              <div className="stat-value text-error">{scrapeStats[0]?.errorCount || 0}</div>
            </div>
            {scrapeStats[0]?.lastScrapeTime && (
              <div className="stat">
                <div className="stat-title">Last Scrape</div>
                <div className="stat-desc">{new Date(scrapeStats[0].lastScrapeTime).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* View Events Card */}
        <div className="card shadow bg-base-200 card-bordered p-4">
          <h2 className="card-title mb-4">Manage Events</h2>
          <p className="mb-4">View all events scraped from this source, including approved, pending, and deleted events.</p>
          <div className="card-actions justify-end">
            <Link href={`/organizations/${organizationId}/sources/${sourceId}/events`} className="btn btn-primary">
              📅 View Events
            </Link>
          </div>
        </div>

        {/* Compare Changes Card */}
        <div className="card shadow bg-base-200 card-bordered p-4">
          <h2 className="card-title mb-4">Compare Changes</h2>
          <p className="mb-4">Review differences between scrapes and resolve conflicts using the diff tool.</p>
          <div className="card-actions justify-end">
            <Link href={`/organizations/${organizationId}/sources/${sourceId}/diff`} className="btn btn-info">
              🔄 Compare Changes
            </Link>
          </div>
        </div>

        {/* Scrape History Card */}
        <div className="card shadow bg-base-200 card-bordered p-4">
          <h2 className="card-title mb-4">Scrape History</h2>
          <p className="mb-4">View detailed history of all scrape attempts, including success and error messages.</p>
          <div className="card-actions justify-end">
            <Link href={`/organizations/${organizationId}/sources/${sourceId}/scrape-history`} className="btn btn-accent">
              📜 View Scrape History
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Events Preview */}
      {latestScrape?.events && latestScrape.events.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Events</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {latestScrape.events.slice(0, 3).map((event) => (
              <div key={event.id} className="card shadow bg-base-200 card-bordered p-4 space-y-2">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">{event.eventName}</h2>
                  <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>
                  {event.endDate && (
                    <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
                  )}
                  <p><strong>Price:</strong> {event.price || 'Unknown'}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {event.isApproved ? (
                      <span className="badge badge-success">Approved</span>
                    ) : event.isDeleted ? (
                      <span className="badge badge-error">Deleted</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {latestScrape.events.length > 3 && (
            <div className="mt-4 text-center">
              <Link href={`/organizations/${organizationId}/sources/${sourceId}/events`} className="btn btn-outline">
                View All Events
              </Link>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}