import sys
sys.path.append("../")

from datetime import datetime
from utils.logger import LogManager
from typing import List, Dict
from setup import global_registry, temp_registry
from core.messaging import handle_content, execute_flow


log_manager = LogManager()
logger = log_manager.get_logger("remainders")

class Reminders:
    def process_batch(self, remainder_data: dict, excel_data: List[Dict]):
        flow_id = remainder_data.get("connected_flow", "")
        flow = global_registry.flows.get(flow_id) if flow_id else {}
        job_id = remainder_data.get("campaign_job_id", "")
        template = remainder_data.get("connected_template", "")

        if not flow or not flow.get("steps"):
            logger.error(f"Flow with ID '{flow_id}' is invalid or missing steps.")
            return

        # if not self.validate_placeholders(flow_id, excel_data):
        #     return

        content = {
            "type": remainder_data.get("message_body_type", ""),
            "body": f'{remainder_data.get("header_message", "")} \n {remainder_data.get("footer_message", "")}  \n {remainder_data.get("footer_message", "")}',
        }

        for entry in excel_data:
            user_id = entry["Phone Number"]
            try:
                temp_registry.clear_user_state(user_id)
                temp_registry.update_user_state(user_id, {"campaign_job_id": job_id})
                handle_content(content, user_id)
                if flow:
                    execute_flow(user_id, flow_id)  # Need support for personalized messages 

            except Exception as e:
                logger.error(f"Failed to send remainder to user:{user_id}, Error:{e}")

            # schedule_time = datetime.strptime(entry["Reminder Time"], "%Y-%m-%d %H:%M")
            # retry_attempts = entry.get("Retry Attempts", global_retry_attempts)
            # retry_interval = entry.get("Retry Interval (minutes)", global_retry_interval)
            # Save initial state to Temp Registry
            # temp_registry.update_user_state(user_id, {
            #     "message": message,
            #     "retry_attempts": retry_attempts,
            #     "retry_interval": retry_interval,
            #     "next_reminder_time": schedule_time,
            #     "attempts_made": 0
            # })

            # Schedule reminders
            # self.scheduler.schedule_reminder(user_id, message, schedule_time, retry_attempts, retry_interval)

        # Archive file after scheduling the first attempt
        # archive_file(file_path)

        # self.scheduler.start()
