"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export default Button; 