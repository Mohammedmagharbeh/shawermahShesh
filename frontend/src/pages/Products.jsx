import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProductDialog } from "@/componenet/common/ProductDialog";
import product_placeholder from "../assets/product_placeholder.jpeg";
import { CATEGORIES } from "@/constants";
import { useUser } from "@/contexts/UserContext";
import Loading from "@/componenet/common/Loading";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Burgers");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { user } = useUser();

  const fetchProducts = () => {
    setIsLoading(true);
    fetch(
      `${import.meta.env.VITE_BASE_URL}/products?category=${selectedCategory}`,
      {
        headers: {
          authorization: `Bearer ${user.token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const allProducts = data.data || [];
        setProducts(allProducts);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);

        toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
        setIsLoading(false);
      });
  };

  useMemo(() => {
    fetchProducts();
  }, [selectedCategory]);

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 arabic-font" dir="rtl">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          {/* <input
            type="text"
            placeholder={t("search_your_favorite_dish")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          /> */}
        </div>
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat, i) => {
            const isAll = cat === "All";
            const catValue = isAll ? "all" : cat.en;
            const catLabel = isAll ? t("all") : cat[selectedLanguage];

            return (
              <button
                key={i}
                onClick={() => setSelectedCategory(catValue)}
                className={`whitespace-nowrap px-6 py-2 rounded-lg transition ${
                  selectedCategory === catValue
                    ? "bg-yellow-500 text-white" // تغيير من orange-400 إلى yellow-500
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                {catLabel}
              </button>
            );
          })}
        </div>

        {products.length > 0 ? (
          <>
            <div className="space-y-6">
              {products.map((product) => (
                <Card
                  key={product._id}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-md transition bg-white"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-row-reverse items-center gap-4 p-4">
                      {/* الصورة على اليسار */}
                      <div className="flex-shrink-0 w-32 h-32">
                        <img
                          src={product.image || product_placeholder}
                          alt={product.name[selectedLanguage]}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* المحتوى على اليمين */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold mb-1 text-gray-900">
                            {product.name[selectedLanguage]}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {product.description[selectedLanguage]}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div>
                            {product.discount > 0 &&
                            !product.hasProteinChoices &&
                            !product.hasTypeChoices ? (
                              <div className="flex items-center gap-2">
                                <p className="text-xl font-bold text-orange-500">
                                  JOD
                                  {product.discountedPrice
                                    ? product.discountedPrice.toFixed(2)
                                    : (
                                        product.basePrice -
                                        (product.basePrice * product.discount) /
                                          100
                                      ).toFixed(2)}
                                </p>
                                <p className="text-gray-400 line-through text-sm">
                                  {product.basePrice}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xl font-bold text-red-600">
                                {product.hasProteinChoices ||
                                product.hasTypeChoices
                                  ? "According To Your Choices"
                                  : `${product.basePrice} ${t("jod")}`}
                              </p>
                            )}
                          </div>

                          <ProductDialog id={product._id} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">{t("no_results_title")}</h3>
            <p className="text-gray-600">{t("no_results_description")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
