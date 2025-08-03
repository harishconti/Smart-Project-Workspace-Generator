
import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectInput, FileSystemNode, TemplateVariable, ProjectChange } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Recursively adds a unique ID to each node in the file system tree.
const addUUIDs = (nodes: Omit<FileSystemNode, 'id'>[]): FileSystemNode[] => {
    return nodes.map(node => ({
        ...node,
        id: crypto.randomUUID(),
        children: node.children ? addUUIDs(node.children) : undefined,
    }));
};

// Recursively substitutes placeholders in file/folder names and content.
const substitutePlaceholders = (nodes: FileSystemNode[], placeholders: TemplateVariable[]): FileSystemNode[] => {
    if (!placeholders || placeholders.length === 0) {
        return nodes;
    }

    const performSubstitution = (text: string): string => {
        if(!text) return text;
        let result = text;
        
        // Sort placeholders by length descending to replace longer matches first 
        // (e.g., to prevent 'API_URL' from replacing 'API_URL_BASE' incorrectly)
        const sortedPlaceholders = [...placeholders].sort((a, b) => b.name.length - a.name.length);

        for (const placeholder of sortedPlaceholders) {
            if (placeholder.name.trim()) {
                // Regex to find {{VAR_NAME}} with optional whitespace, globally
                const regex = new RegExp(`{{\\s*${placeholder.name.trim()}\\s*}}`, 'g');
                result = result.replace(regex, placeholder.value);
            }
        }
        return result;
    };

    const traverseAndSubstitute = (nodesToScan: FileSystemNode[]): FileSystemNode[] => {
        return nodesToScan.map(node => {
            const newNode = { ...node };

            // Substitute in node name
            newNode.name = performSubstitution(newNode.name);

            // Substitute in file content
            if (newNode.type === 'file' && newNode.content) {
                newNode.content = performSubstitution(newNode.content);
            }

            // Recurse for children
            if (newNode.children) {
                newNode.children = traverseAndSubstitute(newNode.children);
            }

            return newNode;
        });
    };

    return traverseAndSubstitute(nodes);
};


// Schema definitions remain the same
const fileOnlyNodeSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["file"], description: "The type must be 'file' at this depth." },
    name: { type: Type.STRING },
    content: { type: Type.STRING, nullable: true },
  },
  required: ["type", "name"],
};

const fileSystemNodeSchemaL3 = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["file", "folder"] },
    name: { type: Type.STRING },
    content: { type: Type.STRING, nullable: true },
    children: {
      type: Type.ARRAY,
      nullable: true,
      items: fileOnlyNodeSchema,
    },
  },
  required: ["type", "name"],
};

const fileSystemNodeSchemaL2 = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["file", "folder"] },
    name: { type: Type.STRING },
    content: { type: Type.STRING, nullable: true },
    children: {
      type: Type.ARRAY,
      nullable: true,
      items: fileSystemNodeSchemaL3,
    },
  },
  required: ["type", "name"],
};

const fileSystemNodeSchemaL1 = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["file", "folder"], description: "The type of the node." },
    name: { type: Type.STRING, description: "The name of the file or folder." },
    content: { type: Type.STRING, nullable: true, description: "The content of the file (if type is 'file')." },
    children: {
      type: Type.ARRAY,
      nullable: true,
      items: fileSystemNodeSchemaL2,
      description: "A list of child nodes (if type is 'folder')."
    },
  },
  required: ["type", "name"],
};


export const generateProjectWorkspace = async (input: ProjectInput): Promise<FileSystemNode[]> => {
    const { projectName, projectDescription, placeholders, fileStructure } = input;

    const placeholdersList = placeholders
        .filter(p => p.name.trim() !== '')
        .map(p => `- The variable {{${p.name.trim()}}} should be used where its value ("${p.value.trim()}") is relevant.`)
        .join('\n');

    const prompt = `
        Based on the following project details, generate a comprehensive file and folder structure.
        The output must be a JSON array of objects following the provided schema.

        Project Name: ${projectName}
        Project Description: ${projectDescription}
        
        Key Placeholders/Variables:
        The AI should use the variable name (e.g., {{CLIENT_NAME}}) in the generated file templates. The user has provided the following variables and their intended values.
        ${placeholdersList || 'None provided.'}
        
        IMPORTANT: Use the placeholder variables *exactly* as provided (e.g., {{CLIENT_NAME}}). Do not create variations or attempt to perform calculations within the placeholders (e.g., DO NOT generate things like {{START_DATE + 4 weeks}}).

        Requested File/Folder Structure Outline:
        ${fileStructure || 'User did not provide a specific structure. Create a logical structure based on the project description. Common structures include folders for "src", "docs", "assets", "tests", "project_management", etc.'}

        Guidelines:
        1.  Create a root-level structure as a JSON array.
        2.  For each item, specify 'type' ('folder' or 'file'), and 'name'.
        3.  Folders can contain a 'children' array of other files or folders.
        4.  Files should have a 'content' property with relevant boilerplate or template text. Use Markdown for formatting.
        5.  Incorporate the provided placeholders where appropriate in file content and names.
        6.  Generate realistic and helpful content for template files (e.g., a README.md, a project brief, a component file).
        7.  The folder structure must not be nested too deeply. A folder at the third level of nesting (e.g., root/level1/level2/level3) can ONLY contain files, not other sub-folders. This means the maximum folder depth is 3 levels from the root.
        8.  If appropriate for the project type (e.g., Node.js, web app), include a comprehensive .gitignore file at the root level.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: fileSystemNodeSchemaL1,
                },
            },
        });

        const jsonString = response.text.trim();
        if (!jsonString) {
          throw new Error("The AI returned an empty response.");
        }
        const generatedData = JSON.parse(jsonString);
        
        const workspaceWithIds = addUUIDs(generatedData);
        
        // Substitute placeholders with their actual values
        const workspaceWithSubstitutions = substitutePlaceholders(workspaceWithIds, placeholders);

        return workspaceWithSubstitutions;
    } catch (error) {
        console.error("Error generating workspace from Gemini:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the AI's response, which was not valid JSON. This can happen with complex requests. Try simplifying your structure description.");
        }
        throw new Error("Failed to generate project workspace. The AI returned an error or an invalid structure. Please try again with a clearer description.");
    }
};


export const updateFileContent = async (
    prompt: string,
    context: { fileName: string; oldContent: string; projectDescription: string }
): Promise<string> => {
    const fullPrompt = `
        You are an expert programmer and document writer.
        A user wants to update a file in their project.
        
        Project Description: ${context.projectDescription}
        File Name: ${context.fileName}
        
        User's Request: "${prompt}"

        Current File Content:
        ---
        ${context.oldContent}
        ---

        Based on the user's request, please generate the new, complete content for the file "${context.fileName}".
        Only output the raw file content, with no extra explanations, commentary, or markdown code blocks around the content.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.2, // Lower temperature for more predictable, focused edits
            }
        });
        return response.text;
    } catch (error) {
         console.error("Error updating content from Gemini:", error);
         throw new Error("Failed to update file content with AI. Please try again.");
    }
};


// Helper to stringify the project structure for the AI prompt
const projectTreeToString = (nodes: FileSystemNode[], indent = ''): string => {
    let result = '';
    for (const node of nodes) {
        result += `${indent}${node.name}${node.type === 'folder' ? '/' : ''}\n`;
        if (node.type === 'folder' && node.children) {
            result += projectTreeToString(node.children, indent + '  ');
        }
    }
    return result;
};

const projectFilesToString = (nodes: FileSystemNode[], pathPrefix = ''): string => {
    let result = '';
    for (const node of nodes) {
        const currentPath = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
        if (node.type === 'file') {
            result += `
--- START OF FILE: ${currentPath} ---
${node.content || ''}
--- END OF FILE: ${currentPath} ---
`;
        }
        if (node.type === 'folder' && node.children) {
            result += projectFilesToString(node.children, currentPath);
        }
    }
    return result;
};

export const refactorProjectWorkspace = async (
    userPrompt: string,
    nodes: FileSystemNode[],
    projectDescription: string
): Promise<ProjectChange[]> => {
    const projectStructure = projectTreeToString(nodes);
    const projectFiles = projectFilesToString(nodes);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                filePath: { type: Type.STRING, description: "The full path of the file to modify, create, or delete, from the project root. E.g., 'src/components/NewComponent.tsx'" },
                status: { type: Type.STRING, enum: ["CREATED", "UPDATED", "DELETED"], description: "The action to perform on the file." },
                newContent: { type: Type.STRING, nullable: true, description: "The full new content of the file for CREATED or UPDATED actions. Should be null for DELETED actions." },
                reasoning: { type: Type.STRING, nullable: true, description: "A brief explanation of why this change is being made." }
            },
            required: ["filePath", "status"]
        }
    };

    const prompt = `
        You are an expert AI programmer tasked with refactoring a project.
        Project Description: ${projectDescription}

        User's Refactoring Request: "${userPrompt}"

        Current Project Structure:
        ${projectStructure}

        Current Project Files and Content:
        ${projectFiles}

        Based on the user's request, please provide a list of changes to be made to the project.
        - Analyze the request and determine which files need to be created, updated, or deleted.
        - For UPDATED files, provide the *entire* new content of the file, not just a diff.
        - For CREATED files, provide the full content for the new file.
        - For DELETED files, you do not need to provide content.
        - File paths must be relative to the project root.
        - Provide a brief reasoning for each change, if you think it adds clarity.
        - If the request is ambiguous, too broad, or cannot be fulfilled, return an empty array.

        The output must be a JSON array of objects following the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.1, // Lower temp for more deterministic refactoring
            },
        });

        const jsonString = response.text.trim();
        if (!jsonString) {
          throw new Error("The AI returned an empty response. The request may be too ambiguous.");
        }
        const changes: ProjectChange[] = JSON.parse(jsonString);
        return changes;

    } catch (error) {
        console.error("Error refactoring workspace from Gemini:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the AI's response, which was not valid JSON.");
        }
        throw new Error("Failed to refactor project. The AI returned an error or an invalid response.");
    }
};
