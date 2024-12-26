import sys
sys.path.append("../")

from core.messaging import handle_content
from typing import List, Dict

class Publish:
    def publish_messages(self, data: List[Dict]):
        for entry in data:
            user_id = entry["user_id"]
            message = entry.get("message")
            handle_content({"type": "text", "body": message}, user_id)
