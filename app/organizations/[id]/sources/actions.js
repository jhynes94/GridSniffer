'use server';

import { prisma } from '@/lib/prisma';
import { runScrape } from '@/lib/scrape-runner';

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

    await prisma.scrapeJob.update({
      where: { id: scrapeJob.id },
      data: {
        scrapeStatus: 'SUCCESS',
        scrapeMessage: result.message || '',
        lastScraped: new Date(),
      },
    });

  } catch (err) {
    console.error(err);

    await prisma.scrapeJob.update({
      where: { id: scrapeJob.id },
      data: {
        scrapeStatus: 'ERROR',
        scrapeMessage: err.message || 'Unknown error',
        lastScraped: new Date(),
      },
    });
  }
}
