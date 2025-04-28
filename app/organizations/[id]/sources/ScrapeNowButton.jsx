'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { scrapeEventSource } from './actions'; // Adjust path if needed

export function ScrapeNowButton({ sourceId }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleScrape() {
    startTransition(async () => {
      await scrapeEventSource(sourceId); // Call server action
      router.refresh(); // 🔥 Force client to refresh and pull latest data
    });
  }

  return (
    <button
      onClick={handleScrape}
      disabled={isPending}
      className="btn btn-sm btn-info"
    >
      {isPending ? (
        <>
          <span className="loading loading-spinner loading-xs mr-2"></span> Scraping...
        </>
      ) : (
        '🔄 Scrape Now'
      )}
    </button>
  );
}
