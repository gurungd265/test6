import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt } from '@fortawesome/free-solid-svg-icons';

// このコンポーネントは、PayPay登録フォームのUIとロジックをカプセル化します。
// 親コンポーネントから onSubmit, isLoading, message などのプロパティを受け取ります。
export default function PaypayRegistrationForm({ onSubmit, isLoading, message }) {
    const [paypayId, setPaypayId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ paypayId });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faMobileAlt} className="text-indigo-600" />
                PayPay登録
            </h2>
            {message && (
                <div className={`p-4 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            <div className="mb-4">
                <label htmlFor="paypayId" className="block text-sm font-medium text-gray-700 mb-2">PayPay ID</label>
                <input
                    type="text"
                    id="paypayId"
                    value={paypayId}
                    onChange={(e) => setPaypayId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="PayPay IDを入力してください"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? '登録中...' : 'PayPayアカウントを登録する'}
            </button>
        </form>
    );
}