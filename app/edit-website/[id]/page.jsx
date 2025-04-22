import WebsiteForm from '@/components/WebsiteForm';
import { prisma } from '@/lib/prisma';
import { updateWebsite } from './actions';

export default async function EditWebsitePage({ params }) {
  const website = await prisma.website.findUnique({
    where: { id: params.id },
  });

  if (!website) {
    return <p className="p-6 text-red-500">Website not found.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <WebsiteForm
        onSubmit={updateWebsite.bind(null, website.id)}
        initialData={website}
        buttonLabel="Update Website"
      />

      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Scrape Info</h2>
        <p>
          <strong>Status:</strong>{' '}
          <span className={`badge ${statusColor(website.scrapeStatus)}`}>
            {website.scrapeStatus}
          </span>
        </p>
        {website.lastScraped && (
          <p>
            <strong>Last Scraped:</strong>{' '}
            {new Date(website.lastScraped).toLocaleString()}
          </p>
        )}
        {website.scrapeMessage && (
          <div className="mt-2 bg-base-200 p-3 rounded border">
            <p className="text-sm text-gray-500 whitespace-pre-wrap">{website.scrapeMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function statusColor(status) {
  switch (status) {
    case 'RUNNING': return 'badge-warning';
    case 'SUCCESS': return 'badge-success';
    case 'ERROR': return 'badge-error';
    default: return 'badge-ghost';
  }
}
