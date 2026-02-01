import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent',
    secondary: 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-sm',
    outline: 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-blue-50 hover:text-blue-700',
    danger: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm', // Using Indigo as "Dark Blue/Danger" alternative to Red
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled,
    icon: Icon,
    ...props
}) {
    const variantClass = variants[variant] || variants.primary;
    const sizeClass = sizes[size] || sizes.md;

    return (
        <button
            className={`
        inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClass} ${sizeClass} ${className}
      `}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {children}
                </>
            ) : (
                <>
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {children}
                </>
            )}
        </button>
    );
}
