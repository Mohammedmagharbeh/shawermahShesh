import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Edit2, Trash2, Package, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import product_placeholder from "../../assets/product_placeholder.jpeg";
import { CATEGORIES } from "@/constants";
import ProductManagement from "./ProductManagement";
import AdditionsManagement from "./AdditionsManagement";

const PRODUCTS_PER_PAGE = 20;

export default function AdminProductPanel() {
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    arName: "",
    enName: "",
    basePrice: "",
    discount: "",
    arDescription: "",
    enDescription: "",
    image: "",
    category: "",
    isSpicy: false,

    hasTypeChoices: false, // sandwich vs meal
    hasProteinChoices: false, // chicken vs meat

    // flexible structure — strings for inputs (convert to Number on submit)
    // note: these fields may be unused depending on toggles
    prices: {
      // single-type prices (when hasProteinChoices === false)
      sandwich: "",
      meal: "",

      // single-protein prices (when hasTypeChoices === false)
      chicken: "",
      meat: "",

      // matrix (when both true)
      chicken_sandwich: "",
      chicken_meal: "",
      meat_sandwich: "",
      meat_meal: "",
    },
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["all", ...CATEGORIES];
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";

  // جلب المنتجات
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/products`
        );
        const allProducts = res.data.data || [];
        setProducts(allProducts);

        setSelectedCategory("all");
      } catch (err) {
        console.error("Error fetching products:", err);
        alert(t("fetch_products_error"));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setFormData({
      arName: product.name.ar || "",
      enName: product.name.en || "",
      basePrice:
        product.basePrice?.toString() || product.price?.toString() || "",
      discount: product.discount?.toString() || "",
      arDescription: product.description.ar || "",
      enDescription: product.description.en || "",
      image: product.image || "",
      category: product.category || "",
      isSpicy: !!product.isSpicy,

      hasTypeChoices: !!product.hasTypeChoices,
      hasProteinChoices: !!product.hasProteinChoices,

      prices: {
        // fallback to empty strings
        sandwich: product.prices?.sandwich?.toString() || "",
        meal: product.prices?.meal?.toString() || "",
        chicken: product.prices?.chicken?.toString() || "",
        meat: product.prices?.meat?.toString() || "",
        chicken_sandwich: product.prices?.chicken?.sandwich?.toString() || "",
        chicken_meal: product.prices?.chicken?.meal?.toString() || "",
        meat_sandwich: product.prices?.meat?.sandwich?.toString() || "",
        meat_meal: product.prices?.meat?.meal?.toString() || "",
      },
    });

    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    toast((toastInstance) => (
      <div className="flex flex-col gap-2">
        <span>{t("confirm_delete")}</span>
        <div className="flex justify-end gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(toastInstance.id)}
          >
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              try {
                await axios.delete(
                  `${import.meta.env.VITE_BASE_URL}/admin/deletefood/${id}`
                );
                setProducts(products.filter((p) => p._id !== id));
                toast.success(t("product_deleted"));
                toast.dismiss(toastInstance.id);
              } catch (error) {
                console.error(
                  "خطأ في الحذف:",
                  error.response?.data || error.message
                );
                toast.error(t("delete_error"));
              }
            }}
          >
            {t("delete")}
          </Button>
        </div>
      </div>
    ));
  };

  // فلترة المنتجات
  const filteredProducts = products.filter((p) => {
    const name = p.name?.[selectedLanguage] || "";
    const categoryLang =
      typeof p.category === "string"
        ? p.category
        : p.category?.[selectedLanguage] || "";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryLang.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      categoryLang.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const displayedProducts = filteredProducts.slice(0, displayedCount);
  const hasMoreProducts = filteredProducts.length > displayedCount;

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setDisplayedCount(PRODUCTS_PER_PAGE);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-primary rounded-lg sm:rounded-xl shadow-lg shadow-primary/20">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {t("admin_panel")}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
                {t("admin_panel_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <ProductManagement
            setProducts={setProducts}
            formData={formData}
            setFormData={setFormData}
            editingId={editingId}
            setEditingId={setEditingId}
          />
          {/* Products List */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* إدارة الإضافات */}
            <AdditionsManagement />
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="relative mb-4">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    placeholder={t("search_product")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 text-sm sm:text-base"
                  />
                </div>

                <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {categories.map((cat, i) => {
                    const catValue = cat === "all" ? "all" : cat.en; // always compare using English
                    return (
                      <Button
                        key={i}
                        variant={
                          selectedCategory === catValue ? "default" : "outline"
                        }
                        onClick={() => handleCategoryChange(catValue)}
                        className="whitespace-nowrap text-xs sm:text-sm flex-shrink-0"
                        size="sm"
                      >
                        {cat === "all"
                          ? t("all")
                          : cat[selectedLanguage] || cat.en}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center items-center py-12 sm:py-20">
                <Loader2 className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
            ) : displayedProducts.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-3 sm:mb-4" />
                  <p className="text-base sm:text-lg text-muted-foreground">
                    {t("no_products")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {displayedProducts.map((product) => (
                  <Card key={product._id} className="overflow-hidden">
                    <div className="relative h-40 sm:h-48 bg-muted">
                      <img
                        src={product.image || product_placeholder}
                        alt={product.name?.[selectedLanguage]}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                        <Badge className="text-xs">
                          {product.category?.[selectedLanguage] ||
                            product.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3 sm:p-5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm sm:text-base line-clamp-1">
                          {product.name?.[selectedLanguage]}
                        </h3>
                        <span className="font-semibold text-primary text-sm sm:text-base whitespace-nowrap">
                          {product.hasProteinChoices || product.hasTypeChoices
                            ? "According To Your Choices"
                            : `${product.basePrice} ${t("jod")}`}
                        </span>
                      </div>
                      {product.discount > 0 && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">
                          {t("discount")}: {product.discount}%
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                        {product.description?.[selectedLanguage]}
                      </p>
                      {/* Action Buttons - تم إضافتها هنا */}
                      <div className="flex gap-2 mt-3 sm:mt-4">
                        <Button
                          onClick={() => handleEdit(product)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm"
                        >
                          <Edit2 className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                          {t("edit")}
                        </Button>
                        <Button
                          onClick={() => handleDelete(product._id)}
                          variant="destructive"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm"
                        >
                          <Trash2 className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                          {t("delete")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {hasMoreProducts && (
              <div className="text-center mt-4 sm:mt-6">
                <Button
                  variant="outline"
                  onClick={() =>
                    setDisplayedCount((prev) => prev + PRODUCTS_PER_PAGE)
                  }
                >
                  {t("show_more")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
