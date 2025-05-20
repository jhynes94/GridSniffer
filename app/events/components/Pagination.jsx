'use client';

import Link from 'next/link';

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams }) {
  // Don't render pagination if only one page
  if (totalPages <= 1) {
    return null;
  }

  // Create a function to generate the query string for pagination links
  const createPageQueryString = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return params.toString();
  };

  // Determine which page numbers to show (current, few before and after, first and last)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // If we have fewer pages than max visible, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);
      
      // Determine range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis after page 1 if needed
      if (start > 2) {
        pages.push('ellipsis1');
      }
      
      // Add pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis2');
      }
      
      // Always include last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center my-4">
      <div className="join">
        {/* Previous button */}
        {currentPage > 1 ? (
          <Link 
            href={`${baseUrl}?${createPageQueryString(currentPage - 1)}`}
            className="join-item btn"
          >
            «
          </Link>
        ) : (
          <button className="join-item btn btn-disabled">«</button>
        )}
        
        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis1' || page === 'ellipsis2') {
            return (
              <button key={page} className="join-item btn btn-disabled">
                ...
              </button>
            );
          }
          
          return (
            <Link
              key={index}
              href={`${baseUrl}?${createPageQueryString(page)}`}
              className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
            >
              {page}
            </Link>
          );
        })}
        
        {/* Next button */}
        {currentPage < totalPages ? (
          <Link 
            href={`${baseUrl}?${createPageQueryString(currentPage + 1)}`}
            className="join-item btn"
          >
            »
          </Link>
        ) : (
          <button className="join-item btn btn-disabled">»</button>
        )}
      </div>
    </div>
  );
}