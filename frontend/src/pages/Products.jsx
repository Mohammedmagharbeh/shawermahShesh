import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Facebook, Instagram } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProductDialog } from "@/componenet/common/ProductDialog";
import product_placeholder from "../assets/product_placeholder.jpeg";
import { CATEGORIES } from "@/constants";

// أيقونة واتساب مخصصة إذا لم تكن موجودة

const PRODUCTS_PER_PAGE = 6;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(["All", ...CATEGORIES]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [productsToShow, setProductsToShow] = useState(PRODUCTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  // جلب المنتجات من API
  useEffect(() => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_BASE_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        const allProducts = data.data || [];
        setProducts(allProducts);
        setFilteredProducts(allProducts);

        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
        setIsLoading(false);
      });
  }, [selectedLanguage]);

  // فلترة المنتجات عند البحث أو تغيير التصنيف
  useEffect(() => {
    let filtered = products;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name[selectedLanguage]
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => {
        const categoryName =
          typeof p.category === "object"
            ? p.category[selectedLanguage]
            : p.category;
        return categoryName === selectedCategory;
      });
    }

    setFilteredProducts(filtered);
    setProductsToShow(PRODUCTS_PER_PAGE);
  }, [products, searchTerm, selectedCategory, selectedLanguage]);

  const handleShowMore = () => {
    setProductsToShow(filteredProducts.length);
  };

  const displayedProducts = filteredProducts.slice(0, productsToShow);
  const hasMoreProducts = filteredProducts.length > productsToShow;

  return (
    <div className="min-h-screen bg-gray-50 arabic-font" dir="rtl">
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          {t("menu_title")}
        </h2>

        {/* البحث والتصنيفات */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder={t("search_your_favorite_dish")}
            className="w-full lg:w-80 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => {
              const isAll = cat === "All";
              const catValue = isAll ? "all" : cat.en;
              const catLabel = isAll ? t("all") : cat[selectedLanguage];

              return (
                <button
                  key={i}
                  onClick={() => setSelectedCategory(catValue)}
                  className={`rounded-full px-4 py-2 ${
                    selectedCategory === catValue
                      ? "bg-red-700 hover:bg-red-800 text-white"
                      : "border border-red-700 text-red-700 hover:bg-red-50"
                  }`}
                >
                  {catLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* حالة التحميل */}
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-700 mx-auto mb-4" />
            <p className="text-gray-600">{t("loading_products")}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProducts.map((product) => (
                <Card
                  key={product._id}
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition bg-white"
                >
                  <div className="relative">
                    <img
                      src={product.image || product_placeholder}
                      alt={product.name[selectedLanguage]}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-700 text-white">
                        {product.category?.[selectedLanguage] ||
                          product.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {product.name[selectedLanguage]}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {product.description[selectedLanguage]}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount > 0 ? (
                          <>
                            <p className="text-gray-500 line-through text-sm">
                              {product.price} د.أ
                            </p>
                            <p className="text-2xl font-bold text-red-700">
                              {product.discountedPrice
                                ? product.discountedPrice.toFixed(2)
                                : (
                                    product.price -
                                    (product.price * product.discount) / 100
                                  ).toFixed(2)}{" "}
                              د.أ
                            </p>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              خصم {product.discount}%
                            </span>
                          </>
                        ) : (
                          <p className="text-2xl font-bold text-red-700">
                            {product.price} د.أ
                          </p>
                        )}
                      </div>

                      <ProductDialog id={product._id} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasMoreProducts && (
              <div className="text-center mt-12">
                <button
                  onClick={handleShowMore}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg"
                >
                  {t("show_more_products", {
                    count: filteredProducts.length - productsToShow,
                  })}
                </button>
              </div>
            )}
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
