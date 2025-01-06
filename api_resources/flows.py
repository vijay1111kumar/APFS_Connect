from falcon import HTTP_500, HTTP_404
from database import get_db
from utils.logger import LogManager
from utils.resources import handle_request
from api_resources.base import BaseResource
from utils.api import send_error, send_success
from database.repositories import flow_repo
from database.models import Flow
from utils.validators import SchemaValidator


class FlowResource(BaseResource):
    def __init__(self, logger):
        self.validator = SchemaValidator()
        self.schema = self.validator.load_schema("flows")
        super().__init__(flow_repo, "Flows", logger)

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
