# Current Functionality (Version 0.1)

This document outlines the core features and capabilities of the "Smart Project Workspace Generator" application as of its initial version.

## Key Features

-   **AI-Powered Project Scaffolding**: Generates files, folders, and relevant boilerplate content based on a natural language project description using the Google Gemini API.
-   **Project-Wide AI Refactoring**: Performs complex, multi-file refactors across the entire workspace with a single, high-level prompt. The AI analyzes the project and proposes a set of changes (creations, updates, deletions) for user review.
-   **In-Browser File Explorer & Editor**: Allows users to review and modify the generated files and folder structure directly in the browser before downloading.
-   **AI Content Assistant**: Provides file-specific AI assistance. Users can prompt the AI to rewrite or improve the content of an individual file (e.g., "add JSDoc comments to this function").
-   **Dual-Mode Operation**:
    -   **AI Mode**: Leverages AI for generation, providing a rich, context-aware project starter.
    -   **Manual Mode**: A fast, local-only mode to generate an exact folder/file structure from a text outline, without AI interaction.
-   **Dynamic Template Variables**: Supports defining key-value placeholders (e.g., `{{CLIENT_NAME}}`) that are automatically substituted with their values throughout the generated files and folder names.
-   **Template Management**: Enables users to save their project input configurations (description, variables, structure) as named templates for quick reuse. Templates are stored in the browser's `localStorage`.
-   **Download as .zip**: Packages the entire generated workspace into a downloadable zip file, ready for use in a local development environment.
-   **Responsive UI**: The interface is designed with Tailwind CSS to be responsive and usable across different screen sizes.

## How It Works

### 1. Generation
-   **AI Mode**: The user's inputs (project name, description, variables, structure outline) are compiled into a detailed prompt. This prompt is sent to the Gemini API with a strict JSON schema to ensure a valid file tree structure in the response.
-   **Manual Mode**: A local service parses a text outline with indentation to create a precise file and folder structure without any API calls.

### 2. Refinement
-   **File Editing**: A built-in text editor allows for manual changes to file content.
-   **AI Editing**: For a specific file, a user can provide a prompt (e.g., "refactor this to use async/await"), and the AI will generate the updated content.
-   **Project-Wide Refactoring**: The AI is given the context of the entire project (all files and their content) and a user's prompt. It returns a structured list of proposed changes for the user to review and approve.

### 3. Export
-   The final workspace, including all AI-generated or manually edited content, can be downloaded as a single `.zip` archive.

## Technical Stack (Client-Side)

-   **Framework**: React 19
-   **Language**: TypeScript
-   **AI**: Google Gemini API (`@google/genai`)
-   **Styling**: Tailwind CSS
-   **Dependencies**: Loaded via ESM on `esm.sh` using an `importmap` in `index.html`. No build step (e.g., Vite, Webpack) is required.
-   **Packaging**: JSZip for in-browser zip file creation.
