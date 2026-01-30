import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function ProductPriceMatrix({ formData, handleInputChange }) {
  const { t } = useTranslation();

  if (!formData.hasTypeChoices && !formData.hasProteinChoices) return null;

  return (
    <div className="border p-3 rounded-md space-y-3 bg-card">
      <p className="font-semibold text-sm">{t("variation_prices_matrix")}</p>

      {/* Complex Matrix: Chicken/Meat + Sandwich/Meal */}
      {formData.hasTypeChoices && formData.hasProteinChoices && (
        <div className="flex flex-col gap-3">
          {["chicken_sandwich", "chicken_meal", "meat_sandwich", "meat_meal"].map(
            (key) => (
              <div key={key}>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  {t(key)}
                </Label>
                <Input
                  id={`prices.${key}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prices[key] || ""}
                  onChange={handleInputChange}
                  className="h-9"
                />
              </div>
            )
          )}
        </div>
      )}

      {/* Type Only */}
      {formData.hasTypeChoices && !formData.hasProteinChoices && (
        <div className="flex flex-col gap-3">
          <div>
            <Label>{t("sandwich_price")}</Label>
            <Input
              id="prices.sandwich"
              type="number"
              value={formData.prices.sandwich}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>{t("meal_price")}</Label>
            <Input
              id="prices.meal"
              type="number"
              value={formData.prices.meal}
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}

      {/* Protein Only */}
      {!formData.hasTypeChoices && formData.hasProteinChoices && (
        <div className="flex flex-col gap-3">
          <div>
            <Label>{t("chicken_price")}</Label>
            <Input
              id="prices.chicken"
              type="number"
              value={formData.prices.chicken}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>{t("meat_price")}</Label>
            <Input
              id="prices.meat"
              type="number"
              value={formData.prices.meat}
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
