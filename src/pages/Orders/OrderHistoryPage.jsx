import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import orderApi from "../../api/order";

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrders, setExpandedOrders] = useState({});

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const fetchedOrders = await orderApi.getUserOrders();
                setOrders(fetchedOrders);

                const initialExpanded = {};
                fetchedOrders.forEach(order => {
                    initialExpanded[order.id] = false;
                });
                setExpandedOrders(initialExpanded);
            } catch (err) {
                console.error("注文履歴の読み込み中にエラーが発生しました：", err);
                setError("注文履歴の読み込み中にエラーが発生しました。ログイン状態を確認してください。");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const toggleOrder = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

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
            case 'COMPLETED':
                return '完了';
            default:
                return '不明';
        }
    };

    if (loading) {
        return <div className="p-6 text-center">読み込み中...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">{error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-6">注文履歴</h2>
                <p>まだ注文はありません</p>
                <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
                    ホームページに移動
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-6">注文履歴</h2>

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="border rounded-lg shadow p-4">
                        {/* General information of the order */}
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <Link to={`/my-orders/${order.id}`} className="font-semibold text-blue-600 hover:underline">
                                    注文ID：＃{order.orderNumber}
                                </Link>
                                <p className={`text-sm ${
                                    order.status === "COMPLETED" ? "text-green-600" :
                                    order.status === "SHIPPED" ? "text-yellow-600" :
                                    "text-red-600"
                                }`}>
                                    注文状況：{getStatusText(order.status)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    注文した日付：{new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-sm text-gray-600">
                                    お届け先住所：{order.shippingAddress?.street || "未指定"}
                                </p>
                                <p className="font-bold text-lg">
                                    合計金額：{order.totalAmount?.toLocaleString()}円
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <div className="text-gray-600">
                                {order.orderItems?.length || 0} 商品
                            </div>
                            <button
                                onClick={() => toggleOrder(order.id)}
                                className="flex items-center gap-1 text-blue-600 ml-auto"
                            >
                                商品詳細
                                {expandedOrders[order.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        </div>

                        {/* Product list (toggle section) */}
                        {expandedOrders[order.id] && (
                            <div className="mt-4 border-t pt-4">
                                {order.orderItems?.map(item => (
                                    <div key={item.id} className="flex gap-4 py-3 border-b last:border-b-0">
                                        <div className="w-20 h-20 flex-shrink-0">
                                            <img
                                                src={item.productImageUrl || "https://placehold.co/80x80/000000/ffffff?text=No+Image"}
                                                alt={item.productName}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </div>

                                        <div className="flex-grow">
                                            <Link
                                                to={`/product/${item.productId}`}
                                                className="font-medium hover:text-blue-600 hover:underline"
                                            >
                                                {item.productName}
                                            </Link>
                                            <div className="text-sm text-gray-600">
                                                <p>注文数量：{item.quantity}</p>
                                                <p>金額：{item.productPrice?.toLocaleString()}円</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
