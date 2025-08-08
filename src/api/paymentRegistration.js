import api from './index';

// PayPay登録API
export const registerPayPay = async (userId, paypayId) => {
    const response = await api.post('/api/register/paypay', {
        userId,
        paypayId
    });
    return response.data;
};

// カード登録API
export const registerCard = async (cardInfo) => {
    console.log(`[API] クレジットカード登録リクエスト (ユーザーID: ${cardInfo.userId})`);
    const response = await api.post('/api/register/card', cardInfo);
    return response.data;
};

// 登録済みPayPayアカウント情報取得API
export const fetchRegisteredPayPay = async (userId) => {
    console.log(`[API] 登録済みPayPay情報照会リクエスト (ユーザーID: ${userId})`);
    try {
        // バックエンドのPayPayRegistrationControllerに新しいGETエンドポイントを想定
        const response = await api.get(`/api/register/paypay/${userId}`);
        return response.data; // { paypayId: "..." } 形式のデータを想定
    } catch (error) {
        if (error.response?.status === 404) {
            console.warn('[API] 登録済みPayPayアカウントなし');
            return null; // 未登録の場合はnullを返す
        }
        console.error('[API] 登録済みPayPay情報照会失敗:', error);
        throw error;
    }
};

// 登録済みカード情報取得API
export const fetchRegisteredCard = async (userId) => {
    console.log(`[API] 登録済みクレジットカード情報照会リクエスト (ユーザーID: ${userId})`);
    try {
        // バックエンドのCardRegistrationControllerに新しいGETエンドポイントを想定
        const response = await api.get(`/api/register/card/${userId}`);
        return response.data; // { cardCompanyName: "...", maskedCardNumber: "..." } 形式のデータを想定
    } catch (error) {
        if (error.response?.status === 404) {
            console.warn('[API] 登録済みクレジットカードなし');
            return null; // 未登録の場合はnullを返す
        }
        console.error('[API] 登録済みクレジットカード情報照会失敗:', error);
        throw error;
    }
;}

    // PayPayアカウント残高を仮想的にチャージするAPI
export const topUpPaypayBalance = async (userId, amount) => {
    console.log(`[API] PayPay残高仮想チャージリクエスト: 金額: ${amount} (ユーザーID: ${userId})`);
    const response = await api.post('/api/register/paypay/topup', { userId, amount });
    return response.data;
};

    // クレジットカード利用可能残高を仮想的にチャージするAPI
export const topUpCardBalance = async (userId, amount) => {
    console.log(`[API] クレジットカード残高仮想チャージリクエスト: 金額: ${amount} (ユーザーID: ${userId})`);
    const response = await api.post('/api/register/card/topup', { userId, amount });
    return response.data;
};
