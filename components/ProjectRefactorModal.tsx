import React, { useState, useCallback } from 'react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Spinner } from './ui/Spinner';
import { SparklesIcon, FileIcon, TrashIcon } from './ui/Icons';
import type { FileSystemNode, ProjectChange } from '../types';
import { refactorProjectWorkspace } from '../services/geminiService';

interface ProjectRefactorModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceData: FileSystemNode[];
    projectDescription: string;
    onApplyChanges: (changes: ProjectChange[]) => void;
}

const getStatusStyles = (status: ProjectChange['status']) => {
    switch(status) {
        case 'CREATED': return 'bg-green-500/20 text-green-400';
        case 'UPDATED': return 'bg-yellow-500/20 text-yellow-400';
        case 'DELETED': return 'bg-red-500/20 text-red-400';
        default: return 'bg-brand-muted text-brand-text';
    }
}

export const ProjectRefactorModal: React.FC<ProjectRefactorModalProps> = ({
    isOpen, onClose, workspaceData, projectDescription, onApplyChanges
}) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [changes, setChanges] = useState<ProjectChange[] | null>(null);
    const [selectedChange, setSelectedChange] = useState<ProjectChange | null>(null);

    const handleGenerateChanges = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setChanges(null);
        setSelectedChange(null);
        try {
            const result = await refactorProjectWorkspace(prompt, workspaceData, projectDescription);
            if(result.length === 0) {
                 setError("The AI could not determine any changes for your request. Try being more specific.");
            } else {
                setChanges(result);
                setSelectedChange(result[0]);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApply = () => {
        if(changes) {
            onApplyChanges(changes);
            onClose();
        }
    }

    const handleClose = () => {
        // Reset state on close
        setPrompt('');
        setIsLoading(false);
        setError(null);
        setChanges(null);
        setSelectedChange(null);
        onClose();
    }
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div 
                className="bg-brand-surface rounded-xl shadow-2xl border border-brand-muted/20 w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-brand-muted/20">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="h-6 w-6 text-brand-primary" />
                        <h2 className="text-xl font-bold text-white">Project-Wide AI Refactor</h2>
                    </div>
                    <button onClick={handleClose} className="text-brand-muted hover:text-white">&times;</button>
                </header>
                
                <div className="flex-grow p-6 flex flex-col gap-4 overflow-y-auto">
                    <div>
                        <label htmlFor="refactor-prompt" className="block text-sm font-medium text-brand-text/80 mb-2">
                            What changes would you like to make to the project?
                        </label>
                        <Textarea 
                            id="refactor-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            placeholder='e.g., "Add a Redux store for user authentication" or "Convert all class components to functional components with hooks"'
                            disabled={isLoading}
                        />
                         {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                    </div>

                    {!changes && !isLoading && (
                        <div className="text-center py-4">
                            <Button onClick={handleGenerateChanges} disabled={!prompt.trim() || isLoading} size="md">
                                Generate Change Preview
                            </Button>
                        </div>
                    )}
                    
                    {isLoading && <div className="flex-grow flex flex-col items-center justify-center"><Spinner /><p className="mt-4">AI is analyzing your project...</p></div>}
                    
                    {changes && !isLoading && (
                         <div className="flex-grow grid grid-cols-12 gap-4 overflow-hidden">
                            <div className="col-span-4 overflow-y-auto pr-2">
                                <h3 className="text-lg font-semibold mb-2 text-white">Proposed Changes</h3>
                                <div className="space-y-2">
                                    {changes.map((change, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => setSelectedChange(change)}
                                            className={`w-full text-left p-2 rounded-md border text-sm transition-colors ${selectedChange === change ? 'bg-brand-primary/20 border-brand-primary/50' : 'bg-brand-surface border-brand-muted/20 hover:bg-brand-muted/30'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium truncate">{change.filePath}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyles(change.status)}`}>{change.status}</span>
                                            </div>
                                            {change.reasoning && <p className="text-xs text-brand-muted mt-1 truncate">{change.reasoning}</p>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-8 bg-brand-bg rounded-lg overflow-hidden flex flex-col">
                                {selectedChange ? (
                                    <>
                                        <div className="p-3 bg-brand-surface/50 border-b border-brand-muted/20 flex items-center gap-2">
                                            {selectedChange.status === 'DELETED' ? <TrashIcon className="h-5 w-5 text-red-400" /> : <FileIcon className="h-5 w-5 text-blue-400" />}
                                            <span className="font-mono text-sm text-white">{selectedChange.filePath}</span>
                                        </div>
                                        <div className="flex-grow overflow-y-auto">
                                            <pre className="p-4 text-xs font-mono text-brand-text whitespace-pre-wrap break-words">
                                                <code>{selectedChange.newContent ?? `// This file will be deleted.`}</code>
                                            </pre>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-brand-muted">Select a change to preview</div>
                                )}
                            </div>
                         </div>
                    )}
                </div>

                <footer className="p-4 border-t border-brand-muted/20 flex justify-end items-center gap-4">
                     <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                     {changes && (
                         <Button variant="primary" onClick={handleApply} disabled={isLoading}>
                             Apply {changes.length} Changes
                         </Button>
                     )}
                </footer>
            </div>
        </div>
    );
};
