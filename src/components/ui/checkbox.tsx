"use client";

import * as React from "react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onCheckedChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
      if (props.onChange) {
        props.onChange(event);
      }
    };

    return (
      <input
        type="checkbox"
        className={`form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${className || ''}`}
        ref={ref}
        {...props}
        onChange={handleChange}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };