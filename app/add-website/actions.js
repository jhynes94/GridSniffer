'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addWebsite(formData) {
  const url = formData.get('url');
  const scrapeStrategy = formData.get('scrapeStrategy');
  const enabled = formData.get('enabled') === 'on';

  if (!url || !scrapeStrategy) {
    throw new Error('Missing required fields');
  }

  await prisma.website.create({
    data: {
      url,
      scrapeStrategy,
      enabled,
    },
  });

  revalidatePath('/');
}
