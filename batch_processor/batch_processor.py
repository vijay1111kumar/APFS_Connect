import os
import shutil

from batch_processor.uploader import Uploader
from batch_processor.promotion import Promotions
from batch_processor.remainder import Reminders
from batch_processor.publisher import Publish
from utils.logger import LogManager

log_manager = LogManager()
logger = log_manager.get_logger("batch_processor")

class BatchProcessor:
    def __init__(self):
        self.uploader = Uploader()
        self.promotions = Promotions()
        self.reminders = Reminders()
        self.publish = Publish()

    def process_batch(self, action: str, file_path: str):
        data = self.uploader.parse_excel(file_path)
        if action == "promotions":
            flow_id = os.path.splitext(os.path.basename(file_path))[0]
            self.promotions.process_promotional_flow(flow_id, data)
            # self.archive_file(file_path)
        if action == "remainder":
            self.reminders.process_reminders(file_path, data, global_retry_attempts=3, global_retry_interval=10)

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
