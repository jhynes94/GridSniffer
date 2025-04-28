import OrganizationForm from '@/components/OrganizationForm';
import { prisma } from '@/lib/prisma';
import { updateOrganization } from '../../actions';

export default async function EditOrganizationPage({ params: paramsPromise }) {
  const params = await paramsPromise;

  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
  });

  if (!organization) {
    return <div className="p-6 text-red-500">Organization not found.</div>;
  }

  const logoUrl = organization.logo
    ? `data:image/png;base64,${Buffer.from(organization.logo).toString('base64')}`
    : null;

  const initialData = {
    ...organization,
    logoUrl,
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Organization</h1>
      <OrganizationForm
        mode="edit"
        organizationId={organization.id}
        initialData={initialData}
        buttonLabel="Update Organization"
      />
    </div>
  );
}
