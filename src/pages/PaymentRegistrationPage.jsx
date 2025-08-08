import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMobileAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import * as paymentRegistrationApi from '../api/paymentRegistration';
import PaypayRegistrationForm from '../components/payment/PaypayRegistrationForm';
import CreditCardRegistrationForm from '../components/payment/CreditCardRegistrationForm';

export default function PaymentRegistrationPage() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedMethod, setSelectedMethod] = useState('paypay');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const method = searchParams.get('method');
        if (method === 'creditCard') {
            setSelectedMethod('creditCard');
        } else {
            setSelectedMethod('paypay');
        }
    }, [searchParams]);

    const handlePaypaySubmit = async ({ paypayId }) => {
        setIsLoading(true);
        setMessage(null);
        try {
            if (!user || !user.email) throw new Error('ユーザー情報がありません。');
            await paymentRegistrationApi.registerPayPay(user.email, paypayId);
            setMessage({ type: 'success', text: `PayPayアカウント (${paypayId}) の登録が完了しました。` });
            setTimeout(() => navigate('/my-points'), 500);
        } catch (err) {
            console.error("PayPay登録に失敗しました:", err);
            const errorMsg = err.response?.data?.error || err.message || '登録中にエラーが発生しました。';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    function maskCardNumber(number) {
        if (!number || number.length < 4) return '**** **** **** ****';
        const last4 = number.slice(-4);
        return '**** **** **** ' + last4;
    }

    const handleCreditCardSubmit = async (cardInfo) => {
        setIsLoading(true);
        setMessage(null);
        try {
            if (!user || !user.email) throw new Error('ユーザー情報がありません。');

            const expiryDate = `${cardInfo.expiryMonth.padStart(2, '0')}${cardInfo.expiryYear.padStart(2, '0')}`; // MMYY 형식
            const fullCardInfo = {
                userId: user.email,
                cardCompanyName: cardInfo.cardCompanyName,
                cardNumber: cardInfo.cardNumber,  // 실제 16자리 숫자
                cardHolderName: cardInfo.cardHolderName,
                expiryDate,
                cvv: cardInfo.cvv,
            };

            await paymentRegistrationApi.registerCard(fullCardInfo);

            setMessage({ type: 'success', text: 'クレジットカードの登録が完了しました。' });
            setTimeout(() => navigate('/my-points'), 500);
        } catch (err) {
            console.error("クレジットカード登録に失敗しました:", err);
            const errorMsg = err.response?.data?.error || err.message || '登録中にエラーが発生しました。';
            setMessage({ type: 'error', text: errorMsg });
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

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 space-y-8">
                <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">決済手段登録</h1>

                {/* tap */}
                <div className="flex justify-center gap-2 md:gap-4 p-1 bg-gray-100 rounded-xl">
                    <button
                        onClick={() => setSelectedMethod('paypay')}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-3 ${
                            selectedMethod === 'paypay' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-blue-500'
                        }`}
                    >
                        <FontAwesomeIcon icon={faMobileAlt} className="text-xl" />
                        <span className="text-lg">PayPay登録</span>
                    </button>
                    <button
                        onClick={() => setSelectedMethod('creditCard')}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-3 ${
                            selectedMethod === 'creditCard' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-blue-500'
                        }`}
                    >
                        <FontAwesomeIcon icon={faCreditCard} className="text-xl" />
                        <span className="text-lg">クレジットカード登録</span>
                    </button>
                </div>

                {/* form */}
                <div className="py-4">
                    {selectedMethod === 'paypay' ? (
                        <PaypayRegistrationForm
                            onSubmit={handlePaypaySubmit}
                            isLoading={isLoading}
                            message={message}
                        />
                    ) : (
                        <CreditCardRegistrationForm
                            onSubmit={handleCreditCardSubmit}
                            isLoading={isLoading}
                            message={message}
                        />
                    )}
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
