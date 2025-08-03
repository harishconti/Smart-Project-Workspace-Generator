
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
    return (
        <input
            className={`
                block w-full px-3 py-2 bg-brand-surface border border-brand-muted/50 rounded-md shadow-sm 
                placeholder-brand-muted text-brand-text 
                focus:outline-none focus:ring-brand-primary focus:border-brand-primary 
                sm:text-sm transition-colors
                ${className}
            `}
            {...props}
        />
    );
};
