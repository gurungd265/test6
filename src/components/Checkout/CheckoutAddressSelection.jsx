import React from 'react';

export default function CheckoutAddressSelection({
    availableAddresses,
    selectedAddressId,
    handleAddressSelect,
    formData
}) {
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">お届け先住所</h2>
            <div className="mb-4">
                <label htmlFor="selectAddress" className="block text-sm font-medium text-gray-700 mb-1">登録済み住所から選択</label>
                <select
                    id="selectAddress"
                    name="selectAddress"
                    value={selectedAddressId}
                    onChange={handleAddressSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {availableAddresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                            {addr.isDefault ? '[デフォルト] ' : ''}
                            〒{addr.postalCode} {addr.state} {addr.city} {addr.street}
                        </option>
                    ))}
                </select>
            </div>

            {/* 選択されたアドレス情報をユーザーに表示する部分(読み取り専用) */}
            <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">選択されたお届け先</h3>
                <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">郵便番号</label>
                    <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{formData.postalCode || '選択されていません'}</p>
                </div>
                <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">都道府県</label>
                    <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{formData.state || '選択されていません'}</p>
                </div>
                <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">市区町村</label>
                    <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{formData.city || '選択されていません'}</p>
                </div>
                <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">番地・建物名など</label>
                    <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">{formData.street || '選択されていません'}</p>
                </div>
                <p className="text-sm text-gray-600 mt-3">※住所を変更する場合は、<a href="/profile" className="text-blue-600 hover:underline">マイプロフィール</a>から登録済みの住所を編集または追加してください。</p>
            </div>
        </section>
    );
}
