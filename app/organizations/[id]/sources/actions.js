'use server';

import { prisma } from '@/lib/prisma';
import { runScrape } from '@/lib/scrape-runner';
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
          await prisma.event.create({
            data: {
              scrapeJobId: scrapeJob.id,
              eventName: event.eventName,
              startDate: new Date(event.startDate),
              endDate: event.endDate ? new Date(event.endDate) : null,
              location: {
                lat: 0, // Placeholder (upgrade later)
                lng: 0,
              },
              price: event.price || null,
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
