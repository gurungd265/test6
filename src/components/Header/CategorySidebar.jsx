import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function CategorySidebar({ categories, onClose, onCategoryClick }) {
    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col">
                <div className="p-4 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close menu"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <Link
                        to="/products"
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 border-b"
                        onClick={onClose}
                    >
                        すべて
                    </Link>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onCategoryClick(category.id)}
                            className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 border-b"
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
