import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import orderApi from '../api/order';
import * as virtualPaymentsApi from '../api/virtualPayments';
import * as paymentRegistrationApi from '../api/paymentRegistration';
import useCheckoutData from '../hooks/useCheckoutData';
import useDeliveryOptions from '../hooks/useDeliveryOptions';
import CheckoutCustomerInfo from '../components/Checkout/CheckoutCustomerInfo';
import CheckoutAddressSelection from '../components/Checkout/CheckoutAddressSelection';
import CheckoutDeliveryOptions from '../components/Checkout/CheckoutDeliveryOptions';
import CheckoutPaymentMethods from '../components/Checkout/CheckoutPaymentMethods';
import CheckoutOrderSummary from '../components/Checkout/CheckoutOrderSummary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const [isOrdering, setIsOrdering] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        lastNameKana: '',
        firstNameKana: '',
        postalCode: '',
        state: '',
        city: '',
        street: '',
        phone: '',
        email: '',
        paymentMethod: '',
        deliveryDate: '',
        deliveryTime: ''
    });

    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
    });

    const [userBalances, setUserBalances] = useState({ point: 0, paypay: 0, virtualCreditCard: 0 });
    const [paymentInfo, setPaymentInfo] = useState({ paypayAccount: null, creditCard: null });

    const [pointChargeAmount, setPointChargeAmount] = useState(1000);
    const [isInlineCharging, setIsInlineCharging] = useState(false);
    const [inlineChargeError, setInlineChargeError] = useState(null);

    const {
        cartItems,
        subtotal,
        availableAddresses,
        selectedAddressId,
        setSelectedAddressId,
        isLoading,
        error: fetchError,
        addressStatusChecked,
        fetchInitialCheckoutData,
        removePurchasedItems,
    } = useCheckoutData();

    const { deliveryDates, DELIVERY_TIME_SLOTS } = useDeliveryOptions();
    const calculatedSubtotal = cartItems.reduce((sum, item) => {
        const price = item.priceAtAddition != null && item.priceAtAddition !== 0 ? item.priceAtAddition : item.productPrice;
        return sum + price * item.quantity;
    }, 0);
    const shippingFee = 600;
    const tax = Math.floor(calculatedSubtotal * 0.1);
    const totalAmount = calculatedSubtotal + shippingFee + tax;

    const fetchUserBalancesAndInfo = useCallback(async () => {
        if (!isLoggedIn || !user) {
            navigate('/login');
            return;
        }
        try {
            const balancesFromVirtualPayments = await virtualPaymentsApi.fetchAllBalances(user.email);
            const paypayAccount = await paymentRegistrationApi.fetchRegisteredPayPay(user.email);
            const creditCard = await paymentRegistrationApi.fetchRegisteredCard(user.email);

            setUserBalances(prevBalances => {
                return {
                    ...prevBalances,
                    point: balancesFromVirtualPayments.pointBalance !== undefined ? balancesFromVirtualPayments.pointBalance : prevBalances.point,
                    paypay: paypayAccount?.balance !== undefined ? paypayAccount.balance : prevBalances.paypay,
                    virtualCreditCard: creditCard?.availableCredit !== undefined ? creditCard.availableCredit : prevBalances.virtualCreditCard,
                };
            });
            setPaymentInfo({ paypayAccount, creditCard });

            // 초기 결제 수단 설정 (등록된 계정이 있는 경우 우선)
            if (paypayAccount && paypayAccount.balance > 0) {
                setFormData(prev => ({ ...prev, paymentMethod: 'paypay' }));
            } else if (creditCard && creditCard.availableCredit > 0) {
                setFormData(prev => ({ ...prev, paymentMethod: 'virtual_credit_card' }));
            } else if (balancesFromVirtualPayments.pointBalance > 0) {
                setFormData(prev => ({ ...prev, paymentMethod: 'point' }));
            } else {
                setFormData(prev => ({ ...prev, paymentMethod: '' }));
            }

        } catch (err) {
            console.error("決済データの読み込みに失敗しました:", err);
            setSubmitError('決済データの読み込みに失敗しました。');
        }
    }, [isLoggedIn, user, navigate]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchInitialCheckoutData(setFormData);
            fetchUserBalancesAndInfo();
        }
    }, [isLoggedIn, user, fetchInitialCheckoutData, fetchUserBalancesAndInfo]);

    const handleInlinePointCharge = useCallback(async () => {
        if (!user || !user.email || !paymentInfo.paypayAccount || pointChargeAmount <= 0) {
            setInlineChargeError('チャージ金額または決済情報が正しくありません。');
            return;
        }

        if (pointChargeAmount > userBalances.paypay) {
            setInlineChargeError('PayPay残高が不足しています。');
            return;
        }

        setIsInlineCharging(true);
        setInlineChargeError(null);

        try {
            await virtualPaymentsApi.topUpPointsWithPayPay(user.email, pointChargeAmount);
            await fetchUserBalancesAndInfo();
            console.log(`${pointChargeAmount}円分のポイントがPayPayでチャージされました。`);
            setPointChargeAmount(1000);
        } catch (err) {
            console.error("ポイントチャージ失敗:", err);
            setInlineChargeError(err.response?.data?.error || 'ポイントチャージ中にエラーが発生しました。');
        } finally {
            setIsInlineCharging(false);
        }
    }, [user, paymentInfo.paypayAccount, pointChargeAmount, userBalances.paypay, fetchUserBalancesAndInfo]);


    // 住所選択変更ハンドラ
    const handleAddressSelect = useCallback((e) => {
        const selectedId = e.target.value;
        setSelectedAddressId(selectedId);
        const selectedAddr = availableAddresses.find(addr => String(addr.id) === selectedId);
        if (selectedAddr) {
            setFormData(prev => ({
                ...prev,
                postalCode: selectedAddr.postalCode || '',
                state: selectedAddr.state || '',
                city: selectedAddr.city || '',
                street: selectedAddr.street || '',
            }));
        }
    }, [availableAddresses, setSelectedAddressId]);

    // 注文送信ハンドラ
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsOrdering(true);
        setSubmitError(null);

        if (!isLoggedIn || !user) {
            setSubmitError('ログインしていません。');
            setIsOrdering(false);
            return;
        }

        const requiredFields = ['lastName', 'firstName', 'phone', 'email', 'deliveryDate', 'deliveryTime', 'paymentMethod'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            setSubmitError('必須項目をすべて入力してください。');
            setIsOrdering(false);
            return;
        }

        if (!selectedAddressId) {
            const addressFields = ['postalCode', 'state', 'city', 'street'];
            const missingAddressFields = addressFields.filter(field => !formData[field]);
            if (missingAddressFields.length > 0) {
                setSubmitError('配送先情報をすべて入力してください。');
                setIsOrdering(false);
                return;
            }
        }

        const virtualPaymentMethods = ['point', 'paypay', 'virtual_credit_card'];
        const isVirtualPayment = virtualPaymentMethods.includes(formData.paymentMethod);

        if (!isVirtualPayment) {
            setSubmitError('選択された支払い方法がサポートされていません。');
            setIsOrdering(false);
            return;
        }

        const balanceKey = formData.paymentMethod === 'virtual_credit_card' ? 'virtualCreditCard' : formData.paymentMethod;
        const currentBalance = userBalances[balanceKey];

        if (currentBalance === undefined || currentBalance < totalAmount) {
            setSubmitError('選択された支払い方法の残高が不足しています。');
            setIsOrdering(false);
            return;
        }

        try {
            const orderPayload = {
                paymentMethod: formData.paymentMethod,
                billingAddressId: selectedAddressId,
                shippingAddressId: selectedAddressId,
            };

            const orderResponse = await orderApi.createOrderFromCart(
                orderPayload.paymentMethod,
                orderPayload.billingAddressId,
                orderPayload.shippingAddressId
            );

            const orderId = orderResponse.id;

            await fetchUserBalancesAndInfo();
            const purchasedItemIds = cartItems.map(item => item.id);
            await removePurchasedItems(purchasedItemIds);

            console.log('ご注文が完了しました！');

            const orderDetails = {
                cartItems: cartItems,
                totalAmount: totalAmount,
                paymentMethod: formData.paymentMethod,
                address: {
                    postalCode: formData.postalCode,
                    state: formData.state,
                    city: formData.city,
                    street: formData.street,
                },
                deliveryDate: formData.deliveryDate,
            };

            navigate('/order-success', { state: { orderId, orderDetails } });
        } catch (err) {
            console.error('注文処理に失敗しました:', err);
            setSubmitError(err.response?.data?.error || '注文処理中にエラーが発生しました。もう一度お試しください。');
        } finally {
            setIsOrdering(false);
        }
    }, [formData, userBalances, totalAmount, navigate, isLoggedIn, user, fetchUserBalancesAndInfo, removePurchasedItems, cartItems, selectedAddressId]);

    const handleNextStep = useCallback(() => {
        setSubmitError(null);

        if (currentStep === 1) {
            const customerFields = ['lastName', 'firstName', 'phone', 'email'];
            const missingCustomerFields = customerFields.filter(field => !formData[field]);

            if (!selectedAddressId) {
                const addressFields = ['postalCode', 'state', 'city', 'street'];
                const missingAddressFields = addressFields.filter(field => !formData[field]);
                if (missingAddressFields.length > 0) {
                    setSubmitError('配送先情報をすべて入力してください。');
                    return;
                }
            }

            if (missingCustomerFields.length > 0) {
                setSubmitError('お客様情報をすべて入力してください。');
                return;
            }
        }
        else if (currentStep === 2) {
            if (!formData.deliveryDate || !formData.deliveryTime) {
                 setSubmitError('配送オプションを選択してください。');
                 return;
            }
            if (!formData.paymentMethod) {
                setSubmitError('支払い方法を選択してください。');
                return;
            }

            if (formData.paymentMethod === 'virtual_credit_card') {
                const { cardNumber, cardExpiry, cardCvv } = cardData;

                const cardNumberCleaned = cardNumber.replace(/\s/g, '');
                const cardNumberRegex = /^\d{16}$/;
                if (!cardNumberCleaned || !cardNumberRegex.test(cardNumberCleaned)) {
                    setSubmitError('有効なクレジットカード番号を入力してください。（16桁の数字）');
                    return;
                }

                const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                if (!cardExpiry || !expiryRegex.test(cardExpiry)) {
                    setSubmitError('有効な有効期限(MM/YY)を入力してください。');
                    return;
                }
                const [month, year] = cardExpiry.split('/').map(Number);
                const currentYear = new Date().getFullYear() % 100;
                const currentMonth = new Date().getMonth() + 1;
                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    setSubmitError('有効期限が切れています。');
                    return;
                }

                const cvvRegex = /^\d{3,4}$/;
                if (!cardCvv || !cvvRegex.test(cardCvv)) {
                    setSubmitError('有効なCVVを入力してください。（3または4桁の数字）');
                    return;
                }
            }

            const balanceKey = formData.paymentMethod === 'virtual_credit_card' ? 'virtualCreditCard' : formData.paymentMethod;
            const currentBalance = userBalances[balanceKey];

            if (currentBalance === undefined || currentBalance < totalAmount) {
                setSubmitError('選択された支払い方法の残高が不足しています。');
                return;
            }
        }

        setCurrentStep(prev => prev + 1);
    }, [formData, userBalances, totalAmount, currentStep, cardData, selectedAddressId]);

    const handlePrevStep = useCallback(() => {
        setCurrentStep(prev => prev - 1);
        setSubmitError(null);
    }, []);

    const displayError = fetchError || submitError || inlineChargeError;
    const isPageLoading = isLoading || authLoading || !addressStatusChecked || (isLoggedIn && Object.keys(userBalances).length === 0);

    if (!isLoggedIn) {
        return (
             <div className="container mx-auto px-4 py-8 max-w-6xl text-center text-gray-700">
                <p>このページにアクセスするにはログインが必要です。</p>
                 <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                     ログインページへ
                 </button>
            </div>
        );
    }

    if (isPageLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl text-center text-gray-700">
                <div className="text-center py-10">データを読み込み中...</div>
            </div>
        );
    }

    if (!isLoading && cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl text-center text-gray-700">
                <p>カートに商品がありません。</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    商品を探しに行く
                </button>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">ご注文内容の確認</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">
                            ステップ {currentStep} / 3: {
                                currentStep === 1 ? 'お客様情報と配送先' :
                                currentStep === 2 ? '配送オプションと支払い方法' :
                                'ご注文内容の最終確認'
                            }
                        </h2>
                        <div className="flex gap-2">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                >
                                    戻る
                                </button>
                            )}
                            {currentStep < 3 && (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    次へ
                                </button>
                            )}
                        </div>
                    </div>

                    {displayError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{displayError}</span>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <>
                            <CheckoutCustomerInfo formData={formData} handleChange={handleChange} />
                            <CheckoutAddressSelection
                                availableAddresses={availableAddresses}
                                selectedAddressId={selectedAddressId}
                                handleAddressSelect={handleAddressSelect}
                                formData={formData}
                            />
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <CheckoutDeliveryOptions
                                formData={formData}
                                handleChange={handleChange}
                                deliveryDates={deliveryDates}
                                DELIVERY_TIME_SLOTS={DELIVERY_TIME_SLOTS}
                            />
                            <CheckoutPaymentMethods
                                formData={formData}
                                handleChange={handleChange}
                                userBalances={userBalances}
                                totalAmount={totalAmount}
                                cardData={cardData}
                                handleCardChange={handleCardChange}
                                paymentInfo={paymentInfo}
                                handleInlinePointCharge={handleInlinePointCharge}
                                pointChargeAmount={pointChargeAmount}
                                setPointChargeAmount={setPointChargeAmount}
                                isInlineCharging={isInlineCharging}
                                inlineChargeError={inlineChargeError}
                            />
                        </>
                    )}

                    {currentStep === 3 && (
                        <form onSubmit={handleSubmit}>
                            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">お客様情報</h2>
                                <p className="mb-2"><span className="font-medium">お名前:</span> {formData.lastName} {formData.firstName}{formData.lastNameKana && ` (${formData.lastNameKana} ${formData.firstNameKana})`}</p>
                                <p className="mb-2"><span className="font-medium">電話番号:</span> {formData.phone}</p>
                                <p className="mb-2"><span className="font-medium">メールアドレス:</span> {formData.email}</p>
                            </section>

                            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">お届け先情報</h2>
                                <p className="mb-2"><span className="font-medium">郵便番号:</span> {formData.postalCode}</p>
                                <p className="mb-2"><span className="font-medium">住所:</span> {formData.state} {formData.city} {formData.street}</p>
                            </section>

                            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">配送オプション</h2>
                                <p className="mb-2"><span className="font-medium">お届け日:</span> {deliveryDates.find(d => d.value === formData.deliveryDate)?.label || '指定なし'}</p>
                                <p className="mb-2"><span className="font-medium">お届け時間帯:</span> {DELIVERY_TIME_SLOTS.find(t => t.value === formData.deliveryTime)?.label || '指定なし'}</p>
                            </section>

                            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">お支払い方法</h2>
                                <p className="mb-2"><span className="font-medium">方法:</span> {
                                    formData.paymentMethod === 'point' ? 'ポイント' :
                                    formData.paymentMethod === 'paypay' ? 'PayPayで支払い' :
                                    formData.paymentMethod === 'virtual_credit_card' ? 'クレジットカード' : ''
                                }</p>
                                {formData.paymentMethod === 'virtual_credit_card' && (
                                    <p className="text-sm text-gray-600">※カード情報は表示されません。</p>
                                )}
                            </section>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                disabled={isOrdering || cartItems.length === 0}
                            >
                                {isOrdering ? '注文処理中...' : '注文を確定する'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="lg:w-1/3">
                    <CheckoutOrderSummary
                        cartItems={cartItems}
                        calculatedSubtotal={calculatedSubtotal}
                        shippingFee={shippingFee}
                        tax={tax}
                        totalAmount={totalAmount}
                    />
                </div>
            </div>
        </div>
    );
}