import { prisma } from '@/lib/prisma';
import { scrapeEventSource } from './actions'; // 👈 Action for scraping

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

  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
    include: { eventSources: { orderBy: { createdAt: 'desc' } } },
  });

  if (!organization) {
    return <div className="p-6 text-red-500">Organization not found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Event Sources for {organization.name}</h1>

      {organization.eventSources.length === 0 ? (
        <p className="text-gray-500">No Event Sources registered yet.</p>
      ) : (
        <div className="grid gap-4">
          {organization.eventSources.map((source) => (
            <form key={source.id} className="card shadow bg-base-200 card-bordered p-4 space-y-2">
              <div>
                <p><strong>URL:</strong> {source.url}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${statusColor(source.scrapeStatus)}`}>
                    {source.scrapeStatus || 'PENDING'}
                  </span>
                </p>
                <p><strong>Created:</strong> {new Date(source.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <a
                  href={`/organizations/${organization.id}/sources/${source.id}/edit`}
                  className="btn btn-sm btn-neutral"
                >
                  Edit
                </a>

                <button
                  formAction={scrapeEventSource.bind(null, source.id)}
                  className="btn btn-sm btn-info"
                >
                  Scrape Now
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      <div className="mt-6">
        <a href={`/organizations/${organization.id}/sources/add`} className="btn btn-primary">
          ➕ Add New Event Source
        </a>
      </div>
    </div>
  );
}
