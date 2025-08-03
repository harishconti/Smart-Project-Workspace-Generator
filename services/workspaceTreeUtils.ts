import type { FileSystemNode, ProjectChange } from '../types';

const findNodeAndParent = (
    nodes: FileSystemNode[],
    path: string
): { node: FileSystemNode; parent: FileSystemNode | null; parentArray: FileSystemNode[] } | null => {
    const pathParts = path.split('/');
    let currentNodes = nodes;
    let parent: FileSystemNode | null = null;

    for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const node = currentNodes.find(n => n.name === part);

        if (!node) return null; // Not found

        if (i === pathParts.length - 1) {
            return { node, parent, parentArray: currentNodes };
        }

        if (node.type === 'folder' && node.children) {
            parent = node;
            currentNodes = node.children;
        } else {
            return null; // Path traverses a file or a folder without children array
        }
    }
    return null;
};

const ensureDirectoryExists = (nodes: FileSystemNode[], path: string): FileSystemNode[] => {
    if (!path) return nodes;

    const pathParts = path.split('/');
    let currentLevel = nodes;

    for (const part of pathParts) {
        if (!part) continue;
        let folderNode = currentLevel.find(n => n.name === part && n.type === 'folder');

        if (!folderNode) {
            folderNode = {
                id: crypto.randomUUID(),
                name: part,
                type: 'folder',
                children: []
            };
            currentLevel.push(folderNode);
        }
        
        if (!folderNode.children) { // Ensure children array exists
            folderNode.children = [];
        }
        currentLevel = folderNode.children;
    }
    return currentLevel;
};


export const applyWorkspaceChanges = (originalNodes: FileSystemNode[], changes: ProjectChange[]): FileSystemNode[] => {
    const newNodes = JSON.parse(JSON.stringify(originalNodes)); // Deep copy

    // Sort changes: Deletes -> Updates -> Creates
    changes.sort((a, b) => {
        const order = { 'DELETED': 0, 'UPDATED': 1, 'CREATED': 2 };
        return order[a.status] - order[b.status];
    });

    for (const change of changes) {
        if (!change.filePath) continue;
        const pathParts = change.filePath.split('/');
        const fileName = pathParts.pop() || '';
        const dirPath = pathParts.join('/');

        if (change.status === 'DELETED') {
            const result = findNodeAndParent(newNodes, change.filePath);
            if (result) {
                const index = result.parentArray.findIndex(n => n.id === result.node.id);
                if (index > -1) {
                    result.parentArray.splice(index, 1);
                }
            }
        } else if (change.status === 'UPDATED') {
            const result = findNodeAndParent(newNodes, change.filePath);
            if (result && result.node.type === 'file') {
                result.node.content = change.newContent;
            }
        } else if (change.status === 'CREATED') {
            const parentChildren = ensureDirectoryExists(newNodes, dirPath);
            const existingFile = parentChildren.find(n => n.name === fileName);

            if (!existingFile) {
                parentChildren.push({
                    id: crypto.randomUUID(),
                    name: fileName,
                    type: 'file',
                    content: change.newContent || '',
                });
            } else if (existingFile.type === 'file') {
                // If AI wants to create a file that exists, treat it as an update.
                existingFile.content = change.newContent;
            }
        }
    }

    return newNodes;
};
