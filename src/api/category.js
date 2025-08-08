import api from './index';

export const fetchCategories = async () => {
    const response = await api.get('/api/categories');
    return response.data;
};