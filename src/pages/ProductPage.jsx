import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import productsApi from '../api/products';
import cartApi from '../api/cart';
import wishlistApi from '../api/wishlist';
import { Heart, X } from "lucide-react";
import { CartContext } from '../contexts/CartContext';
import { useAuth } from "../contexts/AuthContext.jsx";
import ImageSlider from "../components/ImageSlider.jsx";

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const { fetchCartCount } = useContext(CartContext);
    const [wished, setWished] = useState(false);
    const { isLoggedIn, loading: authLoading } = useAuth();
    const productRating = product?.rating ?? 0;
    const productReviewCount = product?.reviewCount ?? 0;

    const [optionSets, setOptionSets] = useState([]);

    const [currentSelection, setCurrentSelection] = useState({
        options: {},
        quantity: 1
    });

    const groupedOptionValues = useMemo(() => {
        const grouped = {};
        product?.options?.forEach(option => {
            if (!grouped[option.optionName]) {
                grouped[option.optionName] = [];
            }
            // 중복된 optionValue가 없을 때만 추가
            if (!grouped[option.optionName].some(o => o.optionValue === option.optionValue)) {
                grouped[option.optionName].push({
                    productOptionId: option.id,  // 여기에 productOptionId 넣기
                    optionValue: option.optionValue
                });
            }
        });
        // console.log("groupedOptionValues:", grouped);
        return grouped;
    }, [product]);

    const [openedOptionGroups, setOpenedOptionGroups] = useState(() => {
        const groups = Object.keys(groupedOptionValues);
        const initialState = {};
        groups.forEach((group, idx) => {
            initialState[group] = idx === 0;
        });
        return initialState;
    });

    useEffect(() => {
        const groups = Object.keys(groupedOptionValues);
        const initialState = {};
        groups.forEach((group, idx) => {
            initialState[group] = idx === 0;
        });
        setOpenedOptionGroups(initialState);
    }, [groupedOptionValues])

    const handleOptionChange = (key, value) => {
        // 선택된 옵션에 대해 productOptionId 찾기
        const matchedOption = product.options.find(
            (opt) => opt.optionName === key && opt.optionValue === value
        );
        console.log("handleOptionChange - key, value:", key, value);
        console.log("handleOptionChange - matchedOption:", matchedOption);
        if (!matchedOption) {
            alert("選択されたオプションは無効です。");
            return;
        }
        const newOptions = {
            ...currentSelection.options,
            [key]: {
                productOptionId: matchedOption.id,
                optionName: key,
                optionValue: value
            }
        };
        const groups = Object.keys(groupedOptionValues);
        const allSelected = groups.every(optionKey => newOptions[optionKey]);
        if (allSelected) {
            // 중복 체크
            const isDuplicate = optionSets.some(set =>
                groups.every(k => set.options[k].productOptionId === newOptions[k].productOptionId)
            );
            if (isDuplicate) {
                alert("既に選択されたオプションです。");
                return;  // 상태 변경 없이 함수 종료
            }
            // 중복이 아니면 새 옵션 세트 추가
            setOptionSets(prevSets => [...prevSets, { options: newOptions, quantity: 1 }]);
            setCurrentSelection({ options: {}, quantity: 1 });
            // 다음 그룹 오픈 초기화
            const resetOpened = {};
            groups.forEach((group, idx) => {
                resetOpened[group] = idx === 0;
            });
            setOpenedOptionGroups(resetOpened);
            return;
        }

        // 아직 모든 옵션 선택 안됐으면 단순히 currentSelection만 갱신
        setCurrentSelection(prev => ({
            ...prev,
            options: newOptions
        }));

        // 다음 옵션 그룹 오픈 (옵션 선택에 따라)
        const currentIndex = groups.indexOf(key);
        if (currentIndex !== -1 && currentIndex + 1 < groups.length) {
            const nextGroup = groups[currentIndex + 1];
            setOpenedOptionGroups(prevOpened => ({
                ...prevOpened,
                [nextGroup]: true
            }));
        }
    };

    const handleDecreaseQuantity = (index) => {
        setOptionSets(prev => {
            const updated = [...prev];
            const currentQty = updated[index].quantity;
            if (currentQty > 1) {
                updated[index] = {
                    ...updated[index],
                    quantity: currentQty - 1
                };
            }
            return updated;
        });
    };

    const handleIncreaseQuantity = (index) => {
        setOptionSets(prev => {
            const updated = [...prev];
            const currentQty = updated[index].quantity;
            if (currentQty < product.stockQuantity) {
                updated[index] = {
                    ...updated[index],
                    quantity: currentQty + 1
                };
            }
            return updated;
        });
    };

    const handleRemoveOptionSet = (index) => {
        setOptionSets(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddToCart = async () => {
        // 옵션을 반드시 요구하는 상품인지 확인
        if (product.requiresOptions) {  // 상품이 옵션을 요구한다면
            // 메인 페이지에서 옵션 세트가 비어 있으면 알림을 띄우고 리턴
            if (optionSets.length === 0 || optionSets.some(set => !set.options || Object.keys(set.options).length === 0)) {
                alert('オプションを選択してください。');
                return;
            }
        }

        try {
            // 옵션이 선택되었으면 상품을 카트에 추가
            for (const set of optionSets) {
                let optionsToSend = set.options && Object.keys(set.options).length > 0
                    ? Object.values(set.options).map(opt => ({
                        productOptionId: opt.productOptionId,
                        optionName: opt.optionName,
                        optionValue: opt.optionValue
                    }))
                    : null; // 옵션이 없으면 null로 처리

                // 상품 ID와 수량, 옵션들을 콘솔에 출력해서 확인
                console.log("Adding to cart:", {
                    productId: product.id,
                    quantity: set.quantity,
                    options: optionsToSend
                });

                // 카트에 상품 추가
                await cartApi.addToCart(
                    product.id,
                    set.quantity,
                    optionsToSend
                );
            }

            // 성공적인 추가 후 처리
            alert('カートに追加されました！');
            setOptionSets([]);  // 옵션 세트 리셋
            setCurrentSelection({ options: {}, quantity: 1 });  // 현재 선택 리셋
            fetchCartCount();  // 카트 수량 갱신 (한 번만 호출)

            // 옵션 그룹 초기화
            const groups = Object.keys(groupedOptionValues);
            const resetOpened = {};
            groups.forEach((group, idx) => {
                resetOpened[group] = idx === 0;
            });
            setOpenedOptionGroups(resetOpened);  // 옵션 그룹 초기화
        } catch (err) {
            console.error(err);
            alert('カートに追加できませんでした。');
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productsApi.getProductById(parseInt(id));
                // console.log("Product data fetched:", data);
                // console.log("Product options:", data.options);
                setProduct(data);
                if (data.images && data.images.length > 0) {
                    setMainImage(data.images[0].imageUrl);
                }
            } catch (err) {
                setError('商品情報を読み込むことができませんでした。');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        const checkWishStatus = async () => {
            if (authLoading || !isLoggedIn) {
                setWished(false);
                return;
            }
            try {
                const wishlistItems = await wishlistApi.getWishlistItems();
                const isProductWished = wishlistItems.some(item => item.productId === parseInt(id));
                setWished(isProductWished);
            } catch (err) {
                console.error("お気に入りリストの状態を確認できませんでした。", err);
            }
        };
        checkWishStatus();
    }, [id, isLoggedIn, authLoading]);

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert("お気に入りリスト操作にはログインが必要です。");
            return;
        }
        const previousWished = wished;
        setWished(!previousWished); // optimistic update
        try {
            if (!previousWished) {
                // 추가 요청
                await wishlistApi.addWishlistItem(parseInt(id));
                console.log(`${product.name}をお気に入りリストに追加しました。`);
            } else {
                // 제거 요청
                await wishlistApi.removeWishlistItemByProductId(parseInt(id));
                console.log(`${product.name}をお気に入りリストから削除しました。`);
            }
        } catch (err) {
            console.error("お気に入りリスト操作に失敗しました。", err);
            setWished(previousWished); // 롤백
            const message = err.response?.data || "不明なエラーが発生しました。";
            alert(`お気に入りリスト操作中にエラーが発生しました: ${message}`);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-700">商品情報を読み込み中...</div>
        );
    }
    if (error) {
        return (
            <div className="p-6 text-center text-red-600">{error}</div>
        );
    }
    if (!product) {
        return (
            <div className="p-6 text-center text-gray-500">商品情報がありません。</div>
        );
    }

    //表示される価格計算(割引価格があれば割引価格、なければ原価)
    const displayPrice = product.discountPrice !== null && product.discountPrice !== undefined
        ? product.discountPrice
        : product.price;

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-4">
                <Link to={`/`}>
                    <span className="hover:underline cursor-pointer">ホーム</span> /{" "}
                </Link>
                {/* Category back end data in category_id, name another API or Join*/}
                <Link to={`/products`}>
                    <span className="hover:underline cursor-pointer">カテゴリー</span> /{" "}
                </Link>
                <span className="text-gray-700 font-semibold">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image Section (2/3) */}
                <div className="lg:col-span-2">
                    <div className="relative">
                        {/* Add To Wishlist Button */}
                        <button
                            onClick={handleWishlist}
                            className="absolute bg-white rounded-full top-2 right-2 z-10 w-9 h-9 flex items-center justify-center hover:scale-110 transition-transform"
                            title="お気に入りに追加"
                        >
                            <Heart
                                size={18}
                                className={`stroke-2 ${wished ? "text-purple-600 fill-purple-600" : "text-gray-400"}`}
                            />
                        </button>
                        {/* Image Slider */}
                        <ImageSlider
                            images={product?.images || []}
                            productName={product?.name || "Product"}
                        />

                        {/* Main Image */}
                        {/* <img
                            src={mainImage || 'https://via.placeholder.com/600/CCCCCC/FFFFFF?text=No+Image'}
                            alt={product.name}
                            className="w-full h-[420px] object-cover rounded-lg shadow"
                        /> */}
                    </div>
                    {/* Mini Thumbnails */}
                    <div className="flex gap-2 mt-2">
                        {product.images && product.images.slice(0, 5).map((img, i) => (
                            <img
                                key={i}
                                src={img.imageUrl}
                                alt={`サムネイル ${i + 1}`} // 'Thumbnail' -> 'サムネイル'
                                className={`w-20 h-20 object-cover rounded border ${mainImage === img.imageUrl ? 'border-purple-600 ring-2 ring-purple-600' : 'border-gray-300'} cursor-pointer`}
                                onClick={() =>  setMainImage(img.imageUrl)}
                            />
                        ))}
                        {(!product.images || product.images.length === 0) && (
                            <img
                                src="https://via.placeholder.com/80/CCCCCC/FFFFFF?text=No+Image"
                                alt="No Thumbnail"
                                className="w-20 h-20 object-cover rounded border"
                            />
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="mt-6">
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                    </div>
                </div>

                {/* Info Section (1/3) */}
                <div className="border rounded-lg shadow p-6 space-y-4">
                    {/* Rating & Reviews (another Options table need. now hardcoding) */}
                    <div>
                        <div className="text-yellow-500 font-bold text-lg">
                            {/* product.rating '評価なし' */}
                            ⭐ {product.rating ? product.rating.toFixed(1) : '評価なし'}
                        </div>
                        <div className="text-sm text-gray-600">
                            {product.reviewCount ? `${product.reviewCount} レビュー` : 'レビューなし'} • 100件以上注文されました {/* 일본어 변경 */}
                        </div>
                    </div>

                    {/* Price */}
                    {product.discountPrice !== null && product.discountPrice !== undefined && (
                        <div className="text-xl text-gray-500 line-through mb-1">
                            {/* 割引前の価格 */}
                            {product.price.toLocaleString()}円
                        </div>
                    )}
                    <div className="text-4xl font-bold text-purple-700 mb-2">
                        {/* displayPrice */}
                        {displayPrice.toLocaleString()}円
                    </div>
                    <div className="text-2xl text-gray-500">
                        {Math.floor(displayPrice / 24).toLocaleString()}円/月 24回払い
                    </div>
                    {/* Options */}
                    {Object.entries(groupedOptionValues).map(([optionName, values]) => (
                        <div key={optionName} className="mb-4 border rounded p-4">
                            <button
                                type="button"
                                onClick={() =>
                                    setOpenedOptionGroups(prev => ({
                                        ...prev,
                                        [optionName]: !prev[optionName],
                                    }))
                                }
                                className="w-full text-left font-medium text-lg flex justify-between items-center"
                            >
                                {optionName}
                            </button>
                            {openedOptionGroups[optionName] && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {values.map(({ productOptionId, optionValue }, idx) => {
                                        // console.log(`Rendering option button key: ${productOptionId}, value: ${optionValue}`);
                                        return (
                                            <button
                                                key={productOptionId ?? `fallback-${optionValue}-${idx}`}
                                                onClick={() => handleOptionChange(optionName, optionValue)}
                                                className={`px-3 py-1 border rounded ${
                                                    currentSelection.options[optionName]?.optionValue === optionValue
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {optionValue}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                    {/* Added Option Sets */}
                    <div className="mt-6">
                        {optionSets.map((set, index) => (
                            <div
                                key={index}
                                className="p-3 mb-2 rounded flex justify-between items-center"
                            >
                                <div className="text-gray-500">
                                    {Object.entries(set.options).map(([key, option]) => (
                                        <div key={key} className="mb-1">{option.optionValue}</div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-0.25">
                                        <button
                                            onClick={() => handleDecreaseQuantity(index)}
                                            className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                                            aria-label="수량 감소"
                                        >
                                            -
                                        </button>
                                        <span className="w-10 text-center text-gray-700">{set.quantity}</span>
                                        <button
                                            onClick={() => handleIncreaseQuantity(index)}
                                            className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                                            aria-label="수량 증가"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveOptionSet(index)}
                                        className="ml-4 text-gray-500 font-bold"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                            disabled={product.stockQuantity <= 0}
                        >
                            カートに追加
                        </button>
                    </div>
                </div>
            </div>

            {/* Description Section */}
            <div className="mt-10">
                <h2 className="text-xl font-bold mb-2">商品の説明</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                    {product.description}
                </p>
            </div>
        </div>
    );
}