import EventSourceForm from '@/components/EventSourceForm';
import { prisma } from '@/lib/prisma';

export default async function EditEventSourcePage({ params }) {
  const { id: organizationId, sourceId } = params;

  const eventSource = await prisma.eventSource.findUnique({
    where: { id: sourceId },
  });

  if (!eventSource) {
    return <div className="p-6 text-red-500">Event Source not found.</div>;
  }

  const initialData = {
    url: eventSource.url,
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Event Source</h1>
      <EventSourceForm
        mode="edit"
        organizationId={organizationId}
        eventSourceId={sourceId}
        initialData={initialData}
        buttonLabel="Update Event Source"
      />
    </div>
  );
}
