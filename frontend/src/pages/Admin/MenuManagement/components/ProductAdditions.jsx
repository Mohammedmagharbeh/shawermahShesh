import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductAdditions({
  formData,
  handleAddAddition,
  handleRemoveAddition,
  handleAdditionChange,
  handleRadioChange,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex flex-col min-[30rem]:flex-row justify-between items-start min-[30rem]:items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="font-semibold">{t("additions") || "Additions"}</Label>
          <Button
            type="button"
            size="icon"
            onClick={handleAddAddition}
            className="h-6 w-6 rounded-full"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="additionsSelectionType"
              value="radio"
              checked={formData.additionsSelectionType === "radio"}
              onChange={handleRadioChange}
              className="accent-primary"
            />
            {t("one_choice")}
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="additionsSelectionType"
              value="checkbox"
              checked={formData.additionsSelectionType === "checkbox"}
              onChange={handleRadioChange}
              className="accent-primary"
            />
            {t("multiple_choices")}
          </label>
        </div>
      </div>

      {/* Addition Rows */}
      <div className="space-y-2">
        {formData.additions?.map((addition, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 items-center border p-2 rounded-md bg-muted/20"
          >
            <div className="min-[30rem]:col-span-5 w-full">
              <Input
                placeholder="Arabic Name"
                value={addition.name?.ar}
                onChange={(e) =>
                  handleAdditionChange(index, "name", {
                    ...addition.name,
                    ar: e.target.value,
                  })
                }
                dir="rtl"
                className="h-8"
              />
            </div>
            <div className="min-[30rem]:col-span-5 w-full">
              <Input
                placeholder="English Name"
                value={addition.name?.en}
                onChange={(e) =>
                  handleAdditionChange(index, "name", {
                    ...addition.name,
                    en: e.target.value,
                  })
                }
                dir="ltr"
                className="h-8"
              />
            </div>
            <div className="min-[30rem]:col-span-2 flex gap-1 w-full">
              <Input
                type="number"
                placeholder="Price"
                value={addition.price}
                onChange={(e) =>
                  handleAdditionChange(index, "price", e.target.value)
                }
                className="h-8"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveAddition(index)}
                className="h-8 w-8 flex-shrink-0"
                style={{ backgroundColor: "var(--color-button2)" }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {formData.additions?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            {t("no_additions_yet")}
          </p>
        )}
      </div>
    </div>
  );
}
