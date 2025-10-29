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
import { CATEGORIES } from "@/constants";
import axios from "axios";

import React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function ProductManagement({
  setProducts,
  formData,
  setFormData,
  editingId,
  setEditingId,
}) {
  const { t, i18n } = useTranslation();

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;

    // checkbox handled separately
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [id]: checked }));
      return;
    }

    // price nested keys like "prices.sandwich" or "prices.chicken_meal"
    if (id.startsWith("prices.")) {
      const key = id.replace(/^prices\./, "");
      setFormData((prev) => ({
        ...prev,
        prices: {
          ...prev.prices,
          [key]: value,
        },
      }));
      return;
    }

    // normal fields
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const buildPayload = (formData) => {
        const payload = {
          name: { ar: formData.arName, en: formData.enName },
          description: {
            ar: formData.arDescription,
            en: formData.enDescription,
          },
          image: formData.image,
          category: formData.category,
          isSpicy: !!formData.isSpicy,
          hasTypeChoices: !!formData.hasTypeChoices,
          hasProteinChoices: !!formData.hasProteinChoices,
          discount: formData.discount ? Number(formData.discount) : 0,
          basePrice: Number(formData.basePrice || formData.price || 0),
          prices: {},
        };

        // Both type & protein
        if (formData.hasTypeChoices && formData.hasProteinChoices) {
          payload.prices = {
            chicken: {
              sandwich: Number(
                formData.prices.chicken_sandwich || payload.basePrice
              ),
              meal: Number(formData.prices.chicken_meal || payload.basePrice),
            },
            meat: {
              sandwich: Number(
                formData.prices.meat_sandwich || payload.basePrice
              ),
              meal: Number(formData.prices.meat_meal || payload.basePrice),
            },
          };
        }
        // Only type (sandwich/meal)
        else if (formData.hasTypeChoices) {
          payload.prices = {
            sandwich: Number(formData.prices.sandwich || payload.basePrice),
            meal: Number(formData.prices.meal || payload.basePrice),
          };
        }
        // Only protein (chicken/meat)
        else if (formData.hasProteinChoices) {
          payload.prices = {
            chicken: Number(formData.prices.chicken || payload.basePrice),
            meat: Number(formData.prices.meat || payload.basePrice),
          };
        }

        return payload;
      };

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
      setFormData({
        arName: "",
        enName: "",
        basePrice: "",
        discount: "",
        arDescription: "",
        enDescription: "",
        image: "",
        category: "",
        isSpicy: false,
        hasTypeChoices: false,
        hasProteinChoices: false,
        prices: {
          sandwich: "",
          meal: "",
          chicken: "",
          meat: "",
          chicken_sandwich: "",
          chicken_meal: "",
          meat_sandwich: "",
          meat_meal: "",
        },
      });

      toast.success(editingId ? t("product_updated") : t("product_added"));
    } catch (error) {
      console.error("خطأ في الإرسال:", error.response?.data || error.message);
      alert(t("submit_error"));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setFormData({ ...formData, image: imageData });
      };
      reader.readAsDataURL(file);
    } else {
      alert(t("choose_image"));
    }
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
                <Input
                  id="hasTypeChoices"
                  type="checkbox"
                  checked={!!formData.hasTypeChoices}
                  onChange={handleInputChange}
                />
                <Label className="text-sm">{t("has_type_choices")}</Label>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  id="hasProteinChoices"
                  type="checkbox"
                  checked={!!formData.hasProteinChoices}
                  onChange={handleInputChange}
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
              <Input
                id="isSpicy"
                type="checkbox"
                checked={formData.isSpicy || false}
                onChange={(e) => handleInputChange(e)}
                className="mt-1.5 w-3"
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

            <Button type="submit" className="w-full">
              {editingId ? t("save_changes") : t("add_product")}
            </Button>

            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    arName: "",
                    enName: "",
                    price: "",
                    discount: "",
                    arDescription: "",
                    enDescription: "",
                    image: "",
                    category: "",
                  });
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
