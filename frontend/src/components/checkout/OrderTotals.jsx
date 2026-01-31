import React from "react";
import PropTypes from "prop-types";
import PriceRow from "./PriceRow";

/**
 * Order totals component displaying price breakdown
 * @component
 */
const OrderTotals = React.memo(({ summary, t }) => {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
      {/* Subtotal */}
      <PriceRow label={t("subtotal")} value={summary.subtotal} />

      {/* Savings - Only show if there are savings */}
      {summary.savings > 0 && (
        <div className="flex justify-between text-green-600 bg-green-50 px-2 py-1 rounded">
          <span className="text-sm">{t("you_save")}:</span>
          <span className="font-bold">{summary.savings.toFixed(2)} JOD</span>
        </div>
      )}

      {/* Delivery Cost */}
      <PriceRow label={t("delivery")} value={summary.deliveryCost} isGreen />

      {/* Total */}
      <PriceRow label={t("total")} value={summary.total} isBold />
    </div>
  );
});

OrderTotals.displayName = "OrderTotals";

OrderTotals.propTypes = {
  /** Order summary with price breakdown */
  summary: PropTypes.shape({
    /** Subtotal after discounts */
    subtotal: PropTypes.number.isRequired,
    /** Original price before discounts */
    originalSubtotal: PropTypes.number,
    /** Amount saved from discounts */
    savings: PropTypes.number.isRequired,
    /** Delivery cost */
    deliveryCost: PropTypes.number.isRequired,
    /** Total amount to pay */
    total: PropTypes.number.isRequired,
  }).isRequired,
  /** Translation function */
  t: PropTypes.func.isRequired,
};

export default OrderTotals;
