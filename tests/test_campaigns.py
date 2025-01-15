import sys
import time

from datetime import datetime, timedelta

sys.path.append("../")
from utils.scheduler import campaign_scheduler

# Schedule a Remainder Campaign
remainder_campaign_data = {
    "campaign_id" :"campaign_123",
    "schedule_time" :datetime.now() + timedelta(seconds=60),
    "activity_type" :"REMAINDER",
    "excel_file" :"../upload/campaign_test_excel.xlsx",
    "retry_attempts" :3,
    "retry_interval" :1
}

campaign_scheduler.schedule_campaign(
    campaign_data=remainder_campaign_data,
    user_id="APFS0001",
)

remainder_campaign_data = {
    "campaign_id" :"campaign_456",
    "schedule_time" :datetime.now() + timedelta(seconds=60),
    "activity_type" :"PROMOTION",
    "excel_file" :"../upload/campaign_test_excel.xlsx",
    "retry_attempts" :3,
    "retry_interval" :1
}

# Schedule a Promotion Campaign
campaign_scheduler.schedule_campaign(
    campaign_data=remainder_campaign_data,
    user_id="APFS0001",  
)
