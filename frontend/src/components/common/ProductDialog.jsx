import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Dialog as DialogUi,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/common/Loading";
import { useTranslation } from "react-i18next";
import { useProductDialogLogic } from "@/components/product-dialog/useProductDialogLogic";

// --- Sub-Components ---
import ProductImage from "@/components/product-dialog/ProductImage";
import ProductHeader from "@/components/product-dialog/ProductHeader";
import OptionSelector from "@/components/product-dialog/OptionSelector";
import AdditionsList from "@/components/product-dialog/AdditionsList";
import DialogFooter from "@/components/product-dialog/DialogFooter";
import { UI_CONFIG } from "@/components/product-dialog/constants";

// --- Constants ---
const PROTEIN_OPTIONS = ["chicken", "meat"];
const TYPE_OPTIONS = ["sandwich", "meal"];

/**
 * Product Dialog Component
 *
 * Displays product details, handles selections, and adds products to cart.
 * Refactored to use sub-components and a custom hook for logic separation.
 *
 * @component
 */
export function ProductDialog({
  id,
  triggerLabel,
  disabled = false,
  className,
}) {
  const { t } = useTranslation();

  // --- Logic Hook ---
  const { state, actions } = useProductDialogLogic(id, t);

  const {
    open,
    loading,
    product,
    quantity,
    selectedAdditions,
    spicy,
    notes,
    selectedType,
    selectedProtein,
    selectedLanguage,
    basePrice,
    additionsPrice,
    pricePerUnit,
    grandTotal,
  } = state;

  const {
    setOpen,
    setNotes,
    handleAddToCart,
    handleQuantityChange,
    handleProteinSelect,
    handleTypeSelect,
    handleSpicySelect,
    handleAdditionToggle,
    isSelectionComplete,
  } = actions;

  const buttonLabel = triggerLabel || t("View product");

  // Memoize spicy options for selector
  const spicyOptions = useMemo(() => ["true", "false"], []);

  return (
    <DialogUi open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`hover:bg-accent hover:text-accent-foreground transition-colors`}
        >
          {buttonLabel}
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent
        className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-2xl md:max-w-4xl flex flex-col p-0 bg-white gap-0 outline-none overflow-hidden border-none sm:border rounded-none sm:rounded-lg"
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto-focus on first input
      >
        {loading ? (
          <div className="flex items-center justify-center p-20 min-h-[400px]">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleAddToCart}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-0 sm:p-6 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 sm:gap-6 lg:gap-8">
                {/* Left Column: Image */}
                <ProductImage
                  image={product.image}
                  name={product.name?.[selectedLanguage]}
                  discount={product.discount}
                  t={t}
                  selectedLanguage={selectedLanguage}
                />

                {/* Right Column: Details & Options */}
                <div className="flex flex-col space-y-6 sm:space-y-8 p-4 sm:p-0 animate-in slide-in-from-right-4 duration-500 delay-100 fill-mode-backwards">
                  {/* Header */}
                  <ProductHeader
                    name={product.name?.[selectedLanguage]}
                    category={product.category?.name?.[selectedLanguage]}
                    description={product.description?.[selectedLanguage]}
                    isSelectionComplete={isSelectionComplete()}
                    pricePerUnit={pricePerUnit}
                    basePrice={basePrice}
                    additionsPrice={additionsPrice}
                    discount={product.discount}
                    t={t}
                  />

                  {/* Options Section */}
                  <div className="space-y-6 pb-4">
                    {/* Protein Selection */}
                    {product.hasProteinChoices && (
                      <OptionSelector
                        t={t}
                        label={t("choose_protein")}
                        options={PROTEIN_OPTIONS}
                        selectedOption={selectedProtein}
                        onSelect={handleProteinSelect}
                        required
                      />
                    )}

                    {/* Type Selection */}
                    {product.hasTypeChoices && (
                      <OptionSelector
                        t={t}
                        label={t("choose_type")}
                        options={TYPE_OPTIONS}
                        selectedOption={selectedType}
                        onSelect={handleTypeSelect}
                        required
                      />
                    )}

                    {/* Spicy Selection - Custom handling for boolean values */}
                    {product.isSpicy && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold block text-gray-800">
                          {t("choose_spicy_level")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {[true, false].map((val) => (
                            <div
                              key={val.toString()}
                              onClick={() => handleSpicySelect(val)}
                              className={`
                                px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 
                                flex items-center gap-3 relative overflow-hidden
                                ${
                                  spicy === val
                                    ? "border-red-500 bg-red-50/50 text-red-700 shadow-sm transform scale-[1.02]"
                                    : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                                }
                              `}
                            >
                              <div
                                className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                ${spicy === val ? "border-red-500 bg-white" : "border-gray-300"}
                              `}
                              >
                                {spicy === val && (
                                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-in zoom-in" />
                                )}
                              </div>
                              <span className="text-sm font-medium">
                                {val ? t("spicy") : t("not_spicy")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additions List */}
                    {product.additions?.length > 0 && (
                      <AdditionsList
                        t={t}
                        additions={product.additions}
                        selectedAdditions={selectedAdditions}
                        selectedLanguage={selectedLanguage}
                        onToggle={handleAdditionToggle}
                        selectionType={product.additionsSelectionType}
                      />
                    )}

                    {/* Notes Field */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="product-notes"
                        className="text-base font-semibold block text-gray-800"
                      >
                        {t("notes")}
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="product-notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t("add_notes")}
                          className="resize-none border-gray-200 focus:border-primary focus:ring-primary min-h-[100px] pr-2 pb-6"
                          maxLength={UI_CONFIG.MAX_NOTES_LENGTH}
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-mono">
                          {notes.length}/{UI_CONFIG.MAX_NOTES_LENGTH}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Actions */}
            <DialogFooter
              t={t}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              grandTotal={grandTotal}
              isSelectionComplete={isSelectionComplete}
              onSubmit={handleAddToCart}
            />
          </form>
        )}
      </DialogContent>
    </DialogUi>
  );
}

ProductDialog.propTypes = {
  id: PropTypes.string.isRequired,
  triggerLabel: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
