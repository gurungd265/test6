import React from 'react';

export default function CheckoutOrderSummary({ cartItems, calculatedSubtotal, shippingFee, tax, totalAmount }) {
    console.log('cartItems:', cartItems);
    return (
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">注文内容</h2>

            {cartItems.length === 0 ? (
                <div className="text-gray-500 text-center py-4">カートに商品がありません</div>
            ) : (
                <>
                    <div className="space-y-4 mb-6">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                        <img
                                            src={item.productImageUrl}
                                            alt={item.productName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-800">{item.productName}</h3>

                                    {/* 옵션 목록 추가 */}
                                    {item.options && item.options.length > 0 && (
                                        <ul className="text-sm text-gray-500 mb-1">
                                            {item.options.map((opt) => (
                                                <li key={opt.id}>
                                                    {opt.optionName}: {opt.optionValue}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <p className="text-sm text-gray-600">
                                        ¥{Number(item.priceAtAddition != null && item.priceAtAddition !== 0 ? item.priceAtAddition : item.productPrice).toLocaleString()} × {item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-600">小計</span>
                            <span className="text-gray-800">¥{calculatedSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">配送料</span>
                            <span className="text-gray-800">¥{shippingFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">消費税</span>
                            <span className="text-gray-800">¥{tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-semibold text-gray-800">合計</span>
                            <span className="font-bold text-gray-900">¥{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </>
            )}

            <div className="text-xs text-gray-500 space-y-2">
                <p>ご注文内容の確認後、注文確定ボタンを押してください。</p>
                <p>当サイトの<a href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</a>に同意の上、お進みください。</p>
            </div>
        </div>
    );
}
