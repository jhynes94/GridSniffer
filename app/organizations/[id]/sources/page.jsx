import { prisma } from '@/lib/prisma';

export default async function EventSourcesPage({ params }) {
  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
    include: { eventSources: true },
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
            <div key={source.id} className="card shadow bg-base-200 card-bordered p-4 space-y-2">
              <p><strong>URL:</strong> {source.url}</p>
              <p><strong>Created:</strong> {new Date(source.createdAt).toLocaleDateString()}</p>

              <div className="flex gap-2 mt-4">
                <a href={`/organizations/${organization.id}/sources/${source.id}/edit`} className="btn btn-sm btn-neutral">
                  Edit
                </a>
                {/* Future: Delete button here */}
              </div>
            </div>
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
