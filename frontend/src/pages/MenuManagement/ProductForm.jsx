import { useState } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { CATEGORIES } from "@/constants";

export default function ProductForm({ t, onSubmit, editingProduct }) {
  const [formData, setFormData] = useState(
    editingProduct || {
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
    }
  );

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Label>{t("arabic_name")}</Label>
      <Input
        id="arName"
        value={formData.arName}
        onChange={handleInputChange}
        required
      />

      <Label>{t("english_name")}</Label>
      <Input
        id="enName"
        value={formData.enName}
        onChange={handleInputChange}
        required
      />

      <Label>{t("base_price")}</Label>
      <Input
        id="basePrice"
        type="number"
        value={formData.basePrice}
        onChange={handleInputChange}
        required
      />

      <Label>{t("category")}</Label>
      <select
        id="category"
        value={formData.category}
        onChange={handleInputChange}
        className="border p-2 rounded"
      >
        <option value="">{t("choose_category")}</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.en} value={cat.en}>
            {t(i18n.language === "ar" ? cat.ar : cat.en)}
          </option>
        ))}
      </select>

      <Label>{t("arabic_description")}</Label>
      <Textarea
        id="arDescription"
        value={formData.arDescription}
        onChange={handleInputChange}
        required
      />

      <Label>{t("english_description")}</Label>
      <Textarea
        id="enDescription"
        value={formData.enDescription}
        onChange={handleInputChange}
        required
      />

      <Label>{t("product_image")}</Label>
      <Input type="file" accept="image/*" onChange={handleImageChange} />

      <Button type="submit" className="w-full">
        {editingProduct ? t("update_product") : t("add_product")}
      </Button>
    </form>
  );
}
