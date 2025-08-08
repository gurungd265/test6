import api from './index';

const orderApi = {
    createOrder: async (orderPayload) => {
        try {
            const response = await api.post('/api/orders', orderPayload);  // orderPayload를 넘겨야 함
            return response.data;
        } catch (error) {
            console.error('注文の作成に失敗しました。', error);
            throw error;
        }
    },

    //(GET /api/orders)
    getUserOrders: async () => {
        try {
            const response = await api.get('/api/orders');
            return response.data; // List<OrderDto>
        } catch (error) {
            console.error('注文履歴の読み込みに失敗しました。', error);
            throw error;
        }
    },

    //(GET /api/orders/{orderId})
    getOrderDetail: async (orderId) => {
        try {
            const response = await api.get(`/api/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error(`注文ID ${orderId}の詳細読み込みに失敗しました。`, error);
            throw error;
        }
    },

    createOrderFromCart: async (paymentMethod, billingAddressId, shippingAddressId) => {
        try {
            const response = await api.post('/api/orders/cart', {
                paymentMethod,
                billingAddressId,
                shippingAddressId
            });
            return response.data; // OrderResponseDto
        } catch (error) {
            console.error('カートからの注文作成に失敗しました。', error);
            throw error;
        }
    },

    // delete
    cancelOrder: async (orderId) => {
        try {
            const response = await api.delete(`/api/orders/${orderId}/cancel`);
            return response.data; // 204 No Content
        } catch (error) {
            console.error(`注文ID ${orderId}のキャンセルに失敗しました。`, error);
            throw error;
        }
    }
};

export default orderApi;