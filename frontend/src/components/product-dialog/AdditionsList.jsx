import React from "react";
import PropTypes from "prop-types";
import { Label } from "@/components/ui/label";

/**
 * Additions List Component
 * Renders a list of additions with checkbox or radio selection
 */
const AdditionsList = React.memo(
  ({
    t,
    additions,
    selectedAdditions,
    selectionType,
    onToggle,
    selectedLanguage,
  }) => {
    return (
      <div className="space-y-4">
        <Label className="text-base font-semibold block text-gray-800">
          {t("additions")}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {additions.map((addition) => {
            const isSelected = selectedAdditions.includes(addition._id);
            const additionName =
              addition.name?.[selectedLanguage] || addition.name?.en;
            const price = Number(addition.price);
            const isCheckbox = selectionType === "checkbox";

            return (
              <div
                key={addition._id}
                onClick={() => onToggle(addition._id, isCheckbox)}
                role={isCheckbox ? "checkbox" : "radio"}
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onToggle(addition._id, isCheckbox);
                    e.preventDefault();
                  }
                }}
                className={`
                flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 select-none
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
                ${
                  isSelected
                    ? "border-red-500 bg-red-50/40 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }
              `}
              >
                <div className="flex items-center gap-3">
                  {/* Custom Checkbox/Radio Indicator */}
                  <div
                    className={`
                  w-5 h-5 flex items-center justify-center border-2 transition-colors duration-200
                  ${isSelected ? "bg-red-500 border-red-500 text-white" : "bg-white border-gray-300 group-hover:border-gray-400"}
                  ${isCheckbox ? "rounded-md" : "rounded-full"}
                `}
                  >
                    {isSelected &&
                      (isCheckbox ? (
                        <svg
                          className="w-3 h-3 animate-in zoom-in duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-in zoom-in duration-200" />
                      ))}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight text-gray-900 group-hover:text-black">
                      {additionName}
                    </span>
                    {price > 0 && (
                      <span className="text-xs text-green-600 font-semibold mt-0.5">
                        + {price.toFixed(2)} {t("jod")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

AdditionsList.displayName = "AdditionsList";

AdditionsList.propTypes = {
  t: PropTypes.func.isRequired,
  additions: PropTypes.array.isRequired,
  selectedAdditions: PropTypes.array.isRequired,
  selectionType: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string,
};

export default AdditionsList;
