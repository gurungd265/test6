import React from "react";

export default function Modal({ children, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded shadow-lg p-6 max-w-md w-full relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
}
