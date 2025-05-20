'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Apply selected changes from a diff comparison
 * 
 * @param {String} sourceId - The ID of the event source
 * @param {Object} changes - Object containing IDs of events to accept/reject
 * @returns {Object} - Status of the operation
 */
export async function applyDiffChanges(organizationId, sourceId, changes) {
  try {
    const { 
      acceptedNew = [], 
      rejectedNew = [],
      acceptedModified = [], 
      rejectedModified = [],
      acceptedRemoved = [], 
      rejectedRemoved = [],
      unchangedEventIds = [] // Added parameter for unchanged events
    } = changes;

    // Handle accepted new events - mark as approved
    if (acceptedNew.length > 0) {
      await prisma.event.updateMany({
        where: { 
          id: { in: acceptedNew }
        },
        data: { 
          isApproved: true 
        }
      });
    }

    // Handle rejected new events - mark as deleted (soft delete)
    if (rejectedNew.length > 0) {
      await prisma.event.updateMany({
        where: { 
          id: { in: rejectedNew }
        },
        data: { 
          isDeleted: true 
        }
      });
    }

    // Handle accepted modified events - mark as approved
    if (acceptedModified.length > 0) {
      await prisma.event.updateMany({
        where: { 
          id: { in: acceptedModified }
        },
        data: { 
          isApproved: true 
        }
      });
    }

    // Handle rejected modified events - mark as deleted
    if (rejectedModified.length > 0) {
      await prisma.event.updateMany({
        where: { 
          id: { in: rejectedModified }
        },
        data: { 
          isDeleted: true 
        }
      });
    }

    // Handle accepted removed events - mark as deleted
    if (acceptedRemoved.length > 0) {
      await prisma.event.updateMany({
        where: { 
          id: { in: acceptedRemoved }
        },
        data: { 
          isDeleted: true 
        }
      });
    }

    // Handle rejected removed events - mark as approved (keep them)
    if (rejectedRemoved.length > 0) {
      await prisma.event.updateMany({
        where: { 
          id: { in: rejectedRemoved }
        },
        data: { 
          isApproved: true 
        }
      });
    }
    
    // Handle unchanged events - mark them as approved without any changes
    if (unchangedEventIds.length > 0) {
      await prisma.event.updateMany({
        where: {
          id: { in: unchangedEventIds }
        },
        data: {
          isApproved: true,
          isDeleted: false
        }
      });
    }

    // Revalidate paths to update UI
    revalidatePath(`/organizations/${organizationId}/sources/${sourceId}/events`);
    revalidatePath(`/organizations/${organizationId}/sources/${sourceId}/diff`);
    
    return { 
      success: true,
      message: "Changes applied successfully"
    };
  } catch (error) {
    console.error('Error applying diff changes:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}