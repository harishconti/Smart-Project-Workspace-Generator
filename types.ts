
export interface TemplateVariable {
    id: string;
    name: string;
    value: string;
}

export interface ProjectInput {
    projectName: string;
    projectDescription: string;
    placeholders: TemplateVariable[];
    fileStructure: string;
}

export interface FileSystemNode {
    id: string;
    type: 'file' | 'folder';
    name:string;
    content?: string;
    children?: FileSystemNode[];
}

export interface ProjectChange {
    filePath: string;
    newContent?: string;
    status: 'CREATED' | 'UPDATED' | 'DELETED';
    reasoning?: string;
}

export interface UserProfile {
    name: string;
    picture: string;
}
