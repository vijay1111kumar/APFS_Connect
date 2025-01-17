import os
import shutil

from batch_processor.uploader import Uploader
from batch_processor.promotion import Promotions
from batch_processor.remainder import Reminders
from batch_processor.publisher import Publish
from database.models import Campaign
from utils.logger import LogManager
from database import get_db

UPLOAD_DIR = "upload"
log_manager = LogManager()
logger = log_manager.get_logger("batch_processor")

class BatchProcessor:
    def __init__(self):
        self.uploader = Uploader()
        self.promotions = Promotions()
        self.reminders = Reminders()
        self.publish = Publish()

    def process_batch(self, campaign_data: dict):
        
        flow_id = ""
        campaign_id = campaign_data.get("id", "")
        customer_excel_file = campaign_data.get("customer_excel_file", "")
        activity_type = campaign_data.get("activity_type", "")
        excel_file_path = os.path.join(UPLOAD_DIR, customer_excel_file)

        data = self.uploader.parse_excel(excel_file_path)
        with get_db() as db:
            campaign = db.query(Campaign).filter_by(id=campaign_id).first()
            if campaign:
                flow_id = campaign.fetch_campaign_connected_flow(db)
                
        if activity_type == "Promotion":
            self.promotions.process_promotional_flow(flow_id, data)
        
        if activity_type == "Remainder":
            self.reminders.process_reminders(excel_file_path, data, global_retry_attempts=3, global_retry_interval=10)
            
        # self.archive_file(file_path)

    def archive_file(file_path: str, archive_dir: str = "./archive") -> None:
        try:
            if not os.path.exists(archive_dir):
                os.makedirs(archive_dir)

            file_name = os.path.basename(file_path)
            archive_path = os.path.join(archive_dir, file_name)
            shutil.move(file_path, archive_path)
            logger.info(f"File '{file_name}' has been archived to '{archive_dir}'.")
        except Exception as e:
            logger.error(f"Failed to archive file '{file_path}': {e}")
