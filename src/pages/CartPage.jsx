import { useState,useEffect,useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartApi from '../api/cart';
import {CartContext} from '../contexts/CartContext';


export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  const [ selectedItems, setSelectedItems] = useState(new Set());

  const { cartItemCount, setCartItemCount, fetchCartCount } = useContext(CartContext);

  const navigate = useNavigate();

    useEffect(() => {
      const fetchCart = async () => {
          try {
              setLoading(true);
              setError(null);

              const cartData = await cartApi.getCartItems();

              const normalizedItems = cartData.items.map(item => {
                  const basePrice = item.priceAtAddition != null
                      ? Number(item.priceAtAddition)
                      : Number(item.productPrice || 0);

                  return {
                      ...item,
                      price: item.productPrice ? Number(item.productPrice) : 0,
                      discountPrice: basePrice,
                      totalPrice: basePrice * item.quantity,
                      options: Array.isArray(item.options)
                          ? item.options.map(option => ({
                              ...option,
                              optionName: option.optionName || '',
                              optionValue: option.optionValue || '',
                              optionId: option.optionId || `${option.optionName}-${option.optionValue}`,
                          }))
                          : [],
                  };
              });

              setCart({ ...cartData, items: normalizedItems });
              console.log('normalizedItems', normalizedItems);

              // 초기엔 전체 선택 해제 상태
              setSelectedItems(new Set());
          } catch (err) {
              console.error('カートデータを読み込むことができませんでした。', err);
              setError('カートデータを読み込むことができませんでした。');
          } finally {
              setLoading(false);
          }
      };
      fetchCart();
      }, []);

  if (loading) return <div className="p-6 text-center text-gray-700">カート情報を読み込み中...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!cart || !cart.items) return <div className="p-6 text-center text-gray-500">カート情報がありません。</div>;

    const handleRemove = (id) => {
        const previousCartItemCount = cartItemCount;
        setCartItemCount(prevCount => Math.max(0, prevCount - selectedItems.size));

        const removeCartItem = async (cartItemId) => {
            try {
                await cartApi.removeCartItem(cartItemId);

                // 삭제 성공 시 cart.items에서 제거 후 상태 갱신
                setCart(prevCart => ({
                    ...prevCart,
                    items: prevCart.items.filter(item => item.id !== cartItemId),
                }));

                fetchCartCount();
            } catch (err) {
                console.error('カートアイテム削除失敗:', err);
                setCartItemCount(previousCartItemCount);
                alert('カートアイテムを削除できませんでした。');
            }
        };

        removeCartItem(id);
    };


  const handleQuantityChange = (cartItemId, currentQuantity, delta) => {
      const newQuantity = Math.max(1, currentQuantity + delta);
      const updateQuantity = async () => {
          try {
              const updatedItem = await cartApi.updateCartItemQuantity(cartItemId, newQuantity);
              setCart(prevCart => ({
                  ...prevCart,
                  items: prevCart.items.map(item =>
                      item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                  )
              }))
          } catch (err) {
              console.error('数量変更失敗:', err);
              alert('数量を変更できませんでした。');
          }
      };
      updateQuantity();
  };

    // 전체 상품 총합
    const total = cart.items.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);

    // 전체 상품 주문 버튼
    const handleCheckout = () => {
        const subtotal = cart.items.reduce(
            (sum, item) => sum + item.discountPrice * item.quantity, 0
        );
        navigate('/checkout', {
            state: {
                cartItems: cart.items,
                subtotal,
            },
        });
    };

    // 선택된 상품만 주문 버튼
    const handleSelectedCheckout = () => {
        const itemsToCheckout = cart.items.filter(item => selectedItems.has(item.id));
        if (itemsToCheckout.length === 0) {
            alert('注文する商品を選択してください。');
            return;
        }
        const subtotal = itemsToCheckout.reduce(
            (sum, item) => sum + item.priceAtAddition * item.quantity, 0
        );
        navigate('/checkout', {
            state: {
                cartItems: itemsToCheckout,
                subtotal,
            },
        });
    };

    // 전체 선택 및 해제 기능
    const toggleSelectAll = () => {
        if (selectedItems.size === cart.items.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cart.items.map(item => item.id)));
        }
    };

    const handleClearCart = async () => {
        if (selectedItems.size === 0) {
            alert('削除する商品を選択してください。');
            return;
        }

        if (!window.confirm('選択した商品を本当に削除しますか？')) {
            return;
        }

        try {
            const idsToRemove = Array.from(selectedItems);
            await Promise.all(idsToRemove.map(id => cartApi.removeCartItem(id)));

            setCart(prevCart => ({
                ...prevCart,
                items: prevCart.items.filter(item => !selectedItems.has(item.id)),
            }));

            setSelectedItems(new Set());
            fetchCartCount();
        } catch (err) {
            console.error('選択商品削除失敗:', err);
            alert('選択した商品を削除できませんでした。');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">ショッピングカート</h1>

            {cart.items.length === 0 ? (
                <div className="text-gray-600 text-center py-10">
                    カートは空です。
                </div>
            ) : (
                <>
                    {/* 전체 선택 및 해제, 선택한 상품 삭제 */}
                    <div className="mb-4 flex justify-between items-center">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={selectedItems.size === cart.items.length}
                                onChange={toggleSelectAll}
                            />
                            <span className="ml-2 text-sm font-normal text-gray-500 underline decoration-solid decoration-gray-500 tracking-wide">
                                すべて選択
                            </span>
                        </label>
                        <button
                            className="ml-auto text-sm font-normal text-red-700 underline decoration-solid decoration-red-700 hover:opacity-80 focus:outline-none"
                            onClick={handleClearCart}
                        >
                            選択した商品を削除
                        </button>
                    </div>

                    {/* Product List */}
                    <div className="space-y-4">
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between bg-white rounded shadow p-4"
                            >
                                <div className="flex items-center gap-4">
                                    {/* 체크박스 */}
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => {
                                            setSelectedItems(prev => {
                                                const newSet = new Set(prev);
                                                if (newSet.has(item.id)) {
                                                    newSet.delete(item.id);
                                                } else {
                                                    newSet.add(item.id);
                                                }
                                                return newSet;
                                            });
                                        }}
                                        className="form-checkbox"
                                    />
                                    <Link to={`/product/${item.productId}`}>
                                        <img
                                            src={item.productImageUrl}
                                            alt={item.productName}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    </Link>
                                    <div>
                                        <Link to={`/product/${item.productId}`}>
                                            <h2 className="font-semibold">{item.productName}</h2>
                                            <p className="text-gray-500">
                                                {(() => {
                                                    const displayPrice = item.discountPrice !== null && item.discountPrice !== undefined
                                                        ? item.discountPrice
                                                        : item.price;

                                                    if (item.discountPrice !== null && item.discountPrice !== undefined && item.discountPrice < item.price) {
                                                        return (
                                                            <>
                                                                <span className="line-through text-gray-400">{item.price.toLocaleString()}円</span>
                                                                <span className="text-purple-700 ml-2">{displayPrice.toLocaleString()}円</span>
                                                            </>
                                                        );
                                                    } else {
                                                        return <span>{item.price.toLocaleString()}円</span>;
                                                    }
                                                })()}
                                            </p>
                                        </Link>
                                        <div className="mt-2">
                                            {item.options && item.options.length > 0 && item.options.map((char, index) => (
                                                <p key={index} className="text-sm text-gray-600">
                                                    <strong>{char.optionName}:</strong> {char.optionValue}
                                                </p>
                                            ))}
                                        </div>
                                        {/*Quantity Controls*/}
                                        <div className="mt-2 flex items-center gap-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                className="h-10 w-10 px-2 py-1 border rounded"
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                className="h-10 w-10 px-2 py-1 border rounded"
                                            >
                                                ＋
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">
                                        {(item.discountPrice * item.quantity).toLocaleString()}円
                                    </p>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="text-red-700 underline decoration-solid decoration-red-700 text-sm mt-2"
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-8 bg-white rounded shadow p-4 text-right">
                        <h3 className="text-lg font-semibold mb-2">
                            Total: {total.toLocaleString()}円
                        </h3>

                        {/* 선택 상품 주문 버튼 */}
                        <button
                            className="bg-white border border-gray-400 text-gray-800 px-6 py-2 rounded hover:bg-gray-100"
                            onClick={handleSelectedCheckout}
                        >
                            選択商品を注文する
                        </button>

                        {/* 전체 상품 주문 버튼 */}
                        <button
                            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 ml-4"
                            onClick={handleCheckout}
                        >
                            全商品を注文する
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}