import { prisma } from '@/lib/prisma';

function statusColor(status) {
  switch (status) {
    case 'RUNNING': return 'badge-warning';
    case 'SUCCESS': return 'badge-success';
    case 'ERROR': return 'badge-error';
    default: return 'badge-ghost'; // PENDING or undefined
  }
}

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
      <h1 className="text-3xl font-bold mb-6">Scraped Events</h1>

      {allEvents.length === 0 ? (
        <p className="text-gray-500">No events scraped yet.</p>
      ) : (
        <div className="grid gap-4">
          {allEvents.map((event) => (
            <div key={event.id} className="card shadow bg-base-200 card-bordered p-4 space-y-2">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">{event.eventName}</h2>

                <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>

                {event.endDate && (
                  <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
                )}

                <p><strong>Price:</strong> {event.price || 'Unknown'}</p>

                <p>
                  <strong>Scraped:</strong>{' '}
                  {new Date(event.scrapeDate).toLocaleString()}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${statusColor(event.scrapeStatus)}`}>
                    {event.scrapeStatus}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

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
