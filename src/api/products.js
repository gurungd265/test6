import api from './index';

const productsApi = {
    getAllProducts: async () => {
        try {
            const response = await api.get('/api/products');
            return response.data;
        } catch (error) {
            console.error('すべての商品読み込み失敗:', error);
            throw error;
        }
    },

    getProductById: async (productId) => {
        try {
            const response = await api.get(`/api/products/${productId}`);
            return response.data;  // 백엔드에서 보내준 ProductDto JSON
        } catch (error) {
            console.error(`商品 ${productId} 読み込み失敗:`, error);
            throw error;
        }
    },

    getCategories: async () => {
        try {
            const response = await api.get('/api/categories');
            return response.data;
        } catch (error) {
            console.error('カテゴリー読み込み失敗:', error);
            throw error;
        }
    },

    getProductsByFilter: async ({ categoryId, keyword, page }) => {
        try {
            const params = {};
            if (categoryId) params.categoryId = categoryId;
            if (keyword) params.keyword = keyword;
            if (page) params.page = page;

            // 검색어가 있을 경우 '/api/products/search'로 호출
            const response = keyword
                ? await api.get('/api/products/search', { params })  // search 엔드포인트로 변경
                : await api.get('/api/products', { params });  // 검색어가 없으면 기본 상품 목록

            return response.data;
        } catch (error) {
            console.error('フィルター付き商品読み込み失敗:', error);
            throw error;
        }
    },
};

export default productsApi;