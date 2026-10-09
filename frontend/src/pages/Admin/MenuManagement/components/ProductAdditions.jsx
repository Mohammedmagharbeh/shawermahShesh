import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductAdditions({ formData, setFormData }) {
  const { t } = useTranslation();

  // --- Legacy Additions Handlers ---
  const handleAddLegacyAddition = () => {
    setFormData((prev) => ({
      ...prev,
      additions: [
        ...(prev.additions ?? []),
        { name: { ar: "", en: "" }, price: "" },
      ],
    }));
  };

  const handleRemoveLegacyAddition = (index) => {
    setFormData((prev) => ({
      ...prev,
      additions: prev.additions.filter((_, i) => i !== index),
    }));
  };

  const handleLegacyAdditionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.additions];
      if (field === "name") updated[index].name = value;
      else updated[index][field] = value;
      return { ...prev, additions: updated };
    });
  };

  const handleLegacyRadioChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      additionsSelectionType: e.target.value,
    }));
  };

  // --- New Categories Handlers ---
  const handleAddCategory = () => {
    setFormData((prev) => ({
      ...prev,
      additionCategories: [
        ...(prev.additionCategories ?? []),
        {
          name: { ar: "", en: "" },
          selectionType: "checkbox",
          items: [],
        },
      ],
    }));
  };

  const handleRemoveCategory = (catIndex) => {
    setFormData((prev) => ({
      ...prev,
      additionCategories: prev.additionCategories.filter((_, i) => i !== catIndex),
    }));
  };

  const handleCategoryChange = (catIndex, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.additionCategories || [])];
      if (field === "name") updated[catIndex].name = value;
      else updated[catIndex][field] = value;
      return { ...prev, additionCategories: updated };
    });
  };

  const handleAddCategoryItem = (catIndex) => {
    setFormData((prev) => {
      const updated = [...(prev.additionCategories || [])];
      updated[catIndex].items.push({ name: { ar: "", en: "" }, price: "" });
      return { ...prev, additionCategories: updated };
    });
  };

  const handleRemoveCategoryItem = (catIndex, itemIndex) => {
    setFormData((prev) => {
      const updated = [...(prev.additionCategories || [])];
      updated[catIndex].items = updated[catIndex].items.filter((_, i) => i !== itemIndex);
      return { ...prev, additionCategories: updated };
    });
  };

  const handleCategoryItemChange = (catIndex, itemIndex, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.additionCategories || [])];
      if (field === "name") updated[catIndex].items[itemIndex].name = value;
      else updated[catIndex].items[itemIndex][field] = value;
      return { ...prev, additionCategories: updated };
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Legacy Additions */}
      {(formData.additions?.length > 0) && (
        <div className="space-y-3 p-4 border rounded-lg bg-orange-50/50">
          <div className="flex flex-col min-[30rem]:flex-row justify-between items-start min-[30rem]:items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="font-semibold text-orange-800">
                {t("additions")} (Legacy)
              </Label>
              <Button
                type="button"
                size="icon"
                onClick={handleAddLegacyAddition}
                className="h-6 w-6 rounded-full bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer text-orange-900">
                <input
                  type="radio"
                  name="additionsSelectionType"
                  value="radio"
                  checked={formData.additionsSelectionType === "radio"}
                  onChange={handleLegacyRadioChange}
                  className="accent-orange-600"
                />
                {t("one_choice")}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-orange-900">
                <input
                  type="radio"
                  name="additionsSelectionType"
                  value="checkbox"
                  checked={formData.additionsSelectionType === "checkbox"}
                  onChange={handleLegacyRadioChange}
                  className="accent-orange-600"
                />
                {t("multiple_choices")}
              </label>
            </div>
          </div>

          <div className="space-y-3">
            {formData.additions?.map((addition, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 border border-orange-200 p-3 rounded-lg bg-white w-full"
                dir="ltr"
              >
                <div className="w-full">
                  <Input
                    placeholder={t("english_name")}
                    value={addition.name?.en || ""}
                    onChange={(e) =>
                      handleLegacyAdditionChange(index, "name", {
                        ...addition.name,
                        en: e.target.value,
                      })
                    }
                    dir="ltr"
                    className="h-8 border-orange-200"
                  />
                </div>
                <div className="w-full">
                  <Input
                    placeholder={t("arabic_name")}
                    value={addition.name?.ar || ""}
                    onChange={(e) =>
                      handleLegacyAdditionChange(index, "name", {
                        ...addition.name,
                        ar: e.target.value,
                      })
                    }
                    dir="rtl"
                    className="h-8 border-orange-200"
                  />
                </div>
                <div className="w-full flex gap-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={addition.price}
                    onChange={(e) =>
                      handleLegacyAdditionChange(index, "price", e.target.value)
                    }
                    className="h-8 border-orange-200 flex-1"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveLegacyAddition(index)}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Header Block matching the screenshot */}
        <div className="flex flex-row items-center justify-between gap-4">
          <Label className="font-semibold text-lg">{t("additions_categories")}</Label>
          <Button
            type="button"
            onClick={handleAddCategory}
            className="h-10 px-4 bg-[#D31F3D] hover:bg-red-700 text-white font-medium rounded-md flex items-center gap-2"
          >
            {t("add_category")} <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.additionCategories?.map((category, catIndex) => (
          <div key={catIndex} className="p-4 border border-gray-200 rounded-xl bg-white space-y-4 shadow-sm">
            
            {/* Category Top Row: Trash & Radio Buttons */}
            <div className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex gap-4 bg-white p-2 rounded-full border border-gray-200 px-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <span className="text-gray-700">{t("multiple_choices")}</span>
                  <input
                    type="radio"
                    name={`catSelectionType-${catIndex}`}
                    value="checkbox"
                    checked={category.selectionType === "checkbox"}
                    onChange={(e) => handleCategoryChange(catIndex, "selectionType", e.target.value)}
                    className="accent-[#D31F3D] w-4 h-4 cursor-pointer"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <span className="text-gray-700">{t("one_choice")}</span>
                  <input
                    type="radio"
                    name={`catSelectionType-${catIndex}`}
                    value="radio"
                    checked={category.selectionType === "radio"}
                    onChange={(e) => handleCategoryChange(catIndex, "selectionType", e.target.value)}
                    className="accent-[#D31F3D] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCategory(catIndex)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 w-10 h-10 shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Category Names Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="ltr">
              <div className="flex flex-col gap-1.5">
                <Input
                  placeholder={t("category_name_en")}
                  value={category.name?.en || ""}
                  onChange={(e) =>
                    handleCategoryChange(catIndex, "name", {
                      ...category.name,
                      en: e.target.value,
                    })
                  }
                  dir="ltr"
                  className="font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Input
                  placeholder={t("category_name_ar")}
                  value={category.name?.ar || ""}
                  onChange={(e) =>
                    handleCategoryChange(catIndex, "name", {
                      ...category.name,
                      ar: e.target.value,
                    })
                  }
                  dir="rtl"
                  className="font-medium"
                />
              </div>
            </div>

            {/* Category Items */}
            <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-row items-center justify-between mb-2">
                <Label className="text-sm text-gray-500 font-semibold">{t("options")}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddCategoryItem(catIndex)}
                  className="h-8 flex items-center gap-2 text-gray-700"
                >
                  {t("add_option")} <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              {category.items?.map((item, itemIndex) => (
                <div key={itemIndex} className="flex flex-col gap-3 bg-gray-50/50 p-4 rounded-lg border shadow-sm w-full" dir="ltr">
                  
                  {/* Item English Name */}
                  <div className="w-full">
                    <Input
                      placeholder="English Name"
                      value={item.name?.en || ""}
                      onChange={(e) =>
                        handleCategoryItemChange(catIndex, itemIndex, "name", {
                          ...item.name,
                          en: e.target.value,
                        })
                      }
                      dir="ltr"
                      className="h-10 bg-white"
                    />
                  </div>

                  {/* Item Arabic Name */}
                  <div className="w-full">
                    <Input
                      placeholder="Arabic Name"
                      value={item.name?.ar || ""}
                      onChange={(e) =>
                        handleCategoryItemChange(catIndex, itemIndex, "name", {
                          ...item.name,
                          ar: e.target.value,
                        })
                      }
                      dir="rtl"
                      className="h-10 bg-white"
                    />
                  </div>

                  {/* Item Price and Delete */}
                  <div className="w-full flex gap-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        handleCategoryItemChange(catIndex, itemIndex, "price", e.target.value)
                      }
                      className="h-10 bg-white flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCategoryItem(catIndex, itemIndex)}
                      className="h-10 w-10 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {category.items?.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 border border-dashed rounded-lg">
                  No options added to this category yet.
                </div>
              )}
            </div>

          </div>
        ))}

        {formData.additionCategories?.length === 0 && (!formData.additions || formData.additions.length === 0) && (
          <p className="text-sm text-gray-400 text-center py-8 border border-dashed rounded-xl bg-gray-50">
            {t("no_additions_yet")}
          </p>
        )}
      </div>
    </div>
  );
}
