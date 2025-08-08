import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import productsApi from "../api/products";
import wishlistApi from "../api/wishlist";
import cartApi from "../api/cart";
import { useAuth } from "../contexts/AuthContext";
import { Heart } from "lucide-react";

export default function WishesPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (authLoading) return;
      if (!isLoggedIn) {
        setError("お気に入りを表示するにはログインしてください。");
        setLoading(false);
        return;
      }

      try {
        const wishlistItems = await wishlistApi.getWishlistItems();

        // 제품 상세정보 병렬 호출
        const detailedItems = await Promise.all(
          wishlistItems.map(async (item) => {
            try {
              const productDetail = await productsApi.getProductById(
                item.productId
              );
              console.log(
                "가격 정보:",
                productDetail.price,
                productDetail.discountPrice
              );
              return {
                ...item,
                price: productDetail.price,
                discountPrice: productDetail.discountPrice,
              };
            } catch (e) {
              return { ...item, price: null, discountPrice: null };
            }
          })
        );

        setWishes(detailedItems);
        setError(null);
      } catch (err) {
        console.error("お気に入りデータを読み込めませんでした。", err);
        setError("お気に入りデータを読み込めませんでした。");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [isLoggedIn, authLoading]);

  const handleRemove = (productIdToRemove) => {
    const removeWishlistItemAction = async () => {
      try {
        await wishlistApi.removeWishlistItemByProductId(productIdToRemove);
        setWishes(
          wishes.filter((item) => item.productId !== productIdToRemove)
        );
      } catch (err) {
        console.error(
          `お気に入りアイテムID ${productIdToRemove}の削除に失敗しました。`,
          err
        );
        alert("お気に入りからアイテムを削除できませんでした。");
      }
    };
    removeWishlistItemAction();
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await cartApi.addToCart(productId, quantity);
      alert("カートに追加しました！");
    } catch (error) {
      console.error("カートへの追加に失敗しました。", error);
      alert("カートへの追加に失敗しました。");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">お気に入り</h2>

      {loading ? (
          <div className="text-center py-10">読み込み中...</div>
      ) : error ? (
          <div className="text-red-600 text-center py-10">{error}</div>
      ) : wishes.length === 0 ? (
          <div className="text-gray-600 text-center py-10">
            お気に入りにアイテムがありません。
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {wishes.map((item) => {
              const hasDiscount = typeof item.discountPrice === "number";
              const displayPrice = hasDiscount ? item.discountPrice : item.price;

              return (
                  <div
                      key={item.id}
                      className="bg-white rounded overflow-hidden flex flex-col justify-between hover:shadow-lg duration-500 group relative"
                  >
                    {/* Remove from Wishes */}
                    <button
                        onClick={() => handleRemove(item.productId)}
                        className="absolute bg-white rounded-full top-2 right-2 z-10 w-9 h-9 flex items-center justify-center hover:scale-110 transition-transform" // 오타 수정: transition-trnsfrorm → transition-transform // 수정됨
                        title="お気に入りに追加"
                    >
                      <Heart
                          size={18}
                          className="stroke-2 text-purple-600 fill-purple-600"
                      />
                    </button>
                    {/* Product Image */}
                    <Link to={`/product/${item.productId}`} className="w-full">
                      <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-full h-56 object-cover rounded-lg group-hover:rounded-t-lg group-hover:rounded-b-none transition-all duration-300"
                      />
                    </Link>
                    <div className="p-4">
                      {/* Product Name */}
                      <h2 className="font-semibold text-lg truncate">
                        <Link to={`/product/${item.productId}`}>
                          {item.productName}
                        </Link>
                      </h2>
                      {/* Product Description */}
                      <p className="text-sm text-gray-500 truncate">
                        {item.productDetail}
                      </p>
                      <div className="mt-2 flex items-center justify-between"> {/* justify between → justify-between 수정 // 수정됨 */}
                        {/* Product Price */}
                        <div className="font-bold text-lg">
                          {/* 가격이 null이 아닐 때만 표시하도록 조건부 렌더링 // 수정됨 */}
                          {item.price !== null && (
                              <div className="line-through text-gray-500 text-base mr-2">
                                {item.price.toLocaleString()}円
                              </div>
                          )}
                          {displayPrice !== null && (
                              <div className="text-purple-600">
                                {displayPrice.toLocaleString()}円
                              </div>
                          )}
                        </div>
                      </div>
                      {/* Button of Adding To Cart */}
                      <button
                          onClick={() => handleAddToCart(item.productId)}
                          className="w-full bg-purple-600 text-white px-4 py-2 rounded mt-2 hover:bg-purple-700"
                      >
                        カートに入れる
                      </button>
                    </div>
                  </div>
              );
            })}
          </div>
      )}
    </div>
  );
}