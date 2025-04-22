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

  return <WebsiteForm onSubmit={updateWebsite.bind(null, website.id)} initialData={website} buttonLabel="Update Website" />;
}
