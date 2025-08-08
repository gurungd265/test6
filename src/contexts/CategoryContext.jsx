import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchCategories } from '../api/category';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchCategories();
                // console.log("Fetched categories:", data);
                setCategories(data);
            } catch (error) {
                console.error("カテゴリ取得エラー:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <CategoryContext.Provider value={{ categories, loading }}>
            {children}
        </CategoryContext.Provider>
    );
}

export function useCategory() {
    return useContext(CategoryContext);
}