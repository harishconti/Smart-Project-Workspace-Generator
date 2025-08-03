from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

def create_folders_in_drive(credentials_info, workspace_data, parent_id=None):
    """
    Recursively creates folders in Google Drive based on the workspace data.

    :param credentials_info: A dictionary with the user's credentials.
    :param workspace_data: A list of file system nodes.
    :param parent_id: The ID of the parent folder in Google Drive.
    """
    credentials = Credentials(**credentials_info)
    service = build('drive', 'v3', credentials=credentials)

    for node in workspace_data:
        if node['type'] == 'folder':
            file_metadata = {
                'name': node['name'],
                'mimeType': 'application/vnd.google-apps.folder'
            }
            if parent_id:
                file_metadata['parents'] = [parent_id]

            folder = service.files().create(body=file_metadata, fields='id').execute()
            print(f"Created folder: {node['name']} with id: {folder.get('id')}")

            if node.get('children'):
                create_folders_in_drive(credentials_info, node['children'], parent_id=folder.get('id'))
