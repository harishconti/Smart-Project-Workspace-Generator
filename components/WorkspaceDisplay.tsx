import React, { useState, useEffect } from 'react';
import type { FileSystemNode, ProjectChange } from '../types';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { FileTree } from './FileTree';
import { DocumentViewer } from './DocumentViewer';
import { DownloadIcon, SparklesIcon } from './ui/Icons';
import { Button } from './ui/Button';
import JSZip from 'jszip';
import { LoadingState } from './LoadingState';
import { ProjectRefactorModal } from './ProjectRefactorModal';

interface WorkspaceDisplayProps {
    workspaceData: FileSystemNode[] | null;
    isLoading: boolean;
    error: string | null;
    onContentUpdate: (nodeId: string, newContent: string) => void;
    onProjectRefactor: (changes: ProjectChange[]) => void;
    projectName: string;
    projectDescription: string;
    isAiEnabled: boolean;
}

const WelcomeState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 3.104l-1.12 2.242-2.48.36-1.8 1.8.36 2.48-1.12 2.242L5 14.998l1.12-2.242 2.48-.36 1.8-1.8-.36-2.48L9.75 3.104zm4.5 0l-1.12 2.242-2.48.36-1.8 1.8.36 2.48-1.12 2.242L9.5 14.998l1.12-2.242 2.48-.36 1.8-1.8-.36-2.48L14.25 3.104zm4.5 0l-1.12 2.242-2.48.36-1.8 1.8.36 2.48-1.12 2.242L14 14.998l1.12-2.242 2.48-.36 1.8-1.8-.36-2.48L18.75 3.104zM5.75 16.104l1.12 2.242 2.48.36 1.8 1.8-.36 2.48 1.12 2.242L12 21.998l-1.12-2.242-2.48-.36-1.8-1.8.36-2.48-1.12-2.242z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-white">Your AI-Generated Workspace</h3>
        <p className="mt-2 text-brand-text/70">Fill out the form to your left to generate a new project structure. Your files and folders will appear here.</p>
    </div>
);


export const WorkspaceDisplay: React.FC<WorkspaceDisplayProps> = ({ 
    workspaceData, isLoading, error, onContentUpdate, onProjectRefactor, projectName, projectDescription, isAiEnabled
}) => {
    const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
    const [isZipping, setIsZipping] = useState<boolean>(false);
    const [highlightDownload, setHighlightDownload] = useState<boolean>(false);
    const [isRefactorModalOpen, setIsRefactorModalOpen] = useState(false);

    useEffect(() => {
        // Find the first file in the new workspace data and select it
        if (workspaceData) {
            let firstFile: FileSystemNode | null = null;
            const findFirstFile = (nodes: FileSystemNode[]) => {
                for (const node of nodes) {
                    if (node.type === 'file') {
                        firstFile = node;
                        return;
                    }
                    if (node.children) {
                        findFirstFile(node.children);
                    }
                    if (firstFile) return;
                }
            };
            findFirstFile(workspaceData);
            setSelectedFile(firstFile);

            // Trigger highlight animation
            setHighlightDownload(true);
            const timer = setTimeout(() => setHighlightDownload(false), 2500); // Animate for 2.5 seconds
            return () => clearTimeout(timer);
        } else {
             setSelectedFile(null);
        }
    }, [workspaceData]);

    const handleDownload = async () => {
        if (!workspaceData) return;
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const addNodesToZip = (nodes: FileSystemNode[], folder: JSZip) => {
                nodes.forEach(node => {
                    if (node.type === 'folder') {
                        const childFolder = folder.folder(node.name);
                        if(childFolder && node.children) {
                             addNodesToZip(node.children, childFolder);
                        }
                    } else {
                        folder.file(node.name, node.content || '');
                    }
                });
            }

            addNodesToZip(workspaceData, zip);
            
            const content = await zip.generateAsync({ type: 'blob' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            const sanitizedProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${sanitizedProjectName || 'workspace'}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (e) {
            console.error("Failed to create zip file", e);
        } finally {
            setIsZipping(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <LoadingState />;
        }
        if (error) {
            return <div className="p-8 text-center text-red-400">
                <h3 className="font-bold text-lg">Generation Failed</h3>
                <p className="mt-2">{error}</p>
            </div>;
        }
        if (!workspaceData) {
            return <WelcomeState />;
        }
        return (
             <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-full">
                <div className="md:col-span-4 lg:col-span-4 xl:col-span-3 border-r border-brand-muted/20 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-white p-4 sticky top-0 bg-brand-surface z-10 border-b border-brand-muted/20">File Explorer</h3>
                    <div className="p-2">
                        <FileTree nodes={workspaceData} onSelectFile={setSelectedFile} selectedFile={selectedFile} />
                    </div>
                </div>
                <div className="md:col-span-8 lg:col-span-8 xl:col-span-9 overflow-hidden h-full">
                     <DocumentViewer 
                        file={selectedFile}
                        onUpdateContent={onContentUpdate}
                        projectDescription={projectDescription}
                        isAiEnabled={isAiEnabled}
                     />
                </div>
            </div>
        );
    };

    return (
        <Card className="min-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-brand-muted/20">
                <h2 className="text-xl font-semibold text-white">2. Review & Edit Your Workspace</h2>
                <div className="flex items-center gap-2">
                     {isAiEnabled && workspaceData && !isLoading && (
                        <Button 
                            onClick={() => setIsRefactorModalOpen(true)}
                            variant="secondary"
                            size="md"
                        >
                           <SparklesIcon className="h-4 w-4 mr-2" />
                           AI Refactor Project
                        </Button>
                    )}
                    {workspaceData && !isLoading && (
                        <Button 
                            onClick={handleDownload}
                            disabled={isZipping}
                            size="md"
                            variant="primary"
                            className={highlightDownload ? 'animate-pulse' : ''}
                        >
                           {isZipping ? <Spinner size="sm" className="mr-2" /> : <DownloadIcon className="h-4 w-4 mr-2" />}
                           {isZipping ? 'Zipping...' : 'Download .zip'}
                        </Button>
                    )}
                </div>
            </div>
            <div className="flex-grow relative">
                {renderContent()}
            </div>
            {isRefactorModalOpen && workspaceData && (
                 <ProjectRefactorModal
                    isOpen={isRefactorModalOpen}
                    onClose={() => setIsRefactorModalOpen(false)}
                    workspaceData={workspaceData}
                    projectDescription={projectDescription}
                    onApplyChanges={onProjectRefactor}
                 />
            )}
        </Card>
    );
};
