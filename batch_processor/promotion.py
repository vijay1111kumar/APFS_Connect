import re
import sys
from typing import List, Dict
sys.path.append("../")

from setup import global_registry
from utils.logger import LogManager
from core.messaging import handle_content

log_manager = LogManager()
logger = log_manager.get_logger("promotions")

class Promotions:
    def process_promotional_flow(self, flow_id: str, data: List[Dict]):
        flow = global_registry.flows.get(flow_id)
        if not flow or not flow.get("steps"):
            logger.error(f"Flow with ID '{flow_id}' is invalid or missing steps.")
            return

        if not self.validate_placeholders(flow_id, data):
            return

        for entry in data:
            user_id = entry["Phone Number"]
            try:
                for step in flow["steps"]:
                    content = step.get("content")
                    if not content:
                        continue
                    personalized_content = self.populate_placeholders(content, entry)
                    handle_content(personalized_content, user_id)
                logger.info(f"Promotion sent successfully to {user_id}")
            except Exception as e:
                logger.error(f"Failed to send promotion to {user_id}: {e}")
                

    def validate_placeholders(self, flow_id: str, data: List[Dict]) -> bool:
        flow = global_registry.flows.get(flow_id)
        if not flow:
            logger.error(f"Flow with ID '{flow_id}' not found.")
            return False

        # Extract Excel column names from the first row of data
        if not data:
            logger.error("Excel data is empty.")
            return False
        excel_columns = data[0].keys()

        placeholders = set()
        for step in flow["steps"]:
            content = step.get("content")
            if not content:
                continue

            # Check if the content body contains placeholders
            if isinstance(content.get("body"), str):
                placeholders.update(
                    [word.strip("{{}}") for word in re.findall(r"{{(.*?)}}", content["body"])]
                )

        missing_columns = placeholders - set(excel_columns)
        if missing_columns:
            logger.error(f"Missing columns in Excel: {missing_columns}")
            return False
        return True

    def populate_placeholders(self, content: Dict, user_data: Dict) -> Dict:
        updated_content = {}
        for key, value in content.items():
            if isinstance(value, str):
                updated_content[key] = self.replace_placeholders(value, user_data)
            else:
                updated_content[key] = value
        return updated_content

    @staticmethod
    def replace_placeholders(template: str, data: Dict) -> str:

        def replace(match):
            key = match.group(1)
            return str(data.get(key, f"{{{{{key}}}}}"))

        return re.sub(r"{{(.*?)}}", replace, template)
