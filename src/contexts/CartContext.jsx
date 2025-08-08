import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import cartApi from '../api/cart';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItemCount, setCartItemCount] = useState(0);
    const { isLoggedIn } = useContext(AuthContext);

    const fetchCartCount = useCallback(async () => {
        try {
            const count = await cartApi.getCartItemCount();
            setCartItemCount(count);
        } catch (error) {
            console.error('カートの数の取得に失敗しました:', error);
            setCartItemCount(0);
        }
    }, []);

    useEffect(() => {
        fetchCartCount();
    }, [isLoggedIn, fetchCartCount]);

    return (
        <CartContext.Provider value={{ cartItemCount,setCartItemCount, fetchCartCount }}>
            {children}
        </CartContext.Provider>
    );
};