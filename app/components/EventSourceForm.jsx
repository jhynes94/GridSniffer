'use client';

import { addEventSource, updateEventSource } from '@/organizations/[id]/sources/actions';
import { useRouter } from 'next/navigation';

export default function EventSourceForm({ mode, organizationId, eventSourceId, initialData, buttonLabel }) {
  const router = useRouter();

  async function serverAction(formData) {
    if (mode === 'add') {
      await addEventSource(organizationId, formData);
    } else if (mode === 'edit') {
      await updateEventSource(eventSourceId, formData);
    }
    router.push(`/organizations/${organizationId}/sources?success=1`);
  }

  return (
    <form action={serverAction} className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Event Source URL</span>
        </label>
        <input
          name="url"
          type="url"
          className="input input-bordered w-full"
          required
          defaultValue={initialData?.url || ''}
        />
      </div>

      {/* In the future we can add scrapeStrategy select dropdown here */}

      <div className="form-control w-full">
        <button type="submit" className="btn btn-primary">
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}
