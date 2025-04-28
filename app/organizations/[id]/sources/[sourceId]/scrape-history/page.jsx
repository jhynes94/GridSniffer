import { prisma } from '@/lib/prisma';

function statusColor(status) {
  switch (status) {
    case 'RUNNING': return 'badge-warning';
    case 'SUCCESS': return 'badge-success';
    case 'ERROR': return 'badge-error';
    default: return 'badge-ghost';
  }
}

export default async function ScrapeHistoryPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { id: organizationId, sourceId } = params;

  const scrapes = await prisma.scrapeJob.findMany({
    where: { eventSourceId: sourceId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Scrape History</h1>

      {scrapes.length === 0 ? (
        <p className="text-gray-500">No scrape attempts yet.</p>
      ) : (
        <div className="grid gap-4">
          {scrapes.map((scrape) => (
            <div key={scrape.id} className="card shadow bg-base-200 card-bordered p-4 space-y-2">
              <p><strong>Scraped At:</strong> {new Date(scrape.createdAt).toLocaleString()}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge ${statusColor(scrape.scrapeStatus)}`}>
                  {scrape.scrapeStatus}
                </span>
              </p>
              <p><strong>Message:</strong> {scrape.scrapeMessage || 'No message.'}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <a
          href={`/organizations/${organizationId}/sources/${sourceId}/events`}
          className="btn btn-secondary"
        >
          ← Back to Events
        </a>
      </div>
    </div>
  );
}
