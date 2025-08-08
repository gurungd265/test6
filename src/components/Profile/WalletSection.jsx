import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faCreditCard, faMobileAlt, faPlus, faCheckCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as virtualPaymentsApi from '../../api/virtualPayments';
import * as paymentRegistrationApi from '../../api/paymentRegistration';

export default function WalletSection({ onLogout }) {
    const { user } = useAuth();
    const [pointBalance, setPointBalance] = useState(0);
    const [paypayAccountInfo, setPaypayAccountInfo] = useState(null);
    const [creditCardInfo, setCreditCardInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.email) {
                setError('ユーザー情報がありません。');
                setIsLoading(false);
                return;
            }

            try {
                const balances = await virtualPaymentsApi.fetchAllBalances(user.email);
                setPointBalance(balances.pointBalance || 0);

                const fetchedPaypayAccount = await paymentRegistrationApi.fetchRegisteredPayPay(user.email);
                setPaypayAccountInfo(fetchedPaypayAccount);

                const fetchedCreditCard = await paymentRegistrationApi.fetchRegisteredCard(user.email);
                setCreditCardInfo(fetchedCreditCard);

                setError(null);
            } catch (err) {
                console.error('ウォレットデータの取得に失敗しました:', err);
                setError('ウォレット情報の読み込みに失敗しました。');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow-lg border border-gray-100">
                <div className="text-lg font-medium text-gray-500 animate-pulse">
                    ウォレット情報を読み込み中...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 max-w-2xl mx-auto space-y-8">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* ポイントsection */}
            <div className="flex flex-col items-center justify-center p-6 border-b border-gray-200">
                <FontAwesomeIcon icon={faCoins} className="text-yellow-400 text-5xl mb-4 animate-bounce" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">保有ポイント</h2>
                <p className="text-6xl font-extrabold text-blue-600 tracking-tight">
                    {pointBalance.toLocaleString()} <span className="text-2xl font-normal text-gray-500">pt</span>
                </p>
                <Link
                    to="/charge"
                    className="mt-6 px-8 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200 transform hover:scale-105"
                >
                    ポイントチャージ
                </Link>
            </div>

            {/* section */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-700 border-b pb-2">登録済み決済手段</h3>

                {/* PayPay */}
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200 transition-shadow duration-200 hover:shadow-md">
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faMobileAlt} className="text-blue-500 text-3xl mr-5" />
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-gray-800">PayPay</span>
                                {paypayAccountInfo ? (
                                    <span className="text-sm text-gray-500 mt-1">ID: {paypayAccountInfo.paypayId}</span>
                                ) : (
                                    <span className="text-sm text-red-500 mt-1">未登録</span>
                                )}
                            </div>
                        </div>
                        <Link
                            to="/payment-registration?method=paypay"
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            {paypayAccountInfo ? (
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
                            ) : (
                                <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                            )}
                        </Link>
                    </div>

                    {/* creditCard */}
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200 transition-shadow duration-200 hover:shadow-md">
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 text-3xl mr-5" />
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-gray-800">クレジットカード</span>
                                {creditCardInfo ? (
                                    <span className="text-sm text-gray-500 mt-1">
                                        {creditCardInfo.cardCompanyName} ({creditCardInfo.maskedCardNumber})
                                    </span>
                                ) : (
                                    <span className="text-sm text-red-500 mt-1">未登録</span>
                                )}
                            </div>
                        </div>
                        <Link
                            to="/payment-registration?method=creditCard" // <-- 'method=creditCard'
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            {creditCardInfo ? (
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
                            ) : (
                                <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                            )}
                        </Link>
                    </div>
            </div>

            {/* Logout */}
            <div className="pt-6 border-t border-gray-200 text-right">
                <button
                    onClick={onLogout}
                    className="inline-flex items-center px-6 py-2 border border-red-500 text-red-500 rounded-full font-medium hover:bg-red-50 transition-colors duration-200"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    ログアウト
                </button>
            </div>
        </div>
    );
}