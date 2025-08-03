
import React from 'react';

interface SpinnerProps {
    size?: 'md' | 'sm';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
    const sizeClasses = {
        md: "h-12 w-12",
        sm: "h-4 w-4"
    }
    return (
         <div
            className={`animate-spin rounded-full border-b-2 border-t-2 border-brand-primary ${sizeClasses[size]} ${className}`}
            role="status"
        >
             <span className="sr-only">Loading...</span>
        </div>
    );
};