import api from './index';
import axios from 'axios';

const userApi = {
        confirmPassword: async (password) => {
                try {
                    const response = await api.post('/api/users/me/confirm-password', { password });
                    return response.data;
                } catch (error) {
                    console.error("Password confirmation API error:", error);
                    throw error;
                }
        },

        getUserProfile: async () => {
            try {
                const response = await api.get('/api/users/me');
                return response.data;
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
                throw error;
            }
        },

        updateUserProfile: async (userData) => {
            try {
                const dataToSend = {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phoneNumber: userData.phoneNumber,
                };
                const response = await api.put('/api/users/me', dataToSend);
                return response.data;
            } catch (error) {
                console.error("Failed to update user profile:", error);
                throw error;
            }
        },

        getAddressById: async (addressId) => {
            try {
                const response = await api.get(`/api/addresses/${addressId}`);
                return response.data;
            } catch (error) {
                console.error("Failed to fetch address by ID:", error);
                throw error;
            }
        },

        getUserAddresses: async () => {
            try {
                const response = await api.get('/api/addresses');
                return response.data;
            } catch (error) {
                console.error("Failed to fetch user addresses:", error);
                throw error;
            }
        },

        saveUserAddress: async (addressData) => {
            try {
                const dataToSend = {
                    id: addressData.id || null,
                    addressType: addressData.addressType || "SHIPPING",
                    street: addressData.streetAddress,
                    city: addressData.city,
                    state: addressData.prefecture,
                    postalCode: addressData.postalCode,
                    country: addressData.country || "日本",
                    isDefault: addressData.isDefault || false,
                };

                let response;
                if (addressData.id) {
                    response = await api.put(`/api/addresses/${addressData.id}`, dataToSend);
                } else {
                    response = await api.post('/api/addresses', dataToSend);
                }
                return response.data;
            } catch (error) {
                console.error("Failed to save user address:", error);
                throw error;
            }
        },

        setDefaultAddress: async (addressId) => {
            try {
                const response = await api.put(`/api/addresses/${addressId}/default`);
                return response.data;
            } catch (error) {
                console.error("Failed to set default address:", error);
                throw error;
            }
        },

        searchAddressByZipcode: async (zipcode) => {
            if (!zipcode || zipcode.length !== 7 || !/^\d+$/.test(zipcode)) {
                throw new Error("有効な7桁の郵便番号を入力してください。");
            }

            try {
                const response = await axios.get(`https://api.zipaddress.net/?zipcode=${zipcode}`);

                if (response.data.code === 200 && response.data.code) {
                    const addressData = response.data.data;
                    return {
                        prefecture: addressData.pref,    // 都道府県
                        city: addressData.city,          // 市区町村
                        streetAddress: addressData.town, // 町域
                    };
                } else if (response.data.code === 400) {
                    throw new Error("無効な郵便番号です。");
                } else {
                    throw new Error("住所の検索に失敗しました。もう一度お試しください。");
                }
            } catch (error) {
                console.error("郵便番号検索エラー:", error);
                if (error.response && error.response.data && error.response.data.message) {
                     throw new Error(error.response.data.message);
                } else if (error.message) {
                     throw error;
                } else {
                    throw new Error("住所の検索中にエラーが発生しました。ネットワーク接続を確認してください。");
                }
            }
        },

        deleteUserAddress: async (addressId) => {
                console.log(`DEBUG userApi: DELETE /api/addresses/${addressId} 呼び出し`);
                try {
                    const response = await api.delete(`/api/addresses/${addressId}`);
                    console.log("DEBUG userApi: 住所削除API呼び出し成功、応答:", response.data);
                    return response.data;
                } catch (error) {
                    console.error("DEBUG userApi: 住所削除APIエラー:", error);
                    throw error;
                }
            },
    };

export default userApi;