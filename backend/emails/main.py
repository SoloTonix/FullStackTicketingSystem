import os
import base64
import time
import re
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# Django setup
import django
import sys

# Load environment variables first
load_dotenv()

# Configure Django
sys.path.append(str(Path.home() / 'Desktop' / 'TicketSys' / 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from emails.models import Mails

# Configuration - Load from environment variables
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
CHECK_INTERVAL = int(os.getenv('CHECK_INTERVAL', 60))
MAX_RESULTS = int(os.getenv('MAX_RESULTS', 10))
CREDENTIALS_PATH = os.getenv('CREDENTIALS_PATH', 'credentials.json')
REDIRECT_URI = os.getenv('REDIRECT_URI', 'http://localhost:8080/')

# Security-sensitive configuration
TOKEN_PATH = os.getenv('TOKEN_PATH', 'token.json')

# Email filtering criteria - could move to Django settings
INTERESTING_SENDERS = os.getenv('INTERESTING_SENDERS', 'solomonokuneye1developer@gmail.com').split(',')
INTERESTING_KEYWORDS = os.getenv('INTERESTING_KEYWORDS', 'Ticket,ID').split(',')
INTERESTING_SUBJECTS = os.getenv('INTERESTING_SUBJECTS', 'Caution').split(',')

def get_gmail_service():
    """Authenticate and return the Gmail API service."""
    creds = None
    
    # Load existing credentials if they exist
    if os.path.exists(TOKEN_PATH):
        try:
            creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
        except Exception as e:
            print(f"Error loading credentials: {e}")
            os.remove(TOKEN_PATH)  # Remove corrupted token file
    
    # Handle credential refresh or new auth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"Error refreshing token: {e}")
                creds = None
        
        if not creds:
            try:
                flow = InstalledAppFlow.from_client_secrets_file(
                    CREDENTIALS_PATH, 
                    SCOPES,
                    redirect_uri=REDIRECT_URI
                )
                creds = flow.run_local_server(
                    port=int(REDIRECT_URI.split(':')[-1].strip('/')),
                    authorization_prompt_message='Please visit this URL: {url}',
                    success_message='Authentication complete. You may close this tab.',
                    open_browser=True
                )
                
                # Save the credentials securely
                with open(TOKEN_PATH, 'w') as token:
                    token.write(creds.to_json())
                os.chmod(TOKEN_PATH, 0o600)  # Restrict file permissions
                    
            except Exception as e:
                print(f"Authentication failed: {e}")
                raise
    
    return build('gmail', 'v1', credentials=creds)

def get_message_details(service, message_id):
    """Get full details of a specific message."""
    message = service.users().messages().get(
        userId='me', 
        id=message_id,
        format='full'
    ).execute()
    
    headers = message.get('payload', {}).get('headers', [])
    details = {
        'message_id': message['id'],
        'from': '',
        'subject': '',
        'date': '',
        'body': ''
    }
    
    for header in headers:
        name = header.get('name', '').lower()
        if name in ['from', 'subject', 'date']:
            details[name] = header.get('value', '')
    
    # Extract body content
    parts = message.get('payload', {}).get('parts', [])
    if parts:
        for part in parts:
            if part['mimeType'] == 'text/plain':
                data = part['body'].get('data', '')
                details['body'] = base64.urlsafe_b64decode(data).decode('utf-8')
                break
    else:
        data = message.get('payload', {}).get('body', {}).get('data', '')
        if data:
            details['body'] = base64.urlsafe_b64decode(data).decode('utf-8')
    
    return details

def is_message_interesting(message_details):
    """Check if a message meets our interesting criteria."""
    sender = message_details.get('from', '').lower()
    subject = message_details.get('subject', '').lower()
    
    # Check if sender is in interesting list
    for interesting_sender in INTERESTING_SENDERS:
        if interesting_sender.lower() in sender:
            return True
    
    # Check if subject contains interesting keywords
    for keyword in INTERESTING_KEYWORDS:
        if keyword.lower() in subject:
            return True
    
    # Check if subject starts with interesting prefixes
    for prefix in INTERESTING_SUBJECTS:
        if subject.startswith(prefix.lower()):
            return True
    
    return False

def save_to_database(message_details):
    """Save interesting message to Django database."""
    try:
        # Extract email from "From" field (might be in format "Name <email@domain.com>")
        from_field = message_details.get('from', '')
        email_match = re.search(r'<(.+?)>', from_field)
        sender_email = email_match.group(1) if email_match else from_field
        
        # Parse date
        received_date = datetime.strptime(message_details['date'], '%a, %d %b %Y %H:%M:%S %z')
        
        # Create or update record
        Mails.objects.update_or_create(
            message_id=message_details['message_id'],
            defaults={
                'sender': sender_email,
                'subject': message_details.get('subject', 'No Subject'),
                'body_preview': message_details.get('body', '')[:500],  # Save first 500 chars
                'received_date': received_date,
                'processed': False
            }
        )
        return True
    except Exception as e:
        print(f"Error saving to database: {e}")
        return False

def check_new_messages(service, last_checked_date=None):
    """Check for new messages since last check."""
    query = ''
    if last_checked_date:
        query = f'after:{int(last_checked_date.timestamp())}'
    
    results = service.users().messages().list(
        userId='me',
        labelIds=['INBOX'],
        q=query,
        maxResults=MAX_RESULTS
    ).execute()
    
    messages = results.get('messages', [])
    interesting_messages = []
    
    for message in messages:
        details = get_message_details(service, message['id'])
        if is_message_interesting(details):
            if save_to_database(details):
                interesting_messages.append(details)
    
    return interesting_messages, datetime.now()

def main():
    print("Starting Gmail monitor with Django integration...")
    service = get_gmail_service()
    last_checked = None
    
    try:
        while True:
            print(f"\nChecking for new messages at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            interesting_messages, last_checked = check_new_messages(service, last_checked)
            
            if interesting_messages:
                print(f"\nSaved {len(interesting_messages)} interesting messages to database:")
                for msg in interesting_messages:
                    print(f"- {msg.get('subject', 'No Subject')} from {msg.get('from', 'Unknown')}")
            else:
                print("No interesting messages found.")
            
            print(f"Waiting {CHECK_INTERVAL} seconds until next check...")
            time.sleep(CHECK_INTERVAL)
    
    except KeyboardInterrupt:
        print("\nMonitoring stopped by user.")

if __name__ == '__main__':
    main()



