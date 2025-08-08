import React, { useState } from "react";

export default function CategoryFilter({ categories, selectedCategory, onFilter }) {

    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={"mb-6"}>
            {/* 필터 제목 클릭하면 토글 */}
            <h3
                className="font-medium text-gray-700 mb-2 cursor-pointer select-none flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                カテゴリー
                <span className="text-gray-500">{isOpen ? '▲' : '▼'}</span>
            </h3>

            {/* isOpen이 true일 때만 필터 버튼 노출 */}
            {isOpen && (
                <div className="space-y-2">
                    <button
                        onClick={() => onFilter(null)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                            !selectedCategory 
                                ? "bg-purple-600 text-white" 
                                : "hover:bg-gray-100 text-gray-800"
                        }`}
                    >
                        すべて
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onFilter(category.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                                selectedCategory === category.id 
                                    ? "bg-purple-600 text-white" 
                                    : "hover:bg-gray-100 text-gray-800"
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}