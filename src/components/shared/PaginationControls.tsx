import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  showCompact?: boolean;
  showTopInfo?: boolean;
  showBottomControls?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPrevPage,
  onNextPage,
  showCompact = false,
  showTopInfo = true,
  showBottomControls = true
}) => {
  if (totalPages <= 1) return null;

  return (
    <>
      {/* Top pagination info */}
      {showTopInfo && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-lorcana-ink font-medium">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} cards
          </div>
          {showCompact && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onPrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-sm border-2 border-lorcana-gold disabled:bg-gray-100 disabled:text-gray-400 hover:bg-lorcana-cream transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-lorcana-ink">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={onNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-sm border-2 border-lorcana-gold disabled:bg-gray-100 disabled:text-gray-400 hover:bg-lorcana-cream transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom pagination controls */}
      {showBottomControls && (
        <div className="mt-8">
          {/* Mobile pagination - compact */}
          <div className="flex sm:hidden justify-between items-center px-4">
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 rounded-sm border-2 border-lorcana-gold disabled:bg-gray-100 disabled:text-gray-400 hover:bg-lorcana-cream transition-colors"
            >
              <ChevronLeft size={16} />
              <span className="text-sm ml-1">Prev</span>
            </button>
            
            <div className="flex items-center space-x-1">
              <span className="text-sm text-lorcana-ink">
                {currentPage} of {totalPages}
              </span>
            </div>

            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 rounded-sm border-2 border-lorcana-gold disabled:bg-gray-100 disabled:text-gray-400 hover:bg-lorcana-cream transition-colors"
            >
              <span className="text-sm mr-1">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Desktop pagination - full controls */}
          <div className="hidden sm:flex justify-center items-center space-x-4">
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-2 rounded-sm border-2 border-lorcana-gold disabled:bg-gray-100 disabled:text-gray-400 hover:bg-lorcana-cream transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      pageNum === currentPage
                        ? 'bg-lorcana-navy text-lorcana-gold'
                        : 'border-2 border-lorcana-gold hover:bg-lorcana-cream'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-2 rounded-sm border-2 border-lorcana-gold disabled:bg-gray-100 disabled:text-gray-400 hover:bg-lorcana-cream transition-colors"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaginationControls;