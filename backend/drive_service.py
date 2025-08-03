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

def copy_file(credentials_info, file_id, new_name, parent_id):
    """
    Copies a file in Google Drive.

    :param credentials_info: A dictionary with the user's credentials.
    :param file_id: The ID of the file to copy.
    :param new_name: The name of the new file.
    :param parent_id: The ID of the parent folder for the new file.
    :return: The ID of the copied file.
    """
    credentials = Credentials(**credentials_info)
    service = build('drive', 'v3', credentials=credentials)

    copy_metadata = {
        'name': new_name,
        'parents': [parent_id]
    }

    copied_file = service.files().copy(
        fileId=file_id,
        body=copy_metadata,
        fields='id'
    ).execute()

    return copied_file.get('id')

def replace_text_in_doc(credentials_info, doc_id, replacements):
    """
    Replaces text in a Google Doc.

    :param credentials_info: A dictionary with the user's credentials.
    :param doc_id: The ID of the Google Doc.
    :param replacements: A list of tuples, where each tuple is (text_to_find, text_to_replace).
    """
    credentials = Credentials(**credentials_info)
    service = build('docs', 'v1', credentials=credentials)

    requests = []
    for text_to_find, text_to_replace in replacements:
        requests.append({
            'replaceAllText': {
                'containsText': {
                    'text': text_to_find,
                    'matchCase': True
                },
                'replaceText': text_to_replace
            }
        })

    if requests:
        body = {'requests': requests}
        service.documents().batchUpdate(documentId=doc_id, body=body).execute()
        print(f"Updated document with ID: {doc_id}")
