import os
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying, ensure you have the correct scope for writing to your file
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

def get_sheet_data():
    """Fetches data from Google Sheets"""
    creds = None
    # The file token.json stores the user's access and refresh tokens.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        # Call the Sheets API
        service = build('sheets', 'v4', credentials=creds)
        sheet = service.spreadsheets()

        # Replace with your actual sheet ID and range
        SAMPLE_SPREADSHEET_ID = 'your-spreadsheet-id-here'
        SAMPLE_RANGE_NAME = 'Sheet1!A2:E'  # Adjust your range
        result = sheet.values().get(spreadsheetId=SAMPLE_SPREADSHEET_ID,
                                     range=SAMPLE_RANGE_NAME).execute()
        values = result.get('values', [])

        return values

    except HttpError as err:
        print(f"An error occurred: {err}")
        return None

def format_speaker_data(speakers):
    """Converts the sheet data into the desired TS format"""
    template = '''

