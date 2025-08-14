"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`bg-fitfest-deep text-white px-4 py-2 rounded hover:bg-fitfest-bright transition-colors disabled:opacity-50 shadow-sm ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export default Button; 