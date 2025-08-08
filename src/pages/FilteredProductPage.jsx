import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import productsApi from '../api/products.js';  // productsApi import

import Product from '../components/Product.jsx';
import CategoryFilter from '../components/Header/CategoryFilter.jsx';
import Pagination from '../components/Pagination.jsx';

export default function FilteredProductPage() {
    const [searchParams] = useSearchParams();

    const categoryIdFromUrl = searchParams.get('categoryId');
    const keywordFromUrl = searchParams.get('keyword') || '';
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;

    const [page, setPage] = useState(pageFromUrl);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const data = await productsApi.getCategories();  // 이 함수는 api에 만들어야 합니다
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories. Product filtering may not work.');
        }
    };

    const fetchProducts = async (categoryId = null, keyword = '', pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);

            const data = await productsApi.getProductsByFilter({
                categoryId,
                keyword,
                page: pageNum,
            });

            setProducts(data.content || data);
            setTotalPages(data.totalPages || 1);
            setTotalProducts(data.totalElements || data.length);
        } catch (err) {
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(pageFromUrl);
    }, [pageFromUrl]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setSelectedCategory(categoryIdFromUrl || null);
        fetchProducts(categoryIdFromUrl, keywordFromUrl, page);
    }, [categoryIdFromUrl, keywordFromUrl, page]);

    const handleFilter = (categoryId) => {
        setSelectedCategory(categoryId);
        navigate(`/products?categoryId=${categoryId || ''}&page=1`);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
            const params = new URLSearchParams(searchParams);
            params.set('page', newPage);
            navigate(`/products?${params.toString()}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    if (loading && products.length === 0) {
        return <div className="p-4 text-gray-600">Loading products...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/*Fixed Category Sidebar*/}
                <div className="w-full md:w-64 sticky top-4 h-fit">
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onFilter={handleFilter}
                    />
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-6">
                        Products {totalProducts > 0 && `(${totalProducts})`}
                    </h1>
                    {loading && products.length > 0 && (
                        <div className="text-gray-600 mb-4">Loading more products...</div>
                    )}
                    {products.length === 0 && !loading ? (
                        <div className="text-gray-600 text-center py-12">
                            No products found. Try adjusting your filters.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <Product key={product.id} product={product} />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}