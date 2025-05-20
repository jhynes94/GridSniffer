import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// Helper function to get a status badge color
function statusColor(status) {
  switch (status) {
    case 'RUNNING': return 'badge-warning';
    case 'SUCCESS': return 'badge-success';
    case 'ERROR': return 'badge-error';
    default: return 'badge-ghost'; // PENDING or undefined
  }
}

export default async function Dashboard() {
  // Get organization statistics
  const organizations = await prisma.organization.findMany({
    include: {
      _count: {
        select: { eventSources: true }
      },
      eventSources: {
        include: {
          _count: {
            select: { scrapes: true }
          },
          scrapes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              _count: {
                select: { events: true }
              }
            }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Get overall statistics
  const stats = await prisma.$transaction([
    prisma.organization.count(),
    prisma.eventSource.count(),
    prisma.scrapeJob.count(),
    prisma.event.count(),
    // Recent scrape jobs with status
    prisma.scrapeJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        eventSource: {
          include: {
            organization: true
          }
        }
      }
    }),
    // Recently modified sources
    prisma.eventSource.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        organization: true
      }
    })
  ]);

  const [orgCount, sourceCount, scrapeCount, eventCount, recentScrapes, recentSources] = stats;

  // Get sources with pending diffs (sources with at least 2 SUCCESS scrapes)
  const sourcesWithDiffs = await prisma.eventSource.findMany({
    where: {
      scrapes: {
        some: {
          scrapeStatus: 'SUCCESS'
        }
      }
    },
    include: {
      organization: true,
      scrapes: {
        where: {
          scrapeStatus: 'SUCCESS'
        },
        orderBy: { createdAt: 'desc' },
        take: 2
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  // Filter to only include sources with at least 2 successful scrapes
  const sourcesWithPendingDiffs = sourcesWithDiffs.filter(source => source.scrapes.length >= 2);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">GridSniffer Dashboard</h1>
          <p className="text-lg text-base-content/70">Monitor events, sources, and organizations</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats shadow w-full mb-8">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div className="stat-title">Organizations</div>
          <div className="stat-value">{orgCount}</div>
          <div className="stat-desc">Event sources aggregated</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div className="stat-title">Event Sources</div>
          <div className="stat-value">{sourceCount}</div>
          <div className="stat-desc">Active scraping targets</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <div className="stat-title">Scrape Jobs</div>
          <div className="stat-value">{scrapeCount}</div>
          <div className="stat-desc">Data collection runs</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div className="stat-title">Events</div>
          <div className="stat-value">{eventCount}</div>
          <div className="stat-desc">Tracked activities</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Organization List */}
        <div className="card shadow-xl bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Organizations</h2>
            
            {organizations.length === 0 ? (
              <div className="alert">
                <span>No organizations added yet.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Sources</th>
                      <th>Events</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.slice(0, 5).map(org => {
                      // Calculate total events across all sources
                      const totalEvents = org.eventSources.reduce((sum, source) => {
                        const firstScrape = source.scrapes[0];
                        return sum + (firstScrape?._count?.events || 0);
                      }, 0);
                      
                      return (
                        <tr key={org.id}>
                          <td>{org.name}</td>
                          <td>{org._count.eventSources}</td>
                          <td>{totalEvents}</td>
                          <td>
                            <Link 
                              href={`/organizations/${org.id}/sources`} 
                              className="btn btn-xs btn-primary"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="card-actions justify-end mt-4">
              <Link href="/organizations" className="btn btn-primary">View All Organizations</Link>
            </div>
          </div>
        </div>

        {/* Recent Scrapes */}
        <div className="card shadow-xl bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Recent Scrapes</h2>
            
            {recentScrapes.length === 0 ? (
              <div className="alert">
                <span>No recent scrapes.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Organization</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScrapes.map(scrape => (
                      <tr key={scrape.id}>
                        <td>{scrape.eventSource.organization.name}</td>
                        <td className="text-sm">
                          {new Date(scrape.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${statusColor(scrape.scrapeStatus)}`}>
                            {scrape.scrapeStatus}
                          </span>
                        </td>
                        <td>
                          <Link 
                            href={`/organizations/${scrape.eventSource.organizationId}/sources/${scrape.eventSourceId}/dashboard`} 
                            className="btn btn-xs btn-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Diffs */}
        <div className="card shadow-xl bg-base-200">
          <div className="card-body">
            <h2 className="card-title">
              <span>Sources with Pending Diffs</span>
              <div className="badge badge-warning ml-2">{sourcesWithPendingDiffs.length}</div>
            </h2>
            
            {sourcesWithPendingDiffs.length === 0 ? (
              <div className="alert">
                <span>No sources with pending diffs.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Organization</th>
                      <th>Source</th>
                      <th>Last Scraped</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourcesWithPendingDiffs.map(source => (
                      <tr key={source.id}>
                        <td>{source.organization.name}</td>
                        <td className="truncate max-w-[200px]">{source.url}</td>
                        <td className="text-sm">
                          {source.scrapes[0] && new Date(source.scrapes[0].createdAt).toLocaleString()}
                        </td>
                        <td>
                          <Link 
                            href={`/organizations/${source.organizationId}/sources/${source.id}/diff`} 
                            className="btn btn-xs btn-accent"
                          >
                            Compare
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sources */}
        <div className="card shadow-xl bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Recently Modified Sources</h2>
            
            {recentSources.length === 0 ? (
              <div className="alert">
                <span>No sources available.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Organization</th>
                      <th>Source</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSources.map(source => (
                      <tr key={source.id}>
                        <td>{source.organization.name}</td>
                        <td className="truncate max-w-[200px]">{source.url}</td>
                        <td className="text-sm">
                          {new Date(source.updatedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <Link 
                            href={`/organizations/${source.organizationId}/sources/${source.id}/dashboard`} 
                            className="btn btn-xs btn-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card shadow-xl bg-primary text-primary-content">
          <div className="card-body">
            <h2 className="card-title">Add New Organization</h2>
            <p>Register a new organization to start tracking their events.</p>
            <div className="card-actions justify-end">
              <Link href="/organizations/add-organization" className="btn">Create Now</Link>
            </div>
          </div>
        </div>
        
        <div className="card shadow-xl bg-accent text-accent-content">
          <div className="card-body">
            <h2 className="card-title">View All Event Sources</h2>
            <p>Browse all registered event sources across organizations.</p>
            <div className="card-actions justify-end">
              <Link href="/organizations" className="btn">View Sources</Link>
            </div>
          </div>
        </div>
        
        <div className="card shadow-xl bg-info text-info-content">
          <div className="card-body">
            <h2 className="card-title">Browse All Events</h2>
            <p>Search and filter events across all organizations.</p>
            <div className="card-actions justify-end">
              <Link href="/events" className="btn">View Events</Link>
            </div>
          </div>
        </div>
        
        <div className="card shadow-xl bg-secondary text-secondary-content">
          <div className="card-body">
            <h2 className="card-title">Resolve Pending Diffs</h2>
            <p>Review and resolve changes detected in recent scrapes.</p>
            <div className="card-actions justify-end">
              {sourcesWithPendingDiffs.length > 0 ? (
                <Link 
                  href={`/organizations/${sourcesWithPendingDiffs[0].organizationId}/sources/${sourcesWithPendingDiffs[0].id}/diff`} 
                  className="btn"
                >
                  Review Changes
                </Link>
              ) : (
                <button className="btn btn-disabled">No Pending Diffs</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}