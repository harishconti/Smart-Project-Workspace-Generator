
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
    return (
        <textarea
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
