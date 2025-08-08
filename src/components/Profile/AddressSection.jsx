import React from 'react';

export default function AddressSection({
    addresses,
    editedAddress,
    handleAddressChange,
    handleAddressSave,
    handleAddressSearch,
    addressSearchError,
    isEditingAddress,
    startEditingAddress,
    cancelEditingAddress,
    handleSetDefaultAddress,
    addressHasChanges,
    onDeleteAddress,
}) {
    function formatPostalCode(postalCode) {
        if (!postalCode) return "";
        const digits = postalCode.replace(/\D/g, "");
        if (digits.length !== 7) return postalCode;
        return digits.slice(0, 3) + "-" + digits.slice(3);
    }
    return (
        <div className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">お届け先住所</h2>

            {/* アドレス帳表示 */}
            {addresses.length === 0 && !isEditingAddress && (
                <p className="text-gray-600">登録された住所がありません。</p>
            )}
            {addresses.map((addr) => (
                <div key={addr.id} className="border p-4 rounded-md flex justify-between items-center">
                    <div>
                        <p>
                            {addr.isDefault && <span className="text-green-600 font-bold mr-2">[デフォルト]</span>}
                            〒{formatPostalCode(addr.postalCode)}<br/>
                            {addr.prefecture || addr.state} {addr.city} {addr.streetAddress || addr.street}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        {!addr.isDefault && (
                            <button
                                onClick={() => {
                                    console.log("デフォルトに設定 버튼 클릭됨, 주소 ID:", addr.id);
                                    handleSetDefaultAddress(addr.id);
                                }}
                                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                            >
                                選択
                            </button>
                        )}
                        <button
                            onClick={() => startEditingAddress(addr)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                            修正
                        </button>
                        {/* 削除ボタン  */}
                            <button
                                onClick={() => onDeleteAddress(addr.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                                削除
                            </button>
                    </div>
                </div>
            ))}

            {/* 新しいアドレスの追加または現在のアドレスの編集ボタン/フォーム */}
            {!isEditingAddress ? (
                <button
                    onClick={() => startEditingAddress()} // 새 주소 추가 시작 (initialAddress로 초기화)
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    新しい住所を追加
                </button>
            ) : (
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-3">
                        {editedAddress.id ? "住所を編集" : "新しい住所を追加"}
                    </h3>
                    <div className="flex items-end gap-2 mb-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700" htmlFor="postalCode">郵便番号 (必須)</label>
                            <input
                                type="text"
                                id="postalCode"
                                name="postalCode"
                                value={editedAddress.postalCode ?? ""}
                                onChange={handleAddressChange}
                                className="w-full mt-1 border rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="例: 1500043, 123-4567"
                                maxLength="8"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                console.log('検索ボタンがクリックされました');
                                handleAddressSearch((editedAddress.postalCode ?? '').replace(/-/g, ''));
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            検索
                        </button>
                    </div>
                    {addressSearchError && (
                        <p className="text-red-500 text-sm mt-1">{addressSearchError}</p>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">都道府県 (必須)</label>
                        <input
                            type="text"
                            name="prefecture"
                            value={editedAddress.prefecture ?? ""}
                            onChange={handleAddressChange}
                            className="w-full mt-1 border rounded px-3 py-2 bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="例: 東京都"
                            readOnly
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">市区町村 (必須)</label>
                        <input
                            type="text"
                            name="city"
                            value={editedAddress.city ?? ""}
                            onChange={handleAddressChange}
                            className="w-full mt-1 border rounded px-3 py-2 bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="例: 渋谷区"
                            readOnly
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">番地・建物名など (必須)</label>
                        <input
                            type="text"
                            name="streetAddress"
                            value={editedAddress.streetAddress ?? ""}
                            onChange={handleAddressChange}
                            className="w-full mt-1 border rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="例: 道玄坂1-2-3 ABCビルディング101"
                            required
                        />
                    </div>
                    {/* isDefault  */}
                    <div className="flex items-center mb-4">
                        <input
                            id="isDefaultAddress"
                            name="isDefault"
                            type="checkbox"
                            checked={editedAddress.isDefault ?? false}
                            onChange={(e) => handleAddressChange({ target: { name: 'isDefault', value: e.target.checked }})}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="isDefaultAddress" className="ml-2 block text-sm text-gray-900">
                            デフォルトの住所に設定する
                        </label>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleAddressSave}
                            disabled={!addressHasChanges} // 変更がなければ無効にします
                            className={`px-4 py-2 rounded ${addressHasChanges ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                        >
                            保存
                        </button>
                        <button
                            onClick={cancelEditingAddress}
                            className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100"
                        >
                            キャンセル
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}