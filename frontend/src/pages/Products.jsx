import { useState, useEffect, useCallback } from "react";
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
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/SortableItem";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { categories, fetchCategories, setCategories } = useCategoryContext();
  const { t, i18n } = useTranslation();
  const selectedLanguage = localStorage.getItem("i18nextLng") || "ar";
  const { user, logout } = useUser();
  const [enableDND, setEnableDND] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchProducts = useCallback(() => {
    if (!selectedCategory) return;

    setIsLoading(true);
    fetch(
      `${import.meta.env.VITE_BASE_URL}/products?category=${selectedCategory}`,
      { headers: { authorization: `Bearer ${user.token}` } }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data.data || []);
      })
      .catch((err) => {
        console.error(err);
        if (err.message.includes("Invalid token")) {
          logout();
        } else {
          toast.error("خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCategory, user.token, logout]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = async (event, elements, collection) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = elements.findIndex((p) => p._id === active.id);
    const newIndex = elements.findIndex((p) => p._id === over.id);

    const newOrder = arrayMove(elements, oldIndex, newIndex);

    if (collection === "admin") setProducts(newOrder);
    else setCategories(newOrder);
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/${collection}/reorder`, {
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
      toast.success("تمت اعادة الترتيب بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("خطأ: لم يتم حفظ ترتيب المنتجات");
      if (collection === "admin") {
        setProducts(elements);
      } else {
        setCategories(elements);
      }
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
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, inStock: Boolean(v) } : p
        )
      );
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 arabic-font pt-12" dir="rtl">
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 py-6 sm:py-8 lg:py-10">
        {/* Categories */}
        <div className="flex gap-1 xs:gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, categories, "categories")}
          >
            <SortableContext
              items={categories.map((c) => c._id)} // ✅ Use categories, not products
              strategy={horizontalListSortingStrategy}
              disabled={!enableDND}
            >
              {categories.map((cat) => {
                const catLabel = cat.name?.[selectedLanguage];
                return (
                  <SortableItem
                    key={cat._id}
                    id={cat._id}
                    disabled={!enableDND}
                  >
                    <button
                      onClick={() => setSelectedCategory(cat._id)}
                      disabled={enableDND}
                      className={`whitespace-nowrap px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-2 text-xs xs:text-sm sm:text-base rounded-lg transition flex-shrink-0 ${
                        selectedCategory === cat._id
                          ? "bg-yellow-500 text-white shadow-md"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {catLabel}
                    </button>
                  </SortableItem>
                );
              })}
            </SortableContext>
          </DndContext>
        </div>

        {user.role === "admin" && (
          <div className="flex items-center w-fit mx-auto px-10 gap-2 py-5 my-5 font-semibold border-2 rounded-md ">
            <Switch
              id="dndconroller"
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
            onDragEnd={(e) => handleDragEnd(e, products, "admin")}
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
                                  {product?.description?.[selectedLanguage]}
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
                                        htmlFor={`inStock-${product._id}`}
                                        className="text-sm"
                                      >
                                        {t("is_in_stock")}
                                      </Label>
                                      <Switch
                                        id={`inStock-${product._id}`}
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
          !isLoading && ( // ✅ Only show when not loading
            <p className="text-center text-gray-500">{t("no_products")}</p>
          )
        )}
      </div>
    </div>
  );
}
