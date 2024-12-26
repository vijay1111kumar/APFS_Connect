import sys
sys.path.append("../APFS_Connect")

from batch_processor.batch_processor import BatchProcessor
batch_processor = BatchProcessor()
batch_processor.process_batch("promotions", "upload/diwali_promotion.xlsx")