
import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { SaveIcon, TrashIcon } from './ui/Icons';

interface TemplateControlsProps {
    templates: string[];
    onSave: (name: string) => void;
    onLoad: (name: string) => void;
    onDelete: (name: string) => void;
}

export const TemplateControls: React.FC<TemplateControlsProps> = ({ templates, onSave, onLoad, onDelete }) => {
    const [newTemplateName, setNewTemplateName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const handleSave = () => {
        onSave(newTemplateName);
        setNewTemplateName('');
    };
    
    const handleLoad = () => {
        if(selectedTemplate) {
            onLoad(selectedTemplate);
        }
    }
    
    const handleDelete = () => {
        if(selectedTemplate && confirm(`Are you sure you want to delete the "${selectedTemplate}" template?`)) {
            onDelete(selectedTemplate);
            setSelectedTemplate('');
        }
    }

    return (
        <div className="space-y-4 rounded-lg border border-brand-muted/20 p-4">
            <h3 className="text-base font-semibold text-white">Template Manager</h3>
            {templates.length > 0 && (
                <div className="space-y-2">
                    <label htmlFor="load-template" className="block text-sm font-medium text-brand-text/80">Load Existing Template</label>
                    <div className="flex gap-2">
                        <select
                            id="load-template"
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="block w-full px-3 py-2 bg-brand-surface border border-brand-muted/50 rounded-md shadow-sm text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            <option value="">Select a template...</option>
                            {templates.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <Button type="button" onClick={handleLoad} disabled={!selectedTemplate} title="Load Template">Load</Button>
                        <Button type="button" variant="danger-ghost" onClick={handleDelete} disabled={!selectedTemplate} title="Delete Template">
                           <TrashIcon className="h-5 w-5"/>
                        </Button>
                    </div>
                </div>
            )}
            <div className="space-y-2">
                 <label htmlFor="save-template" className="block text-sm font-medium text-brand-text/80">Save Current as Template</label>
                <div className="flex gap-2">
                    <Input
                        id="save-template"
                        placeholder="New template name..."
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                    />
                    <Button type="button" onClick={handleSave} disabled={!newTemplateName.trim()} title="Save Template">
                       <SaveIcon className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
