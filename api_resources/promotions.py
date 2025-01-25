import random
from falcon import HTTP_400, HTTP_404

from database import get_db
from utils.resources import handle_request
from api_resources.base import BaseResource
from utils.api import send_error, send_success
from database.repositories import promotion_repo
from database.models import Promotion, Campaign
from utils.validators import SchemaValidator
from sqlalchemy_serializer import serialize_collection
from sqlalchemy import func

from datetime import datetime, timedelta
from database import get_db
from database.models import Promotion, Campaign, CampaignMetrics, CampaignJob

class PromotionResource(BaseResource):
    def __init__(self, logger):
        self.model = Promotion
        self.validator = SchemaValidator()
        self.schema = self.validator.load_schema("promotions")
        super().__init__(promotion_repo, "Promotions", logger)

    def on_get(self, req, resp, id=None):
        with handle_request(self.logger, resp):
            with get_db() as db:
                if not id:
                    filters = req.params

                    if "performance" in filters:
                        return self.get_promotions_performance(db, resp)
            
                    results = self.handle_filter(db, self.model, filters)
                    return send_success(resp, data=results)
                
                # Default behavior for single ID
                if req.path.endswith("/campaigns"):
                    return self.get_campaigns_for_promotion(db, id, resp)

                result, error = self.handle_get(db, id)
                if error:
                    return send_error(resp, error, HTTP_404)
                return send_success(resp, data=result)


    def get_campaigns_for_promotion(self, db, promotion_id, resp):

        try:
            campaigns = (
                db.query(Campaign)
                .filter(Campaign.activity_id == promotion_id, Campaign.activity_type == "PROMOTION")
                .all()
            )
            campaigns = serialize_collection(campaigns)
            return send_success(resp, data=campaigns)

        except Exception as e:
            self.logger.error(f"Error fetching campaigns for promotion {promotion_id}: {e}")
            raise e
            

    def on_post(self, req, resp, id=None):
        with handle_request(self.logger, resp):
            with get_db() as db:
                req_body = req.media
                validated_data = self.validator.validate(req_body, self.schema, self.model)
                result, error  = self.handle_post(db, validated_data)
                if error:
                    return send_error(resp, error, HTTP_400)
                send_success(resp, data=result)

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
                    return send_error(resp, error, HTTP_400)
                return send_success(resp, data=result)

    def on_delete(self, req, resp, id):
        with handle_request(self.logger, resp):
            with get_db() as db:
                result, error = self.handle_delete(db, id)
                if error:
                    return send_error(resp, error, HTTP_404)
                return send_success(resp, data=result)

    def get_promotions_performance(self, db, resp):
        try:
            # Fetch the last 30 days
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)

            # Fetch all campaigns
            campaigns = db.query(Campaign).all()

            if not campaigns:
                return send_error(resp, "No campaigns found", HTTP_404)

            # Collect performance data
            performance_data = {}

            for campaign in campaigns:
                activity_id = campaign.activity_id
                activity_type = campaign.activity_type.value  # "PROMOTION" or "REMAINDER"

                if activity_type not in performance_data:
                    performance_data[activity_type] = {}
                
                if activity_type == "Promotion" :
                    if not activity_id in performance_data[activity_type]:
                        performance_data[activity_type][activity_id] = {}

                    activity_model = Promotion
                    name = db.query(activity_model.name).filter(activity_model.id == activity_id).scalar()
                    performance_data[activity_type][activity_id] = {
                        "name": name,
                        "values": [
                            {"date": str(start_date + timedelta(days=i)), "value": random.randint(100, 400)}
                            for i in range(31)
                        ],
                    }
                else:
                    continue

                # Fetch CampaignJobs for the campaign
                campaign_jobs = db.query(CampaignJob).filter(CampaignJob.campaign_id == campaign.id).all()

                # Process metrics for each CampaignJob
                for job in campaign_jobs:
                    metrics = (
                        db.query(
                            func.sum(CampaignMetrics.total_users_targeted).label("total_users_targeted"),
                        )
                        .filter(
                            CampaignMetrics.campaign_job_id == job.id,
                            CampaignMetrics.created_at >= start_date,
                            CampaignMetrics.created_at <= end_date,
                        )
                        .group_by(CampaignMetrics.created_at)
                        .all()
                    )

                    for metric in metrics:
                        metric_date = metric[0]
                        # Update the value for the corresponding date
                        for entry in performance_data[activity_type][activity_id]["values"]:
                            if entry["date"] == str(metric_date):
                                # entry["value"] += metric.total_users_targeted
                                entry["value"] += random.randint(100, 400)

            return send_success(resp, data=performance_data)

        except Exception as e:
            self.logger.error(f"Error fetching promotions performance: {e}")
            raise e
