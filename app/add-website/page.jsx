import WebsiteForm from '@/components/WebsiteForm';
import { addWebsite } from './actions';

export default function AddWebsitePage() {
  return <WebsiteForm onSubmit={addWebsite} buttonLabel="Add Website" />;
}
