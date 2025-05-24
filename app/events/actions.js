'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateEventFingerprint } from '@/lib/event-utils';

/**
 * Edit an event's details
 * 
 * @param {String} eventId - The ID of the event to edit
 * @param {Object} data - Updated event data
 * @returns {Object} - Status of the operation
 */
export async function editEvent(eventId, data) {
  try {
    // Validate the data
    const { eventName, startDate, endDate, price, location } = data;
    
    if (!eventName || !startDate) {
      return {
        success: false,
        error: 'Event name and start date are required'
      };
    }

    // Get event data for path revalidation
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        scrapeJob: {
          include: {
            eventSource: true
          }
        }
      }
    });

    if (!event) {
      return {
        success: false,
        error: 'Event not found'
      };
    }

    // Convert strings to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;
    
    if (isNaN(startDateObj.getTime())) {
      return {
        success: false,
        error: 'Invalid start date'
      };
    }

    if (endDateObj && isNaN(endDateObj.getTime())) {
      return {
        success: false,
        error: 'Invalid end date'
      };
    }

    // Create an event object for fingerprint generation
    const eventObj = {
      eventName,
      startDate: startDateObj,
    };

    // Generate a new fingerprint
    const eventFingerprint = generateEventFingerprint(eventObj);

    // Update the event
    await prisma.event.update({
      where: { id: eventId },
      data: {
        eventName,
        startDate: startDateObj,
        endDate: endDateObj,
        price,
        location: location || {},
        eventFingerprint,
        updatedAt: new Date(),
      }
    });

    // Extract organization and source ID for path revalidation
    const organizationId = event.scrapeJob.eventSource.organizationId;
    const sourceId = event.scrapeJob.eventSourceId;

    // Revalidate paths to update UI
    revalidatePath(`/organizations/${organizationId}/sources/${sourceId}/events`);
    revalidatePath(`/organizations/${organizationId}/sources`);
    revalidatePath(`/events`);
    
    return { 
      success: true,
      message: "Event updated successfully"
    };
  } catch (error) {
    console.error('Error updating event:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Delete an event (hard delete)
 * 
 * @param {String} eventId - The ID of the event to delete
 * @returns {Object} - Status of the operation
 */
export async function deleteEvent(eventId) {
  try {
    // Get event data for path revalidation
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        scrapeJob: {
          include: {
            eventSource: true
          }
        }
      }
    });

    if (!event) {
      return {
        success: false,
        error: 'Event not found'
      };
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId }
    });

    // Extract organization and source ID for path revalidation
    const organizationId = event.scrapeJob.eventSource.organizationId;
    const sourceId = event.scrapeJob.eventSourceId;

    // Revalidate paths to update UI
    revalidatePath(`/organizations/${organizationId}/sources/${sourceId}/events`);
    revalidatePath(`/organizations/${organizationId}/sources`);
    revalidatePath(`/events`);
    
    return { 
      success: true,
      message: "Event deleted successfully"
    };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}