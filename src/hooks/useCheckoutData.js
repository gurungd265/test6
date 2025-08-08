import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import cartApi from '../api/cart';
import userApi from '../api/user';
import { useAuth } from '../contexts/AuthContext';

const useCheckoutData = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    // CheckoutPageから取得するステート
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [availableAddresses, setAvailableAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [isLoading, setIsLoading] = useState(true); // 初期ローディング状態
    const [error, setError] = useState(null); // データローディングエラー
    const [addressStatusChecked, setAddressStatusChecked] = useState(false);

    // 初期チェックアウトデータ（カート、ユーザープロフィール、住所）を取得するロジック
    // setFormDataCallbackを引数に受け取り、CheckoutPageのformDataを更新できるようにする
    const fetchInitialCheckoutData = useCallback(async (setFormDataCallback) => {
        setError(null);
        setIsLoading(true);
        setAddressStatusChecked(false);

        try {
            let fetchedCartItems = [];
            let fetchedSubtotal = 0;
            // location.stateを介してカート情報が渡された場合はそれを使用し、そうでない場合はAPIを呼び出す
            if (location.state?.cartItems && location.state?.subtotal !== undefined) {
                fetchedCartItems = location.state.cartItems;
                fetchedSubtotal = location.state.subtotal;
            } else {
                const cartData = await cartApi.getCartItems();
                fetchedCartItems = cartData.items || [];
                fetchedSubtotal = cartData.subtotal || 0;
            }
            setCartItems(fetchedCartItems);
            setSubtotal(fetchedSubtotal);

            // カートが空の場合は早期リターンし、追加のAPI呼び出しを防ぐ
            if (fetchedCartItems.length === 0) {
                setIsLoading(false);
                setAddressStatusChecked(true); // カートが空なので住所ステータスは「確認済み」とみなす
                return;
            }

            // ログイン状態の場合のみユーザー情報と住所を読み込む
            if (isLoggedIn) {
                const profileData = await userApi.getUserProfile();
                const addressesData = await userApi.getUserAddresses();
                setAvailableAddresses(addressesData);

                // setFormDataCallbackを介してCheckoutPageのformDataを更新
                setFormDataCallback(prev => ({
                    ...prev,
                    lastName: profileData.lastName || '',
                    firstName: profileData.firstName || '',
                    email: profileData.email || '',
                    phone: profileData.phoneNumber || '',
                }));

                // 登録済み住所がある場合、デフォルト住所または最初の住所でformDataを初期設定
                if (addressesData.length > 0) {
                    const defaultAddr = addressesData.find(addr => addr.isDefault) || addressesData[0];
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr.id);
                        setFormDataCallback(prev => ({
                            ...prev,
                            postalCode: defaultAddr.postalCode || '',
                            state: defaultAddr.state || '',
                            city: defaultAddr.city || 'f',
                            street: defaultAddr.street || '',
                        }));
                    }
                } else {
                    // 住所がない場合、住所関連のformDataをクリアする（リダイレクトされる予定）
                    setFormDataCallback(prev => ({
                        ...prev,
                        postalCode: '', state: '', city: '', street: ''
                    }));
                }
            }
        } catch (err) {
            console.error('チェックアウト情報ロード失敗:', err);
            setError('注文情報の読み込みに失敗しました。');
        } finally {
            setIsLoading(false);
            setAddressStatusChecked(true);
        }
    }, [location.state, isLoggedIn, navigate]); // useCallbackの依存関係にnavigateを追加

    const removePurchasedItems = useCallback(async (itemIds)=>{
        try{
            await cartApi.removeItemsFromCart(itemIds);
            setCartItems(prevItems => prevItems.filter(item =>!itemIds.includes(item.id)));

            setSubtotal(prevSubtotal=> {
                const removeItemsTotal = cartItems
                    .filter(item => itemIds.includes(item.id))
                    .reduce((sum,item) => sum + (item.priceAtAddition * item.quantity), 0);
                return prevSubtotal - removeItemsTotal;
            });

            console.log('購入商品がカートから正常に削除されました。');
        }catch(err){
            console.error('カートアイテム削除失敗:', err);
            setError('購入商品削除中にエラーが発生しました。');
        }
    },[cartItems]);

    // 住所の有無に応じたリダイレクトロジック（このフック内で処理）
    useEffect(() => {
        // データロード完了、カートが空でない、住所ステータス確認済みの場合にリダイレクト条件を確認
        if (!isLoading && cartItems.length > 0 && addressStatusChecked) {
            if (availableAddresses.length === 0) {
                alert('ご注文には登録済みの住所が必要です。マイプロフィールで住所を登録してください。');
                navigate('/profile', { state: { fromCheckout: true } });
            }
        }
    }, [isLoading, cartItems, availableAddresses, addressStatusChecked, navigate]);

    return {
        cartItems,
        subtotal,
        availableAddresses,
        selectedAddressId,
        setSelectedAddressId,
        isLoading, // 初期データローディング状態
        error, // データロード中に発生したエラー（fetchErrorとして使用される）
        addressStatusChecked,
        fetchInitialCheckoutData, // この関数をCheckoutPageから呼び出してformDataを更新
        removePurchasedItems,
    };
};

export default useCheckoutData;
