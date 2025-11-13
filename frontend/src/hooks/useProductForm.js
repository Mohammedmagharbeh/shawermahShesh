export default function useProductForm(formData, setFormData) {
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

  const buildPayload = () => {
    const payload = {
      name: { ar: formData.arName, en: formData.enName },
      description: {
        ar: formData.arDescription,
        en: formData.enDescription,
      },
      additions: formData.additions,
      image: formData.image,
      category: formData.category,
      isSpicy: Boolean(formData.isSpicy),
      hasTypeChoices: !!formData.hasTypeChoices,
      hasProteinChoices: !!formData.hasProteinChoices,
      discount: formData.discount ? Number(formData.discount) : 0,
      basePrice: Number(formData.basePrice || formData.price || 0),
      prices: {},
      inStock: Boolean(formData.inStock),
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
          sandwich: Number(formData.prices.meat_sandwich || payload.basePrice),
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

  return { handleInputChange, handleImageChange, buildPayload };
}
