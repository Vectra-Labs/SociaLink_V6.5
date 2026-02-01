import React from 'react';

const variants = {
    // All variants mapped to Blue scales per user request
    default: 'bg-slate-100 text-slate-800', // Neutral for basic tags
    success: 'bg-blue-100 text-blue-700',   // Light Blue for success
    warning: 'bg-blue-50 text-blue-600',    // Very Light Blue for warnings
    danger: 'bg-indigo-100 text-indigo-700', // Indigo (Darker Blue-ish) for danger
    blue: 'bg-blue-100 text-blue-700',       // Standard Blue
    dark: 'bg-blue-800 text-blue-50',        // Dark Blue
};

export function Badge({ children, variant = 'default', className = '', ...props }) {
    const variantClass = variants[variant] || variants.default;
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
