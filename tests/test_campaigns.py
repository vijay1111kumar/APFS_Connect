import sys
sys.path.append("../")

from datetime import datetime, timedelta
from batch_processor.scheduler import CampaignScheduler

campaign_scheduler = CampaignScheduler()
campaign_scheduler.start()

# Schedule a Remainder
campaign_scheduler.schedule_campaign(
    campaign_id="campaign_123",
    user_id="user_001",
    message="This is your remainder!",
    schedule_time=datetime.now() + timedelta(seconds=10),
    activity_type="REMAINDER",
    excel_file="../upload/campaign_test_excel.xlsx"
)

# Schedule a Promotion
# campaign_scheduler.schedule_campaign(
#     campaign_id="campaign_456",
#     user_id=None,  # Not needed for promotions
#     message=None,  # Not needed for promotions
#     schedule_time=datetime.now() + timedelta(seconds=30),
#     activity_type="PROMOTION",
#     excel_file="../upload/campaign_test_excel.xlsx"
# )

import time

try:
    while True:
        time.sleep(1)
except (KeyboardInterrupt, SystemExit):
    campaign_scheduler.stop()