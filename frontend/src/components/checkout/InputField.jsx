import React from "react";
import PropTypes from "prop-types";

/**
 * Reusable input field component with consistent styling
 * @component
 */
const InputField = React.memo(
  ({
    label,
    title,
    value,
    onChange,
    required = false,
    readOnly = false,
    type = "text",
    placeholder = "",
  }) => {
    return (
      <div className="space-y-2">
        <label
          htmlFor={label}
          className="block text-sm font-semibold text-gray-700"
        >
          {title} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={label}
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange && onChange(e.target.value)}
          className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-colors ${
            readOnly
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-gray-50 hover:bg-white"
          }`}
        />
      </div>
    );
  },
);

InputField.displayName = "InputField";

InputField.propTypes = {
  /** Unique identifier for the input field */
  label: PropTypes.string.isRequired,
  /** Display title/label text */
  title: PropTypes.string.isRequired,
  /** Current input value */
  value: PropTypes.string.isRequired,
  /** Change handler function */
  onChange: PropTypes.func,
  /** Whether the field is required */
  required: PropTypes.bool,
  /** Whether the field is read-only */
  readOnly: PropTypes.bool,
  /** Input type */
  type: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
};

export default InputField;
