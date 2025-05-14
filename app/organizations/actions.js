'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function addOrganization(formData) {
  const name = formData.get('name');
  const acronym = formData.get('acronym');
  const description = formData.get('description');
  const homeWebsite = formData.get('homeWebsite');
  const logoFile = formData.get('logo');


  console.log('Form Data:', formData);

  if (!name) {
    throw new Error('Organization name is required');
  }

  let logoBuffer = null;
  if (logoFile && typeof logoFile.arrayBuffer === 'function') {
    const arrayBuffer = await logoFile.arrayBuffer();
    logoBuffer = Buffer.from(arrayBuffer);
  }

  await prisma.organization.create({
    data: {
      name,
      acronym: acronym || null,
      description: description || null,
      homeWebsite: homeWebsite || null,
      logo: logoBuffer,
    },
  });
}

export async function updateOrganization(id, formData) {
  const name = formData.get('name');
  const acronym = formData.get('acronym');
  const description = formData.get('description');
  const homeWebsite = formData.get('homeWebsite');
  const logoFile = formData.get('logo');

  if (!name) {
    throw new Error('Organization name is required');
  }

  let logoBuffer = null;
  if (logoFile && typeof logoFile.arrayBuffer === 'function' && logoFile.size > 0) {
    const arrayBuffer = await logoFile.arrayBuffer();
    logoBuffer = Buffer.from(arrayBuffer);
  }

  const updateData = {
    name,
    acronym: acronym || null,
    description: description || null,
    homeWebsite: homeWebsite || null,
  };

  if (logoBuffer) {
    updateData.logo = logoBuffer;
  }

  await prisma.organization.update({
    where: { id },
    data: updateData,
  });
}
