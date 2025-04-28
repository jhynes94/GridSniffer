import EventSourceForm from '@/components/EventSourceForm';

export default async function AddEventSourcePage({ params }) {
  const organizationId = params.id;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add Event Source</h1>
      <EventSourceForm
        mode="add"
        organizationId={organizationId}
        buttonLabel="Save Event Source"
      />
    </div>
  );
}
