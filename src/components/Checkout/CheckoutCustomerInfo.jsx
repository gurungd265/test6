import React from 'react';

export default function CheckoutCustomerInfo({ formData, handleChange }) {
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">お客様情報</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">お名前（漢字）</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="lastName"
                        placeholder="姓"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        pattern="[\u4E00-\u9FFF]+"
                        title="漢字で入力してください。"
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="firstName"
                        placeholder="名"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        pattern="[\u4E00-\u9FFF]+"
                        title="漢字で入力してください。"
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">お名前（カタカナ）</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="lastNameKana"
                        placeholder="セイ"
                        value={formData.lastNameKana}
                        onChange={handleChange}
                        pattern="[\u30A1-\u30FC]+"
                        title="全角カタカナで入力してください"
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="firstNameKana"
                        placeholder="メイ"
                        value={formData.firstNameKana}
                        onChange={handleChange}
                        pattern="[\u30A1-\u30FC]+"
                        title="全角カタカナで入力してください"
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="\d{2,4}-?\d{2,4}-?\d{3,4}"
                    placeholder="090-1234-5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </section>
    );
}