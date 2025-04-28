import { prisma } from '@/lib/prisma';

export default async function OrganizationsPage({ searchParams: searchParamsPromise }) {
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const searchParams = await searchParamsPromise;
  const success = searchParams?.success;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Registered Organizations</h1>
        <div className="flex gap-2">
          <a href="/organizations/add-organization" className="btn btn-primary">
            ➕ Add Organization
          </a>
        </div>
      </div>

      {success && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-success">
            <span>Organization saved successfully!</span>
          </div>
        </div>
      )}

      {organizations.length === 0 ? (
        <p className="text-gray-500">No organizations registered yet.</p>
      ) : (
        <div className="grid gap-4">
          {organizations.map((org) => {
            const logoBase64 = org.logo
              ? `data:image/png;base64,${Buffer.from(org.logo).toString('base64')}`
              : null;

            return (
              <div key={org.id} className="card shadow bg-base-200 card-bordered p-4 space-y-2">
                <div className="flex items-center gap-4">
                  {logoBase64 && (
                    <img
                      src={logoBase64}
                      alt={`${org.name} Logo`}
                      className="w-16 h-16 object-contain rounded"
                    />
                  )}
                  <div className="flex flex-col gap-1">
                    <h2 className="card-title">{org.name}</h2>
                    {org.acronym && <p className="text-sm text-gray-500">{org.acronym}</p>}
                    {org.description && (
                      <p className="text-sm text-gray-400">
                        {org.description.length > 120
                          ? org.description.substring(0, 120) + '...'
                          : org.description}
                      </p>
                    )}
                    {org.homeWebsite && (
                      <a
                        href={org.homeWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary text-sm"
                      >
                        {org.homeWebsite}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-4">
                  <a href={`/organizations/edit-organization/${org.id}`} className="btn btn-sm btn-neutral">
                    Edit
                  </a>
                  <a href={`/organizations/${org.id}/sources`} className="btn btn-sm btn-info">
                    Manage Sources
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
