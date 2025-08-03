import React, { useState, useCallback, useEffect } from 'react';
import { ProjectInputForm } from './components/ProjectInputForm';
import { WorkspaceDisplay } from './components/WorkspaceDisplay';
import { generateProjectWorkspace } from './services/geminiService';
import { generateLocalWorkspace } from './services/localWorkspaceService';
import { applyWorkspaceChanges } from './services/workspaceTreeUtils';
import type { ProjectInput, FileSystemNode, ProjectChange, UserProfile } from './types';
import { Documentation } from './components/Documentation';
import { ToggleSwitch } from './components/ui/ToggleSwitch';


const updateNodeInTree = (nodes: FileSystemNode[], id: string, newContent: string): FileSystemNode[] => {
    return nodes.map(node => {
        if (node.id === id) {
            return { ...node, content: newContent };
        }
        if (node.children) {
            return { ...node, children: updateNodeInTree(node.children, id, newContent) };
        }
        return node;
    });
};

const App: React.FC = () => {
    const [projectInput, setProjectInput] = useState<ProjectInput>({
        projectName: 'My New Web App',
        projectDescription: 'A responsive web application for managing tasks and collaborating with team members.',
        placeholders: [
            { id: crypto.randomUUID(), name: 'CLIENT_NAME', value: 'ACME Corp' },
            { id: crypto.randomUUID(), name: 'PROJECT_LEAD', value: 'John Doe' },
            { id: crypto.randomUUID(), name: 'START_DATE', value: '2024-08-15' },
        ],
        fileStructure: `src/\n  components/\n    Button.tsx\n    Modal.tsx\n  pages/\n    HomePage.tsx\n    AboutPage.tsx\ndocs/\n  ProjectBrief.md\n  APIDocumentation.md\npublic/\n  images/`,
    });
    const [workspaceData, setWorkspaceData] = useState<FileSystemNode[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'workspace' | 'documentation'>('workspace');
    const [templates, setTemplates] = useState<Record<string, ProjectInput>>({});
    const [isAiEnabled, setIsAiEnabled] = useState<boolean>(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isCreatingInDrive, setIsCreatingInDrive] = useState<boolean>(false);
    const [driveCreationSuccess, setDriveCreationSuccess] = useState<string | null>(null);
    const [driveCreationError, setDriveCreationError] = useState<string | null>(null);


    const handleCreateInDrive = async () => {
        if (!workspaceData) {
            setDriveCreationError("No workspace data to create in Google Drive.");
            return;
        }
        setIsCreatingInDrive(true);
        setDriveCreationSuccess(null);
        setDriveCreationError(null);
        try {
            const response = await fetch('/api/drive/create-folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workspaceData }),
            });
            const result = await response.json();
            if (response.ok) {
                setDriveCreationSuccess(result.message);
            } else {
                setDriveCreationError(result.error || 'An unknown error occurred.');
            }
        } catch (error) {
            setDriveCreationError('Failed to connect to the server.');
        } finally {
            setIsCreatingInDrive(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data);
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        try {
            const savedTemplates = localStorage.getItem('project_templates');
            if (savedTemplates) {
                const parsedTemplates = JSON.parse(savedTemplates);

                // Simple migration: check if placeholders is a string and convert
                Object.keys(parsedTemplates).forEach(key => {
                    const template = parsedTemplates[key];
                    if (typeof template.placeholders === 'string') {
                        const names = template.placeholders.split(',').map(s => s.trim().replace(/[{}]/g, ''));
                        template.placeholders = names
                            .filter(name => name)
                            .map(name => ({
                                id: crypto.randomUUID(),
                                name: name,
                                value: ''
                            }));
                    } else if (!Array.isArray(template.placeholders)) {
                        template.placeholders = [];
                    }
                });
                
                setTemplates(parsedTemplates);
            }
        } catch (e) {
            console.error("Failed to load or migrate templates from localStorage", e);
            // In case of corrupted data, clear it
            localStorage.removeItem('project_templates');
        }
    }, []);

    const handleSaveTemplate = (name: string) => {
        if (!name.trim()) {
            alert("Template name cannot be empty.");
            return;
        }
        const newTemplates = { ...templates, [name]: projectInput };
        setTemplates(newTemplates);
        localStorage.setItem('project_templates', JSON.stringify(newTemplates));
    };

    const handleLoadTemplate = (name: string) => {
        if (templates[name]) {
            setProjectInput(templates[name]);
        }
    };

    const handleDeleteTemplate = (name: string) => {
        const newTemplates = { ...templates };
        delete newTemplates[name];
        setTemplates(newTemplates);
        localStorage.setItem('project_templates', JSON.stringify(newTemplates));
    };

    const handleGenerate = useCallback(async (input: ProjectInput) => {
        setIsLoading(true);
        setError(null);
        setWorkspaceData(null);
        try {
            let data: FileSystemNode[];
            if(isAiEnabled) {
                data = await generateProjectWorkspace(input);
            } else {
                data = generateLocalWorkspace(input.fileStructure);
            }
            setWorkspaceData(data);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred. Check the console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [isAiEnabled]);
    
    const handleContentUpdate = useCallback((nodeId: string, newContent: string) => {
        setWorkspaceData(prevData => {
            if (!prevData) return null;
            return updateNodeInTree(prevData, nodeId, newContent);
        });
    }, []);
    
    const handleProjectRefactor = useCallback((changes: ProjectChange[]) => {
        setWorkspaceData(prevData => {
            if (!prevData) return null;
            try {
                return applyWorkspaceChanges(prevData, changes);
            } catch (e) {
                console.error("Failed to apply refactor changes:", e);
                setError(e instanceof Error ? e.message : "An error occurred while applying changes.");
                return prevData; // Return original data on error
            }
        });
    }, []);


    const NavLink: React.FC<{
        currentView: typeof view,
        targetView: typeof view,
        onClick: () => void,
        children: React.ReactNode
    }> = ({ currentView, targetView, onClick, children }) => {
        const isActive = currentView === targetView;
        const classes = `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActive 
                ? 'bg-brand-primary text-white' 
                : 'text-brand-text/70 hover:bg-brand-surface hover:text-white'
        }`;
        return <button onClick={onClick} className={classes}>{children}</button>;
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
            <header className="flex items-center justify-between py-4 px-8 border-b border-brand-muted/20">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-wider">
                        <span className="text-brand-primary">Smart</span> Project Workspace Generator
                    </h1>
                    <p className="text-sm text-brand-text/70">Empowered with AI</p>
                </div>
                <nav className="flex items-center space-x-6">
                    <ToggleSwitch 
                        label="AI Mode"
                        enabled={isAiEnabled}
                        onChange={setIsAiEnabled}
                    />
                    <div className="flex items-center space-x-2">
                        <NavLink currentView={view} targetView="workspace" onClick={() => setView('workspace')}>
                            Generator
                        </NavLink>
                        <NavLink currentView={view} targetView="documentation" onClick={() => setView('documentation')}>
                            Documentation
                        </NavLink>
                    </div>
                    <div className="flex items-center space-x-4">
                        {userProfile ? (
                            <div className="flex items-center space-x-2">
                                <img src={userProfile.picture} alt={userProfile.name} className="w-8 h-8 rounded-full" />
                                <span className="text-sm font-medium text-white">{userProfile.name}</span>
                            </div>
                        ) : (
                            <a href="http://localhost:5001/auth/google" className="px-4 py-2 rounded-md text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors">
                                Login with Google
                            </a>
                        )}
                        {userProfile && workspaceData && (
                            <button
                                onClick={handleCreateInDrive}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                                Create in Google Drive
                            </button>
                        )}
                    </div>
                </nav>
            </header>
            
            {view === 'workspace' ? (
                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-screen-2xl mx-auto">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <ProjectInputForm 
                            input={projectInput}
                            onInputChange={setProjectInput}
                            onGenerate={handleGenerate} 
                            isLoading={isLoading}
                            templates={Object.keys(templates)}
                            onSaveTemplate={handleSaveTemplate}
                            onLoadTemplate={handleLoadTemplate}
                            onDeleteTemplate={handleDeleteTemplate}
                            isAiEnabled={isAiEnabled}
                         />
                    </div>
                    <div className="lg:col-span-8 xl:col-span-9">
                        {isCreatingInDrive && (
                            <div className="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg" role="alert">
                                Creating folders in Google Drive...
                            </div>
                        )}
                        {driveCreationSuccess && (
                            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
                                {driveCreationSuccess}
                            </div>
                        )}
                        {driveCreationError && (
                            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                                {driveCreationError}
                            </div>
                        )}
                        <WorkspaceDisplay 
                            workspaceData={workspaceData} 
                            isLoading={isLoading} 
                            error={error} 
                            onContentUpdate={handleContentUpdate}
                            onProjectRefactor={handleProjectRefactor}
                            projectName={projectInput.projectName}
                            projectDescription={projectInput.projectDescription}
                            isAiEnabled={isAiEnabled}
                        />
                    </div>
                </main>
            ) : (
                <main className="p-8 md:p-12 max-w-screen-lg mx-auto">
                    <Documentation />
                </main>
            )}
        </div>
    );
};

export default App;
