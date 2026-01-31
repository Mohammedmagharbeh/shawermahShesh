import React from "react";
import PropTypes from "prop-types";
import { Label } from "@/components/ui/label";

/**
 * Option Selector Component
 * Generic component for selecting options (protein, type, spicy level)
 */
const OptionSelector = React.memo(
  ({ t, label, options, selectedOption, onSelect, required = false }) => {
    return (
      <div className="space-y-3">
        <Label className="text-base font-semibold block text-gray-800">
          {label}
          {required && (
            <span className="text-red-500 ml-1" title={t("required_field")}>
              *
            </span>
          )}
        </Label>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => onSelect(opt)}
              role="radio"
              aria-checked={selectedOption === opt}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelect(opt);
                  e.preventDefault();
                }
              }}
              className={`
              px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 
              flex items-center gap-3 relative overflow-hidden group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
              ${
                selectedOption === opt
                  ? "border-red-500 bg-red-50/50 text-red-700 shadow-sm transform scale-[1.02]"
                  : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
              }
            `}
            >
              {/* Custom Radio Circle */}
              <div
                className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200
              ${selectedOption === opt ? "border-red-500 bg-white" : "border-gray-300 group-hover:border-gray-400"}
            `}
              >
                {selectedOption === opt && (
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-in zoom-in duration-200" />
                )}
              </div>

              <span className="text-sm font-medium capitalize select-none">
                {t(opt)}
              </span>

              {/* Background enhancement for selected state */}
              {selectedOption === opt && (
                <div className="absolute inset-0 bg-red-500/5 -z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

OptionSelector.displayName = "OptionSelector";

OptionSelector.propTypes = {
  t: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedOption: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  required: PropTypes.bool,
};

export default OptionSelector;
