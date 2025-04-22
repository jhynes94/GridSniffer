import { prisma } from '@/lib/prisma';
import {
  deleteWebsite,
  toggleWebsite,
  scrapeWebsite,
  scrapeAllWebsites,
} from './actions';

function statusColor(status) {
  switch (status) {
    case 'RUNNING': return 'badge-warning';
    case 'SUCCESS': return 'badge-success';
    case 'ERROR': return 'badge-error';
    default: return 'badge-ghost';
  }
}

export default async function HomePage() {
  const websites = await prisma.website.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Registered Websites</h1>
        <div className="flex gap-2">
          <form action={scrapeAllWebsites}>
            <button className="btn btn-secondary">🔄 Scrape All</button>
          </form>
          <a href="/add-website" className="btn btn-primary">➕ Add Website</a>
        </div>
      </div>

      {websites.length === 0 ? (
        <p className="text-gray-500">No websites registered yet.</p>
      ) : (
        <div className="grid gap-4">
          {websites.map((site) => (
            <form key={site.id} className="card shadow bg-base-200 card-bordered p-4 space-y-2">
              <div className="flex flex-col gap-1">
                <h2 className="card-title break-all">{site.url}</h2>
                <p><strong>Strategy:</strong> {site.scrapeStrategy}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${statusColor(site.scrapeStatus)}`}>
                    {site.scrapeStatus}
                  </span>
                </p>
                <p>
                  <strong>Last Scraped:</strong>{' '}
                  {site.lastScraped
                    ? new Date(site.lastScraped).toLocaleString()
                    : 'Never'}
                </p>
                {site.scrapeMessage && site.scrapeStatus === 'ERROR' && (
                  <p className="text-sm text-error mt-1">
                    ⚠️ {site.scrapeMessage}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap mt-4">
                <a href={`/edit-website/${site.id}`} className="btn btn-sm btn-neutral">
                  Edit
                </a>

                <button
                  formAction={toggleWebsite.bind(null, site.id, site.enabled)}
                  className="btn btn-sm btn-warning"
                >
                  {site.enabled ? 'Disable' : 'Enable'}
                </button>

                <button
                  formAction={deleteWebsite.bind(null, site.id)}
                  className="btn btn-sm btn-error"
                >
                  Delete
                </button>

                <button
                  formAction={scrapeWebsite.bind(null, site.id)}
                  className="btn btn-sm btn-info"
                >
                  Scrape Now
                </button>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
