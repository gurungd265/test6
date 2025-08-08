import React from "react";
import { Search } from "lucide-react";

export default function SearchBox({ searchTerm, setSearchTerm, onSearch, onKeyPress }) {
    return (
        <div className="hidden sm:flex items-center w-full border rounded overflow-hidden bg-gray-50 h-10">
            <input
                type="search"
                placeholder="探す..."
                className="px-3 py-0 w-full outline-none bg-gray-50 text-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onKeyPress}
                aria-label="Search products"
            />
            <button
                className="px-3 bg-purple-600 text-white flex items-center justify-center h-10 hover:bg-purple-700"
                onClick={onSearch}
                aria-label="Submit search"
            >
                <Search size={16} />
            </button>
        </div>
    );
}