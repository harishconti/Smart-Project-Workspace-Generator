
import type { FileSystemNode } from '../types';

interface NodeWithLevel {
    level: number;
    node: FileSystemNode;
}

export const generateLocalWorkspace = (structureString: string): FileSystemNode[] => {
    const lines = structureString.split('\n').filter(line => line.trim() !== '');

    const nodesWithLevels: NodeWithLevel[] = lines.map(line => {
        // Assume 2 spaces for indentation, adjust if needed
        const level = (line.match(/^\s*/) || [''])[0].length / 2;
        const trimmedLine = line.trim();
        const isFolder = trimmedLine.endsWith('/');
        const name = isFolder ? trimmedLine.slice(0, -1).trim() : trimmedLine;

        const node: FileSystemNode = {
            id: crypto.randomUUID(),
            name,
            type: isFolder ? 'folder' : 'file',
            children: isFolder ? [] : undefined,
            content: isFolder ? undefined : '',
        };

        return {
            level,
            node,
        };
    }).filter(item => item.node.name); // Filter out empty or whitespace-only lines

    const rootNodes: FileSystemNode[] = [];
    const parentStack: NodeWithLevel[] = [];

    for (const currentNode of nodesWithLevels) {
        // Pop from stack until the parent is found
        while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= currentNode.level) {
            parentStack.pop();
        }

        const parent = parentStack.length > 0 ? parentStack[parentStack.length - 1].node : null;

        if (parent && parent.type === 'folder' && parent.children) {
            parent.children.push(currentNode.node);
        } else {
            // This is a root node
            rootNodes.push(currentNode.node);
        }

        // If the current node is a folder, push it onto the stack to become a potential parent
        if (currentNode.node.type === 'folder') {
            parentStack.push(currentNode);
        }
    }

    return rootNodes;
};
