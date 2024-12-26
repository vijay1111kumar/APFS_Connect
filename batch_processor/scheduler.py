import sys
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta

sys.path.append("../")
from datetime import datetime
from utils.logger import LogManager
from core.messaging import handle_content

log_manager = LogManager()
logger = log_manager.get_logger("scheduler")

class ReminderScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()

    def schedule_reminder(self, user_id: str, message: str, schedule_time: datetime, retry_attempts: int, retry_interval: int):
        # Scheduling only the initial reminder
        self.scheduler.add_job(self.send_reminder, 'date', run_date=schedule_time, args=[user_id, message, 1, retry_attempts, retry_interval])

    def send_reminder(self, user_id: str, message: str, attempt: int, total_attempts: int, retry_interval: int):
        # Need to add support for flows too.
        try:
            handle_content({"type": "text", "body": message}, user_id)
            logger.info(f"Reminder sent to {user_id}")
        except Exception as e:
            logger.error(f"Failed to send reminder to {user_id}: {e}")
            if attempt >= total_attempts:
                return
        
            next_attempt_time = datetime.now() + timedelta(minutes=retry_interval)
            self.scheduler.add_job(self.send_reminder, 'date', run_date=next_attempt_time, args=[user_id, message, attempt + 1, total_attempts, retry_interval])

    def start(self):
        self.scheduler.start()

    def stop(self):
        self.scheduler.shutdown()
