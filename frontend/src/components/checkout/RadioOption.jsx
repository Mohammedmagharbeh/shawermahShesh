import React from "react";
import PropTypes from "prop-types";

/**
 * Radio button option component with consistent styling
 * @component
 */
const RadioOption = React.memo(({ label, checked, onChange, name }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-red-500 focus:ring-red-500 cursor-pointer"
      />
      <span className="group-hover:text-red-600 transition-colors">
        {label}
      </span>
    </label>
  );
});

RadioOption.displayName = "RadioOption";

RadioOption.propTypes = {
  /** Display label for the radio option */
  label: PropTypes.string.isRequired,
  /** Whether this option is selected */
  checked: PropTypes.bool.isRequired,
  /** Change handler function */
  onChange: PropTypes.func.isRequired,
  /** Radio group name */
  name: PropTypes.string,
};

export default RadioOption;
