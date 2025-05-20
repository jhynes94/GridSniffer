'use server';

import { prisma } from '@/lib/prisma';
import { runScrape } from '@/lib/scrape-runner';
import { generateEventFingerprint } from '@/lib/event-utils';
import { revalidatePath } from 'next/cache';

export async function addEventSource(organizationId, formData) {
  const url = formData.get('url');
  const scrapeStrategy = formData.get('scrapeStrategy');

  if (!url || !scrapeStrategy) {
    throw new Error('URL and Scrape Strategy are required.');
  }

  await prisma.eventSource.create({
    data: {
      organizationId,
      url,
      scrapeStrategy,
    },
  });
}

export async function updateEventSource(eventSourceId, formData) {
  const url = formData.get('url');
  const scrapeStrategy = formData.get('scrapeStrategy');

  if (!url || !scrapeStrategy) {
    throw new Error('URL and Scrape Strategy are required.');
  }

  await prisma.eventSource.update({
    where: { id: eventSourceId },
    data: {
      url,
      scrapeStrategy,
    },
  });
}

export async function scrapeEventSource(sourceId) {
  const source = await prisma.eventSource.findUnique({
    where: { id: sourceId },
  });

  if (!source) {
    throw new Error('Event Source not found.');
  }

  const scrapeJob = await prisma.scrapeJob.create({
    data: {
      eventSourceId: sourceId,
      url: source.url,
      scrapeStrategy: source.scrapeStrategy,
      scrapeStatus: 'RUNNING',
    },
  });

  try {
    const result = await runScrape(source);

    console.log('Scrape Result:', result);

    if (result.events && Array.isArray(result.events)) {
      for (const event of result.events) {
        try {
          // Create event with normalized date objects for consistency
          const startDate = new Date(event.startDate);
          const endDate = event.endDate ? new Date(event.endDate) : null;
          
          // Create the event object to generate fingerprint
          const eventObject = {
            eventName: event.eventName,
            startDate: startDate,
            endDate: endDate,
            price: event.price || null
          };
          
          // Generate fingerprint for comparison
          const fingerprint = generateEventFingerprint(eventObject);
          
          // Create the event with fingerprint
          await prisma.event.create({
            data: {
              scrapeJobId: scrapeJob.id,
              eventName: event.eventName,
              startDate: startDate,
              endDate: endDate,
              location: {
                lat: 0, // Placeholder (upgrade later)
                lng: 0,
              },
              price: event.price || null,
              eventFingerprint: fingerprint,
              // New events default to not approved
              isApproved: false
            },
          });
        } catch (eventInsertError) {
          console.error('Failed to insert event:', event, eventInsertError.message);
        }
      }
    }

    await prisma.scrapeJob.update({
      where: { id: scrapeJob.id },
      data: {
        scrapeStatus: 'SUCCESS',
        scrapeMessage: result.message || '',
        lastScraped: new Date(),
      },
    });

  } catch (err) {
    console.error('Scrape failed:', err.message || err);

    await prisma.scrapeJob.update({
      where: { id: scrapeJob.id },
      data: {
        scrapeStatus: 'ERROR',
        scrapeMessage: err.message || 'Unknown error',
        lastScraped: new Date(),
      },
    });
  }

  // 🔥 Revalidate the Sources page so status updates without manual refresh
  revalidatePath(`/organizations/${source.organizationId}/sources`);
}
