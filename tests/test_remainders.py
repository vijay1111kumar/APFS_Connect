
import sys
import time
sys.path.append("../APFS_Connect")

from batch_processor.batch_processor import BatchProcessor
from batch_processor.scheduler import ReminderScheduler

scheduler = ReminderScheduler()
scheduler.start()

batch_processor = BatchProcessor()
batch_processor.process_batch("remainder", "upload/test_remainders.xlsx")

# Keeping the script alive to allow the scheduler to execute jobs
try:
    while True:
        time.sleep(1)
except (KeyboardInterrupt, SystemExit):
    scheduler.stop()
