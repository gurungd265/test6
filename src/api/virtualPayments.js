import api from './index';

/**
 * ユーザーのすべての残高（ポイント、PayPay、バーチャルカード）を一度に照会するAPI
 * @param {string} userId - ユーザーID
 * @returns {Promise<object>} BalanceResponseDtoオブジェクト
 */
export const fetchAllBalances = async (userId) => {
    console.log(`[API] ポイント・PayPay・バーチャルカード残高の一括照会リクエスト (ユーザーID: ${userId})`);
    try {
        const response = await api.get(`/api/balances/${userId}`);
        return response.data; // { pointBalance, paypayBalance, virtualCardBalance } オブジェクトを返します。
    } catch (error) {
        if (error.response?.status === 404) {
            console.warn('[API] 残高情報がありません。初期値0として処理します。');
            return { pointBalance: 0, paypayBalance: 0, virtualCardBalance: 0 };
        }
        console.error('[API] 残高照会に失敗しました:', error);
        throw error;
    }
};

/**
 * すべての残高照会関数を使用してポイント残高を取得します。
 * @param {string} userId - ユーザーID
 * @returns {Promise<number>} ポイント残高
 */
export const fetchPointBalance = async (userId) => {
    const balances = await fetchAllBalances(userId);
    return balances.pointBalance;
};

/**
 * すべての残高照会関数を使用してPayPay残高を取得します。
 * @param {string} userId - ユーザーID
 * @returns {Promise<number>} PayPay残高
 */
export const fetchPayPayBalance = async (userId) => {
    const balances = await fetchAllBalances(userId);
    return balances.paypayBalance;
};

/**
 * PayPayでポイントをチャージします。
 * @param {string} userId - ユーザーID
 * @param {number} amount - チャージ金額
 * @returns {Promise<object>} 更新された全体の残高を含むBalanceResponseDto
 */
export const chargePointsWithPayPay = async (userId, amount) => {
    console.log(`[API] PayPayでポイントをチャージ: 金額: ${amount} (ユーザーID: ${userId})`);
    const payload = { userId, amount };
    try {
        // バックエンドが更新された全体の残高(BalanceResponseDto)を返します。
        const response = await api.post('/api/balances/charge/paypay', payload);
        return response.data;
    } catch (error) {
        console.error('[API] ポイントチャージに失敗しました:', error);
        throw error;
    }
};

/**
 * クレジットカードでポイントをチャージします。
 * @param {string} userId - ユーザーID
 * @param {number} amount - チャージ金額
 * @returns {Promise<object>} 新しいポイント残高を含むオブジェクト
 */
export const chargePointsWithCreditCard = async (userId, amount) => {
    console.log(`[API] クレジットカードでポイントをチャージ: 金額: ${amount} (ユーザーID: ${userId})`);
    const payload = { userId, amount };
    try {
        const response = await api.post('/api/balances/charge/card', payload);
        return response.data;
    } catch (error) {
        console.error('[API] ポイントチャージに失敗しました:', error);
        throw error;
    }
};

/**
 * ポイントをPayPayに払い戻します。
 * @param {string} userId - ユーザーID
 * @param {number} amount - 払い戻し金額
 * @returns {Promise<object>} 更新された全体の残高を含むBalanceResponseDto
 */
export const refundPointsToPayPay = async (userId, amount) => {
    console.log(`[API] ポイントをPayPayに払い戻し: 金額: ${amount} (ユーザーID: ${userId})`);
    const payload = { userId, amount };
    try {
        const response = await api.post('/api/balances/refund/paypay', payload);
        return response.data;
    } catch (error) {
        console.error('[API] ポイント払い戻しに失敗しました:', error);
        throw error;
    }
};

/**
 * ポイントを差し引きます (新しい関数)。
 * @param {string} userId - ユーザーID
 * @param {number} amount - 差し引き金額
 * @returns {Promise<object>} 新しいポイント残高を含むオブジェクト
 */
export const deductPoints = async (userId, amount) => {
    console.log(`[API] ポイント残高から差し引き: 金額: ${amount} (ユーザーID: ${userId})`);
    const payload = { userId, amount };
    try {
        const response = await api.post('/api/balances/deduct/point', payload);
        return response.data;
    } catch (error) {
        console.error('[API] ポイントの差し引きに失敗しました:', error);
        throw error;
    }
};

/**
 * バーチャル決済を統合する関数
 * @param {string} userId - ユーザーID
 * @param {string} method - 決済方法 ('point', 'paypay', 'virtual_credit_card', 'PAYPAY_REFUND')
 * @param {number} totalAmount - 決済金額
 * @returns {Promise<object>} 決済後の残高情報
 */
export const processVirtualPayment = async (userId, method, totalAmount) => {
    console.log(`[API] バーチャル決済リクエスト: ${method}, 金額: ${totalAmount} (ユーザーID: ${userId})`);
    const payload = { userId: userId, amount: totalAmount };

    if (method.toUpperCase() === 'PAYPAY_REFUND') {
        const response = await refundPointsToPayPay(userId, totalAmount);
        console.log(`[API] バーチャル決済成功:`, response);
        return response;
    } else if (method === 'point') {
        const response = await deductPoints(userId, totalAmount);
        console.log(`[API] ポイント決済成功:`, response);
        return response;
    } else if (method === 'paypay') {
        console.log(`[API] PayPayバーチャル残高で決済: 金額: ${totalAmount} (ユーザーID: ${userId})`);
        const response = await api.post('/api/balances/deduct/paypay', payload);
        return response.data;
    } else if (method === 'virtual_credit_card') {
        console.log(`[API] クレジットカードバーチャル残高で決済: 金額: ${totalAmount} (ユーザーID: ${userId})`);
        const response = await api.post('/api/balances/deduct/card', payload);
        return response.data;
    }
    else {
        console.error('[API] サポートされていない決済方法です:', method);
        throw new Error('サポートされていない決済方法です。');
    }
};

/**
 * PayPayでポイントをチャージします。
 * @param {string} userId - ユーザーID
 * @param {number} amount - チャージ金額
 * @returns {Promise<object>} 更新された全体の残高を含むBalanceResponseDto
 */
export const topUpPointsWithPayPay = async (userId, amount) => {
    console.log(`[API] PayPayでポイントチャージリクエスト: ${amount}ポイント (ユーザーID: ${userId})`);
    return chargePointsWithPayPay(userId, amount);
};
