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
        for attempt in range(retry_attempts):
            run_time = schedule_time + timedelta(minutes=attempt * retry_interval)
            self.scheduler.add_job(self.send_reminder, 'date', run_date=run_time, args=[user_id, message, attempt + 1, retry_attempts])
            logger.info(f"Job scheduled for {user_id} at {run_time}")
        self.scheduler.print_jobs()

    def send_reminder(self, user_id: str, message: str, attempt: int, total_attempts: int):
        logger.info(f"Reminder sent to {user_id}: {message}")
        handle_content({"type": "text", "body": message}, user_id)

    def start(self):
        self.scheduler.start()

    def stop(self):
        self.scheduler.shutdown()
