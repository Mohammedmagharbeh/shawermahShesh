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
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, INITIAL_FORM_DATA } from "@/constants";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useProductForm from "../../hooks/useProductForm";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

function ProductManagement({
  setProducts,
  formData,
  setFormData,
  editingId,
  setEditingId,
}) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { buildPayload, handleInputChange, handleImageChange } = useProductForm(
    formData,
    setFormData
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildPayload(formData);

      if (editingId) {
        // update
        const res = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/admin/updatefood/${editingId}`,
          payload
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? res.data : p))
        );
        setEditingId(null);
      } else {
        // add new
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/postfood`,
          payload
        );
        setProducts((prev) => [res.data, ...prev]);
      }

      // reset form
      setFormData(INITIAL_FORM_DATA);

      toast.success(editingId ? t("product_updated") : t("product_added"));
    } catch (error) {
      console.error("خطأ في الإرسال:", error.response?.data || error.message);
      toast.error(t("submit_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddition = () => {
    setFormData((prev) => ({
      ...prev,
      additions: [...(prev.additions ?? []), { name: "", price: "" }],
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
      const updated = [...prev.additions];
      updated[index][field] = value;
      return { ...prev, additions: updated };
    });
  };

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

            {/* Base Price (always visible) */}
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

            {/* Toggles */}
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
              {/* Case A: both toggles true => show 2x2 matrix */}
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

              {/* Case B: only hasTypeChoices => sandwich & meal */}
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

              {/* Case C: only hasProteinChoices => chicken & meat single prices */}
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

            <div className="space-y-2">
              <div className="flex gap-2 items-center mb-2">
                <Label className="text-sm font-semibold">Additions</Label>
                <button
                  type="button"
                  onClick={handleAddAddition}
                  className="p-1 rounded bg-primary text-white hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.additions?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("no_additions_yet")}
                </p>
              )}

              {formData.additions?.map((addition, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Addition name"
                    value={addition.name}
                    onChange={(e) =>
                      handleAdditionChange(index, "name", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={addition.price}
                    onChange={(e) =>
                      handleAdditionChange(index, "price", e.target.value)
                    }
                    className="w-24"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveAddition(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>

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
              <Label htmlFor="category" className="text-sm">
                {t("category")}
              </Label>
              <Select
                onValueChange={(value) => {
                  const selectedCategory = CATEGORIES.find(
                    (cat) => cat.en === value
                  );
                  setFormData({
                    ...formData,
                    category: selectedCategory?.en, // always store English value for backend
                  });
                }}
                className="mt-1.5"
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={formData.category || t("choose_category")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat, index) => (
                    <SelectItem key={index} value={cat.en}>
                      {i18n.language === "ar" ? cat.ar : cat.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <Label htmlFor="category" className="text-sm">
                Has Spicy
              </Label>
              <Switch
                id="isSpicy"
                checked={Boolean(formData.isSpicy)}
                onCheckedChange={(v) =>
                  setFormData((prev) => ({ ...prev, isSpicy: Boolean(v) }))
                }
                className={`${i18n.language === "ar" ? "flex-row-reverse" : ""}`}
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="image" className="text-sm">
                {t("product_image")}
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1.5"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="preview"
                  className="mt-2 rounded w-32"
                />
              )}
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? t("saving")
                : editingId
                  ? t("save_changes")
                  : t("add_product")}
            </Button>

            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setFormData(INITIAL_FORM_DATA);
                }}
                className="w-full"
              >
                {t("cancel_edit")}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductManagement;
