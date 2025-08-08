import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faCreditCard, faMobileAlt, faInfoCircle, faWallet } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default function CheckoutPaymentMethods({
    formData,
    handleChange,
    userBalances = { point: 0, paypay: 0, virtualCreditCard: 0 },
    totalAmount = 0,
    cardData,
    handleCardChange,
    paymentInfo = { paypayAccount: null, creditCard: null },
    handleInlinePointCharge,
    pointChargeAmount,
    setPointChargeAmount,
    isInlineCharging,
    inlineChargeError,
}) {

    const paymentOptions = [];

    // ポイント決済は常に利用可能
    paymentOptions.push({
        value: 'point',
        label: 'ポイント',
        balance: userBalances.point,
        balanceLabel: 'ポイント',
        icon: faCoins,
        chargePath: '/charge'
    });

    // PayPayアカウントが登録されている場合のみオプションに追加
    if (paymentInfo.paypayAccount) {
        paymentOptions.push({
            value: 'paypay',
            label: 'PayPay',
            balance: userBalances.paypay,
            balanceLabel: '円',
            icon: faMobileAlt,
            chargePath: '/paypay-balance-page' // PayPay
        });
    }

    // クレジットカードが登録されている場合のみオプションに追加
    if (paymentInfo.creditCard) {
        paymentOptions.push({
            value: 'virtual_credit_card',
            label: 'クレジットカード',
            balance: userBalances.virtualCreditCard,
            balanceLabel: '円',
            icon: faCreditCard,
            chargePath: '/card-balance-page'
        });
    }

    // 選択中の決済方法の情報を取得
    const selectedMethod = formData.paymentMethod;
    const selectedOption = paymentOptions.find(option => option.value === selectedMethod);
    const currentBalance = selectedOption ? selectedOption.balance : 0;
    const canPayWithSelectedMethod = currentBalance >= totalAmount;

    const hasOnlyPointOption = paymentOptions.length === 1 && paymentOptions[0].value === 'point';

    if (hasOnlyPointOption && !paymentInfo.paypayAccount && !paymentInfo.creditCard) {
        return (
            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">お支払い方法</h2>
                <div className="bg-gray-50 p-6 rounded-md text-center text-gray-600">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400 text-3xl mb-3" />
                    <p className="font-medium">
                        PayPayまたはクレジットカードが登録されていません。
                    </p>
                    <p className="text-sm mt-1">
                        ポイント以外の方法で決済したい場合は、決済手段を登録してください。
                    </p>
                    <Link
                        to="/payment-registration"
                        className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        決済手段を登録する
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">お支払い方法</h2>

            <div className="space-y-3 mb-6">
                {paymentOptions.map(option => (
                    <label
                        key={option.value}
                        className={`flex items-center space-x-2 p-3 rounded-md transition-all cursor-pointer ${
                            selectedMethod === option.value ? 'bg-blue-50 border border-blue-200' : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={option.value}
                            checked={selectedMethod === option.value}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex-1 text-gray-700 font-medium flex items-center">
                            <FontAwesomeIcon icon={option.icon} className="mr-2 text-blue-500" />
                            {option.label}
                        </span>
                        <span className="text-sm text-gray-500">
                            残高: {option.balance.toLocaleString()} {option.balanceLabel}
                        </span>
                    </label>
                ))}
            </div>

            {/* 仮想クレジットカード選択時のフォーム画面 */}
            {selectedMethod === 'virtual_credit_card' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                    <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">カード番号</label>
                        <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={cardData.cardNumber}
                            onChange={handleCardChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
                            <input
                                type="text"
                                id="cardExpiry"
                                name="cardExpiry"
                                value={cardData.cardExpiry}
                                onChange={handleCardChange}
                                placeholder="MM/YY"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-1">セキュリティコード</label>
                            <input
                                type="text"
                                id="cardCvv"
                                name="cardCvv"
                                value={cardData.cardCvv}
                                onChange={handleCardChange}
                                placeholder="CVC"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        ※ このカード情報は決済のためのみに使用され、保存されません。
                    </p>
                </div>
            )}

            {/* 選択された決済手段の決済情報の表示 */}
            {selectedOption && (
                <div className="bg-gray-50 p-4 rounded-md mt-4">
                    <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                        <span>現在の残高:</span>
                        <span className="text-blue-600 font-bold">
                            {currentBalance.toLocaleString()} {selectedOption.balanceLabel}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-gray-700 mt-2">
                        <span>お支払い金額:</span>
                        <span className="text-red-600 font-bold">
                            - {totalAmount.toLocaleString()} {selectedOption.balanceLabel}
                        </span>
                    </div>
                    {canPayWithSelectedMethod && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-base font-bold text-gray-800">
                            <span>お支払い後の残高:</span>
                            <span>
                                {(currentBalance - totalAmount).toLocaleString()} {selectedOption.balanceLabel}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {selectedOption && !canPayWithSelectedMethod && (
                <div className="bg-red-50 p-4 rounded-md mt-6">
                    <p className="text-red-700 text-sm mb-3">
                        決済に必要な {selectedOption.balanceLabel}が {totalAmount.toLocaleString()} {selectedOption.balanceLabel}に対し、<br />
                        現在の残高は {currentBalance.toLocaleString()} {selectedOption.balanceLabel}です。
                    </p>

                    {selectedMethod === 'point' && paymentInfo.paypayAccount ? (
                        <div className="space-y-4">
                            <p className="text-gray-700 text-sm font-medium">PayPay残高からポイントをチャージできます。</p>
                            {inlineChargeError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                                    <span className="block sm:inline">{inlineChargeError}</span>
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="number"
                                    value={pointChargeAmount}
                                    onChange={(e) => setPointChargeAmount(Number(e.target.value))}
                                    placeholder="チャージ金額"
                                    min="1"
                                    step="1000"
                                    className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleInlinePointCharge}
                                    disabled={isInlineCharging || pointChargeAmount <= 0}
                                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-md transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isInlineCharging ? 'チャージ中...' : 'PayPayでポイントをチャージ'}
                                </button>
                            </div>
                            <p className="text-sm text-gray-600">※ PayPay残高: {userBalances.paypay.toLocaleString()} 円</p>
                        </div>
                    ) : (
                        <Link
                            to={selectedOption.chargePath}
                            className="w-full text-center inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                        >
                            {selectedOption.label}の残高をチャージする
                        </Link>
                    )}
                </div>
            )}
        </section>
    );
}
