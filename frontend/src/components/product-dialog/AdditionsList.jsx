import React from "react";
import PropTypes from "prop-types";
import { Label } from "@/components/ui/label";
import shesho from "@/assets/shesho.png";
import shishsi from "@/assets/shishsi.png";

/**
 * Additions List Component
 */
const AdditionsList = React.memo(
  ({
    t,
    additions,
    additionCategories,
    selectedAdditions,
    selectionType,
    onToggle,
    selectedLanguage,
  }) => {

    // --- معالجة الاسم + إظهار الصور ---
    const renderAdditionName = (name, addition) => {
      if (!name) return null;

      const cleanName = name.toLowerCase().trim();
      const enName = addition?.name?.en?.toLowerCase() || "";

      // 👇 تحقق ذكي (بدون تطابق صارم)
      const isBoy =
        cleanName.includes("ولادي") ||
        enName.includes("sheesho") ||
        cleanName.includes("boy");

      const isGirl =
        cleanName.includes("بناتي") ||
        enName.includes("sheeshi") ||
        cleanName.includes("girl");

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium leading-tight text-gray-900">
            {name}
          </span>

          {isBoy && (
            <img
              src={shesho}
              alt="Boy"
              className="w-6 h-6 object-contain animate-in zoom-in duration-300"
              onError={() => console.error("Sheesho image missing")}
            />
          )}

          {isGirl && (
            <img
              src={shishsi}
              alt="Girl"
              className="w-6 h-6 object-contain animate-in zoom-in duration-300"
              onError={() => console.error("Sheeshi image missing")}
            />
          )}
        </div>
      );
    };

    const renderAdditionsGroup = (groupItems, groupSelectionType, groupIds = []) => {
      const isCheckbox = groupSelectionType === "checkbox";

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {groupItems.map((addition) => {
            const isSelected = selectedAdditions.includes(addition._id);
            const additionName = addition.name?.[selectedLanguage] || addition.name?.en || "";
            const price = Number(addition.price);

            return (
              <div
                key={addition._id}
                onClick={() => onToggle(addition._id, isCheckbox, groupIds)}
                className={`
                  flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 select-none
                  ${
                    isSelected
                      ? "border-red-500 bg-red-50/40 shadow-sm"
                      : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }
                `}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  
                  {/* Indicator */}
                  <div
                    className={`
                      w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 transition-colors duration-200
                      ${
                        isSelected
                          ? isCheckbox
                            ? "bg-red-500 border-red-500"
                            : "bg-white border-red-500"
                          : "bg-white border-gray-300"
                      }
                      ${isCheckbox ? "rounded-md" : "rounded-full"}
                    `}
                  >
                    {isSelected &&
                      (isCheckbox ? (
                        <svg
                          className="w-3 h-3 text-white"
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
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                      ))}
                  </div>

                  {/* Name + Image */}
                  <div className="flex flex-col min-w-0">
                    {renderAdditionName(additionName, addition)}

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
      );
    };

    return (
      <div className="space-y-6">
        
        {/* Legacy additions (if any) */}
        {additions && additions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-base font-semibold block text-gray-800">
              {t("additions")}
            </Label>
            {renderAdditionsGroup(
              additions, 
              selectionType, 
              additions.map(a => a._id) // pass all group IDs for radio behavior exclusion
            )}
          </div>
        )}

        {/* Addition Categories (New) */}
        {additionCategories && additionCategories.length > 0 && (
          <div className="space-y-6">
            {additionCategories.map((cat, index) => {
              const catName = cat.name?.[selectedLanguage] || cat.name?.en || "";
              return (
                <div key={index} className="space-y-2">
                  <Label className="text-base font-semibold block text-gray-800">
                    {catName}
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      ({cat.selectionType === "checkbox" ? t("multiple_choices") : t("one_choice")})
                    </span>
                  </Label>
                  {renderAdditionsGroup(
                    cat.items || [], 
                    cat.selectionType, 
                    (cat.items || []).map(a => a._id) // Group IDs so radio deselects correctly
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    );
  }
);

AdditionsList.displayName = "AdditionsList";

export default AdditionsList;