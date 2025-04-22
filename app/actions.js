'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteWebsite(id) {
  await prisma.website.delete({ where: { id } });
  revalidatePath('/');
}

export async function toggleWebsite(id, enabled) {
  await prisma.website.update({
    where: { id },
    data: { enabled: !enabled },
  });
  revalidatePath('/');
}
