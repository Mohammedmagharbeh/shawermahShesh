import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProductDialog } from "@/componenet/common/ProductDialog";
import product_placeholder from "../assets/product_placeholder.jpeg";
import { CATEGORIES } from "@/constants";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Burgers");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  const fetchProducts = () => {
    setIsLoading(true);
    fetch(
      `${import.meta.env.VITE_BASE_URL}/products?category=${selectedCategory}`
    )
      .then((res) => res.json())
      .then((data) => {
        const allProducts = data.data || [];
        setProducts(allProducts);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
        setIsLoading(false);
      });
  };

  useMemo(() => {
    fetchProducts();
  }, [selectedLanguage, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 arabic-font" dir="rtl">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <input
            type="text"
            placeholder={t("search_your_favorite_dish")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin yellow mx-auto mb-4" />
            <p className="text-gray-600">{t("loading_products")}</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="space-y-6">
              {products.map((product) => (
                <Card key={product._id} className="shadow-sm">
                  <CardContent>
                    <div className="flex items-center">
                      <img
                        src={product.image || product_placeholder}
                        alt={product.name[selectedLanguage]}
                        className="w-24 h-24 object-cover rounded-lg ml-4"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {product.name[selectedLanguage]}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {product.description[selectedLanguage]}
                        </p>
                        <div className="text-lg font-bold text-orange-500">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                      <ProductDialog id={product._id} />
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
