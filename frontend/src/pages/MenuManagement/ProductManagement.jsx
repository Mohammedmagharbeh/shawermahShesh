import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useProductForm from "../../hooks/useProductForm";
import { useUser } from "@/contexts/UserContext";
import { INITIAL_FORM_DATA } from "@/constants";
import { useCategoryContext } from "@/contexts/CategoryContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function ProductManagement({ setProducts, formData, setFormData, editingId, setEditingId }) {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const { categories, fetchCategories } = useCategoryContext();
  const { buildPayload, handleInputChange, handleImageChange } = useProductForm(formData, setFormData);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleRadioChange = (e) => {
    setFormData({ ...formData, additionsSelectionType: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildPayload(formData);
      if (editingId) {
        const res = await axios.put(`${BASE_URL}/admin/updatefood/${editingId}`, payload, {
          headers: { "Content-Type": "application/json", authorization: `Bearer ${user.token}` },
        });
        setProducts((prev) => prev.map((p) => (p._id === editingId ? res.data : p)));
        setEditingId(null);
      } else {
        const res = await axios.post(`${BASE_URL}/admin/postfood`, payload, {
          headers: { "Content-Type": "application/json", authorization: `Bearer ${user.token}` },
        });
        setProducts((prev) => [res.data, ...prev]);
      }
      setFormData(INITIAL_FORM_DATA);
      toast.success(editingId ? t("product_updated") : t("product_added"));
    } catch (error) {
      console.error(error);
      toast.error(t("submit_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddition = () => {
    setFormData((prev) => ({
      ...prev,
      additions: [...(prev.additions ?? []), { name: { ar: "", en: "" }, price: "" }],
    }));
  };

  const handleRemoveAddition = (index) => {
    setFormData((prev) => ({ ...prev, additions: prev.additions.filter((_, i) => i !== index) }));
  };

  const handleAdditionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.additions];
      if (field === "name") updated[index].name = value;
      else updated[index][field] = value;
      return { ...prev, additions: updated };
    });
  };

  return (
    <Card className="shadow-md border-border/50 max-h-none lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle className="text-xl font-bold">{editingId ? t("edit_product") : t("add_product")}</CardTitle>
        <CardDescription>{editingId ? t("edit_existing_product") : t("add_new_product")}</CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Grid for Name Inputs */}
          <div className="grid grid-cols-1 min-[30rem]:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arName">{t("arabic_name")}</Label>
              <Input id="arName" value={formData.arName} onChange={handleInputChange} required dir="rtl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enName">{t("english_name")}</Label>
              <Input id="enName" value={formData.enName} onChange={handleInputChange} required dir="ltr" />
            </div>
          </div>

          {/* Grid for Base Price & Discount */}
          <div className="grid grid-cols-1 min-[30rem]:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">{t("base_price")}</Label>
              <Input id="basePrice" type="number" min="0" step="0.01" value={formData.basePrice} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">{t("discount_percentage")}</Label>
              <Input id="discount" type="number" min="0" max="100" value={formData.discount} onChange={handleInputChange} placeholder="0" />
            </div>
          </div>

          {/* Configuration Switches */}
          <div className="bg-yellow-500 p-3 rounded-lg flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Switch id="hasTypeChoices" checked={formData.hasTypeChoices} onCheckedChange={(v) => setFormData({ ...formData, hasTypeChoices: v })} className={i18n.language === "ar" ? "flex-row-reverse" : ""} />
              <Label htmlFor="hasTypeChoices" className="cursor-pointer">{t("has_type_choices")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="hasProteinChoices" checked={formData.hasProteinChoices} onCheckedChange={(v) => setFormData({ ...formData, hasProteinChoices: v })} className={i18n.language === "ar" ? "flex-row-reverse" : ""} />
              <Label htmlFor="hasProteinChoices" className="cursor-pointer">{t("has_protein_choices")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isSpicy" checked={Boolean(formData.isSpicy)} onCheckedChange={(v) => setFormData((prev) => ({ ...prev, isSpicy: Boolean(v) }))} className={i18n.language === "ar" ? "flex-row-reverse" : ""} />
              <Label htmlFor="isSpicy" className="cursor-pointer">{t("has_spicy")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="inStock" checked={Boolean(formData.inStock)} onCheckedChange={(v) => setFormData((prev) => ({ ...prev, inStock: Boolean(v) }))} className={i18n.language === "ar" ? "flex-row-reverse" : ""} />
              <Label htmlFor="inStock" className="cursor-pointer">{t("is_in_stock")}</Label>
            </div>
          </div>

          {/* Pricing Matrices (Responsive) */}
          {(formData.hasTypeChoices || formData.hasProteinChoices) && (
            <div className="border p-3 rounded-md space-y-3 bg-card">
              <p className="font-semibold text-sm">{t("variation_prices_matrix")}</p>

              {/* Complex Matrix: Chicken/Meat + Sandwich/Meal */}
              {formData.hasTypeChoices && formData.hasProteinChoices && (
                <div className="flex flex-col gap-3">
                  {['chicken_sandwich', 'chicken_meal', 'meat_sandwich', 'meat_meal'].map((key) => (
                    <div key={key}>
                      <Label className="text-xs text-muted-foreground mb-1 block">{t(key)}</Label>
                      <Input id={`prices.${key}`} type="number" min="0" step="0.01" value={formData.prices[key] || ""} onChange={handleInputChange} className="h-9" />
                    </div>
                  ))}
                </div>
              )}

              {/* Type Only */}
              {formData.hasTypeChoices && !formData.hasProteinChoices && (
                <div className="flex flex-col gap-3">
                  <div><Label>{t("sandwich_price")}</Label><Input id="prices.sandwich" type="number" value={formData.prices.sandwich} onChange={handleInputChange} /></div>
                  <div><Label>{t("meal_price")}</Label><Input id="prices.meal" type="number" value={formData.prices.meal} onChange={handleInputChange} /></div>
                </div>
              )}

              {/* Protein Only */}
              {!formData.hasTypeChoices && formData.hasProteinChoices && (
                <div className="flex flex-col gap-3">
                  <div><Label>{t("chicken_price")}</Label><Input id="prices.chicken" type="number" value={formData.prices.chicken} onChange={handleInputChange} /></div>
                  <div><Label>{t("meat_price")}</Label><Input id="prices.meat" type="number" value={formData.prices.meat} onChange={handleInputChange} /></div>
                </div>
              )}
            </div>
          )}

          <div className="h-px bg-border" />

          {/* Additions Section */}
          <div className="space-y-3">
            <div className="flex flex-col min-[30rem]:flex-row justify-between items-start min-[30rem]:items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="font-semibold">{t("additions") || "Additions"}</Label>
                <Button type="button" size="icon" onClick={handleAddAddition} className="h-6 w-6 rounded-full"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="additionsSelectionType" value="radio" checked={formData.additionsSelectionType === "radio"} onChange={handleRadioChange} className="accent-primary" />
                  {t("one_choice")}
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="additionsSelectionType" value="checkbox" checked={formData.additionsSelectionType === "checkbox"} onChange={handleRadioChange} className="accent-primary" />
                  {t("multiple_choices")}
                </label>
              </div>
            </div>

            {/* Addition Rows */}
            <div className="space-y-2">
              {formData.additions?.map((addition, index) => (
                <div key={index} className="flex flex-col gap-2 items-center border p-2 rounded-md bg-muted/20">
                  <div className="min-[30rem]:col-span-5 w-full"><Input placeholder="Arabic Name" value={addition.name?.ar} onChange={(e) => handleAdditionChange(index, "name", { ...addition.name, ar: e.target.value })} dir="rtl" className="h-8" /></div>
                  <div className="min-[30rem]:col-span-5 w-full"><Input placeholder="English Name" value={addition.name?.en} onChange={(e) => handleAdditionChange(index, "name", { ...addition.name, en: e.target.value })} dir="ltr" className="h-8" /></div>
                  <div className="min-[30rem]:col-span-2 flex gap-1 w-full">
                    <Input type="number" placeholder="Price" value={addition.price} onChange={(e) => handleAdditionChange(index, "price", e.target.value)} className="h-8" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveAddition(index)} className="h-8 w-8 flex-shrink-0" style={{ backgroundColor: "var(--color-button2)" }}><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
              {formData.additions?.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">{t("no_additions_yet")}</p>}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Category & Image */}
          <div className="space-y-2">
            <Label>{t("category")}</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger><SelectValue placeholder={t("choose_category")} /></SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name.en} ({cat.name.ar})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("product_image")}</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
            {formData.image && <img src={formData.image} alt="Preview" className="h-20 w-auto rounded-md border object-cover" />}
          </div>

          {/* Descriptions */}
          <div className="flex flex-col gap-4">
            <div className="space-y-2"><Label>{t("arabic_description")}</Label>
              <Textarea value={formData.arDescription}
                onChange={handleInputChange}
                id="arDescription"
                dir="rtl"
                placeholder="ادخل الوصف"
                className="border p-2 w-full"
                rows={3}
              />
            </div>
            <div className="space-y-2"><Label>{t("english_description")}</Label>
              <Textarea value={formData.enDescription} onChange={handleInputChange} id="enDescription" dir="ltr" placeholder="enter description" className="border p-2 w-full" rows={3} /></div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {editingId && (
              <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFormData(INITIAL_FORM_DATA); }} className="flex-1">
                {t("cancel_edit")}
              </Button>
            )}
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t("saving") : editingId ? t("save_changes") : t("add_product")}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}

export default ProductManagement;