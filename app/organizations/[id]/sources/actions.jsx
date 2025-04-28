'use server';

import { prisma } from '@/lib/prisma';

export async function addEventSource(organizationId, formData) {
  const url = formData.get('url');

  if (!url) {
    throw new Error('Event Source URL is required.');
  }

  await prisma.eventSource.create({
    data: {
      organizationId,
      url,
    },
  });
}

export async function updateEventSource(eventSourceId, formData) {
  const url = formData.get('url');

  if (!url) {
    throw new Error('Event Source URL is required.');
  }

  await prisma.eventSource.update({
    where: { id: eventSourceId },
    data: {
      url,
    },
  });
}

// (Optional) Future: add deleteEventSource(eventSourceId)
