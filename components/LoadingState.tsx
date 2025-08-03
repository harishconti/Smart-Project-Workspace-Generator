import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './ui/Icons';

const loadingMessages = [
    "Consulting with the digital architects...",
    "Analyzing your project blueprint...",
    "Scaffolding the digital framework...",
    "Brewing some fresh code...",
    "Polishing the file structures...",
    "Warming up the AI's neural network...",
    "Assembling bytes into brilliance...",
    "Finalizing the AI's masterpiece...",
];

export const LoadingState: React.FC = () => {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % loadingMessages.length;
            setMessage(loadingMessages[index]);
        }, 2500); // Change message every 2.5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="relative flex items-center justify-center w-40 h-40">
                {/* Background animation layers */}
                <div className="absolute w-full h-full rounded-full bg-brand-primary/10 animate-pulse"></div>
                <div 
                    className="absolute w-full h-full rounded-full bg-brand-primary/10 animate-pulse" 
                    style={{ animationDelay: '0.5s' }}
                ></div>
                <div 
                    className="absolute w-full h-full rounded-full bg-brand-primary/10 animate-pulse"
                    style={{ animationDelay: '1s' }}
                ></div>
                
                {/* Central Icon */}
                <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-brand-surface border-2 border-brand-primary/20">
                     <SparklesIcon className="w-12 h-12 text-brand-primary" />
                </div>
            </div>

            <h3 className="mt-8 text-xl font-semibold text-white transition-opacity duration-500">{message}</h3>
            <p className="mt-2 text-brand-text/70">The AI is working its magic. Please wait a moment.</p>
        </div>
    );
};