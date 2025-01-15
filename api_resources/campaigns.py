from datetime import datetime, timedelta
from falcon import HTTP_400, HTTP_404

from database import get_db
from utils.logger import LogManager
from utils.resources import handle_request
from api_resources.base import BaseResource
from utils.validators import SchemaValidator
from utils.api import send_error, send_success
from database.repositories import campaign_repo
from utils.scheduler import campaign_scheduler
from database.models import Campaign, CampaignMetrics, Promotion, Remainder

activity_mapping  = {
    "Promotion":  Promotion,
    "Remainder": Remainder
}

class CampaignResource(BaseResource):
    def __init__(self, logger):
        self.model = Campaign
        self.validator = SchemaValidator()
        self.schema = self.validator.load_schema("campaigns")
        super().__init__(campaign_repo, "Campaigns", logger)

    def on_get(self, req, resp, id=None):
        with handle_request(self.logger, resp):
            with get_db() as db:
                if not id:
                    filters = req.params
                
                    if "performance" in filters:
                        return self.get_campaigns_performance(db, resp)
                
                    results = self.handle_filter(db, self.model, filters)
                    return send_success(resp, data=results)
                
                if req.path.endswith("/metrics"):
                    return self.get_campaign_metrics(db, id, resp)

                # Default behavior for single ID
                result, error = self.handle_get(db, id)
                if error:
                    return send_error(resp, error, HTTP_404)
                return send_success(resp, data=result)

    def get_campaign_metrics(self, db, campaign_id, resp):

        try:
            metrics = (
                db.query(CampaignMetrics)
                .filter(CampaignMetrics.campaign_id == campaign_id)
                .first()
            )
            metrics = metrics.to_dict() if metrics else {}
            return send_success(resp, data=metrics)

        except Exception as e:
            self.logger.error(f"Error fetching metrics for campaign {campaign_id}: {e}")
            raise e
            

    def on_post(self, req, resp, id=None):
        with handle_request(self.logger, resp):
            with get_db() as db:

                req_body = req.media
                validated_data = self.validator.validate(req_body, self.schema, self.model)
                created_campaign, error = self.handle_post(db, validated_data)
                if error:
                    return send_error(resp, error, HTTP_400)

                self.queue_campaign_in_scheduler(created_campaign)
                send_success(resp, data=created_campaign)


    def on_patch(self, req, resp, id):
        with handle_request(self.logger, resp):
            with get_db() as db:
                req_body = req.media
                restricted = self.check_restricted_fields(req_body)
                if restricted:
                    return send_error(resp, f"Cannot patch restricted fields: {', '.join(restricted)}", HTTP_400)

                validated_data = self.validator.validate_partial(req_body, self.schema, self.model)
                result, error = self.handle_patch(db, id, validated_data)
                if error:
                    return send_error(resp, error, HTTP_404)
                return send_success(resp, data=result)


    def on_delete(self, req, resp, id):
        with handle_request(self.logger, resp):
            with get_db() as db:
                result, error = self.handle_delete(db, id)
                if error:
                    return send_error(resp, error, HTTP_404)
                return send_success(resp, data=result)


    def queue_campaign_in_scheduler(self, campaign_data: dict):
        campaign_id = campaign_data["id"]
        user_id = campaign_data["created_by"]
        run_on_save = campaign_data.get("run_on_save", False)
        schedule_time = campaign_data.get("schedule_at")

        # Execute immediately
        if run_on_save:
            self.logger.info(f"Running campaign {campaign_id} immediately.")
            campaign_scheduler.schedule_campaign(campaign_data, user_id)

        if schedule_time:
            self.logger.info(f"Scheduling next run for campaign {campaign_id} at {schedule_time}.")
            campaign_scheduler.schedule_campaign(campaign_data, user_id)

        else:
            # No scheduling needed
            self.logger.info(f"Campaign {campaign_id} created without immediate or scheduled execution.")

    def get_campaigns_performance(self, db, resp):
        try:
            performance_data = {"Campaign": {}}
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)

            # Fetch all campaigns
            campaigns = db.query(Campaign).all()
            if not campaigns:
                return send_error(resp, "No campaigns found", HTTP_404)

            # Collect performance data

            for campaign in campaigns[:10]:
                id = campaign.id
                name = campaign.name
                activity_id = campaign.activity_id
                activity_type = campaign.activity_type.value

                if activity_type not in performance_data:
                    performance_data[activity_type] = {}

                if activity_id not in performance_data[activity_type]:
                    # Initialize data for this activity
                    activity_model = activity_mapping.get(activity_type)
                    activity_name = (
                        db.query(activity_model.name)
                        .filter(activity_model.id == activity_id)
                        .scalar()
                    )
                    performance_data["Campaign"][id] = {
                        "name": name,
                        "activity_type": activity_type,
                        "activity_id": activity_id,
                        "activity_name": activity_name,
                        "values": [
                            {"date": str(start_date + timedelta(days=i)), "value": 0}
                            for i in range(31)
                        ],
                    }

                # Fetch metrics for this campaign
                metrics = (
                    db.query(CampaignMetrics)
                    .filter(
                        CampaignMetrics.campaign_id == campaign.id,
                        CampaignMetrics.created_at >= start_date,
                        CampaignMetrics.created_at <= end_date,
                    )
                    .all()
                )

                for metric in metrics:
                    metric_date = metric.created_at.date()
                    # Update the value for the corresponding date
                    for entry in performance_data["Campaign"][id]["values"]:
                        if entry["date"] == str(metric_date):
                            entry["value"] += metric.total_users_targeted

            return send_success(resp, data=performance_data)
        
        except Exception as e:
            self.logger.error(f"Error fetching campaigns performance: {e}")
            raise e
