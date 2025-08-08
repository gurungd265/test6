import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faCreditCard, faMobileAlt, faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import * as virtualPaymentsApi from '../api/virtualPayments';
import * as paymentRegistrationApi from '../api/paymentRegistration';

export default function ChargePage() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('paypay');
    const [chargeAmount, setChargeAmount] = useState(1000);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paypayIsRegistered, setPaypayIsRegistered] = useState(false);
    const [creditCardIsRegistered, setCreditCardIsRegistered] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);

    const checkRegistrationStatus = async () => {
        if (!user || !user.email) {
            setStatusLoading(false);
            return;
        }

        let paypayRegistered = false;
        let creditCardRegistered = false;

        try {
            const paypayAccount = await paymentRegistrationApi.fetchRegisteredPayPay(user.email);
            if (paypayAccount && paypayAccount.paypayId) {
                paypayRegistered = true;
            }
        } catch (e) {
            console.error("PayPay登録状態の確認に失敗しました:", e);
        }
        setPaypayIsRegistered(paypayRegistered);
        if (paypayRegistered) {
             setSelectedMethod('paypay');
        }

        try {
            const cardInfo = await paymentRegistrationApi.fetchRegisteredCard(user.email);
            if (cardInfo && cardInfo.maskedCardNumber) {
                creditCardRegistered = true;
            }
        } catch (e) {
            console.error("クレジットカード登録状態の確認に失敗しました:", e);
        }
        setCreditCardIsRegistered(creditCardRegistered);
        if (!paypayRegistered && creditCardRegistered) {
             setSelectedMethod('creditCard');
        }

        setStatusLoading(false);
    };

    useEffect(() => {
        checkRegistrationStatus();
    }, [user]);

    const handleCharge = async () => {
        setError(null);
        setIsLoading(true);

        if (!user || !user.email) {
            setError('ユーザー情報がありません。');
            setIsLoading(false);
            return;
        }

        if (chargeAmount <= 0) {
            setError('1円以上をチャージしてください。');
            setIsLoading(false);
            return;
        }

        try {
            if (selectedMethod === 'paypay') {
                if (!paypayIsRegistered) {
                    alert('PayPayアカウントが登録されていません。登録ページへ移動します。');
                    navigate('/payment-registration?method=paypay');
                    return;
                }
                await virtualPaymentsApi.chargePointsWithPayPay(user.email, chargeAmount);
                alert(`${chargeAmount}円分のポイントをPayPayでチャージしました。`);
            } else if (selectedMethod === 'creditCard') {
                 if (!creditCardIsRegistered) {
                    alert('クレジットカードが登録されていません。登録ページへ移動します。');
                    navigate('/payment-registration?method=creditCard');
                    return;
                }
                await virtualPaymentsApi.chargePointsWithCreditCard(user.email, chargeAmount);
                alert(`${chargeAmount}円分のポイントをクレジットカードでチャージしました。`);
            }
            navigate('/my-points');
        } catch (err) {
            console.error("チャージに失敗しました:", err);
            const errorMsg = err.response?.data?.error || 'チャージ中にエラーが発生しました。';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl text-center text-gray-700">
                <p>このページにアクセスするにはログインが必要です。</p>
                <button onClick={() => navigate('/login')} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    ログインページへ
                </button>
            </div>
        );
    }

    if (statusLoading) {
         return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="flex justify-center items-center h-48 bg-white rounded-xl shadow-2xl border border-gray-100">
                     <div className="text-lg font-medium text-gray-500 animate-pulse">登録状況を確認中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 space-y-8">
                <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">ポイントチャージ</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* 탭 버튼 */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-700">チャージ方法を選択</h2>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setSelectedMethod('paypay')}
                            className={`flex-1 px-6 py-4 rounded-xl font-bold transition-colors duration-200 flex items-center justify-center gap-3 ${
                                selectedMethod === 'paypay' && paypayIsRegistered
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : paypayIsRegistered
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!paypayIsRegistered}
                        >
                            <FontAwesomeIcon icon={faMobileAlt} className="text-xl" />
                            <span>PayPay</span>
                            {paypayIsRegistered ? <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" /> : <span className="text-sm font-normal">(未登録)</span>}
                        </button>
                        <button
                            onClick={() => setSelectedMethod('creditCard')}
                            className={`flex-1 px-6 py-4 rounded-xl font-bold transition-colors duration-200 flex items-center justify-center gap-3 ${
                                selectedMethod === 'creditCard' && creditCardIsRegistered
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : creditCardIsRegistered
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!creditCardIsRegistered}
                        >
                            <FontAwesomeIcon icon={faCreditCard} className="text-xl" />
                            <span>クレジットカード</span>
                            {creditCardIsRegistered ? <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" /> : <span className="text-sm font-normal">(未登録)</span>}
                        </button>
                    </div>
                    {(!paypayIsRegistered || !creditCardIsRegistered) && (
                        <p className="text-sm text-center text-gray-500 mt-2">
                            未登録の決済手段は選択できません。
                            <Link to="/payment-registration" className="text-blue-600 underline hover:no-underline ml-1">登録はこちら</Link>
                        </p>
                    )}
                </div>

                {/* 충전 금액 입력 */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-gray-700">チャージ金額</h2>
                    <p className="text-sm text-gray-500">
                        ※ 1000ポイント単位でチャージできます。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <input
                            type="number"
                            value={chargeAmount}
                            onChange={(e) => setChargeAmount(parseInt(e.target.value))}
                            className="flex-grow p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            min="1000"
                            step="1000"
                        />
                        <button
                            onClick={handleCharge}
                            disabled={isLoading || (selectedMethod === 'paypay' && !paypayIsRegistered) || (selectedMethod === 'creditCard' && !creditCardIsRegistered)}
                            className="w-full sm:w-auto px-8 py-4 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'チャージ中...' : 'チャージする'}
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200 text-center">
                    <button
                        onClick={() => navigate('/my-points')}
                        className="inline-flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-100 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        ポイントページに戻る
                    </button>
                </div>
            </div>
        </div>
    );
}
