from falcon import HTTP_400, HTTP_404

from database import get_db
from utils.resources import handle_request
from api_resources.base import BaseResource
from utils.api import send_error, send_success
from database.repositories import campaign_repo
from database.models import Campaign
from utils.validators import SchemaValidator


class CampaignResource(BaseResource):
    def __init__(self, logger):
        self.validator = SchemaValidator()
        self.schema = self.validator.load_schema("campaigns")
        super().__init__(campaign_repo, "Campaigns", logger)

    def on_get(self, req, resp, id=None):
        with handle_request(self.logger, resp):
            with get_db() as db:
                result, error = self.handle_get(db, id)
                if error:
                    return send_error(resp, error, HTTP_404)
                return send_success(resp, data=result)

    def on_post(self, req, resp, id=None):
        with handle_request(self.logger, resp):
            with get_db() as db:
                req_body = req.media
                validated_data = self.validator.validate(req_body, self.schema, Campaign)
                result = self.handle_post(db, validated_data)
                send_success(resp, data=result)

    def on_patch(self, req, resp, id):
        with handle_request(self.logger, resp):
            with get_db() as db:
                req_body = req.media
                restricted = self.check_restricted_fields(req_body)
                if restricted:
                    return send_error(resp, f"Cannot patch restricted fields: {', '.join(restricted)}", HTTP_400)

                validated_data = self.validator.validate_partial(req_body, self.schema, Campaign)
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
