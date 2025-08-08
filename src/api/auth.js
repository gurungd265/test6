import api from './index';

const authApi = {
    // ログイン API
    login: async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 会員登録API
    register: async (userData) => {
        try {
            const response = await api.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ログアウト
    logout: () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('userEmail');
    },
};

export default authApi;