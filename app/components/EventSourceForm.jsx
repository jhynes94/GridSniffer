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
      {/* Event Source URL */}
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

      {/* Scrape Strategy */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Scrape Strategy</span>
        </label>
        <select
          name="scrapeStrategy"
          className="select select-bordered w-full"
          required
          defaultValue={initialData?.scrapeStrategy || 'html'}
        >
          <option value="html">HTML (Generic AI)</option>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="screenshot">Screenshot (Advanced)</option>
        </select>
      </div>

      {/* Future: Conditionally render iframe picker here if scrapeStrategy === 'screenshot' */}

      <div className="form-control w-full">
        <button type="submit" className="btn btn-primary">
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}
