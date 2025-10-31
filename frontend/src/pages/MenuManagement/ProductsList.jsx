import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/constants";
import axios from "axios";
import { Package, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "@/componenet/common/Loading";
import ProductCard from "./ProductCard";

function ProductsList({ products, setProducts, setFormData, setEditingId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const categories = CATEGORIES;
  const [selectedCategory, setSelectedCategory] = useState("Burgers");
  const [loading, setLoading] = useState(true);
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/products?category=${selectedCategory}`
        );
        const allProducts = res.data.data || [];
        setProducts(allProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        alert(t("fetch_products_error"));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter((p) => {
    const name = p.name?.[selectedLanguage] || "";
    const categoryLang =
      typeof p.category === "string"
        ? p.category
        : p.category?.[selectedLanguage] || "";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryLang?.toLowerCase().includes(searchTerm?.toLowerCase());

    const matchesCategory =
      categoryLang?.toLowerCase() === selectedCategory?.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
  };

  if (loading) return <Loading />;

  return (
    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
              const catValue = cat.en;
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
                  {cat[selectedLanguage] || cat.en}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {filteredProducts.length === 0 ? (
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
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              products={products}
              setProducts={setProducts}
              setFormData={setFormData}
              setEditingId={setEditingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsList;
