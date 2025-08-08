import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, ShoppingBag, Home, ShoppingCart, Truck, CreditCard, User, Box } from 'lucide-react';

export default function OrderSuccess() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();

    const orderId = state?.orderId;
    const orderDetails = state?.orderDetails;

    if (!orderId || !orderDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="container mx-auto max-w-2xl text-center bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">エラーが発生しました</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        注文情報を見つけることができません。
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center mx-auto gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                        <Home size={20} />
                        ホームに戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 py-12 md:p-12 font-inter">
            <div className="container mx-auto max-w-5xl">
                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-12 text-center">

                    {/* 注文完了の成功アニメーションとメッセージ */}
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="w-20 h-20 text-green-500 animate-bounce" strokeWidth={1} />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 animate-fade-in">
                        {isLoggedIn && user ? `${user.lastName} ${user.firstName}様、ご注文ありがとうございます！` : 'ご注文ありがとうございます！'}
                    </h1>

                    <p className="text-lg text-gray-600 mb-10 animate-fade-in-delay-100">
                        ご注文が正常に処理されました。注文確認メールを送信しました。
                    </p>

                    {/* 注文概要カード */}
                    <div className="bg-white rounded-xl p-0 mb-8 text-left shadow-lg overflow-hidden">

                        {/* Order Number */}
                        <div className="bg-blue-50 p-6 flex items-center gap-4 border-b border-gray-200">
                            <ShoppingBag className="text-blue-600 w-8 h-8" />
                            <span className="text-xl md:text-2xl font-bold text-gray-800">
                                注文番号: {orderId}
                            </span>
                        </div>

                        {/* Ordered product list */}
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Box className="text-gray-500 w-5 h-5"/>
                                ご注文商品
                            </h3>
                            <ul className="space-y-6">
                                {orderDetails.cartItems.map(item => (
                                    <li key={item.id} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-b-0">
                                        {/* Image */}
                                        <img
                                            src={item.productImageUrl}
                                            alt={item.productName}
                                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 shadow-md"
                                        />
                                        {/* Product name and options */}
                                        <div className="flex flex-col flex-grow">
                                            <span className="text-sm font-semibold text-gray-800">{item.productName}</span>
                                            {/* Options */}
                                            {item.options && item.options.length > 0 && (
                                                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                                                    {item.options.map(opt => (
                                                        <li key={opt.id}>
                                                            <span className="font-medium">{opt.optionName}:</span> {opt.optionValue}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {/* Price and quantity */}
                                        <div className="text-right text-sm text-gray-800 font-bold whitespace-nowrap">
                                            ¥{(item.priceAtAddition * item.quantity).toLocaleString()} <br />
                                            <span className="text-xs font-normal text-gray-500">({item.quantity}点)</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* お客様、決済、配送情報 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-t border-gray-200">
                            {isLoggedIn && user && (
                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><User size={20} className="text-blue-500"/>お客様情報</h3>
                                    <p className="text-sm text-gray-600">{user.lastName} {user.firstName} 様</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                            )}
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><CreditCard size={20} className="text-blue-500"/>お支払い情報</h3>
                                <p className="text-sm text-gray-600">お支払い方法: {orderDetails.paymentMethod === 'paypay' ? 'PayPay' : 'ポイント'}</p>
                                <p className="text-sm font-bold text-gray-800 mt-2">合計金額: ¥{orderDetails.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Truck size={20} className="text-blue-500"/>配送先情報</h3>
                                <p className="text-sm text-gray-600">〒{orderDetails.address.postalCode}</p>
                                <p className="text-sm text-gray-600">{orderDetails.address.state} {orderDetails.address.city} {orderDetails.address.street}</p>
                                <p className="text-sm text-gray-600 mt-1">お届け予定日: {orderDetails.deliveryDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* button */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-delay-200">
                        <button
                            onClick={() => navigate(`/my-orders/${orderId}`)}
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-green-500 text-white rounded-lg shadow-xl hover:bg-green-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                        >
                            <ShoppingBag size={18} />
                            注文詳細を確認
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-200 text-gray-800 rounded-lg shadow-xl hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                        >
                            <Home size={18} />
                            ホームに戻る
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
