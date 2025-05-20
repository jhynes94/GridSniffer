import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import FilterBar from './components/FilterBar';
import EventTable from './components/EventTable';
import Pagination from './components/Pagination';

export default async function EventsPage({ searchParams: searchParamsPromise }) {
  // Await searchParams before using them
  const searchParams = await searchParamsPromise;
  
  // Parse search parameters with defaults
  const page = Number(searchParams?.page) || 1;
  const pageSize = Number(searchParams?.pageSize) || 20;
  const search = searchParams?.search || '';
  const orgId = searchParams?.organization || undefined;
  const sourceId = searchParams?.source || undefined;
  const status = searchParams?.status || undefined;
  const startDate = searchParams?.startDate ? new Date(searchParams.startDate) : undefined;
  const endDate = searchParams?.endDate ? new Date(searchParams.endDate) : undefined;
  
  // Build query filters
  // Construct the where clause for filtering events
  const whereClause = {
    ...(search && {
      eventName: {
        contains: search,
        mode: 'insensitive',
      },
    }),
    ...(orgId && {
      scrapeJob: {
        eventSource: {
          organizationId: orgId,
        },
      },
    }),
    ...(sourceId && {
      scrapeJob: {
        eventSourceId: sourceId,
      },
    }),
    ...(status === 'approved' && { isApproved: true, isDeleted: false }),
    ...(status === 'pending' && { isApproved: false, isDeleted: false }),
    ...(status === 'deleted' && { isDeleted: true }),
    ...(startDate && {
      startDate: {
        gte: startDate,
      },
    }),
    ...(endDate && {
      startDate: {
        lte: endDate,
      },
    }),
  };
  
  // Create the full query parameters
  const filters = {
    where: whereClause,
    orderBy: {
      startDate: 'desc',
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      scrapeJob: {
        include: {
          eventSource: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
  };

  // Execute query with count for pagination
  const [events, totalCount] = await Promise.all([
    prisma.event.findMany(filters),
    prisma.event.count({ where: whereClause }),
  ]);

  // Get all organizations for filter dropdown
  const organizations = await prisma.organization.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  // Get sources for filter dropdown (filtered by org if selected)
  const sources = await prisma.eventSource.findMany({
    ...(orgId && { where: { organizationId: orgId } }),
    orderBy: { url: 'asc' },
    include: {
      organization: {
        select: { name: true },
      },
    },
  });

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">All Events</h1>
        <div className="stats bg-primary text-primary-content shadow mt-4 md:mt-0">
          <div className="stat">
            <div className="stat-title">Total Events</div>
            <div className="stat-value">{totalCount}</div>
          </div>
        </div>
      </div>

      <FilterBar 
        organizations={organizations}
        sources={sources}
        currentFilters={{
          search,
          orgId,
          sourceId,
          status,
          startDate: searchParams?.startDate,
          endDate: searchParams?.endDate,
        }}
      />

      {events.length === 0 ? (
        <div className="alert alert-info mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No events found matching your criteria. Try adjusting your filters.</span>
        </div>
      ) : (
        <>
          <EventTable events={events} />
          
          <div className="mt-6">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              baseUrl="/events"
              searchParams={searchParams}
            />
          </div>
        </>
      )}
    </div>
  );
}