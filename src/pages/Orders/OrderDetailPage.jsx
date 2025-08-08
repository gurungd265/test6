import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderApi from '../../api/order';
import { ShoppingBag, Truck, CreditCard, User, Home, ArrowLeft } from 'lucide-react';

export default function OrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!isLoggedIn) {
                navigate('/login');
                return;
            }
            try {
                const fetchedOrder = await orderApi.getOrderDetail(orderId);
                setOrder(fetchedOrder);
            } catch (err) {
                console.error(`注文ID ${orderId}の詳細読み込みに失敗しました。`, err);
                setError("注文詳細の読み込みに失敗しました。");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, isLoggedIn, navigate]);

    if (loading) {
        return <div className="container mx-auto p-8 text-center">読み込み中...</div>;
    }

    if (error || !order) {
        return (
            <div className="container mx-auto p-8 text-center text-red-600">
                <p>{error || "注文情報が見つかりません。"}</p>
                <button
                    onClick={() => navigate('/my-orders')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    注文履歴に戻る
                </button>
            </div>
        );
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return '処理中';
            case 'SHIPPED':
                return '発送済み';
            case 'DELIVERED':
                return 'お届け済み';
            case 'CANCELLED':
                return 'キャンセル済み';
            default:
                return '不明';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 ml-4">注文詳細</h1>
            </div>

            <div className="bg-white rounded-xl shadow-2xl p-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-700">注文番号: #{order.id}</h2>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'SHIPPED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        ステータス: {getStatusText(order.status)}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {order.customer && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2"><User size={20} className="text-blue-500"/>お客様情報</h3>
                            <p className="text-sm text-gray-600">{order.customer.lastName} {order.customer.firstName} 様</p>
                            <p className="text-sm text-gray-600">{order.customer.email}</p>
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2"><CreditCard size={20} className="text-blue-500"/>お支払い情報</h3>
                        <p className="text-sm text-gray-600">方法: {order.paymentMethod === 'paypay' ? 'PayPay' : 'ポイント'}</p>
                        <p className="text-sm font-bold text-gray-800 mt-2">合計金額: ¥{order.totalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2"><Truck size={20} className="text-blue-500"/>配送先情報</h3>
                        <p className="text-sm text-gray-600">〒{order.deliveryAddress.postalCode}</p>
                        <p className="text-sm text-gray-600">{order.deliveryAddress.state} {order.deliveryAddress.city} {order.deliveryAddress.street}</p>
                        <p className="text-sm text-gray-600 mt-1">お届け日: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600 mt-1">お届け時間: {order.deliveryTime}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">ご注文商品</h3>
                    <ul className="space-y-4">
                        {order.orderItems.map(item => (
                            <li key={item.id} className="flex gap-4 items-start border-b border-gray-200 pb-4 last:border-b-0">
                                <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"
                                />
                                <div className="flex flex-col flex-grow">
                                    <span className="text-sm font-semibold text-gray-800">{item.product.name}</span>
                                    {/* option */}
                                </div>
                                <div className="text-right text-sm text-gray-800 font-medium whitespace-nowrap">
                                    ¥{(item.priceAtOrder * item.quantity).toLocaleString()} <br />
                                    <span className="text-xs text-gray-500">({item.quantity}点)</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
                    >
                    <Home size={18} />
                    ホームに戻る
                    </button>
                </div>
            </div>
        </div>
    );
}
