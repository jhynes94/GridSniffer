'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { runScrape } from '@/lib/scrape-runner';

// ADD WEBSITE
export async function addWebsite(formData) {
  const url = formData.get('url');
  const scrapeStrategy = formData.get('scrapeStrategy');
  const enabled = formData.get('enabled') === 'on';

  if (!url || !scrapeStrategy) {
    throw new Error('Missing required fields');
  }

  await prisma.website.create({
    data: { url, scrapeStrategy, enabled },
  });

  revalidatePath('/');
}

// UPDATE WEBSITE
export async function updateWebsite(id, formData) {
  const url = formData.get('url');
  const scrapeStrategy = formData.get('scrapeStrategy');
  const enabled = formData.get('enabled') === 'on';

  if (!url || !scrapeStrategy) {
    throw new Error('Missing required fields');
  }

  await prisma.website.update({
    where: { id },
    data: { url, scrapeStrategy, enabled },
  });

  revalidatePath('/');
}

// DELETE WEBSITE
export async function deleteWebsite(id) {
  await prisma.website.delete({ where: { id } });
  revalidatePath('/');
}

// TOGGLE WEBSITE ENABLED
export async function toggleWebsite(id, currentState) {
  await prisma.website.update({
    where: { id },
    data: { enabled: !currentState },
  });

  revalidatePath('/');
}

// SCRAPE ONE WEBSITE
export async function scrapeWebsite(id) {
  await prisma.website.update({
    where: { id },
    data: {
      scrapeStatus: 'RUNNING',
      scrapeMessage: '',
    },
  });

  try {
    const website = await prisma.website.findUnique({ where: { id } });

    const result = await runScrape(website); // from /lib/scrape-runner.js

    await prisma.website.update({
      where: { id },
      data: {
        scrapeStatus: 'SUCCESS',
        scrapeMessage: result.message || '',
        lastScraped: new Date(),
      },
    });
  } catch (error) {
    await prisma.website.update({
      where: { id },
      data: {
        scrapeStatus: 'ERROR',
        scrapeMessage: error.message || 'Unknown error',
      },
    });
  }

  revalidatePath('/');
}

// SCRAPE ALL ENABLED WEBSITES
export async function scrapeAllWebsites() {
  const websites = await prisma.website.findMany({ where: { enabled: true } });

  for (const site of websites) {
    await prisma.website.update({
      where: { id: site.id },
      data: {
        scrapeStatus: 'RUNNING',
        scrapeMessage: '',
      },
    });

    try {
      const result = await runScrape(site);

      await prisma.website.update({
        where: { id: site.id },
        data: {
          scrapeStatus: 'SUCCESS',
          scrapeMessage: result.message || '',
          lastScraped: new Date(),
        },
      });
    } catch (error) {
      await prisma.website.update({
        where: { id: site.id },
        data: {
          scrapeStatus: 'ERROR',
          scrapeMessage: error.message || 'Unknown error',
        },
      });
    }
  }

  revalidatePath('/');
}
