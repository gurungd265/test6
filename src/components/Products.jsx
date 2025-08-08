import React,{useState,useEffect} from "react";
import Product from "./Product";
import productsApi from "../api/products";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await productsApi.getAllProducts();
                setProducts(response.content);
            } catch (err) {
                console.error("商品リストの読み込みに失敗しました:", err);
                setError("商品リストを読み込むことができませんでした。サーバーの状態を確認してください。");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

      if (loading) {
        return (
          <main className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-100px)]">
            <p className="text-xl text-gray-700">商品リストを読み込み中...</p>
            {/* you want spinners? */}
          </main>
        );
      }

      if (error) {
        return (
          <main className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-100px)]">
            <p className="text-xl text-red-600">{error}</p>
          </main>
        );
      }

      if (products.length === 0) {
        return (
          <main className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-100px)]">
            <p className="text-xl text-gray-500">登録された商品がありません。</p>
          </main>
        );
      }

  return (
    <>
      {/* Products */}
       <main className="container mx-auto p-4">
           <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 gap-y-10">
                 {products.map((product) => (
                     // ProductコンポーネントにバックエンドAPIから受け取った商品データをpropsで伝達します */}
                    <Product key={product.id} product={product} />
                  ))}
            </section>
       </main>
    </>

  );
}
