from contextlib import contextmanager
from utils.api import send_error, send_success
from falcon import HTTP_500

@contextmanager
def handle_request(logger, resp, success_message=None):
    try:
        yield
        if success_message:
            send_success(resp, success_message)
    except Exception as e:
        error_msg = "An error occurred while processing the request"
        logger.error(error_msg, exc_info=e)
        send_error(resp, error_msg, HTTP_500, excp=e)
