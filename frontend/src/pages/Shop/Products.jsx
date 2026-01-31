import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";
import Loading from "@/components/common/Loading";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCategoryContext } from "@/contexts/CategoryContext";
import ProductCard from "@/components/shop/ProductCard";
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
import { motion, AnimatePresence } from "framer-motion";

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
      { headers: { authorization: `Bearer ${user.token}` } },
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
      // Prevent scrolling issues on mobile
    }),
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
        },
      );

      const data = await res.json();
      toast.success(data.message);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, inStock: Boolean(v) } : p,
        ),
      );
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (isLoading && products.length === 0) return <Loading />;

  return (
    <div
      className="min-h-screen bg-gray-50 pb-24 sm:pb-20 pt-4"
      dir={i18n.dir()}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {/* --- Category Tabs (Sticky Mobile Header) --- */}
        <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-md py-3 -mx-4 px-4 mb-6 border-b border-gray-100 shadow-sm transition-all duration-300">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x mandatory touch-pan-x">
            {/* Note regarding DndContext: Wrapping sticky elements can sometimes cause scroll issues on mobile if sensors capture events too eagerly. 
                 But existing implementation uses DndContext here. Keeping it. */}
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
                    className="snap-start shrink-0"
                  >
                    <button
                      onClick={() => setSelectedCategory(cat._id)}
                      disabled={enableDND}
                      className={`
                        whitespace-nowrap px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-300 transform active:scale-95
                        ${
                          selectedCategory === cat._id
                            ? "bg-gray-900 text-white shadow-lg ring-2 ring-gray-200 ring-offset-1 scale-100"
                            : "bg-white text-gray-500 hover:text-gray-900 border border-transparent shadow-sm hover:shadow"
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

        {/* --- Admin Controls --- */}
        {user.role === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end mb-6"
          >
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <Label
                htmlFor="dndconroller"
                className="text-sm font-medium cursor-pointer select-none text-gray-700"
              >
                {t("enable_reorder")}
              </Label>
              <Switch
                id="dndconroller"
                checked={enableDND}
                onCheckedChange={setEnableDND}
                dir="ltr"
                className="data-[state=checked]:bg-gray-900"
              />
            </div>
          </motion.div>
        )}

        {/* --- Product List --- */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : products.length > 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-20">
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <SortableItem key={product._id} id={product._id}>
                      <ProductCard
                        product={product}
                        user={user}
                        handleInStock={handleInStock}
                        selectedLanguage={selectedLanguage}
                        t={t}
                      />
                    </SortableItem>
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center opacity-70"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner animate-pulse">
              🍽️
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("no_products")}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              There are no products in this category yet.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
