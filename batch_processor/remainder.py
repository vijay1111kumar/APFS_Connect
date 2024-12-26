import sys
sys.path.append("../")

from datetime import datetime
from utils.logger import LogManager
from typing import List, Dict
from setup import temp_registry
from batch_processor.scheduler import ReminderScheduler

log_manager = LogManager()
logger = log_manager.get_logger("remainders")

class Reminders:

    def __init__(self, scheduler: ReminderScheduler):
        self.scheduler = scheduler

    def process_reminders(self, file_path: str, data: List[Dict], global_retry_attempts: int, global_retry_interval: int):
        for entry in data:
            user_id = entry["Phone Number"]
            message = entry["Reminder Message"]

            schedule_time = datetime.strptime(entry["Reminder Time"], "%Y-%m-%d %H:%M")
            retry_attempts = entry.get("Retry Attempts", global_retry_attempts)
            retry_interval = entry.get("Retry Interval (minutes)", global_retry_interval)

            # Save initial state to Temp Registry
            temp_registry.update_user_state(user_id, {
                "message": message,
                "retry_attempts": retry_attempts,
                "retry_interval": retry_interval,
                "next_reminder_time": schedule_time,
                "attempts_made": 0
            })

            # Schedule reminders
            self.scheduler.schedule_reminder(user_id, message, schedule_time, retry_attempts, retry_interval)

        # Archive file after scheduling the first attempt
        # archive_file(file_path)

        self.scheduler.start()
