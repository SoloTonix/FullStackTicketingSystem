import os
import base64
from datetime import datetime, timedelta
import time
import re
import requests
from msal import ConfidentialClientApplication
import django
import sys

# Django setup (same as your original)
sys.path.append('C:/Users/solomon/Desktop/TicketSys/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from emails.models import Mails  # Import your model

# Configuration
CHECK_INTERVAL = 60  # seconds between checks
MAX_RESULTS = 10     # number of emails to check each time

# Microsoft App Registration Details
CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
TENANT_ID = 'YOUR_TENANT_ID'
AUTHORITY = f'https://login.microsoftonline.com/{TENANT_ID}'
SCOPES = ['https://graph.microsoft.com/.default']

# Email filtering criteria (similar to your Gmail version)
INTERESTING_SENDERS = ['support@retailsupermarkets.com']
INTERESTING_KEYWORDS = ['Ticket', 'ID']
INTERESTING_SUBJECTS = ['Caution:']

def get_outlook_service():
    """Authenticate and return a Microsoft Graph API session"""
    app = ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )
    
    result = app.acquire_token_for_client(scopes=SCOPES)
    
    if "access_token" in result:
        headers = {
            'Authorization': 'Bearer ' + result['access_token'],
            'Content-Type': 'application/json'
        }
        return headers
    else:
        raise Exception(result.get("error_description", "Authentication failed"))

def get_message_details(headers, message_id):
    """Get full details of a specific message"""
    endpoint = f'https://graph.microsoft.com/v1.0/me/messages/{message_id}'
    response = requests.get(endpoint, headers=headers)
    message = response.json()
    
    details = {
        'message_id': message['id'],
        'from': message['from']['emailAddress']['address'],
        'subject': message.get('subject', ''),
        'date': message['receivedDateTime'],
        'body': message.get('body', {}).get('content', '')
    }
    
    return details

def is_message_interesting(message_details):
    """Same filtering logic as your Gmail version"""
    sender = message_details.get('from', '').lower()
    subject = message_details.get('subject', '').lower()
    
    for interesting_sender in INTERESTING_SENDERS:
        if interesting_sender.lower() in sender:
            return True
    
    for keyword in INTERESTING_KEYWORDS:
        if keyword.lower() in subject:
            return True
    
    for prefix in INTERESTING_SUBJECTS:
        if subject.startswith(prefix.lower()):
            return True
    
    return False

def save_to_database(message_details):
    """Same database saving logic as your original"""
    try:
        received_date = datetime.strptime(
            message_details['date'].split('.')[0], 
            '%Y-%m-%dT%H:%M:%S'
        )
        
        Mails.objects.update_or_create(
            message_id=message_details['message_id'],
            defaults={
                'sender': message_details['from'],
                'subject': message_details.get('subject', 'No Subject'),
                'body_preview': message_details.get('body', '')[:500],
                'received_date': received_date,
                'processed': False
            }
        )
        return True
    except Exception as e:
        print(f"Error saving to database: {e}")
        return False

def check_new_messages(headers, last_checked_date=None):
    """Check for new messages with Microsoft Graph API"""
    endpoint = 'https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages'
    params = {
        '$top': MAX_RESULTS,
        '$orderby': 'receivedDateTime DESC',
        '$select': 'id,from,subject,receivedDateTime'
    }
    
    if last_checked_date:
        params['$filter'] = f"receivedDateTime gt {last_checked_date.isoformat()}"
    
    response = requests.get(endpoint, headers=headers, params=params)
    messages = response.json().get('value', [])
    interesting_messages = []
    
    for message in messages:
        details = get_message_details(headers, message['id'])
        if is_message_interesting(details):
            if save_to_database(details):
                interesting_messages.append(details)
    
    return interesting_messages, datetime.now()

def main():
    print("Starting Outlook monitor with Django integration...")
    headers = get_outlook_service()
    last_checked = None
    
    try:
        while True:
            print(f"\nChecking for new messages at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            interesting_messages, last_checked = check_new_messages(headers, last_checked)
            
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