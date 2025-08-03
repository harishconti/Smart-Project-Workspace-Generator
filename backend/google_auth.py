import os
import json
from google_auth_oauthlib.flow import Flow

# This is the file that contains the client secrets.
CLIENT_SECRETS_FILE = "client_secret.json"

# This is the scope that we will request from the user.
SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.profile']

def get_flow():
    """
    Creates a Google OAuth2 flow object.
    """
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri='http://localhost:5001/auth/callback')
    return flow
