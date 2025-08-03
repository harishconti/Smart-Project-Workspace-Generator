# Smart Project Workspace Generator

An intelligent, AI-powered application designed to bootstrap entire project workspaces, including folder structures and document templates, directly from a user's high-level description.

## Table of Contents

-   [Overview](#overview)
-   [Key Features](#key-features)
-   [Tech Stack](#tech-stack)
-   [Application Architecture](#application-architecture)
-   [Setup & Running](#setup--running)
-   [How It Works](#how-it-works)
    -   [AI Mode](#ai-mode)
    -   [Manual Mode](#manual-mode)
    -   [AI Refactoring](#ai-refactoring)
-   [Future Roadmap](#future-roadmap)

## Overview

This application bridges the gap between idea and implementation by leveraging the power of the Google Gemini API. Users can describe a project in natural language (e.g., "A responsive web application for task management"), and the AI will generate a logical and complete starting point, including source files, documentation, configuration files, and more.

The goal is to eliminate the tedious, repetitive setup process for new projects, allowing developers to jump straight into building core features.

## Key Features

-   **AI-Powered Project Scaffolding**: Generates files, folders, and relevant boilerplate content based on a project description.
-   **Project-Wide AI Refactoring**: Perform complex, multi-file refactors across the entire workspace with a single prompt.
-   **In-Browser File Explorer & Editor**: Review and modify the generated files directly in the browser before downloading.
-   **AI Content Assistant**: Refine individual file content with targeted AI prompts (e.g., "add JSDoc comments").
-   **Dynamic Template Variables**: Define placeholders like `{{CLIENT_NAME}}` that are automatically substituted with their values throughout the generated workspace.
-   **Template Management**: Save, load, and delete project input configurations to quickly reuse common setups.
-   **Manual Fallback Mode**: For precise control, toggle off AI to quickly generate an exact file/folder structure from a text outline.
-   **Download as .zip**: Package the entire generated workspace into a downloadable zip file.
-   **Automated `.gitignore`**: The AI automatically includes a relevant `.gitignore` file for the specified project type.

## Tech Stack

This application is built with a modern, browser-native technology stack.

-   **Core Framework**: [**React 19**](https://react.dev/) for building the user interface.
-   **Language**: [**TypeScript**](https://www.typescriptlang.org/) for static typing and improved developer experience.
-   **AI Integration**: [**Google Gemini API**](https://ai.google.dev/) via the [`@google/genai`](https://www.npmjs.com/package/@google/genai) SDK for all generative capabilities.
-   **Styling**: [**Tailwind CSS**](https://tailwindcss.com/) for a utility-first CSS workflow.
-   **Client-Side Zipping**: [**JSZip**](https://stuk.github.io/jszip/) for creating the downloadable `.zip` archive in the browser.
-   **Module Loading**: Uses [**ESM modules**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) loaded directly from `esm.sh`. This setup requires no local bundler (like Vite or Webpack) for development.

## Application Architecture

The application is structured into several key directories:

-   `components/`: Contains all React components, broken down into UI elements (`ui/`) and feature-specific components.
-   `services/`: Holds the business logic, especially for interacting with external APIs or performing complex operations.
    -   `geminiService.ts`: Manages all communication with the Google Gemini API.
    -   `localWorkspaceService.ts`: Handles file structure generation in Manual Mode.
    -   `workspaceTreeUtils.ts`: Provides utility functions for manipulating the workspace file tree.
-   `types.ts`: Defines all TypeScript interfaces and types used across the application.
-   `App.tsx`: The main application component that manages state and orchestrates the different parts of the UI.
-   `index.html`: The entry point of the application, which includes the `importmap` for module resolution.

## Setup & Running

This application is designed to run in a specific browser-based development environment that handles module resolution and environment variables.

1.  **API Key**: The application requires a Google Gemini API key. This key **must** be available as an environment variable named `API_KEY`. The application is hardcoded to read `process.env.API_KEY`.
    ```javascript
    // In services/geminiService.ts
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    ```
2.  **Dependencies**: All dependencies are loaded remotely via an `importmap` in `index.html`. There is no `package.json` or `npm install` step.
3.  **Running**: Serve the `index.html` file through a local web server. The associated development environment should inject the necessary `process.env.API_KEY` variable.

## How It Works

### AI Mode

When "AI Mode" is enabled, the application uses the Gemini API for most of its functionality.

1.  **Generation**: The user's inputs (project name, description, variables, structure outline) are compiled into a detailed prompt. This prompt is sent to the Gemini API with a strict JSON schema defined for the response. The AI returns a JSON object representing the file tree, which is then rendered.
2.  **File Editing**: The AI can be prompted to rewrite or update the content of a single file. The existing content is sent along with the user's request for context.
3.  **Placeholder Substitution**: After the AI generates the workspace but before it's displayed, the application performs a find-and-replace for all defined template variables (e.g., `{{VAR}}`).

### Manual Mode

When "AI Mode" is disabled, the application runs entirely locally without any API calls. It parses the text in the "Define Project Structure" textarea, respecting indentation for nesting, and builds the corresponding file/folder structure.

### AI Refactoring

The Project-Wide Refactor feature is one of the most powerful capabilities:

1.  The entire current workspace (file paths and their contents) is serialized into a string.
2.  This serialized data, along with the user's refactoring prompt, is sent to the Gemini API.
3.  The API is instructed to return a list of changes (`CREATED`, `UPDATED`, `DELETED`) in a structured JSON format.
4.  The user is shown a preview of these changes.
5.  Upon confirmation, the `applyWorkspaceChanges` utility processes this list to programmatically update the workspace state.

## Future Roadmap

This section outlines the features required to evolve the application from its current state as a client-side code generator to the server-backed **Google Drive automation tool** described in the technical documentation. The current implementation is fundamentally different from the target architecture.

### Unimplemented Features (Gap Analysis)

The following core components from the technical documentation are not present in the current application:

1.  **Backend Server & Database**: The application is currently 100% client-side, running in the browser. The target architecture requires:
    -   A dedicated backend service (e.g., Node.js, Python/Flask).
    -   A persistent database (e.g., PostgreSQL, MongoDB) for storing user data, templates, and OAuth tokens. `localStorage` is currently used as a temporary substitute for template storage.

2.  **Google Integration**: The application does not currently interact with any user-specific Google services. The target requires:
    -   **Google OAuth 2.0**: Full user authentication flow to securely obtain permissions to a user's Google account.
    -   **Google Drive API Integration**: The ability to programmatically create nested folders and files directly within a user's Google Drive. The current app only creates a virtual structure for a `.zip` download.
    -   **Google Docs API Integration**: The ability to link to existing Google Docs as templates, create copies, and populate them with data by performing find-and-replace operations. The current app generates all file content with AI.

3.  **Server-Side Security Model**: The target architecture's security model is not applicable to the current client-side app. This includes:
    -   Server-side management of OAuth Client ID and Secret.
    -   Secure, encrypted, server-side storage of user refresh tokens.

### Prioritized Implementation Plan

To achieve the vision of the technical documentation, development should proceed in the following order of priority:

1.  **Priority 1: Establish Backend Infrastructure**
    -   **Task**: Set up a basic backend server (e.g., Node.js with Express) and a database.
    -   **Goal**: Create the foundation for all server-side logic, user management, and secure token handling. This is the most critical prerequisite.

2.  **Priority 2: Implement Google OAuth 2.0 Authentication**
    -   **Task**: Build the full OAuth 2.0 flow. The backend will handle the code-for-token exchange and securely store refresh tokens in the database.
    -   **Goal**: Enable users to securely log in with their Google account and grant the application the necessary `drive.file` and `documents` scopes.

3.  **Priority 3: Develop Google Drive Folder Generation**
    -   **Task**: Create a service that uses the authenticated user's token to call the Google Drive API (`files.create` with `mimeType: 'application/vnd.google-apps.folder'`).
    -   **Goal**: Allow users to define a folder structure that is then created in their "My Drive." This is the first deliverable feature for authenticated users.

4.  **Priority 4: Implement Google Docs Templating and Population**
    -   **Task**: Build the UI and backend logic for linking a Google Doc as a template. Use the Drive API (`files.copy`) to duplicate it and the Docs API (`documents.batchUpdate`) to perform find-and-replace operations for placeholders.
    -   **Goal**: Fulfill the core value proposition of populating templated documents with user-provided data directly within Google Drive.
