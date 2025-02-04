from falcon import HTTP_404

from database import get_db
from database.models import CampaignJob
from utils.resources import handle_request
from api_resources.base import BaseResource
from utils.api import send_error, send_success
from utils.scheduler import campaign_scheduler, celery_app
from sqlalchemy_serializer import serialize_collection

class CampaignSchedulerResource(BaseResource):
    def __init__(self):
        self.jobs = {}

    def on_get(self, req, resp):
        with handle_request(self.logger, resp):
            if req.path.endswith("/upcoming"):
                result = self.list_upcoming_jobs()
                return send_success(resp, data=serialize_collection(result))

            inspect = celery_app.control.inspect()
            scheduled_jobs = inspect.scheduled()
            result = serialize_collection(scheduled_jobs) if scheduled_jobs else [] 
            return send_success(resp, data=result)
            

    def on_post(self, req, resp):
        with handle_request(self.logger, resp):
            data = req.media
            user_id = data.get("user_id")

            campaign_data = {
                "campaign_id" : data.get("campaign_id", ""),
                "activity_type" : data.get("activity_type", ""),
                "activity_id" : data.get("activity_id", ""),
                "schedule_time" : data.get("schedule_time", ""),
                "excel_file" : data.get("customer_excel_file", ""),
                "repeat_count" : data.get("repeat_count", 0),
                "repeat_interval_value" : data.get("repeat_interval_value", 0),
                "repeat_interval_unit" : data.get("repeat_interval_unit", 0)
            }
            campaign_scheduler.schedule_campaign.apply_async(
                args=[campaign_data, user_id,]
            )
            return send_success(resp, "Campaign {campaign_id} scheduled successfully.")


    def on_delete(self, req, resp, job_id):
        with handle_request(self.logger, resp):
            with get_db() as db:
                job = db.query(CampaignJob).filter_by(id=job_id).first()
                if not job:
                    return send_error(resp, f"Job with id: {job_id} not found", error_code=HTTP_404)
                
                celery_app.control.revoke(job_id, terminate=True)
                job.status = "Cancelled"
                db.commit()
                send_success(resp, f"Job {job_id} cancelled successfully")


    def list_upcoming_jobs():
        with get_db() as db:
            jobs = (
                db.query(CampaignJob)
                .filter(CampaignJob.status == "Scheduled")
                .order_by(CampaignJob.schedule_time.asc())
                .limit(10)
                .all()
            )
            return jobs
