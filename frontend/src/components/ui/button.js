import React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
    variants: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    },
    sizes: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    }
};

const Button = ({ className, variant = "default", size = "default", ...props }) => {
    // Handle different variants
    const getVariantClasses = () => {
        switch (variant) {
            case "outline":
                return "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100";
            case "destructive":
                return "bg-red-500 text-white hover:bg-red-600";
            case "ghost":
                return "hover:bg-gray-100 hover:text-gray-900";
            case "link":
                return "text-teal-500 underline-offset-4 hover:underline";
            default:
                return "bg-teal-500 text-white hover:bg-teal-600";
        }
    };

    // Handle different sizes
    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return "h-8 rounded-md px-3 text-xs";
            case "lg":
                return "h-12 rounded-md px-8 text-base";
            case "icon":
                return "h-9 w-9";
            default:
                return "h-10 rounded-md px-4 py-2 text-sm";
        }
    };

    return (
        <button
            className={`inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${getVariantClasses()} ${getSizeClasses()} ${className || ""}`}
            {...props}
        />
    );
};

Button.displayName = "Button";

export { Button, buttonVariants }; 