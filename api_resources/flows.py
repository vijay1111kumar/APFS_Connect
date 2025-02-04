from falcon import HTTP_500, HTTP_404
from database import get_db
from utils.logger import LogManager
from utils.resources import handle_request
from api_resources.base import BaseResource
from utils.api import send_error, send_success
from database.repositories import flow_repo
from database.models import Flow
from utils.validators import SchemaValidator

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database.models import CampaignMetrics, Campaign, Flow, Promotion, Remainder, CampaignJob
from sqlalchemy_serializer import serialize_collection

from sqlalchemy import func, or_, and_
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

def fetch_flow_performance(session: Session, start_date: datetime = None, end_date: datetime = None):
    performance_data = {}

    if not end_date:
        end_date = datetime.now()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    flows = session.query(Flow).all()
    if not flows:
        return {"message": "No flows found.", "data": {}}

    for flow in flows:
        total_users = 0
        flow_completed = 0
        flow_cutoffs = 0
        messages_attempted = 0
        messages_delivered = 0
        messages_failed = 0
        flow_id = flow.id
        flow_name = flow.name

        # Fetch campaigns connected to this flow through promotions and remainders
        promotion_subquery = session.query(Promotion.id).filter(Promotion.connected_flow == flow_id).subquery()
        remainder_subquery = session.query(Remainder.id).filter(Remainder.connected_flow == flow_id).subquery()

        campaigns = session.query(Campaign).filter(
            or_(
                and_(Campaign.activity_type == "PROMOTION", Campaign.activity_id.in_(promotion_subquery)),
                and_(Campaign.activity_type == "REMAINDER", Campaign.activity_id.in_(remainder_subquery))
            )
        ).all()

        # Aggregate metrics from CampaignJobs and CampaignMetrics
        for campaign in campaigns:
            campaign_jobs = session.query(CampaignJob.id).filter(CampaignJob.campaign_id == campaign.id).all()
            campaign_job_ids = [job.id for job in campaign_jobs]

            if not campaign_job_ids:
                continue

            metrics = (
                session.query(
                    func.sum(CampaignMetrics.total_users_targeted).label("total_users"),
                    func.sum(CampaignMetrics.flow_completed).label("flow_completed"),
                    func.sum(CampaignMetrics.flow_cutoffs).label("flow_cutoffs"),
                    func.sum(CampaignMetrics.messages_attempted).label("messages_attempted"),
                    func.sum(CampaignMetrics.messages_delivered).label("messages_delivered"),
                    func.sum(CampaignMetrics.messages_failed).label("messages_failed"),
                )
                .filter(CampaignMetrics.campaign_job_id.in_(campaign_job_ids))
                .filter(CampaignMetrics.created_at.between(start_date, end_date))
                .first()
            )

            total_users += metrics.total_users or 0
            flow_completed += metrics.flow_completed or 0
            flow_cutoffs += metrics.flow_cutoffs or 0
            messages_attempted += metrics.messages_attempted or 0
            messages_delivered += metrics.messages_delivered or 0
            messages_failed += metrics.messages_failed or 0

        performance_data[flow_id] = {
            "name": flow_name,
            "total_users": total_users,
            "flow_completed": flow_completed,
            "flow_cutoffs": flow_cutoffs,
            "messages_attempted": messages_attempted,
            "messages_delivered": messages_delivered,
            "messages_failed": messages_failed,
            "values": [
                {
                    "date": str((start_date + timedelta(days=i)).date()),
                    "value": flow_completed + flow_cutoffs,
                }
                for i in range((end_date - start_date).days + 1)
            ],
        }

    return performance_data


class FlowResource(BaseResource):
    def __init__(self, logger):
        self.validator = SchemaValidator()
        self.schema = self.validator.load_schema("flows")
        super().__init__(flow_repo, "Flows", logger)

    def on_get(self, req, resp, id=None):
        with handle_request(self.logger, resp):
            with get_db() as db:

                if not id:
                    filters = req.params

                    if "performance" in filters:
                        result = fetch_flow_performance(db)
                        return send_success(resp, "Flow's Performance", data=result)

                if req.path.endswith("/campaigns"):
                    return self.get_campaigns_with_flow(db, id, resp)
                
                if req.path.endswith("/promotions"):
                    return self.get_promotions_with_flow(db, id, resp)
                
                if req.path.endswith("/remainders"):
                    return self.get_remainders_with_flow(db, id, resp)

                result, error = self.handle_get(db, id)
                if error:
                    return send_error(resp, error, HTTP_404)
                return send_success(resp, data=result)


    def get_campaigns_with_flow(self, db: Session, flow_id: str, resp):
        """
        Fetch all campaigns linked to a given flow by its ID.
        """
        try:
            promotion_ids = db.query(Promotion.id).filter(Promotion.connected_flow == flow_id).subquery()
            remainder_ids = db.query(Remainder.id).filter(Remainder.connected_flow == flow_id).subquery()

            campaigns = db.query(Campaign).filter(
                or_(
                    and_(Campaign.activity_type == "PROMOTION", Campaign.activity_id.in_(promotion_ids)),
                    and_(Campaign.activity_type == "REMAINDER", Campaign.activity_id.in_(remainder_ids))
                )
            ).all()

            campaign_data = [
                {
                    "id": campaign.id,
                    "name": campaign.name,
                    # "schedule_at": campaign.schedule_at,
                    "is_active": campaign.is_active,
                    "created_by": campaign.created_by,
                    # "created_at": campaign.created_at,
                    "activity_type": campaign.activity_type.value,
                    "activity_id": campaign.activity_id,
                }
                for campaign in campaigns
            ]

            return send_success(resp, data=campaign_data)

        except Exception as e:
            return send_error(resp, f"Error fetching campaigns for flow: {e}")

                

    def get_promotions_with_flow(self, db, flow_id, resp):
        try:
            promotions = (
                db.query(Promotion)
                .filter(Promotion.connected_flow == flow_id)
                .all()
            )
            promotions = serialize_collection(promotions)
            return send_success(resp, data=promotions)

        except Exception as e:
            self.logger.error(f"Error fetching promotions with connected flow as {flow_id}: {e}")
            raise e
            
    def get_remainders_with_flow(self, db, flow_id, resp):
        try:
            remainders = (
                db.query(Remainder)
                .filter(Remainder.connected_flow == flow_id)
                .all()
            )
            remainders = serialize_collection(remainders)
            return send_success(resp, data=remainders)

        except Exception as e:
            self.logger.error(f"Error fetching remainders with connected flow as {flow_id}: {e}")
            raise e
        
    def on_post(self, req, resp, id=None):
        with handle_request(self.logger, resp):
            with get_db() as db:
                req_body = req.media
                validated_data = self.validator.validate(req_body, self.schema, Flow)
                result = self.handle_post(db, validated_data)
                send_success(resp, data=result)

    def on_patch(self, req, resp, id):
        with handle_request(self.logger, resp):
            with get_db() as db:
                req_body = req.media
                validated_data = self.validator.validate_partial(req_body, self.schema, Flow)
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
