import React from 'react';
import type { ProjectInput, TemplateVariable } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card } from './ui/Card';
import { TemplateControls } from './TemplateControls';
import { TrashIcon } from './ui/Icons';


interface ProjectInputFormProps {
    input: ProjectInput;
    onInputChange: (input: ProjectInput) => void;
    onGenerate: (input: ProjectInput) => void;
    isLoading: boolean;
    templates: string[];
    onSaveTemplate: (name: string) => void;
    onLoadTemplate: (name:string) => void;
    onDeleteTemplate: (name: string) => void;
    isAiEnabled: boolean;
}

export const ProjectInputForm: React.FC<ProjectInputFormProps> = ({ 
    input, onInputChange, onGenerate, isLoading,
    templates, onSaveTemplate, onLoadTemplate, onDeleteTemplate,
    isAiEnabled
}) => {
    const { projectName, projectDescription, placeholders, fileStructure } = input;

    const handleChange = (field: keyof Omit<ProjectInput, 'placeholders'>, value: string) => {
        onInputChange({ ...input, [field]: value });
    };

    const handlePlaceholderChange = (id: string, field: 'name' | 'value', value: string) => {
        const newPlaceholders = input.placeholders.map(p => 
            p.id === id ? { ...p, [field]: value } : p
        );
        onInputChange({ ...input, placeholders: newPlaceholders });
    };

    const addPlaceholder = () => {
        const newPlaceholders = [...input.placeholders, { id: crypto.randomUUID(), name: '', value: '' }];
        onInputChange({ ...input, placeholders: newPlaceholders });
    };

    const removePlaceholder = (id: string) => {
        const newPlaceholders = input.placeholders.filter(p => p.id !== id);
        onInputChange({ ...input, placeholders: newPlaceholders });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(input);
    };

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold text-white">1. {isAiEnabled ? 'Define Your Project' : 'Define Structure'}</h2>
                
                <div className="space-y-2">
                    <label htmlFor="projectName" className="block text-sm font-medium text-brand-text/80">Project Name</label>
                    <Input id="projectName" value={projectName} onChange={(e) => handleChange('projectName', e.target.value)} required />
                </div>
                
                {isAiEnabled && (
                    <>
                        <div className="space-y-2">
                            <label htmlFor="projectDescription" className="block text-sm font-medium text-brand-text/80">Project Description</label>
                            <Textarea id="projectDescription" value={projectDescription} onChange={(e) => handleChange('projectDescription', e.target.value)} rows={4} required />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-brand-text/80">Template Variables</label>
                            <div className="space-y-2">
                                {placeholders.map((p) => (
                                    <div key={p.id} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
                                        <Input
                                            placeholder="Variable Name"
                                            aria-label="Variable Name"
                                            value={p.name}
                                            onChange={(e) => handlePlaceholderChange(p.id, 'name', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Value"
                                            aria-label="Variable Value"
                                            value={p.value}
                                            onChange={(e) => handlePlaceholderChange(p.id, 'value', e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="danger-ghost"
                                            size="sm"
                                            onClick={() => removePlaceholder(p.id)}
                                            aria-label="Remove variable"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" size="sm" variant="secondary" onClick={addPlaceholder}>
                                Add Variable
                            </Button>
                        </div>
                    </>
                )}


                <div className="space-y-2">
                    <label htmlFor="fileStructure" className="block text-sm font-medium text-brand-text/80">
                         {isAiEnabled ? 'Describe Desired Structure (optional)' : 'Define Project Structure'}
                    </label>
                    <Textarea 
                        id="fileStructure" 
                        value={fileStructure} 
                        onChange={(e) => handleChange('fileStructure', e.target.value)} 
                        rows={8} 
                        placeholder={isAiEnabled ? "e.g., src/components/Button.tsx" : "src/\n  components/\n    Button.tsx"}
                        required={!isAiEnabled}
                    />
                     <p className="text-xs text-brand-muted">
                        {isAiEnabled 
                            ? "Use indentation to represent folders. AI will create a logical structure if left blank."
                            : "Use 2-space indentation for nesting. End folder names with a slash (e.g., 'components/')."
                        }
                    </p>
                </div>
                
                {isAiEnabled && (
                    <TemplateControls 
                        templates={templates}
                        onSave={onSaveTemplate}
                        onLoad={onLoadTemplate}
                        onDelete={onDeleteTemplate}
                    />
                )}

                <div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Generating...' : 'Generate Workspace'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};