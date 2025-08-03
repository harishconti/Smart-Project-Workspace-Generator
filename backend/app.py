import os
from flask import Flask, redirect, url_for, session, request, jsonify
from backend.google_auth import get_flow
from google.oauth2.credentials import Credentials
import google.auth.transport.requests
import requests

app = Flask(__name__)
# In a production app, this secret key should be loaded from a secure source
app.secret_key = os.urandom(24)

@app.route('/')
def hello_world():
    return 'Hello, World! The backend is running.'

@app.route('/auth/google')
def auth_google():
    """
    Redirects the user to Google's consent screen.
    """
    flow = get_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true')
    session['state'] = state
    return redirect(authorization_url)

@app.route('/auth/callback')
def auth_callback():
    """
    Handles the redirect from Google after the user grants permission.
    """
    state = session['state']
    flow = get_flow()
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

    return redirect(url_for('profile'))

@app.route('/api/profile')
def profile():
    """
    A protected route that returns the user's Google profile information.
    """
    if 'credentials' not in session:
        return redirect(url_for('auth_google'))

    credentials = Credentials(**session['credentials'])

    # We can use the credentials to make authenticated API calls.
    # For example, let's get the user's profile information.
    response = requests.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        headers={'Authorization': f'Bearer {credentials.token}'}
    )

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return "Failed to fetch profile information.", response.status_code


if __name__ == '__main__':
    # Using port 5001 as specified in the plan and client_secret.json
    app.run(debug=True, port=5001)

from backend.drive_service import create_folders_in_drive, copy_file, replace_text_in_doc

@app.route('/api/drive/create-document', methods=['POST'])
def create_document():
    """
    Creates a new document in Google Drive by copying a template and replacing text.
    """
    if 'credentials' not in session:
        return jsonify({'error': 'User not authenticated'}), 401

    data = request.get_json()
    template_id = data.get('templateId')
    new_name = data.get('newName')
    parent_id = data.get('parentId')
    replacements = data.get('replacements')

    if not all([template_id, new_name, parent_id, replacements]):
        return jsonify({'error': 'Missing required parameters'}), 400

    try:
        # 1. Copy the template document
        copied_doc_id = copy_file(session['credentials'], template_id, new_name, parent_id)

        # 2. Replace the text in the new document
        replace_text_in_doc(session['credentials'], copied_doc_id, replacements)

        return jsonify({'message': f'Successfully created document: {new_name}'})
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': 'Failed to create document in Google Drive.'}), 500

@app.route('/api/drive/create-folders', methods=['POST'])
def create_folders():
    """
    Creates folders in Google Drive based on the project structure.
    """
    if 'credentials' not in session:
        return jsonify({'error': 'User not authenticated'}), 401

    data = request.get_json()
    workspace_data = data.get('workspaceData')

    if not workspace_data:
        return jsonify({'error': 'Missing workspaceData'}), 400

    try:
        create_folders_in_drive(session['credentials'], workspace_data)
        return jsonify({'message': 'Folders created successfully in Google Drive.'})
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': 'Failed to create folders in Google Drive.'}), 500
