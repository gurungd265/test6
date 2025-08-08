import api from './index';
import Cookies from 'js-cookie';

const isLoggedIn = () => {
    return !!localStorage.getItem('jwtToken');
};

const cartApi = {
    // 카트에 상품을 추가
    addToCart: async (productId, quantity, options) => {
        let url = `/api/cart/items?productId=${productId}&quantity=${quantity}`;

        // 비회원인 경우, sessionId를 쿼리 파라미터로 추가
        if (!isLoggedIn()) {
            let sessionId = Cookies.get('sessionId');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                Cookies.set('sessionId', sessionId, { expires: 7, path: '/' });
            }
            url += `&sessionId=${sessionId}`;
        }

        // 옵션들에 대해 productOptionId가 있는지 확인 후 전달
        if (options && options.length > 0) {
            options.forEach(attr => {
                if (!attr.productOptionId) {
                    console.error("Option ID is missing:", attr);
                    throw new Error("Option ID must not be null or undefined");
                }
                url += `&${encodeURIComponent(attr.optionName)}=${encodeURIComponent(attr.optionValue)}`;
            });
        }

        // API 호출
        try {
            // GET 방식에서 쿼리 파라미터를 URL에 담아서 호출하기
            const response = await api.post(url, { productId, quantity, options });
            return response.data;
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            throw error;
        }
    },

    // ログインしたユーザーのショッピングカート項目の取得
    getCartItems: async () => {
        let url = `/api/cart`;
            if(!isLoggedIn()){
                let sessionId = Cookies.get('sessionId');
                if (!sessionId) {
                    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    Cookies.set('sessionId', sessionId, { expires: 7 , path: '/'});
                }
                url += url.includes('?') ? `&sessionId=${sessionId}` : `?sessionId=${sessionId}`;
            }
        try {
            const response = await api.get(url);
            return response.data; // ショッピングカートリスト
        } catch (error) {
            console.error('カートアイテムを読み込むことができませんでした。', error);
            throw error;
        }
    },

    // ショッピングカート項目の数量変更
    updateCartItemQuantity: async (cartItemId, newQuantity) => {
        let url = `/api/cart/items/${cartItemId}?quantity=${newQuantity}`;
                if(!isLoggedIn()){
                    let sessionId = Cookies.get('sessionId');
                    if (!sessionId) {
                        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        Cookies.set('sessionId', sessionId, { expires: 7 , path: '/'});
                    }
                    url += `&sessionId=${sessionId}`;
                }
        try {
            const response = await api.put(url);
            return response.data; // アップデートされたショッピングカート項目
        } catch (error) {
            console.error(`カートアイテムID ${cartItemId}の数量を更新できませんでした。`, error);
            throw error;
        }
    },

    // ショッピングカート項目削除
    removeCartItem: async (cartItemId) => {
        let url = `/api/cart/items/${cartItemId}`;
                if(!isLoggedIn()){
                    let sessionId = Cookies.get('sessionId');
                    if (!sessionId) {
                        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        Cookies.set('sessionId', sessionId, { expires: 7 , path: '/'});
                    }
                    url += url.includes('?') ? `&sessionId=${sessionId}` : `?sessionId=${sessionId}`;
                }
        try {
            const response = await api.delete(url);
            return response.data;
        } catch (error) {
            console.error(`カートアイテムID ${cartItemId}を削除できませんでした。`, error);
            throw error;
        }
    },

    removeItemsFromCart: async (itemIds) => {
            console.log(`[API] カートから複数商品一括削除リクエスト: ${itemIds.join(', ')}`);
            let url = `/api/cart/items/batch-delete`;
            if(!isLoggedIn()){
                const sessionId = Cookies.get('sessionId');
                if (!sessionId) {
                    console.error("セッションIDがありません。");
                    throw new Error("セッションIDがありません。");
                }
                url += `?sessionId=${sessionId}`;
            }
            try {
                const response = await api.post(url, { itemIds });
                return response.data;
            } catch (error) {
                console.error('複数のカートアイテムを削除できませんでした。', error);
                throw error;
            }
    },


    // 買い物かごを空けること
    clearCart: async () => {
        let url = `/api/cart`;
                if(!isLoggedIn()){
                    let sessionId = Cookies.get('sessionId');
                    if (!sessionId) {
                        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        Cookies.set('sessionId', sessionId, { expires: 7 , path: '/'});
                    }
                    url += url.includes('?') ? `&sessionId=${sessionId}` : `?sessionId=${sessionId}`;
                }
        try {
            const response = await api.delete(url);
            return response.data;
        } catch (error) {
            console.error('カートを空にできませんでした。', error);
            throw error;
        }
    },

    mergeAnonymousCart: async (sessionId) => {
            try {
                const response = await api.post(`/api/cart/merge?sessionId=${sessionId}`);
                Cookies.remove('sessionId', { path: '/' });
                return response.data;
            } catch (error) {
                console.error('匿名カートの統合に失敗しました。', error);
                throw error;
            }
    },

    getCartItemCount: async () => {
        let url = '/api/cart/count';
        if (!isLoggedIn()) {
            const sessionId = Cookies.get('sessionId');
            if (sessionId) {
                url += `?sessionId=${sessionId}`;
            } else {
                return 0;
            }
        } else {
            console.log('DEBUG_CART_API: getCartItemCount: not sessionId request:', url);
        }
        try {
            const response = await api.get(url);
            console.log('DEBUG_CART_API: getCartItemCount response.data:', response.data);
            return response.data ?? 0;
        } catch (error) {
            console.error('Failed to fetch cart item count:', error);
            return 0;
        }
    }
};

export default cartApi;