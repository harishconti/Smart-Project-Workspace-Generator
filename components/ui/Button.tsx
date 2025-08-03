
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'danger' | 'secondary' | 'danger-ghost';
    size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
    const baseClasses = `
        inline-flex items-center justify-center border border-transparent 
        font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-offset-brand-bg
        disabled:cursor-not-allowed transition-colors duration-200
    `;
    
    const variantClasses = {
        primary: 'text-white bg-brand-primary hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-brand-muted',
        danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-brand-muted',
        secondary: 'text-brand-text/90 bg-brand-surface hover:bg-brand-muted/70 focus:ring-brand-primary disabled:bg-brand-surface/50 disabled:text-brand-muted',
        'danger-ghost': 'bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 disabled:text-brand-muted/50 disabled:bg-transparent'
    };
    
    const sizeClasses = {
        md: 'px-4 py-2 text-base',
        sm: 'px-3 py-1.5 text-sm'
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
