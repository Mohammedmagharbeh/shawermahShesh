// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import { Switch } from "@/components/ui/switch";
// import { Plus } from "lucide-react";

// import axios from "axios";
// import toast from "react-hot-toast";
// import { useTranslation } from "react-i18next";
// import useProductForm from "../../hooks/useProductForm";
// import { useUser } from "@/contexts/UserContext";
// import { INITIAL_FORM_DATA } from "@/constants";
// import { useCategoryContext } from "@/contexts/CategoryContext";
// import { Textarea } from "@/components/ui/textarea";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// function ProductManagement({
//   setProducts,
//   formData,
//   setFormData,
//   editingId,
//   setEditingId,
// }) {
//   const { t, i18n } = useTranslation();
//   const { user } = useUser();
//   const [loading, setLoading] = useState(false);
//   const { categories, fetchCategories } = useCategoryContext();

//   const { buildPayload, handleInputChange, handleImageChange } = useProductForm(
//     formData,
//     setFormData
//   );

//   useEffect(() => {
//     fetchCategories();
//   }, [fetchCategories]);

//   // --- Submit Product ---
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const payload = buildPayload(formData);

//       if (editingId) {
//         const res = await axios.put(
//           `${BASE_URL}/admin/updatefood/${editingId}`,
//           payload,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               authorization: `Bearer ${user.token}`,
//             },
//           }
//         );
//         setProducts((prev) =>
//           prev.map((p) => (p._id === editingId ? res.data : p))
//         );
//         setEditingId(null);
//       } else {
//         const res = await axios.post(`${BASE_URL}/admin/postfood`, payload, {
//           headers: {
//             "Content-Type": "application/json",
//             authorization: `Bearer ${user.token}`,
//           },
//         });
//         setProducts((prev) => [res.data, ...prev]);
//       }

//       setFormData({ ...INITIAL_FORM_DATA, category: formData.category });
//       toast.success(editingId ? t("product_updated") : t("product_added"));
//     } catch (error) {
//       console.error("خطأ في الإرسال:", error.response?.data || error.message);
//       toast.error(t("submit_error"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Additions ---
//   const handleAddAddition = () => {
//     setFormData((prev) => ({
//       ...prev,
//       additions: [
//         ...(prev.additions ?? []),
//         { name: { ar: "", en: "" }, price: "" },
//       ],
//     }));
//   };

//   const handleRemoveAddition = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       additions: prev.additions.filter((_, i) => i !== index),
//     }));
//   };

//   const handleAdditionChange = (index, field, value) => {
//     setFormData((prev) => {
//       const updated = [...prev.additions];
//       if (field === "name") updated[index].name = value;
//       else updated[index][field] = value;
//       return { ...prev, additions: updated };
//     });
//   };

//   // --- Render JSX ---
//   return (
//     <div className="lg:col-span-1">
//       <Card className="shadow-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto rounded-md">
//         <CardHeader className="p-4 sm:p-6">
//           <CardTitle className="text-lg sm:text-xl">
//             {editingId ? t("edit_product") : t("add_product")}
//           </CardTitle>
//           <CardDescription className="text-xs sm:text-sm">
//             {editingId ? t("edit_existing_product") : t("add_new_product")}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="p-4 sm:p-6">
//           <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
//             {/* Name Fields */}
//             <div className="flex flex-col">
//               <Label htmlFor="arName" className="text-sm">
//                 {t("arabic_name")}
//               </Label>
//               <Input
//                 id="arName"
//                 value={formData.arName}
//                 onChange={handleInputChange}
//                 required
//                 className="mt-1.5"
//                 dir="rtl"
//               />
//             </div>
//             <div className="flex flex-col">
//               <Label htmlFor="enName" className="text-sm">
//                 {t("english_name")}
//               </Label>
//               <Input
//                 id="enName"
//                 value={formData.enName}
//                 onChange={handleInputChange}
//                 required
//                 className="mt-1.5"
//                 dir="ltr"
//               />
//             </div>

//             {/* Base Price */}
//             <div className="flex flex-col">
//               <Label htmlFor="basePrice" className="text-sm">
//                 {t("base_price")}
//               </Label>
//               <Input
//                 id="basePrice"
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={formData.basePrice}
//                 onChange={handleInputChange}
//                 className="mt-1.5"
//                 required
//               />
//             </div>

//             {/* Switches */}
//             <div className="flex gap-4 items-center mt-2">
//               <div className="flex items-center gap-2">
//                 <Switch
//                   id="hasTypeChoices"
//                   checked={formData.hasTypeChoices}
//                   onCheckedChange={(v) =>
//                     setFormData({ ...formData, hasTypeChoices: v })
//                   }
//                   className={`${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
//                 />
//                 <Label className="text-sm">{t("has_type_choices")}</Label>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Switch
//                   id="hasProteinChoices"
//                   checked={formData.hasProteinChoices}
//                   onCheckedChange={(v) =>
//                     setFormData({ ...formData, hasProteinChoices: v })
//                   }
//                   className={`${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
//                 />
//                 <Label className="text-sm">{t("has_protein_choices")}</Label>
//               </div>
//             </div>

//             {/* Conditional Prices */}
//             <div className="mt-3">
//               {formData.hasTypeChoices && formData.hasProteinChoices && (
//                 <div className="space-y-3 border p-3 rounded-md">
//                   <p className="font-semibold text-sm">
//                     {t("variation_prices_matrix")}
//                   </p>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     <div>
//                       <Label>{t("chicken_sandwich")}</Label>
//                       <Input
//                         id="prices.chicken_sandwich"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.prices.chicken_sandwich}
//                         onChange={handleInputChange}
//                       />
//                     </div>
//                     <div>
//                       <Label>{t("chicken_meal")}</Label>
//                       <Input
//                         id="prices.chicken_meal"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.prices.chicken_meal}
//                         onChange={handleInputChange}
//                       />
//                     </div>
//                     <div>
//                       <Label>{t("meat_sandwich")}</Label>
//                       <Input
//                         id="prices.meat_sandwich"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.prices.meat_sandwich}
//                         onChange={handleInputChange}
//                       />
//                     </div>
//                     <div>
//                       <Label>{t("meat_meal")}</Label>
//                       <Input
//                         id="prices.meat_meal"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.prices.meat_meal}
//                         onChange={handleInputChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}
//               {formData.hasTypeChoices && !formData.hasProteinChoices && (
//                 <div className="space-y-2 border p-3 rounded-md">
//                   <p className="font-semibold text-sm">{t("type_prices")}</p>
//                   <div className="flex gap-2">
//                     <div className="flex-1">
//                       <Label>{t("sandwich_price")}</Label>
//                       <Input
//                         id="prices.sandwich"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.prices.sandwich}
//                         onChange={handleInputChange}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <Label>{t("meal_price")}</Label>
//                       <Input
//                         id="prices.meal"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.prices.meal}
//                         onChange={handleInputChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}
//               {!formData.hasTypeChoices && formData.hasProteinChoices && (
//                 <div className="space-y-2 border p-3 rounded-md">
//                   <p className="font-semibold text-sm">{t("protein_prices")}</p>
//                   <div className="flex gap-2">
//                     <div className="flex-1">
//                       <Label>{t("chicken_price")}</Label>
//                       <Input
//                         id="prices.chicken"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.prices.chicken}
//                         onChange={handleInputChange}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <Label>{t("meat_price")}</Label>
//                       <Input
//                         id="prices.meat"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.prices.meat}
//                         onChange={handleInputChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <hr />

//             {/* Additions */}
//             <div className="space-y-2">
//               <div className="flex justify-between items-center mb-2">
//                 <div className="flex gap-2">
//                   <Label className="text-sm font-semibold">Additions</Label>
//                   <button
//                     type="button"
//                     onClick={handleAddAddition}
//                     className="p-1 rounded bg-primary text-white hover:bg-primary/90"
//                   >
//                     <Plus className="w-4 h-4" />
//                   </button>
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <Label className="inline-flex gap-2 items-center">
//                     <Input
//                       type="radio"
//                       name="additonSelectType"
//                       value="radio"
//                       required={formData.additions.length > 0}
//                       checked={formData.additionsSelectionType === "radio"}
//                       onChange={handleInputChange}
//                     />
//                     One Choice
//                   </Label>
//                   <Label className="inline-flex gap-2 items-center">
//                     <Input
//                       type="radio"
//                       name="additonSelectType"
//                       value="checkbox"
//                       required={formData.additions.length > 0}
//                       checked={formData.additionsSelectionType === "checkbox"}
//                       onChange={handleInputChange}
//                     />
//                     Multiple Choices
//                   </Label>
//                 </div>
//               </div>

//               {formData.additions?.length === 0 && (
//                 <p className="text-sm text-muted-foreground">
//                   {t("no_additions_yet")}
//                 </p>
//               )}

//               {formData.additions?.map((addition, index) => (
//                 <div
//                   key={index}
//                   className="flex flex-col gap-2 border p-2 rounded-md"
//                 >
//                   <Input
//                     placeholder="اسم الإضافة بالعربي"
//                     value={addition.name?.ar || ""}
//                     onChange={(e) =>
//                       handleAdditionChange(index, "name", {
//                         ...addition.name,
//                         ar: e.target.value,
//                       })
//                     }
//                     className="w-full"
//                     dir="rtl"
//                     required
//                   />
//                   <Input
//                     placeholder="Addition Name"
//                     value={addition.name?.en || ""}
//                     onChange={(e) =>
//                       handleAdditionChange(index, "name", {
//                         ...addition.name,
//                         en: e.target.value,
//                       })
//                     }
//                     className="w-full"
//                     dir="ltr"
//                     required
//                   />
//                   <Input
//                     type="number"
//                     placeholder="Price"
//                     value={addition.price}
//                     onChange={(e) =>
//                       handleAdditionChange(index, "price", e.target.value)
//                     }
//                     className="w-full"
//                     required
//                   />
//                   <Button
//                     type="button"
//                     variant="destructive"
//                     size="icon"
//                     onClick={() => handleRemoveAddition(index)}
//                     className="self-end"
//                   >
//                     ✕
//                   </Button>
//                 </div>
//               ))}
//             </div>

//             <hr />

//             {/* Discount */}
//             <div className="flex flex-col">
//               <Label htmlFor="discount" className="text-sm">
//                 {t("discount_percentage")}
//               </Label>
//               <Input
//                 id="discount"
//                 type="number"
//                 value={formData.discount}
//                 onChange={handleInputChange}
//                 placeholder={t("discount_example")}
//                 min="0"
//                 max="100"
//                 className="mt-1.5"
//               />
//             </div>
            
//             {/* Category */}

//             {/* Category Selection */}
//             <div className="flex flex-col">
//               <Label htmlFor="category" className="text-sm">
//                 {t("category")}
//               </Label>
//               <Select
//                 value={formData.category}
//                 onValueChange={(value) =>
//                   setFormData({ ...formData, category: value })
//                 }
//                 className="mt-1.5"
//                 required
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder={t("choose_category")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.length > 0 &&
//                     categories?.map((cat) => (
//                       <SelectItem key={cat._id} value={cat._id}>
//                         {cat.name.en} ({cat.name.ar})
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Add / Edit Category */}
//             {/* <div className="border p-3 rounded-md space-y-3">
//               <p className="font-semibold text-sm">
//                 {editingCategory
//                   ? t("edit_category")
//                   : t("add_new_category_title")}
//               </p>
//               {editingCategory ? (
//                 <div className="space-y-2">
//                   <Input
//                     placeholder={t("arabic_name")}
//                     value={editingCategory.name.ar}
//                     onChange={(e) =>
//                       setEditingCategory({
//                         ...editingCategory,
//                         name: { ...editingCategory.name, ar: e.target.value },
//                       })
//                     }
//                     dir="rtl"
//                     required
//                   />
//                   <Input
//                     placeholder={t("english_name")}
//                     value={editingCategory.name.en}
//                     onChange={(e) =>
//                       setEditingCategory({
//                         ...editingCategory,
//                         name: { ...editingCategory.name, en: e.target.value },
//                       })
//                     }
//                     dir="ltr"
//                     required
//                   />
//                   <div className="flex gap-2">
//                     <Button
//                       type="button"
//                       onClick={handleUpdateCategory}
//                       disabled={loading}
//                     >
//                       {t("update")}
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       onClick={() => setEditingCategory(null)}
//                     >
//                       {t("cancel")}
//                     </Button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex gap-2">
//                   <Input
//                     placeholder={t("arabic_name")}
//                     value={newCategoryAr}
//                     onChange={(e) => setNewCategoryAr(e.target.value)}
//                     dir="rtl"
//                   />
//                   <Input
//                     placeholder={t("english_name")}
//                     value={newCategoryEn}
//                     onChange={(e) => setNewCategoryEn(e.target.value)}
//                     dir="ltr"
//                   />
//                   <Button
//                     type="button"
//                     onClick={handleAddCategory}
//                     disabled={loading}
//                   >
//                     {t("add")}
//                   </Button>
//                 </div>
//               )}
//             </div> */}

//             <div className="flex flex-col">
//               <Label htmlFor="arDescription" className="text-sm">
//                 {t("arabic_description")}
//               </Label>
//               <Textarea
//                 id="arDescription"
//                 value={formData.arDescription}
//                 onChange={handleInputChange}
//                 required
//                 rows={4}
//                 className="mt-1.5 border-2 border-input p-1 rounded-md"
//                 dir="rtl"
//               />
//             </div>
//             <div className="flex flex-col">
//               <Label htmlFor="enDescription" className="text-sm">
//                 {t("english_description")}
//               </Label>
//               <Textarea
//                 id="enDescription"
//                 value={formData.enDescription}
//                 onChange={handleInputChange}
//                 required
//                 rows={4}
//                 className="mt-1.5 border-2 border-input p-1 rounded-md"
//                 dir="ltr"
//               />
//             </div>

//             <Button type="submit" disabled={loading} className="w-full mt-3">
//               {editingId ? t("update_product") : t("add_product")}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default ProductManagement;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useProductForm from "../../hooks/useProductForm";
import { useUser } from "@/contexts/UserContext";
import { INITIAL_FORM_DATA } from "@/constants";
import { useCategoryContext } from "@/contexts/CategoryContext";
import { Textarea } from "@/components/ui/textarea";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function ProductManagement({
  setProducts,
  formData,
  setFormData,
  editingId,
  setEditingId,
}) {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const { categories, fetchCategories, deleteCategoryOptimistic } = useCategoryContext();

  const { buildPayload, handleInputChange } = useProductForm(
    formData,
    setFormData
  );

  // select صغير لاختيار الفئة للحذف (يُستخدم بجانب زر إضافة الإضافة)
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState(
    formData.category || ""
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // لو تم تغيير formData.category من برا، نزامن القيم
    setSelectedCategoryToDelete(formData.category || "");
  }, [formData.category]);

  // ------------------------------------------------------------------
  //  📦 Submit Product
  // ------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildPayload(formData);

      if (editingId) {
        const res = await axios.put(
          `${BASE_URL}/admin/updatefood/${editingId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${user.token}`,
            },
          }
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? res.data : p))
        );
        setEditingId(null);
      } else {
        const res = await axios.post(`${BASE_URL}/admin/postfood`, payload, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.token}`,
          },
        });
        setProducts((prev) => [res.data, ...prev]);
      }

      setFormData({ ...INITIAL_FORM_DATA, category: formData.category });
      toast.success(editingId ? t("product_updated") : t("product_added"));
    } catch (error) {
      console.error("خطأ في الإرسال:", error.response?.data || error.message);
      toast.error(t("submit_error"));
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  //  ➕ Additions Handlers
  // ------------------------------------------------------------------
  const handleAddAddition = () => {
    setFormData((prev) => ({
      ...prev,
      additions: [
        ...(prev.additions ?? []),
        { name: { ar: "", en: "" }, price: "" },
      ],
    }));
  };

  const handleRemoveAddition = (index) => {
    setFormData((prev) => ({
      ...prev,
      additions: prev.additions.filter((_, i) => i !== index),
    }));
  };

  const handleAdditionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.additions ?? [])];
      if (field === "name") updated[index].name = value;
      else updated[index][field] = value;
      return { ...prev, additions: updated };
    });
  };

  // ------------------------------------------------------------------
  //  🗑️ Delete Category Handler
  // ------------------------------------------------------------------
  const handleDeleteCategory = async (categoryId) => {
    if (!categoryId) {
      toast.error(t("choose_category_first") || "Choose a category first");
      return;
    }

    const confirmMsg =
      (t("confirm_delete_category") || "Are you sure you want to delete this category?") +
      " " +
      (i18n.language === "ar"
        ? (categories.find((c) => c._id === categoryId)?.name?.ar || "")
        : (categories.find((c) => c._id === categoryId)?.name?.en || ""));

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}api/admin/category/${categoryId}`, {
        headers: {
          authorization: `Bearer ${user.token}`,
        },
      });

      // تحديث محلي إن وجدت دالة optimistic أو إعادة جلب من السيرفر
      if (deleteCategoryOptimistic) {
        deleteCategoryOptimistic(categoryId);
      } else {
        fetchCategories();
      }

      // إذا كانت الفئة المحذوفة هي الفئة المختارة حالياً في الفورم، قم بتصفيرها
      if (formData.category === categoryId) {
        setFormData({ ...formData, category: "" });
      }

      // وإذا كانت المحددة للحذف معروضة في select الصغير، نفضيها
      if (selectedCategoryToDelete === categoryId) {
        setSelectedCategoryToDelete("");
      }

      toast.success(t("category_deleted") || "Category deleted successfully");
    } catch (error) {
      console.error("خطأ في حذف الفئة:", error.response?.data || error.message);
      toast.error(t("category_delete_error") || "Error deleting category");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  //  🖼️ Render JSX
  // ------------------------------------------------------------------
  return (
    <div className="lg:col-span-1">
      <Card className="shadow-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto rounded-md">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">
            {editingId ? t("edit_product") : t("add_product")}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {editingId ? t("edit_existing_product") : t("add_new_product")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Name Fields */}
            <div className="flex flex-col">
              <Label htmlFor="arName" className="text-sm">
                {t("arabic_name")}
              </Label>
              <Input
                id="arName"
                value={formData.arName}
                onChange={handleInputChange}
                required
                className="mt-1.5"
                dir="rtl"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="enName" className="text-sm">
                {t("english_name")}
              </Label>
              <Input
                id="enName"
                value={formData.enName}
                onChange={handleInputChange}
                required
                className="mt-1.5"
                dir="ltr"
              />
            </div>

            {/* Base Price */}
            <div className="flex flex-col">
              <Label htmlFor="basePrice" className="text-sm">
                {t("base_price")}
              </Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={handleInputChange}
                className="mt-1.5"
                required
              />
            </div>

            {/* Switches */}
            <div className="flex gap-4 items-center mt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="hasTypeChoices"
                  checked={formData.hasTypeChoices}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, hasTypeChoices: v })
                  }
                  className={`${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
                />
                <Label className="text-sm">{t("has_type_choices")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="hasProteinChoices"
                  checked={formData.hasProteinChoices}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, hasProteinChoices: v })
                  }
                  className={`${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
                />
                <Label className="text-sm">{t("has_protein_choices")}</Label>
              </div>
            </div>

            {/* Conditional Prices */}
            <div className="mt-3">
              {formData.hasTypeChoices && formData.hasProteinChoices && (
                <div className="space-y-3 border p-3 rounded-md">
                  <p className="font-semibold text-sm">
                    {t("variation_prices_matrix")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>{t("chicken_sandwich")}</Label>
                      <Input
                        id="prices.chicken_sandwich"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prices.chicken_sandwich}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label>{t("chicken_meal")}</Label>
                      <Input
                        id="prices.chicken_meal"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prices.chicken_meal}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label>{t("meat_sandwich")}</Label>
                      <Input
                        id="prices.meat_sandwich"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prices.meat_sandwich}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label>{t("meat_meal")}</Label>
                      <Input
                        id="prices.meat_meal"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prices.meat_meal}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}
              {formData.hasTypeChoices && !formData.hasProteinChoices && (
                <div className="space-y-2 border p-3 rounded-md">
                  <p className="font-semibold text-sm">{t("type_prices")}</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>{t("sandwich_price")}</Label>
                      <Input
                        id="prices.sandwich"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prices.sandwich}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>{t("meal_price")}</Label>
                      <Input
                        id="prices.meal"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prices.meal}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}
              {!formData.hasTypeChoices && formData.hasProteinChoices && (
                <div className="space-y-2 border p-3 rounded-md">
                  <p className="font-semibold text-sm">{t("protein_prices")}</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>{t("chicken_price")}</Label>
                      <Input
                        id="prices.chicken"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prices.chicken}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>{t("meat_price")}</Label>
                      <Input
                        id="prices.meat"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prices.meat}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr />

            {/* Additions & (moved) Delete Category next to Add button */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-semibold">
                    {t("additions") || "Additions"}
                  </Label>
                  {/* زر إضافة إضافة */}
                  <button
                    type="button"
                    onClick={handleAddAddition}
                    className="p-1 rounded bg-primary text-white hover:bg-primary/90"
                    title={t("add_addition") || "Add addition"}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* هنا الزر الجديد: سيلِكت صغير لاختيار الفئة + زر الحذف */}
                <div className="flex items-center gap-2">
                  <div className="text-sm">{t("delete_category") || "Delete Category"}</div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedCategoryToDelete}
                      onValueChange={(v) => setSelectedCategoryToDelete(v)}
                      className="w-48"
                      disabled={loading || categories.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("choose_category") || "Choose"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {i18n.language === "ar" ? cat.name.ar : cat.name.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteCategory(selectedCategoryToDelete)}
                      disabled={loading || !selectedCategoryToDelete}
                      title={t("delete_selected_category") || "Delete selected category"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Label className="inline-flex gap-2 items-center">
                    <Input
                      type="radio"
                      name="additonSelectType"
                      value="radio"
                      required={formData.additions.length > 0}
                      checked={formData.additionsSelectionType === "radio"}
                      onChange={handleInputChange}
                    />
                    {t("one_choice") || "One Choice"}
                  </Label>
                  <Label className="inline-flex gap-2 items-center">
                    <Input
                      type="radio"
                      name="additonSelectType"
                      value="checkbox"
                      required={formData.additions.length > 0}
                      checked={formData.additionsSelectionType === "checkbox"}
                      onChange={handleInputChange}
                    />
                    {t("multiple_choices") || "Multiple Choices"}
                  </Label>
                </div>
              </div>

              {formData.additions?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("no_additions_yet")}
                </p>
              )}

              {formData.additions?.map((addition, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 border p-2 rounded-md"
                >
                  <Input
                    placeholder="اسم الإضافة بالعربي"
                    value={addition.name?.ar || ""}
                    onChange={(e) =>
                      handleAdditionChange(index, "name", {
                        ...addition.name,
                        ar: e.target.value,
                      })
                    }
                    className="w-full"
                    dir="rtl"
                    required
                  />
                  <Input
                    placeholder="Addition Name"
                    value={addition.name?.en || ""}
                    onChange={(e) =>
                      handleAdditionChange(index, "name", {
                        ...addition.name,
                        en: e.target.value,
                      })
                    }
                    className="w-full"
                    dir="ltr"
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={addition.price}
                    onChange={(e) =>
                      handleAdditionChange(index, "price", e.target.value)
                    }
                    className="w-full"
                    required
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveAddition(index)}
                    className="self-end"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>

            <hr />

            {/* Category Selection (for assigning product category) */}
            <div className="flex flex-col">
              <Label htmlFor="category" className="text-sm">
                {t("category")}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                className="mt-1.5"
                required
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("choose_category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name.en} ({cat.name.ar})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      {t("no_categories_found")}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Category list (optional, shows categories and delete) */}
            <div className="space-y-2 border p-3 rounded-md">
              <p className="font-semibold text-sm">
                {t("category_list_for_deletion") || "Category List"}
              </p>
              {categories.length > 0 ? (
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="flex items-center justify-between p-2 rounded-md bg-accent/50 hover:bg-accent"
                    >
                      <span className="text-sm font-medium truncate">
                        {i18n.language === "ar" ? cat.name.ar : cat.name.en}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="w-7 h-7 flex-shrink-0"
                        disabled={loading}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("no_categories_to_manage") || "No categories to delete"}
                </p>
              )}
            </div>

            <hr />

            {/* Discount */}
            <div className="flex flex-col">
              <Label htmlFor="discount" className="text-sm">
                {t("discount_percentage")}
              </Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder={t("discount_example")}
                min="0"
                max="100"
                className="mt-1.5"
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="arDescription" className="text-sm">
                {t("arabic_description")}
              </Label>
              <Textarea
                id="arDescription"
                value={formData.arDescription}
                onChange={handleInputChange}
                required
                rows={4}
                className="mt-1.5 border-2 border-input p-1 rounded-md"
                dir="rtl"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="enDescription" className="text-sm">
                {t("english_description")}
              </Label>
              <Textarea
                id="enDescription"
                value={formData.enDescription}
                onChange={handleInputChange}
                required
                rows={4}
                className="mt-1.5 border-2 border-input p-1 rounded-md"
                dir="ltr"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-3">
              {editingId ? t("update_product") : t("add_product")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductManagement;
