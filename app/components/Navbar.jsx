'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  // Determine if we're on the main dashboard
  const isHome = pathname === '/';
  // Check if we're in the organizations section
  const isOrganizations = pathname.startsWith('/organizations') && !pathname.includes('/sources/');
  // Check if we're in a specific organization's section (sources, events, etc.)
  const isOrganizationDetail = pathname.includes('/sources/');
  // Check if we're on the events page
  const isEvents = pathname.startsWith('/events');

  return (
    <div className="navbar bg-base-300 sticky top-0 z-10 shadow-md mb-4">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
            <li><Link href="/">Dashboard</Link></li>
            <li><Link href="/organizations">Organizations</Link></li>
            <li><Link href="/events">Events</Link></li>
            {isOrganizationDetail && (
              <li>
                <a>Current Source</a>
                <ul className="p-2">
                  <li><a>Events</a></li>
                  <li><a>Diff Tool</a></li>
                  <li><a>Scrape History</a></li>
                </ul>
              </li>
            )}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl">GridSniffer</Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/" className={isHome ? 'active' : ''}>Dashboard</Link></li>
          <li><Link href="/organizations" className={isOrganizations ? 'active' : ''}>Organizations</Link></li>
          <li><Link href="/events" className={isEvents ? 'active' : ''}>Events</Link></li>
          {isOrganizationDetail && (
            <li>
              <details>
                <summary>Current Source</summary>
                <ul className="p-2 bg-base-200 rounded-box">
                  <li><a>Events</a></li>
                  <li><a>Diff Tool</a></li>
                  <li><a>Scrape History</a></li>
                </ul>
              </details>
            </li>
          )}
        </ul>
      </div>
      
      <div className="navbar-end">
        <Link href="/organizations/add-organization" className="btn btn-sm btn-primary mr-2">
          Add Organization
        </Link>
      </div>
    </div>
  );
}