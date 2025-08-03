# TODO

## Google OAuth 2.0 Credentials

The `client_secret.json` file contains placeholder values. To enable Google authentication, you must replace the placeholder values with your actual Google Cloud OAuth 2.0 client ID and secret.

You can create OAuth 2.0 credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

When creating the credentials, make sure to add `http://localhost:5001/auth/callback` to the list of authorized redirect URIs.
