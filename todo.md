# Application TODO and Setup Guide

This document outlines the necessary steps to configure and run this application, as well as future development tasks.

## 1. Local Development Setup

To run this application on your local machine, you need to complete the following configuration and setup steps.

### Prerequisites
- Python 3.x installed
- Node.js and npm installed

### Configuration

#### a. Google OAuth 2.0 Credentials
The `client_secret.json` file in the root directory contains placeholder values. To enable Google authentication, you must replace these with your actual Google Cloud OAuth 2.0 client credentials.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Create a new OAuth 2.0 Client ID.
3.  When prompted for the application type, select "Web application".
4.  Add `http://localhost:5001/auth/callback` to the list of "Authorized redirect URIs".
5.  Download the JSON credentials file and place its content into the `client_secret.json` file at the root of this project.

#### b. Enable Google APIs
Ensure the following APIs are enabled for your Google Cloud project:
-   **Google Drive API**
-   **Google Docs API**

### Running the Application

You need to run two separate processes in two different terminals.

**Terminal 1: Start the Backend Server**
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Run the Flask server
python backend/app.py
```
The backend will be running at `http://localhost:5001`.

**Terminal 2: Start the Frontend Development Server**
```bash
# Install Node.js dependencies
npm install

# Run the Vite development server
npm run dev
```
The frontend will be accessible at the URL provided by Vite (usually `http://localhost:5173`).

## 2. Production Deployment (High-Level Steps)

To deploy this application to a production environment, you would need to:

1.  **Choose a Hosting Provider**: A platform like Heroku, AWS, or Google Cloud Run that can host both a Python backend and a static React frontend.
2.  **Build the Frontend**: Run `npm run build` to create a production-ready build of the React application in the `dist` directory.
3.  **Configure the Backend to Serve Frontend**: Modify the Flask application to serve the static files from the `dist` directory.
4.  **Set Environment Variables**: Securely set the `client_secret.json` content as an environment variable on the server, instead of keeping it as a file.
5.  **Update Redirect URI**: Update your Google OAuth credentials to use your production URL for the redirect URI.

## 3. Future Development Tasks

The following items are critical for a production-ready application but have not yet been implemented.

-   **Implement a Database**:
    -   **Task**: Set up a persistent database (e.g., PostgreSQL, MongoDB).
    -   **Reason**: The application currently has no database. A database is required to securely store user information and project templates.

-   **Secure User Token Storage**:
    -   **Task**: Store user refresh tokens securely in the database, encrypted at rest.
    -   **Reason**: Currently, tokens are stored in the browser's session storage, which is not persistent or suitable for production. Storing encrypted refresh tokens in a database is essential for security.

-   **Save Project Templates**:
    -   **Task**: Allow users to save their project configurations (folder structure, linked template docs) to the database.
    -   **Reason**: This would allow users to reuse their templates across sessions, which is a key feature described in the technical documentation.
