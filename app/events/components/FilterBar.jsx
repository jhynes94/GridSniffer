'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function FilterBar({ organizations, sources, currentFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Form state
  const [search, setSearch] = useState(currentFilters.search || '');
  const [orgId, setOrgId] = useState(currentFilters.orgId || '');
  const [sourceId, setSourceId] = useState(currentFilters.sourceId || '');
  const [status, setStatus] = useState(currentFilters.status || '');
  const [startDate, setStartDate] = useState(currentFilters.startDate || '');
  const [endDate, setEndDate] = useState(currentFilters.endDate || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Function to create search param string
  const createQueryString = (params) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Reset to page 1 when filters change
    newParams.set('page', '1');
    
    // Update or remove params based on values
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    return newParams.toString();
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    const queryString = createQueryString({
      search,
      organization: orgId,
      source: sourceId,
      status,
      startDate,
      endDate,
    });
    
    router.push(`${pathname}?${queryString}`);
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearch('');
    setOrgId('');
    setSourceId('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    
    router.push(pathname);
  };

  // Filter sources by selected organization
  const filteredSources = orgId
    ? sources.filter(source => source.organizationId === orgId)
    : sources;

  // Check if any filters are active
  const hasActiveFilters = search || orgId || sourceId || status || startDate || endDate;

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Filters</h2>
        <button 
          className="btn btn-sm btn-ghost"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Simple search form always visible */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search events..."
          className="input input-bordered flex-grow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Search</button>
        {hasActiveFilters && (
          <button 
            type="button" 
            className="btn btn-outline btn-error"
            onClick={handleClearFilters}
          >
            Clear
          </button>
        )}
      </form>

      {/* Advanced filters (collapsible) */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Organization</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={orgId}
              onChange={(e) => {
                setOrgId(e.target.value);
                setSourceId(''); // Reset source when org changes
              }}
            >
              <option value="">All Organizations</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Event Source</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              disabled={!orgId}
            >
              <option value="">All Sources</option>
              {filteredSources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.url && source.url.length > 40 ? source.url.substring(0, 40) + '...' : source.url}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Start Date (From)</span>
            </label>
            <input 
              type="date" 
              className="input input-bordered w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Start Date (To)</span>
            </label>
            <input 
              type="date" 
              className="input input-bordered w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-control justify-end mt-8">
            <button 
              className="btn btn-primary w-full" 
              onClick={handleSearch}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm font-semibold">Active Filters:</span>
          
          {search && (
            <div className="badge badge-primary gap-1">
              Search: {search}
              <button 
                className="ml-1"
                onClick={() => {
                  setSearch('');
                  const queryString = createQueryString({
                    ...currentFilters,
                    search: '',
                  });
                  router.push(`${pathname}?${queryString}`);
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {orgId && (
            <div className="badge badge-primary gap-1">
              Org: {organizations.find(o => o.id === orgId)?.name}
              <button 
                className="ml-1"
                onClick={() => {
                  setOrgId('');
                  setSourceId('');
                  const queryString = createQueryString({
                    ...currentFilters,
                    organization: '',
                    source: '',
                  });
                  router.push(`${pathname}?${queryString}`);
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {sourceId && (
            <div className="badge badge-primary gap-1">
              Source: {sources.find(s => s.id === sourceId)?.url.substring(0, 15) + '...'}
              <button 
                className="ml-1"
                onClick={() => {
                  setSourceId('');
                  const queryString = createQueryString({
                    ...currentFilters,
                    source: '',
                  });
                  router.push(`${pathname}?${queryString}`);
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {status && (
            <div className="badge badge-primary gap-1">
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              <button 
                className="ml-1"
                onClick={() => {
                  setStatus('');
                  const queryString = createQueryString({
                    ...currentFilters,
                    status: '',
                  });
                  router.push(`${pathname}?${queryString}`);
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {startDate && (
            <div className="badge badge-primary gap-1">
              From: {startDate}
              <button 
                className="ml-1"
                onClick={() => {
                  setStartDate('');
                  const queryString = createQueryString({
                    ...currentFilters,
                    startDate: '',
                  });
                  router.push(`${pathname}?${queryString}`);
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {endDate && (
            <div className="badge badge-primary gap-1">
              To: {endDate}
              <button 
                className="ml-1"
                onClick={() => {
                  setEndDate('');
                  const queryString = createQueryString({
                    ...currentFilters,
                    endDate: '',
                  });
                  router.push(`${pathname}?${queryString}`);
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}