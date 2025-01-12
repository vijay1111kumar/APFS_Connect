import sys

from queue import Queue
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

sys.path.append("../")
from utils.logger import LogManager
from batch_processor.batch_processor import BatchProcessor

log_manager = LogManager()
logger = log_manager.get_logger("scheduler")


class CampaignScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.batch_processor = BatchProcessor()
        self.campaign_queue = Queue()

    def schedule_campaign(self, campaign_id, user_id, message, schedule_time, activity_type, excel_file, retry_attempts, retry_interval):
        self.scheduler.add_job(
            self.queue_campaign,
            'date',
            run_date=schedule_time,
            args=[campaign_id, user_id, message, activity_type, excel_file, retry_attempts, retry_interval]
        )

    def queue_campaign(self, campaign_id, user_id, message, activity_type, excel_file, retry_attempts, retry_interval):
        self.campaign_queue.put((campaign_id, user_id, message, activity_type, excel_file, retry_attempts, retry_interval))
        self.process_queue()

    def process_queue(self):
        if not self.campaign_queue.empty():
            campaign_details = self.campaign_queue.get()
            self.execute_campaign(*campaign_details)

    def execute_campaign(self, campaign_id, user_id, message, activity_type, excel_file, attempt, retry_attempts, retry_interval):
        try:
            self.batch_processor.process_batch(activity_type.lower(), excel_file)
            logger.info(f"{activity_type} executed for campaign {campaign_id}")
        except Exception as e:
            logger.error(f"Error executing campaign {campaign_id}: {e}")

        if attempt < retry_attempts:
            next_attempt_time = datetime.now() + timedelta(minutes=retry_interval)
            self.scheduler.add_job(
                self.queue_campaign,
                'date',
                run_date=next_attempt_time,
                args=[campaign_id, user_id, message, activity_type, excel_file, attempt + 1, retry_attempts, retry_interval]
            )

    def start(self):
        self.scheduler.start()
        logger.info("Campaign scheduler started.")

    def stop(self):
        self.scheduler.shutdown()
        logger.info("Campaign scheduler stopped.")
