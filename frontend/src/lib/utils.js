import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const calculateSubtotal = (product) => {
  // Determine base price
  let basePrice = product.productId?.basePrice ?? product.productId?.price ?? 0;

  // Case 1: has protein & type choices
  if (
    product.productId?.hasProteinChoices &&
    product.productId?.hasTypeChoices
  ) {
    const protein = product.selectedProtein;
    const type = product.selectedType;
    if (
      protein &&
      type &&
      product.productId.prices[protein] &&
      product.productId.prices[protein][type] !== undefined
    ) {
      basePrice = product.productId.prices[protein][type];
    }
  }

  // Case 2: has only type choices
  else if (product.productId?.hasTypeChoices) {
    const type = product.selectedType;
    if (type && product.productId.prices[type] !== undefined) {
      basePrice = product.productId.prices[type];
    }
  }

  // --- Calculate additions total ---
  const additionsTotal =
    product.additions?.reduce(
      (sum, addition) => sum + (addition.price || 0),
      0
    ) || 0;

  // --- Apply discount to base price only ---
  const discount = product.productId?.discount || 0;
  const discountedPrice =
    discount === 0 ? basePrice : basePrice - (discount * basePrice) / 100;

  // --- Final unit price ---
  return discountedPrice + additionsTotal;
};
