import React from 'react';

interface ToggleSwitchProps {
    label: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => {
    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="ai-toggle" className="text-sm font-medium text-brand-text/80 select-none cursor-pointer" onClick={() => onChange(!enabled)}>
                {label}
            </label>
            <button
                id="ai-toggle"
                type="button"
                onClick={() => onChange(!enabled)}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-bg
                    ${enabled ? 'bg-brand-primary' : 'bg-brand-muted'}
                `}
                role="switch"
                aria-checked={enabled}
            >
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                        transition duration-200 ease-in-out
                        ${enabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
};
