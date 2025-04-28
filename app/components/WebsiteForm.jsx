'use client';

export default function WebsiteForm({ onSubmit, initialData = {}, buttonLabel = 'Save' }) {
  return (
    <form action={onSubmit} className="max-w-md p-4 space-y-4">
      <h1 className="text-xl font-bold">{initialData.id ? 'Edit Website' : 'Add Website'}</h1>

      <input
        name="url"
        type="url"
        placeholder="Website URL"
        className="input input-bordered w-full"
        defaultValue={initialData.url || ''}
        required
      />

      <select
        name="scrapeStrategy"
        className="select select-bordered w-full"
        defaultValue={initialData.scrapeStrategy || ''}
        required
      >
        <option value="" disabled>Select strategy</option>
        <option value="generic_ai">Generic AI</option>
        <option value="pdf">PDF</option>
        <option value="image">Image</option>
        <option value="css_calendar">CSS Calendar</option>
      </select>

      <label className="label cursor-pointer">
        <span className="label-text">Enabled</span>
        <input
          type="checkbox"
          name="enabled"
          className="checkbox"
          defaultChecked={initialData.enabled ?? true}
        />
      </label>

      <button type="submit" className="btn btn-primary">{buttonLabel}</button>
    </form>
  );
}
