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

## 2. Low-Cost Production Deployment

This section provides a guide for deploying the application with minimal to no cost, using services with generous free tiers.

### Recommended Services
-   **Backend**: [Render](https://render.com/) (Free tier for web services)
-   **Frontend**: [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/) (Free tier for static sites)
-   **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free shared cluster) or [PlanetScale](https://planetscale.com/) (Free tier for SQL)

### Deployment Steps

#### a. Frontend Deployment (Netlify/Vercel)
1.  Push your project to a GitHub, GitLab, or Bitbucket repository.
2.  Sign up for Netlify or Vercel and connect your Git repository.
3.  Configure the build settings:
    -   **Build Command**: `npm run build`
    -   **Publish Directory**: `dist`
4.  Deploy the site. Netlify/Vercel will give you a public URL (e.g., `your-project.netlify.app`).

#### b. Backend Deployment (Render)
1.  In your Flask app (`backend/app.py`), you'll need to add a CORS (Cross-Origin Resource Sharing) configuration to allow requests from your frontend's URL. You can use the `flask-cors` library.
2.  Sign up for Render and create a new "Web Service".
3.  Connect the same Git repository.
4.  Configure the service settings:
    -   **Environment**: Python 3
    -   **Build Command**: `pip install -r backend/requirements.txt`
    -   **Start Command**: `gunicorn backend.app:app` (You'll need to add `gunicorn` to your `requirements.txt`)
5.  Add your `client_secret.json` content as a secret file or individual environment variables in the Render dashboard.
6.  Render will provide a public URL for your backend (e.g., `your-backend.onrender.com`).

#### c. Final Configuration
1.  **Update Backend URL in Frontend**: In your frontend code, make sure any API requests point to your new backend URL on Render.
2.  **Update Google OAuth Redirect URI**: Go back to the Google Cloud Console and add your backend's callback URL (e.g., `https://your-backend.onrender.com/auth/callback`) to the authorized redirect URIs.

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
