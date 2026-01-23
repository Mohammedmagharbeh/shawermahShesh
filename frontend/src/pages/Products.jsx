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
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/SortableItem";
import { Flame } from "lucide-react"; // Import an icon for hot deals

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
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
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

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50/50 arabic-font pt-16 pb-20" dir={i18n.dir()}>
      <div className="container mx-auto px-4 max-w-5xl">

        {/* --- Category Tabs --- */}
        <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-sm py-2 -mx-4 px-4 mb-4 border-b border-gray-100/50">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, categories, "categories")}
            >
              <SortableContext
                items={categories.map((c) => c._id)}
                strategy={horizontalListSortingStrategy}
                disabled={!enableDND}
              >
                {categories.map((cat) => (
                  <SortableItem
                    key={cat._id}
                    id={cat._id}
                    disabled={!enableDND}
                    className="snap-start"
                  >
                    <button
                      onClick={() => setSelectedCategory(cat._id)}
                      disabled={enableDND}
                      className={`
                        whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border
                        ${selectedCategory === cat._id
                          ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                          : "bg-white text-muted-foreground border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      {cat.name?.[selectedLanguage] || cat.name?.ar}
                    </button>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* --- Admin Reorder Switch --- */}
        {user.role === "admin" && (
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border shadow-sm">
              <Label htmlFor="dndconroller" className="text-sm cursor-pointer select-none">
                {t("enable_reorder")}
              </Label>
              <Switch
                id="dndconroller"
                checked={enableDND}
                onCheckedChange={setEnableDND}
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* --- Product List --- */}
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
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => {
                  const isOutOfStock = !product.inStock;
                  const hasDiscount = product.discount > 0;
                  const discountPercent = product.discount;

                  let priceDisplay;

                  if (product.hasProteinChoices || product.hasTypeChoices) {
                    priceDisplay = (
                      <span className="text-xs sm:text-sm font-medium text-gray-600">
                        {t("according_to_your_choices")}
                      </span>
                    );
                  } else {
                    const originalPrice = Number(product.basePrice);
                    const discountedPrice = originalPrice - (originalPrice * discountPercent / 100);

                    if (hasDiscount) {
                      priceDisplay = (
                        <div className="flex flex-col items-start leading-none gap-1">
                          {/* Discounted Price (Big & Red) */}
                          <div className="flex items-baseline gap-1">
                            <span className="text-red-600 text-lg sm:text-xl font-bold">
                              {discountedPrice.toFixed(2)}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-red-600">{t("jod")}</span>
                          </div>

                          {/* Old Price + Savings Pill */}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 line-through text-xs sm:text-sm decoration-gray-400">
                              {originalPrice.toFixed(2)} {t("jod")}
                            </span>
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                              {t("save")} {discountPercent}%
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      priceDisplay = (
                        <div className="flex items-baseline gap-1">
                          <span className={`text-base sm:text-xl font-bold ${isOutOfStock ? "text-gray-500" : "text-primary"}`}>
                            {originalPrice.toFixed(2)}
                          </span>
                          <span className={`text-xs sm:text-sm font-normal ${isOutOfStock ? "text-gray-500" : "text-primary"}`}>{t("jod")}</span>
                        </div>
                      );
                    }
                  }

                  return (
                    <SortableItem key={product._id} id={product._id}>
                      <Card
                        className={`
                          overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white group
                          ${isOutOfStock ? "opacity-75 grayscale-[0.8]" : ""}
                        `}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex gap-3 sm:gap-5 h-full">

                            {/* Product Image */}
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                              <img
                                src={product.image || product_placeholder}
                                alt={product.name[selectedLanguage]}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                              />

                              {/* Out of Stock Overlay */}
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Badge variant="destructive" className="text-[10px] sm:text-xs font-bold px-2 py-1">
                                    {t("out_of_stock") || "Out of Stock"}
                                  </Badge>
                                </div>
                              )}

                              {/* 🔥 PROMINENT DISCOUNT BADGE 🔥 */}
                              {!isOutOfStock && hasDiscount && (
                                <div className="absolute top-0 ltr:right-0 rtl:left-0 z-10">
                                  <div className="bg-green-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-none ltr:rounded-tr-lg ltr:rounded-bl-lg rtl:rounded-tl-lg rtl:rounded-br-lg shadow-md flex items-center gap-1">
                                    <Flame className="w-3 h-3 fill-white" />
                                    {discountPercent}% OFF
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                                    {product.name[selectedLanguage]}
                                  </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                  {product?.description?.[selectedLanguage]}
                                </p>
                              </div>

                              <div className="flex items-end justify-between gap-2 mt-3">
                                {/* Price Display Section */}
                                <div className="font-bold min-h-[2.5rem] flex items-end">
                                  {priceDisplay}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                  {/* Admin Stock Toggle */}
                                  {(user.role === "admin" || user.role === "employee") && (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                      <Switch
                                        id={`inStock-${product._id}`}
                                        checked={!isOutOfStock}
                                        onCheckedChange={(v) => handleInStock(v, product)}
                                        className="scale-75 data-[state=checked]:bg-green-600"
                                        dir="ltr"
                                      />
                                    </div>
                                  )}

                                  <ProductDialog
                                    id={product._id}
                                    disabled={isOutOfStock}
                                    className={`h-8 w-8 sm:h-9 sm:w-9 ${hasDiscount && !isOutOfStock ? "bg-red-600 hover:bg-red-700 text-white border-none shadow-sm" : ""}`}
                                  />
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
          !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-2xl">🍽️</div>
              <p className="text-gray-500 font-medium">{t("no_products")}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}