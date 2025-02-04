import os
import shutil

from batch_processor.uploader import Uploader
from batch_processor.promotion import Promotions
from batch_processor.remainder import Reminders
from batch_processor.publisher import Publish
from database.models import Campaign
from utils.logger import LogManager
from database import get_db
from database.models import Promotion, Remainder


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
        activity_type = campaign_data.get("activity_type", "")
        activity_id = campaign_data.get("activity_id", "")
        customer_excel_file = campaign_data.get("customer_excel_file", "")
        excel_file_path = os.path.join(UPLOAD_DIR, customer_excel_file)
        excel_data = self.uploader.parse_excel(excel_file_path)

        with get_db() as db:
            if activity_type == "Promotion":
                promotion_data = db.query(Promotion).filter_by(id=activity_id).first().to_dict()
                promotion_data.update({"campaign_job_id": campaign_data.get("job_id")})
                self.promotions.process_batch(promotion_data, excel_data)

            elif activity_type == "Remainder":
                remainder_data = db.query(Remainder).filter_by(id=activity_id).first().to_dict()
                remainder_data.update({"campaign_job_id": campaign_data.get("job_id")})
                self.reminders.process_batch(remainder_data, excel_data)

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
