import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as virtualPaymentsApi from '../api/virtualPayments';
import * as paymentRegistrationApi from '../api/paymentRegistration';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faPlusCircle, faMinusCircle, faCreditCard, faMobileAlt, faArrowLeft, faWallet } from '@fortawesome/free-solid-svg-icons';

export default function MyPointPage() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [pointBalance, setPointBalance] = useState(0);
    const [paypayBalance, setPaypayBalance] = useState(0);
    const [paypayAccountInfo, setPaypayAccountInfo] = useState(null);
    const [creditCardInfo, setCreditCardInfo] = useState(null);
    const [refundAmount, setRefundAmount] = useState(1000);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refundError, setRefundError] = useState(null);
    const [isRefunding, setIsRefunding] = useState(false);

    const fetchAllData = async () => {
        if (!isLoggedIn || !user) {
            setIsLoading(false);
            return;
        }

        try {
            const balances = await virtualPaymentsApi.fetchAllBalances(user.email);
            setPointBalance(balances.pointBalance || 0);
            setPaypayBalance(balances.paypayBalance || 0);

            const fetchedPaypayAccount = await paymentRegistrationApi.fetchRegisteredPayPay(user.email);
            setPaypayAccountInfo(fetchedPaypayAccount);

            const fetchedCreditCard = await paymentRegistrationApi.fetchRegisteredCard(user.email);
            setCreditCardInfo(fetchedCreditCard);

            setError(null);
        } catch (err) {
            console.error("データの取得に失敗しました:", err);
            setError('データを読み込む中にエラーが発生しました。');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [isLoggedIn, user]);

    const handleRefundPoints = async () => {
        setRefundError(null);
        setIsRefunding(true);

        if (!user || !user.email) {
            setRefundError('ユーザー情報がありません。');
            setIsRefunding(false);
            return;
        }

        if (refundAmount <= 0) {
            setRefundError('1円以上を返金してください。');
            setIsRefunding(false);
            return;
        }

        if (refundAmount > pointBalance) {
            setRefundError('ポイント残高が足りません。');
            setIsRefunding(false);
            return;
        }

        if (!paypayAccountInfo) {
            setRefundError('PayPayアカウントが登録されていません。返金するにはPayPayアカウントを登録してください。');
            setIsRefunding(false);
            return;
        }

        try {
            await virtualPaymentsApi.refundPointsToPayPay(user.email, refundAmount);
            await fetchAllData();
            setRefundAmount(1000);
            alert(`${refundAmount}円分のポイントをPayPayに返金しました。`);
        } catch (err) {
            console.error("ポイント返金に失敗しました:", err);
            if (err.response && err.response.data) {
                setRefundError(err.response.data.error || err.response.data);
            } else {
                setRefundError('返金中にエラーが発生しました。');
            }
        } finally {
            setIsRefunding(false);
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
                <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">マイポイント管理</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* ポイント 잔액 섹션 */}
                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                        <FontAwesomeIcon icon={faCoins} className="text-yellow-400 text-4xl mr-3" />
                        <h2 className="text-2xl font-bold text-gray-700">保有ポイント</h2>
                    </div>
                    <p className="text-5xl font-extrabold text-blue-600 tracking-tight">
                        {pointBalance.toLocaleString()} <span className="text-xl font-normal text-gray-500">pt</span>
                    </p>
                    <div className="mt-4 text-gray-600 text-center">
                        <p>PayPay残高: {paypayBalance.toLocaleString()} 円</p>
                    </div>
                    <Link
                        to="/charge"
                        className="mt-6 px-8 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                        ポイントをチャージ
                    </Link>
                </div>

                {/* payment section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-700 border-b pb-2">登録済み決済手段</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PayPay カード */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center mb-4">
                                    <FontAwesomeIcon icon={faMobileAlt} className="text-blue-500 text-2xl mr-3" />
                                    <span className="text-lg font-semibold text-gray-800">PayPay</span>
                                </div>
                                {paypayAccountInfo ? (
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600">ID: <span className="font-medium">{paypayAccountInfo.paypayId}</span></p>
                                        <p className="text-sm text-gray-600">仮想残高: <span className="font-medium">{paypayAccountInfo.balance.toLocaleString()} 円</span></p>
                                        <Link
                                            to="/paypay-balance-page"
                                            className="inline-flex items-center mt-3 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faWallet} className="mr-2" />残高を管理
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-3">登録されていません。</p>
                                        <Link
                                            to="/payment-registration?method=paypay"
                                            className="inline-block px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                        >
                                            登録する
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* creditcard */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center mb-4">
                                    <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 text-2xl mr-3" />
                                    <span className="text-lg font-semibold text-gray-800">クレジットカード</span>
                                </div>
                                {creditCardInfo ? (
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600">会社: <span className="font-medium">{creditCardInfo.cardCompanyName}</span></p>
                                        <p className="text-sm text-gray-600">番号: <span className="font-medium">{creditCardInfo.maskedCardNumber}</span></p>
                                        <p className="text-sm text-gray-600">仮想残高: <span className="font-medium">{creditCardInfo.availableCredit.toLocaleString()} 円</span></p>
                                        <Link
                                            to="/card-balance-page"
                                            className="inline-flex items-center mt-3 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faWallet} className="mr-2" />残高を管理
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-3">登録されていません。</p>
                                        <Link
                                            to="/payment-registration?method=creditCard"
                                            className="inline-block px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                        >
                                            登録する
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ポイント back */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-gray-700">ポイント返金</h3>
                    <p className="text-sm text-gray-500">
                        ※ ポイントを現金としてPayPayへ返金します。（1000ポイント単位）
                    </p>

                    {refundError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
                            <span className="block sm:inline">{refundError}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <input
                            type="number"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(parseInt(e.target.value))}
                            className="flex-grow p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            min="1000"
                            step="1000"
                        />
                        <button
                            onClick={handleRefundPoints}
                            disabled={isRefunding || !paypayAccountInfo}
                            className="w-full sm:w-auto px-8 py-4 bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRefunding ? '返金中...' : '返金する'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
