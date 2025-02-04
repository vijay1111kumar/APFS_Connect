import re
import sys
from typing import List, Dict
# sys.path.append("../")

from setup import global_registry, temp_registry
from utils.logger import LogManager
from core.messaging import handle_content, execute_flow, send_template_message

log_manager = LogManager()
logger = log_manager.get_logger("promotions")

class Promotions:
    def process_batch(self, promotion_data: dict, excel_data: List[Dict]):

        flow_id = promotion_data.get("connected_flow", "")
        job_id = promotion_data.get("campaign_job_id", "")
        template = promotion_data.get("connected_template", "")
        flow = global_registry.flows.get(flow_id) if flow_id else {}

        if flow and not flow.get("steps"):
            logger.error(f"Flow with ID '{flow_id}' is invalid or missing steps.")
            return

        # if not self.validate_placeholders(flow_id, excel_data):
        #     return

        content = {
            "type": promotion_data.get("message_body_type", ""),
            "body": f'*{promotion_data.get("header_message", "")}* \n {promotion_data.get("message_body", "")}  \n _{promotion_data.get("footer_message", "")}_'        }

        for entry in excel_data:
            user_id = entry["Phone Number"]
            try:
                temp_registry.clear_user_state(user_id)
                temp_registry.update_user_state(user_id, {"campaign_job_id": job_id})

                # send_template_message(user_id, "new_customer")
                # send_template_message(user_id, template)
                handle_content(content, user_id)
                if flow:
                    execute_flow(user_id, flow_id)  # Need support for personalized messages 
            except Exception as e:
                logger.error(f"Failed to send promotion to user:{user_id}, Error:{e}")

                # for step in flow["steps"]:
                #     content = step.get("content")
                #     if not content:
                #         continue
                #     personalized_content = self.populate_placeholders(content, entry)
                #     handle_content(personalized_content, user_id)
                # logger.info(f"Promotion sent successfully to {user_id}")
                

    def validate_placeholders(self, flow_id: str, excel_data: List[Dict]) -> bool:
        flow = global_registry.flows.get(flow_id)
        if not flow:
            logger.error(f"Flow with ID '{flow_id}' not found.")
            return False

        # Extract Excel column names from the first row of data
        if not excel_data:
            logger.error("Excel data is empty.")
            return False
        excel_columns = excel_data[0].keys()

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
