import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { CURRENCY } from "./constants";

/**
 * Price row component for displaying label-value pairs
 * @component
 */
const PriceRow = React.memo(
  ({ label, value, isGreen = false, isBold = false }) => {
    // Memoize formatted value to avoid repeated calculations
    const formattedValue = useMemo(() => {
      return `${Number(value).toFixed(2)} ${CURRENCY}`;
    }, [value]);

    return (
      <div
        className={`flex justify-between items-center ${isBold ? "text-lg font-bold pt-3 border-t border-gray-200" : ""}`}
      >
        <span className={isBold ? "text-gray-900" : "text-gray-600"}>
          {label}:
        </span>
        <span
          className={`font-semibold ${
            isGreen
              ? "text-green-600"
              : isBold
                ? "text-red-600"
                : "text-gray-900"
          }`}
        >
          {formattedValue}
        </span>
      </div>
    );
  },
);

PriceRow.displayName = "PriceRow";

PriceRow.propTypes = {
  /** Label text for the price row */
  label: PropTypes.string.isRequired,
  /** Numeric value to display */
  value: PropTypes.number.isRequired,
  /** Whether to display in green (for savings/delivery) */
  isGreen: PropTypes.bool,
  /** Whether to display in bold (for total) */
  isBold: PropTypes.bool,
};

export default PriceRow;
