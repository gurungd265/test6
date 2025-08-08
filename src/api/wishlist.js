import api from './index';

const wishlistApi = {
    addWishlistItem: async (productId) => {
        try {
            const response = await api.post(`/api/users/me/wishlists/${productId}`);
            return response.data;
        } catch (error) {
            console.error('お気に入りへの商品追加に失敗しました。', error);
            throw error;
        }
    },

    getWishlistItems: async () => {
        try {
            const response = await api.get('/api/users/me/wishlists');
            return response.data;
        } catch (error) {
            console.error('お気に入りの読み込みに失敗しました。', error);
            throw error;
        }
    },

    removeWishlistItem: async (wishlistItemId) => {
        try {
            const response = await api.delete(`/api/users/me/wishlists/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`お気に入りアイテムID ${wishlistItemId}の削除に失敗しました。`, error);
            throw error;
        }
    },

    removeWishlistItemByProductId: async (productId) => {
        try {
            const response = await api.delete(`/api/users/me/wishlists/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`お気に入りリストから商品ID ${productId}の削除に失敗しました。`, error);
            throw error;
        }
    }
};

export default wishlistApi;