import React, { useState, useEffect } from 'react';
import type { FileSystemNode } from '../types';
import { updateFileContent } from '../services/geminiService';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { SaveIcon, SparklesIcon } from './ui/Icons';
import { Spinner } from './ui/Spinner';


interface DocumentViewerProps {
    file: FileSystemNode | null;
    onUpdateContent: (nodeId: string, newContent: string) => void;
    projectDescription: string;
    isAiEnabled: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ file, onUpdateContent, projectDescription, isAiEnabled }) => {
    const [editedContent, setEditedContent] = useState<string>('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setEditedContent(file?.content || '');
        setAiPrompt('');
        setError(null);
    }, [file]);
    
    if (!file) {
        return (
            <div className="flex items-center justify-center h-full text-brand-muted p-4">
                <p>Select a file from the explorer to view or edit its content.</p>
            </div>
        );
    }
    
    if (file.type === 'folder') {
        return (
            <div className="flex items-center justify-center h-full text-brand-muted p-4">
                <p>Select a file to see its content. You have selected a folder.</p>
            </div>
        );
    }

    const handleSave = () => {
        onUpdateContent(file.id, editedContent);
    };

    const handleAiUpdate = async () => {
        if (!aiPrompt.trim()) return;
        setIsRegenerating(true);
        setError(null);
        try {
            const newContent = await updateFileContent(aiPrompt, {
                fileName: file.name,
                oldContent: editedContent,
                projectDescription: projectDescription,
            });
            setEditedContent(newContent);
            onUpdateContent(file.id, newContent); // Auto-save after AI update
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred');
        } finally {
            setIsRegenerating(false);
        }
    };
    
    const isPristine = file.content === editedContent;

    return (
        <div className="flex flex-col h-full bg-brand-bg">
            <header className="flex items-center justify-between p-3 border-b border-brand-muted/20 flex-shrink-0">
                <h3 className="font-semibold text-white truncate" title={file.name}>{file.name}</h3>
                <Button onClick={handleSave} disabled={isPristine || isRegenerating} size="sm">
                    <SaveIcon className="mr-2 h-4 w-4" />
                    <span>{isPristine ? 'Saved' : 'Save Changes'}</span>
                </Button>
            </header>
            
            <div className="flex-grow relative">
                <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-full p-4 bg-brand-surface border-0 rounded-none font-mono text-sm resize-none focus:outline-none focus:ring-0"
                    placeholder="File content..."
                    spellCheck="false"
                />
            </div>

            {isAiEnabled && (
                <footer className="p-4 border-t border-brand-muted/20 flex-shrink-0 space-y-3 bg-brand-surface">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-brand-primary" />
                        <label htmlFor="ai-prompt" className="text-sm font-medium text-white">Update with AI</label>
                    </div>
                    <Textarea 
                        id="ai-prompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={2}
                        className="text-sm"
                        placeholder={`e.g., "add JSDoc comments to this function" or "refactor this to use async/await"`}
                        disabled={isRegenerating}
                    />
                    <div className="flex items-center justify-between">
                         <div className="text-xs text-red-400 h-4">
                            {error && <p>{error}</p>}
                        </div>
                        <Button onClick={handleAiUpdate} disabled={isRegenerating || !aiPrompt.trim()} size="sm">
                            {isRegenerating ? (
                                <><Spinner size="sm" className="mr-2" /> Regenerating...</>
                            ) : (
                               'Generate & Save'
                            )}
                        </Button>
                    </div>
                </footer>
            )}
        </div>
    );
};