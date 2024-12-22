import os
from dotenv import load_dotenv

# Keep a .env file with all credentials at root level
load_dotenv()

MODE = os.getenv("MODE", "debug") 

# Logging settings
LOG_DIR = "logs"
CONSOLE_LOG_LEVEL = os.getenv("CONSOLE_LOG_LEVEL", "DEBUG").upper()
FILE_LOG_LEVEL = os.getenv("FILE_LOG_LEVEL", "INFO").upper()
ENABLE_COLORS = os.getenv("ENABLE_COLORS", "true").lower() == "true"

# Security and API tokens
WHATSAPP_API_TOKEN = os.getenv("WHATSAPP_API_TOKEN", "")
THIRD_PARTY_API_KEY = os.getenv("THIRD_PARTY_API_KEY", "")

# Other project settings
FLOW_DIR = "flows"
DATASET_DIR = "datasets"

# Whatsapp Account Credentials
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "")
PHONE_NUMBER = os.getenv("PHONE_NUMBER", "")
WHATSAPP_ACCOUNT_ID = os.getenv("WHATSAPP_ACCOUNT_ID", "")
VERSION = os.getenv("VERSION", "v21.0")

BASE_URL = f"https://graph.facebook.com/{VERSION}/{WHATSAPP_ACCOUNT_ID}/messages"
MEDIA_URL = f"https://graph.facebook.com/{VERSION}/{WHATSAPP_ACCOUNT_ID}/media"
HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json",
}

