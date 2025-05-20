import { prisma } from '@/lib/prisma';
import DiffContainer from './DiffContainer';

export default async function DiffPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { id: organizationId, sourceId } = params;

  // Get the source info for display
  const source = await prisma.eventSource.findUnique({
    where: { id: sourceId },
    include: { organization: true }
  });

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

  // If we don't have two successful scrapes, we can't show a diff
  if (!latestScrape || !previousScrape) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Event Comparison</h1>
        
        <div className="alert alert-warning mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            At least two successful scrapes are needed to show differences.
            Run a scrape to generate data for comparison.
          </span>
        </div>
        
        <div className="flex gap-4">
          <a
            href={`/organizations/${organizationId}/sources/${sourceId}/dashboard`}
            className="btn btn-primary"
          >
            📊 Dashboard
          </a>

          <a
            href={`/organizations/${organizationId}/sources/${sourceId}/events`}
            className="btn btn-secondary"
          >
            ← Back to Events
          </a>
          
          <a
            href={`/organizations/${organizationId}/sources/${sourceId}/scrape-history`}
            className="btn btn-accent"
          >
            📜 View Scrape History
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Event Comparison</h1>
      <p className="text-lg mb-6">
        Comparing events for {source?.organization?.name} - {source?.url}
      </p>
      
      <DiffContainer 
        organizationId={organizationId}
        sourceId={sourceId}
        latestScrape={latestScrape}
        previousScrape={previousScrape}
      />
      
      <div className="mt-6 flex gap-4">
        <a
          href={`/organizations/${organizationId}/sources/${sourceId}/dashboard`}
          className="btn btn-primary"
        >
          📊 Dashboard
        </a>

        <a
          href={`/organizations/${organizationId}/sources/${sourceId}/events`}
          className="btn btn-secondary"
        >
          ← Back to Events
        </a>
        
        <a
          href={`/organizations/${organizationId}/sources/${sourceId}/scrape-history`}
          className="btn btn-accent"
        >
          📜 View Scrape History
        </a>
      </div>
    </div>
  );
}