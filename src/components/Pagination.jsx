import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="flex items-center justify-between mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>

            <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
}
