'use client';

import { addOrganization, updateOrganization } from '@/organizations/actions';
import { useFormState } from 'react-dom'; // built-in Next.js form helpers
import { useRouter } from 'next/navigation';

export default function OrganizationForm({ mode, organizationId, initialData, buttonLabel }) {
  const router = useRouter();

  async function serverAction(formData) {
    if (mode === 'add') {
      await addOrganization(formData);
    } else if (mode === 'edit') {
      await updateOrganization(organizationId, formData);
    }
    router.push('/organizations?success=1');
  }

  return (
    <form action={serverAction} encType="multipart/form-data" className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <input
          name="name"
          type="text"
          className="input input-bordered w-full"
          required
          defaultValue={initialData?.name || ''}
        />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Acronym</span>
        </label>
        <input
          name="acronym"
          type="text"
          className="input input-bordered w-full"
          defaultValue={initialData?.acronym || ''}
        />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          name="description"
          className="textarea textarea-bordered w-full"
          defaultValue={initialData?.description || ''}
        ></textarea>
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Home Website</span>
        </label>
        <input
          name="homeWebsite"
          type="url"
          className="input input-bordered w-full"
          defaultValue={initialData?.homeWebsite || ''}
        />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Logo Image</span>
        </label>
        <input
          name="logo"
          type="file"
          accept="image/*"
          className="file-input file-input-bordered w-full"
        />
        {initialData?.logoUrl && (
          <div className="mt-2">
            <img
              src={initialData.logoUrl}
              alt="Current Logo"
              className="w-24 h-24 object-contain rounded border"
            />
          </div>
        )}
      </div>

      <div className="form-control w-full">
        <button type="submit" className="btn btn-primary">
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}
