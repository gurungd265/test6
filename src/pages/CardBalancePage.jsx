import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faPlusCircle, faArrowLeft, faWallet } from '@fortawesome/free-solid-svg-icons';
import * as paymentRegistrationApi from '../api/paymentRegistration';

export default function CardBalancePage() { // ファイル名を変更
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [creditCardInfo, setCreditCardInfo] = useState(null);
    const [topUpAmount, setTopUpAmount] = useState(10000);
    const [isLoading, setIsLoading] = useState(true);
    const [isTopUpLoading, setIsTopUpLoading] = useState(false);
    const [error, setError] = useState(null);
    const [topUpError, setTopUpError] = useState(null);

    const fetchCreditCardInfo = async () => {
        if (!isLoggedIn || !user) {
            setIsLoading(false);
            return;
        }
        try {
            const info = await paymentRegistrationApi.fetchRegisteredCard(user.email);
            setCreditCardInfo(info);
            setError(null);
        } catch (err) {
            console.error("クレジットカード情報取得に失敗しました:", err);
            setError('クレジットカード情報の読み込みに失敗しました。');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCreditCardInfo();
    }, [isLoggedIn, user]);

    const handleTopUp = async () => {
        setTopUpError(null);
        setIsTopUpLoading(true);

        if (!user || !user.email) {
            setTopUpError('ユーザー情報がありません。');
            setIsTopUpLoading(false);
            return;
        }
        if (topUpAmount <= 0) {
            setTopUpError('1円以上をチャージしてください。');
            setIsTopUpLoading(false);
            return;
        }
        if (!creditCardInfo) {
            setTopUpError('クレジットカードが登録されていません。');
            setIsTopUpLoading(false);
            return;
        }

        try {
            const response = await paymentRegistrationApi.topUpCardBalance(user.email, topUpAmount);
            alert(`${topUpAmount}円分のクレジットカード利用可能残高をチャージしました。現在の残高: ${response.newAvailableCredit.toLocaleString()}円`);
            await fetchCreditCardInfo();
            setTopUpAmount(10000);
        } catch (err) {
            console.error("クレジットカード残高チャージに失敗しました:", err);
            setTopUpError(err.response?.data?.error || 'チャージ中にエラーが発生しました。');
        } finally {
            setIsTopUpLoading(false);
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

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="flex justify-center items-center h-48 bg-white rounded-xl shadow-2xl border border-gray-100">
                     <div className="text-lg font-medium text-gray-500 animate-pulse">データを読み込む中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 space-y-8">
                <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">クレジットカード残高管理</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {creditCardInfo ? (
                    <div className="space-y-6">
                        {/* Card */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                            <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 text-4xl mb-3" />
                            <p className="text-xl font-semibold text-gray-800">カード会社: <span className="font-bold">{creditCardInfo.cardCompanyName}</span></p>
                            <p className="text-lg text-gray-700">カード番号: <span className="font-bold">{creditCardInfo.maskedCardNumber}</span></p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">現在の仮想残高: {creditCardInfo.availableCredit.toLocaleString()} 円</p>
                        </div>

                        {/* Card Charge */}
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <h2 className="text-xl font-bold text-gray-700">仮想残高チャージ</h2>
                            <p className="text-sm text-gray-500">
                                ※ クレジットカードの仮想利用可能残高を増やします。
                            </p>
                            {topUpError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
                                    <span className="block sm:inline">{topUpError}</span>
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <input
                                    type="number"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(parseInt(e.target.value))}
                                    className="flex-grow p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                    min="1"
                                    step="10000"
                                />
                                <button
                                    onClick={handleTopUp}
                                    disabled={isTopUpLoading}
                                    className="w-full sm:w-auto px-8 py-4 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isTopUpLoading ? 'チャージ中...' : 'チャージする'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <p className="text-lg text-gray-700 mb-4">クレジットカードは登録されていません。</p>
                        <Link
                            to="/payment-registration?method=creditCard"
                            className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            クレジットカードを登録する
                        </Link>
                    </div>
                )}

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
