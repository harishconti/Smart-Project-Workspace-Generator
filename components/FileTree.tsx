
import React, { useState } from 'react';
import type { FileSystemNode } from '../types';
import { FolderIcon, FileIcon, ChevronDownIcon, ChevronRightIcon } from './ui/Icons';

interface FileTreeProps {
    nodes: FileSystemNode[];
    onSelectFile: (file: FileSystemNode) => void;
    selectedFile: FileSystemNode | null;
    level?: number;
}

interface TreeNodeProps {
    node: FileSystemNode;
    onSelectFile: (file: FileSystemNode) => void;
    selectedFile: FileSystemNode | null;
    level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onSelectFile, selectedFile, level }) => {
    const [isOpen, setIsOpen] = useState(true);

    const isFolder = node.type === 'folder';
    const isSelected = selectedFile?.id === node.id;

    const handleClick = () => {
        if (isFolder) {
            setIsOpen(!isOpen);
        }
        onSelectFile(node);
    };

    const basePadding = 1; // rem
    const paddingLeft = `${basePadding + level * 1.25}rem`;
    
    const buttonClasses = `flex items-center w-full text-left p-1.5 rounded-md cursor-pointer hover:bg-brand-primary/20 transition-colors duration-150`;
    const finalClasses = `${buttonClasses} ${isSelected && !isFolder ? 'bg-brand-primary/30 text-white' : ''}`;


    return (
        <div>
            <button onClick={handleClick} className={finalClasses} style={{ paddingLeft }}>
                {isFolder ? (
                    isOpen ? <ChevronDownIcon className="mr-2 flex-shrink-0" /> : <ChevronRightIcon className="mr-2 flex-shrink-0" />
                ) : (
                    <div className="w-5 mr-2 flex-shrink-0"></div> // Spacer for file icon alignment
                )}
                
                {isFolder ? <FolderIcon className="mr-2 text-yellow-400 flex-shrink-0" /> : <FileIcon className="mr-2 text-blue-400 flex-shrink-0" />}

                <span className="truncate flex-grow">{node.name}</span>
            </button>
            {isFolder && isOpen && node.children && (
                 <div className="w-full">
                    <FileTree nodes={node.children} onSelectFile={onSelectFile} selectedFile={selectedFile} level={level + 1} />
                </div>
            )}
        </div>
    );
};

export const FileTree: React.FC<FileTreeProps> = ({ nodes, onSelectFile, selectedFile, level = 0 }) => {
    return (
        <div className="space-y-1">
            {nodes.map((node) => (
                <TreeNode key={node.id} node={node} onSelectFile={onSelectFile} selectedFile={selectedFile} level={level} />
            ))}
        </div>
    );
};