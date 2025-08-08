import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';

// このコンポーネントは、クレジットカード登録フォームのUIとロジックをカプセル化します。
// 親コンポーネントから onSubmit, isLoading, message などのプロパティを受け取ります。
export default function CreditCardRegistrationForm({ onSubmit, isLoading, message }) {
    const [cardInfo, setCardInfo] = useState({
        cardCompanyName: '',
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (['cardNumber', 'cvv', 'expiryMonth', 'expiryYear'].includes(name)) {
            const onlyDigits = value.replace(/\D/g, '');
            setCardInfo(prev => ({ ...prev, [name]: onlyDigits }));
        } else {
            setCardInfo(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...cardInfo,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faCreditCard} className="text-indigo-600" />
                クレジットカード登録
            </h2>
            {message && (
                <div className={`p-4 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            <div className="mb-4">
                <label htmlFor="cardCompanyName" className="block text-sm font-medium text-gray-700 mb-2">カード会社名</label>
                <select
                    id="cardCompanyName"
                    name="cardCompanyName"
                    value={cardInfo.cardCompanyName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                >
                    <option value="">選択</option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="JCB">JCB</option>
                    <option value="American Express">American Express</option>
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-2">カード名義人名</label>
                <input
                    type="text"
                    id="cardHolderName"
                    name="cardHolderName"
                    value={cardInfo.cardHolderName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例: TARO YAMADA"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">カード番号</label>
                <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={cardInfo.cardNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="16桁のカード番号"
                    maxLength={16}
                    required
                    pattern="\d{16}"
                    title="16桁の数字で入力してください"
                />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-2">有効期限（月）</label>
                    <input
                        type="text"
                        id="expiryMonth"
                        name="expiryMonth"
                        value={cardInfo.expiryMonth}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="MM"
                        maxLength={2}
                        required
                        pattern="^(0[1-9]|1[0-2])$"
                        title="01～12の2桁の月を入力してください"
                    />
                </div>
                <div>
                    <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-2">有効期限（年）</label>
                    <input
                        type="text"
                        id="expiryYear"
                        name="expiryYear"
                        value={cardInfo.expiryYear}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="YY"
                        maxLength={2}
                        required
                        pattern="^\d{2}$"
                        title="2桁の年（例：25）を入力してください"
                    />
                </div>
                <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={cardInfo.cvv}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="3桁"
                        maxLength={3}
                        required
                        pattern="\d{3}"
                        title="3桁の数字で入力してください"
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? '登録中...' : 'クレジットカードを登録する'}
            </button>
        </form>
    );
}