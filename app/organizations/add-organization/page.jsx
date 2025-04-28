'use client';

import OrganizationForm from '@/components/OrganizationForm';
import { addOrganization } from '../actions';

export default function AddOrganizationPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add Organization</h1>
      <OrganizationForm mode="add" onSubmit={addOrganization} buttonLabel="Save Organization" />

      <div id="toast-success" className="toast toast-top toast-end hidden">
        <div className="alert alert-success">
          <span>Organization saved successfully!</span>
        </div>
      </div>
    </div>
  );
}
