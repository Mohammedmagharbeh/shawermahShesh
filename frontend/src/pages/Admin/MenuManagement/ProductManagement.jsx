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
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useProductForm from "@/hooks/useProductForm";
import { useUser } from "@/contexts/UserContext";
import { INITIAL_FORM_DATA } from "@/constants";
import { useCategoryContext } from "@/contexts/CategoryContext";
import ProductPriceMatrix from "./components/ProductPriceMatrix";
import ProductAdditions from "./components/ProductAdditions";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function ProductManagement({
  setProducts,
  formData,
  setFormData,
  editingId,
  setEditingId,
}) {
  const { t } = useTranslation();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const { categories, fetchCategories } = useCategoryContext();
  const { buildPayload, handleInputChange, handleImageChange } = useProductForm(
    formData,
    setFormData,
  );

  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const validateForm = () => {
    const newErrors = {};
    let hasError = false;

    if (formData.additionCategories) {
      formData.additionCategories.forEach((cat, catIndex) => {
        if (!cat?.name?.en) { newErrors[`additionCategories.${catIndex}.name.en`] = t("required_field"); hasError = true; }
        if (!cat?.name?.ar) { newErrors[`additionCategories.${catIndex}.name.ar`] = t("required_field"); hasError = true; }
        
        if (cat.items) {
          cat.items.forEach((item, itemIndex) => {
            if (!item?.name?.en) { newErrors[`additionCategories.${catIndex}.items.${itemIndex}.name.en`] = t("required_field"); hasError = true; }
            if (!item?.name?.ar) { newErrors[`additionCategories.${catIndex}.items.${itemIndex}.name.ar`] = t("required_field"); hasError = true; }
            if (item.price == null || item.price === "") { newErrors[`additionCategories.${catIndex}.items.${itemIndex}.price`] = t("required_field"); hasError = true; }
            else if (Number(item.price) < 0) { newErrors[`additionCategories.${catIndex}.items.${itemIndex}.price`] = t("invalid_price", "Invalid price"); hasError = true; }
          });
        }
      });
    }

    if (formData.additions) {
      formData.additions.forEach((add, index) => {
        if (!add?.name?.en) { newErrors[`additions.${index}.name.en`] = t("required_field"); hasError = true; }
        if (!add?.name?.ar) { newErrors[`additions.${index}.name.ar`] = t("required_field"); hasError = true; }
        if (add.price == null || add.price === "") { newErrors[`additions.${index}.price`] = t("required_field"); hasError = true; }
        else if (Number(add.price) < 0) { newErrors[`additions.${index}.price`] = t("invalid_price", "Invalid price"); hasError = true; }
      });
    }

    setErrors(newErrors);
    return !hasError;
  };

  useEffect(() => {
    if (hasSubmitted) {
      validateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, hasSubmitted, t]);

  const handleRadioChange = (e) => {
    setFormData({ ...formData, additionsSelectionType: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (!validateForm()) {
      toast.error(t("fix_errors_before_submitting") || "يرجى تصحيح الأخطاء قبل الإرسال");
      return;
    }
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
          },
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? res.data.data : p)),
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
      setFormData(INITIAL_FORM_DATA);
      setHasSubmitted(false);
      setErrors({});
      toast.success(editingId ? t("product_updated") : t("product_added"));
    } catch (error) {
      console.error(error);
      const serverMessage = error.response?.data?.message;
      toast.error(serverMessage || t("submit_error"));
    } finally {
      setLoading(false);
    }
  };



  return (
    <Card className="shadow-md border-border/50 max-h-none lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle className="text-xl font-bold">
          {editingId ? t("edit_product") : t("add_product")}
        </CardTitle>
        <CardDescription>
          {editingId ? t("edit_existing_product") : t("add_new_product")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grid for Name Inputs */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arName">{t("arabic_name")}</Label>
              <Input
                id="arName"
                value={formData.arName}
                onChange={handleInputChange}
                required
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enName">{t("english_name")}</Label>
              <Input
                id="enName"
                value={formData.enName}
                onChange={handleInputChange}
                required
                dir="ltr"
              />
            </div>
          </div>

          {/* Grid for Base Price & Discount */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">{t("base_price")}</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">{t("discount_percentage")}</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </div>

          {/* Configuration Switches */}
          <div className="p-3 rounded-lg flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="hasTypeChoices"
                checked={formData.hasTypeChoices}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, hasTypeChoices: v })
                }
                dir="ltr"
              />
              <Label htmlFor="hasTypeChoices" className="cursor-pointer">
                {t("has_type_choices")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="hasProteinChoices"
                checked={formData.hasProteinChoices}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, hasProteinChoices: v })
                }
                dir="ltr"
              />
              <Label htmlFor="hasProteinChoices" className="cursor-pointer">
                {t("has_protein_choices")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isSpicy"
                checked={Boolean(formData.isSpicy)}
                onCheckedChange={(v) =>
                  setFormData((prev) => ({ ...prev, isSpicy: Boolean(v) }))
                }
                dir="ltr"
              />
              <Label htmlFor="isSpicy" className="cursor-pointer">
                {t("has_spicy")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="inStock"
                checked={Boolean(formData.inStock)}
                onCheckedChange={(v) =>
                  setFormData((prev) => ({ ...prev, inStock: Boolean(v) }))
                }
                dir="ltr"
              />
              <Label htmlFor="inStock" className="cursor-pointer">
                {t("is_in_stock")}
              </Label>
            </div>
          </div>

          {/* Product Price Matrix Component */}
          <ProductPriceMatrix
            formData={formData}
            handleInputChange={handleInputChange}
          />

          <div className="h-px bg-border" />

          {/* Product Additions Component */}
          <ProductAdditions
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />

          <div className="h-px bg-border" />

          {/* Category & Image */}
          <div className="space-y-2">
            <Label>{t("category")}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("choose_category")} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name.en} ({cat.name.ar})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("product_image")}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="h-20 w-auto rounded-md border object-cover"
              />
            )}
          </div>

          {/* Descriptions */}
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>{t("arabic_description")}</Label>
              <Textarea
                value={formData.arDescription}
                onChange={handleInputChange}
                id="arDescription"
                dir="rtl"
                placeholder="ادخل الوصف"
                className="border p-2 w-full"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("english_description")}</Label>
              <Textarea
                value={formData.enDescription}
                onChange={handleInputChange}
                id="enDescription"
                dir="ltr"
                placeholder="enter description"
                className="border p-2 w-full"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setFormData(INITIAL_FORM_DATA);
                }}
                className="flex-1"
              >
                {t("cancel_edit")}
              </Button>
            )}
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? t("saving")
                : editingId
                  ? t("save_changes")
                  : t("add_product")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProductManagement;
