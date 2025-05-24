import { prisma } from '@/lib/prisma';
import EventList from './components/EventList';

export default async function SourceEventsPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { id: organizationId, sourceId } = params;

  const source = await prisma.eventSource.findUnique({
    where: { id: sourceId },
    include: {
      scrapes: {
        include: {
          events: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!source) {
    return <div className="p-6 text-red-500">Event Source not found.</div>;
  }

  // Collect all events across all scrapes, but map scrape status onto them
  const allEvents = source.scrapes.flatMap(scrape =>
    scrape.events.map(event => ({
      ...event,
      scrapeStatus: scrape.scrapeStatus,
      scrapeDate: scrape.createdAt,
    }))
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      <EventList 
        events={allEvents} 
        organizationId={organizationId} 
        sourceId={sourceId} 
      />

      <div className="flex gap-4 mt-6">
        <a
          href={`/organizations/${organizationId}/sources/${sourceId}/dashboard`}
          className="btn btn-primary"
        >
          📊 Dashboard
        </a>

        <a
          href={`/organizations/${organizationId}/sources/${sourceId}/diff`}
          className="btn btn-info"
        >
          🔄 Compare Event Changes
        </a>
        
        <a
          href={`/organizations/${organizationId}/sources/${sourceId}/scrape-history`}
          className="btn btn-accent"
        >
          📜 View Scrape History
        </a>

        <a
          href={`/organizations/${organizationId}/sources`}
          className="btn btn-secondary"
        >
          ← Back to Sources
        </a>
      </div>
    </div>
  );
}