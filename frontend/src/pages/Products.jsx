import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ProductDialog } from "@/componenet/common/ProductDialog";
import product_placeholder from "../assets/product_placeholder.jpeg";
import { useUser } from "@/contexts/UserContext";
import Loading from "@/componenet/common/Loading";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import i18n from "@/i18n";
import { useCategoryContext } from "@/contexts/CategoryContext";
import {
  DndContext,
  useSensor,
  closestCenter,
  PointerSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/SortableItem";
import { Button } from "@/components/ui/button";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    "6925a83f23f3a8dcdb91b714"
  );
  const [isLoading, setIsLoading] = useState(false);
  const { categories, fetchCategories } = useCategoryContext();
  const { t, i18n } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { user, logout } = useUser();
  const [enableDND, setEnableDND] = useState(false);

  const fetchProducts = () => {
    setIsLoading(true);
    fetch(
      `${import.meta.env.VITE_BASE_URL}/products?category=${selectedCategory}`,
      { headers: { authorization: `Bearer ${user.token}` } }
    )
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.message.includes("Invalid token")) logout();
        toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useMemo(() => {
    fetchProducts();
  }, [selectedCategory]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p._id === active.id);
    const newIndex = products.findIndex((p) => p._id === over.id);

    const newOrder = arrayMove(products, oldIndex, newIndex);
    setProducts(newOrder);

    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/admin/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          categoryId: selectedCategory,
          orderedIds: newOrder.map((p) => p._id),
        }),
      });
    } catch (err) {
      console.error(err);
      toast.error("خطأ: لم يتم حفظ ترتيب المنتجات");
    }
  };

  if (isLoading) return <Loading />;

  const handleInStock = async (v, product) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/admin/updatefood/${product._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ ...product, inStock: Boolean(v) }),
        }
      );

      const data = await res.json();
      toast.success(data.message);
      fetchProducts();
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 arabic-font pt-12" dir="rtl">
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 py-6 sm:py-8 lg:py-10">
        {/* Categories */}
        <div className="flex gap-1 xs:gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat, i) => {
            const isAll = cat === "All";
            const catValue = isAll ? "all" : cat;
            const catLabel = isAll ? t("all") : cat.name?.[selectedLanguage];
            return (
              <button
                key={i}
                onClick={() => setSelectedCategory(catValue._id)}
                className={`whitespace-nowrap px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-2 text-xs xs:text-sm sm:text-base rounded-lg transition flex-shrink-0 ${
                  selectedCategory === catValue._id
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                }`}
              >
                {catLabel}
              </button>
            );
          })}
        </div>

        {user.role === "admin" && (
          <div className="flex items-center w-fit mx-auto px-10 gap-2 py-5 my-5 font-semibold border-2 rounded-md ">
            <Switch
              id="hasTypeChoices"
              checked={enableDND}
              onCheckedChange={(v) => setEnableDND(v)}
              className={`${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            />
            <Label className="text-sm">{t("enable_reorder")}</Label>
          </div>
        )}

        {products.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={products.map((p) => p._id)}
              strategy={verticalListSortingStrategy}
              disabled={!enableDND}
            >
              <div className="space-y-3 xs:space-y-4 sm:space-y-6">
                {products.map((product) => {
                  const isOutOfStock = !product.inStock;

                  return (
                    <SortableItem key={product._id} id={product._id}>
                      <Card
                        className={`overflow-hidden border-0 shadow-sm transition bg-white ${
                          isOutOfStock
                            ? "opacity-60 grayscale hover:shadow-sm"
                            : "hover:shadow-md"
                        }`}
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-row-reverse items-center gap-2 sm:gap-4 p-2 xs:p-3 sm:p-4 relative">
                            {isOutOfStock && (
                              <Badge
                                variant="destructive"
                                className="absolute top-1 xs:top-2 left-1 xs:left-2 z-10 text-xs xs:text-sm"
                              >
                                {t("out_of_stock") || "Out of Stock"}
                              </Badge>
                            )}

                            {/* Product Image */}
                            <div className="flex-shrink-0 w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 relative ml-2">
                              <img
                                src={product.image || product_placeholder}
                                alt={product.name[selectedLanguage]}
                                className={`w-full h-full object-cover rounded-lg ${
                                  isOutOfStock ? "grayscale opacity-70" : ""
                                }`}
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div className="min-w-0">
                                <h3
                                  className={`text-sm xs:text-base sm:text-lg font-bold mb-0.5 xs:mb-1 line-clamp-1 ${
                                    isOutOfStock
                                      ? "text-gray-500"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {product.name[selectedLanguage]}
                                </h3>
                                <p
                                  className={`text-xs xs:text-sm line-clamp-2 leading-6 ${isOutOfStock ? "text-gray-400" : "text-gray-600"}`}
                                >
                                  {product.description[selectedLanguage]}
                                </p>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 xs:mt-2 gap-2">
                                {/* Price */}
                                <div className="min-w-0">
                                  {product.discount > 0 &&
                                  !product.hasProteinChoices &&
                                  !product.hasTypeChoices ? (
                                    <div className="flex items-center gap-1 xs:gap-2">
                                      <p
                                        className={`text-base xs:text-lg sm:text-xl font-bold ${
                                          isOutOfStock
                                            ? "text-gray-400"
                                            : "text-orange-500"
                                        }`}
                                      >
                                        JOD{" "}
                                        {product.discountedPrice
                                          ? product.discountedPrice.toFixed(2)
                                          : (
                                              product.basePrice -
                                              (product.basePrice *
                                                product.discount) /
                                                100
                                            ).toFixed(2)}
                                      </p>
                                      <p className="text-gray-400 line-through text-xs xs:text-sm">
                                        {product.basePrice}
                                      </p>
                                    </div>
                                  ) : (
                                    <p
                                      className={`text-base xs:text-lg sm:text-xl font-bold line-clamp-1 ${
                                        isOutOfStock
                                          ? "text-gray-400"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {product.hasProteinChoices ||
                                      product.hasTypeChoices
                                        ? "According To Your Choices"
                                        : `${product.basePrice} ${t("jod")}`}
                                    </p>
                                  )}
                                </div>

                                {/* Product Dialog Button */}
                                <div className="flex gap-5 flex-shrink-0">
                                  <ProductDialog
                                    id={product._id}
                                    disabled={isOutOfStock}
                                  />
                                  {(user.role === "admin" ||
                                    user.role === "employee") && (
                                    <div className="flex flex-col">
                                      <Label
                                        htmlFor="inStock"
                                        className="text-sm"
                                      >
                                        {t("is_in_stock")}
                                      </Label>
                                      <Switch
                                        id="inStock"
                                        className={`${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
                                        checked={product.inStock}
                                        onCheckedChange={(v) =>
                                          handleInStock(v, product)
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SortableItem>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <p className="text-center text-gray-500">{t("no_products")}</p>
        )}
      </div>
    </div>
  );
}
