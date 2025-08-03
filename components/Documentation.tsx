import React from 'react';
import { Card } from './ui/Card';
import { PencilSquareIcon, SparklesIcon, LightbulbIcon, DownloadIcon } from './ui/Icons';

const StepCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-brand-surface/50 rounded-lg p-6 text-center border border-brand-muted/20 transform hover:scale-105 hover:border-brand-primary/50 transition-all duration-300 h-full flex flex-col">
        <div className="flex justify-center items-center mb-4">
            <div className="bg-brand-primary/20 p-3 rounded-full">
                {icon}
            </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-brand-text/70 flex-grow">{children}</p>
    </div>
);

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8 last:mb-0">
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        {children}
    </div>
);

export const Documentation: React.FC = () => {
    return (
        <div className="space-y-12">
            <header className="text-center">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                    Getting Started
                </h1>
                <p className="mt-4 text-lg text-brand-text/70 max-w-2xl mx-auto">
                    Unlock the full potential of the Workspace Generator. Here’s everything you need to know.
                </p>
            </header>

            <section>
                <h2 className="text-3xl font-bold text-center text-white mb-8">From Idea to Code in 4 Steps</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StepCard icon={<LightbulbIcon className="h-8 w-8 text-brand-primary" />} title="1. Define">
                        Got an idea? Describe your project, set up template variables, and optionally outline your desired file structure.
                    </StepCard>
                    <StepCard icon={<SparklesIcon className="h-8 w-8 text-brand-primary" />} title="2. Generate">
                        Our AI analyzes your input and builds a complete, logical file and folder structure with relevant boilerplate content.
                    </StepCard>
                    <StepCard icon={<PencilSquareIcon className="h-8 w-8 text-brand-primary" />} title="3. Edit & Refine">
                        Click any file to open the editor. Make changes manually, or use the integrated AI to rewrite and improve your code.
                    </StepCard>
                    <StepCard icon={<DownloadIcon className="h-8 w-8 text-brand-primary" />} title="4. Download">
                        Once you're happy with the structure and content, download the entire workspace as a .zip file with a single click.
                    </StepCard>
                </div>
            </section>
            
            <Card className="p-6 sm:p-8">
                <div className="prose prose-invert max-w-none prose-p:text-brand-text/90 prose-headings:text-white prose-li:text-brand-text/90 prose-strong:text-white prose-a:text-brand-secondary prose-code:text-yellow-400 prose-code:bg-brand-bg prose-code:p-1 prose-code:rounded-md">
                    
                    <DetailSection title="A Deeper Dive into the Inputs">
                        <p>The quality of the generated workspace depends heavily on the quality of your input. Here’s a breakdown of each field.</p>
                        
                        <h4>Project Name & Description</h4>
                        <p>
                            In AI Mode, these are the most important fields. Describe what your project is, its main purpose, the technologies you plan to use (e.g., "a React app with TypeScript," "a Python data analysis project," "a marketing campaign plan"), and any other key details. The AI uses this description to infer a logical file structure and content.
                        </p>
                        
                        <h4>Template Variables</h4>
                        <p>
                           This dynamic list allows you to define key/value pairs that will be used throughout your project (in AI Mode).
                        </p>
                        <ul>
                            <li><strong>Name:</strong> This is the placeholder token the AI will insert, like <code>CLIENT_NAME</code>.</li>
                            <li><strong>Value:</strong> This is the actual text that will replace the placeholder, like <code>ACME Corp</code>.</li>
                        </ul>
                        <p>
                           After generation, the app will automatically find every instance of <code>{'{{CLIENT_NAME}}'}</code> in your files and file names, and replace it with <code>ACME Corp</code>. Use the "Add Variable" button to create as many as you need.
                        </p>
                        
                        <h4>Project Structure Input</h4>
                        <p>
                          This field changes based on the mode. In AI mode, it's an optional outline. In Manual Mode, it's a required blueprint that is followed exactly.
                        </p>
                    </DetailSection>

                    <DetailSection title="AI vs. Manual Mode">
                        <p>This application provides two powerful ways to generate your workspace, controlled by the "AI Mode" toggle in the header.</p>
                        <ul>
                            <li><strong>AI Mode (Default):</strong> This mode leverages the full power of Gemini AI. Provide a rich description, variables, and an optional structure outline, and the AI will generate a complete, context-aware project with relevant boilerplate content in each file. Use this for creative brainstorming and generating feature-complete starting points.</li>
                            <li><strong>Manual Mode:</strong> When you toggle AI Mode off, the app becomes a lightning-fast local generator. It will precisely create the empty files and folders exactly as you define them in the "Define Project Structure" input. AI-related fields are hidden for a streamlined experience. Use this when you know the exact structure you need and want it created instantly.</li>
                        </ul>
                    </DetailSection>

                    <DetailSection title="Managing Your Templates">
                        <p>Save time by reusing your project configurations with the Template Manager (only available in AI mode).</p>
                         <ul>
                            <li><strong>Save:</strong> Enter a name in the "Save Current as Template" field and click the save icon. This saves everything from the form above.</li>
                            <li><strong>Load:</strong> Select a saved template from the dropdown and click "Load" to instantly populate the entire form.</li>
                            <li><strong>Delete:</strong> Select a template and click the trash icon to permanently remove it.</li>
                        </ul>
                    </DetailSection>
                    
                    <DetailSection title="Downloading Your Workspace">
                        <p>After your workspace is generated, a "Download .zip" button will appear in the header of the review panel. Clicking this will package all your files and folders into a single zip archive, named after your project, and download it to your computer. This is perfect for getting started with your favorite code editor immediately.</p>
                    </DetailSection>


                    <DetailSection title="Pro Tips for Best Results">
                        <div className="flex items-start space-x-4 bg-brand-primary/10 p-4 rounded-lg border border-brand-primary/30">
                            <LightbulbIcon className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
                            <div>
                                <h5 className="font-bold text-white">Be Specific! (AI Mode)</h5>
                                <p className="!mt-1">The more context you provide in the description (e.g., "a Next.js e-commerce site using Stripe for payments"), the more tailored and useful your generated workspace will be.</p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4 bg-brand-primary/10 p-4 rounded-lg border border-brand-primary/30 mt-4">
                             <SparklesIcon className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
                             <div>
                                <h5 className="font-bold text-white">Leverage the AI Editor</h5>
                                <p className="!mt-1">Use the 'Update with AI' feature for more than just fixing typos. Ask it to 'add error handling', 'refactor this into a React hook', or 'translate this document to Spanish'. Be specific with your requests!</p>
                            </div>
                         </div>
                    </DetailSection>

                     <div className="text-center text-brand-muted mt-12">
                        <p>Remember: this tool has a folder nesting limit of 3 levels to ensure performance in AI mode.</p>
                    </div>

                </div>
            </Card>
        </div>
    );
};