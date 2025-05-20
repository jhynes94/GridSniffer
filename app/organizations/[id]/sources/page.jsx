import { prisma } from '@/lib/prisma';
import { ScrapeNowButton } from './ScrapeNowButton'; // Adjust path if needed

function statusColor(status) {
  switch (status) {
    case 'RUNNING': return 'badge-warning';
    case 'SUCCESS': return 'badge-success';
    case 'ERROR': return 'badge-error';
    default: return 'badge-ghost'; // PENDING or undefined
  }
}

export default async function EventSourcesPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { id: organizationId } = params;

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      eventSources: {
        orderBy: { createdAt: 'desc' },
        include: {
          scrapes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!organization) {
    return <div className="p-6 text-red-500">Organization not found.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Event Sources for {organization.name}</h1>
        <a
          href="/organizations"
          className="btn btn-secondary"
        >
          ← Back to Organizations
        </a>
      </div>

      {organization.eventSources.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-base-200 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">No Event Sources Yet</h2>
          <p className="text-gray-500 mb-6">Start by adding your first Event Source to begin scraping events!</p>
          <a
            href={`/organizations/${organizationId}/sources/add`}
            className="btn btn-primary"
          >
            ➕ Add Event Source
          </a>
          <a
            href="/organizations"
            className="btn btn-ghost mt-4"
          >
            ← Back to Organizations
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {organization.eventSources.map((source) => {
            const latestScrape = source.scrapes[0];
            const scrapeStatus = latestScrape?.scrapeStatus || 'PENDING';

            return (
              <div key={source.id} className="card shadow bg-base-200 card-bordered p-4 space-y-2">
                <div>
                  <p><strong>URL:</strong> {source.url}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`badge ${statusColor(scrapeStatus)}`}>
                      {scrapeStatus}
                      {scrapeStatus === 'RUNNING' && (
                        <span className="loading loading-spinner loading-xs ml-2"></span>
                      )}
                    </span>
                  </p>
                  <p><strong>Created:</strong> {new Date(source.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <a
                    href={`/organizations/${organizationId}/sources/${source.id}/dashboard`}
                    className="btn btn-sm btn-primary"
                  >
                    📊 Dashboard
                  </a>
                  
                  <a
                    href={`/organizations/${organizationId}/sources/${source.id}/edit`}
                    className="btn btn-sm btn-neutral"
                  >
                    ✏️ Edit
                  </a>

                  <ScrapeNowButton sourceId={source.id} />

                  <a
                    href={`/organizations/${organizationId}/sources/${source.id}/events`}
                    className="btn btn-sm btn-secondary"
                  >
                    📅 View Events
                  </a>
                  
                  <a
                    href={`/organizations/${organizationId}/sources/${source.id}/diff`}
                    className="btn btn-sm btn-info"
                  >
                    🔄 Compare Changes
                  </a>

                  <a
                    href={`/organizations/${organizationId}/sources/${source.id}/scrape-history`}
                    className="btn btn-sm btn-accent"
                  >
                    📜 Scrape History
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <a
          href={`/organizations/${organizationId}/sources/add`}
          className="btn btn-primary"
        >
          ➕ Add New Event Source
        </a>

        <a
          href="/organizations"
          className="btn btn-secondary"
        >
          ← Back to Organizations
        </a>
      </div>
    </div>
  );
}
