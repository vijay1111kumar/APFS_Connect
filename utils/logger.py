import os
import json
import falcon
import logging
import settings

from logging.handlers import RotatingFileHandler
from termcolor import colored

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "operation": getattr(record, "operation", None),
            "user_id": getattr(record, "user_id", None),
            "flow_id": getattr(record, "flow_id", None),
            "request_id": getattr(record, "request_id", None),
        }
        return json.dumps(log_entry)


class ColoredFormatter(logging.Formatter):
    LEVEL_COLORS = {
        logging.DEBUG: "blue",
        logging.INFO: "green",
        logging.WARNING: "yellow",
        logging.ERROR: "red",
        logging.CRITICAL: "magenta",
    }

    def format(self, record: logging.LogRecord) -> str:
        log_color = self.LEVEL_COLORS.get(record.levelno, "white")
        record.msg = colored(record.msg, log_color)
        return super().format(record)


class LogManager:
    def __init__(self, log_dir: str = "logs") -> None:
        self.loggers = {}
        self.log_dir = log_dir
        os.makedirs(log_dir, exist_ok=True)

        self.console_level = getattr(logging, settings.CONSOLE_LOG_LEVEL, logging.DEBUG)
        self.file_level = getattr(logging, settings.FILE_LOG_LEVEL, logging.INFO)
        self._initialize_loggers()

    def _initialize_loggers(self) -> None:
        categories = {
            "api": "api.log",
            "flows": "flows.log",
            "errors": "errors.log",
            "batch_processor": "batch_processor.log",
            "analytics": "analytics.log",
            "promotions": "promotions.log",
            "temp_registry": "temp_registry.log",
            "global_registry": "global_registry.log",
            "webhook": "webhook.log",
            "messages": "messages.log",
            "server": "server.log",
            "validators": "validators.log",
            "remainders": "remainders.log",
            "scheduler": "scheduler.log",
            "uploader": "uploader.log",
        }


        for category, file_name in categories.items():
            self._create_logger(
                category,
                os.path.join(self.log_dir, file_name),
                formatter=JSONFormatter(),
                level=self.file_level,
            )

    def _create_logger(
        self, name: str, file_path: str, formatter: logging.Formatter, level: int
    ) -> None:

        file_handler = RotatingFileHandler(file_path, maxBytes=10 * 1024 * 1024, backupCount=5)
        file_handler.setFormatter(formatter)
        file_handler.setLevel(level)

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(
            ColoredFormatter("%(asctime)s - %(levelname)s - %(message)s")
        )
        console_handler.setLevel(self.console_level)

        logger = logging.getLogger(name)
        logger.setLevel(level)
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        logger.propagate = False

        self.loggers[name] = logger

    def get_logger(self, name: str) -> logging.Logger:
        return self.loggers.get(name, logging.getLogger())
    
    def log_api_call(self, response: falcon.response, user_id: str) -> None:
        logger = self.get_logger("api")

        url = getattr(response, "url", "Unknown URL")
        method = getattr(response.request, "method", "Unknown Method") if response.request else "Unknown Method"
        status_code = getattr(response, "status_code", "Unknown Status")
        response_time = getattr(response, "elapsed", None)

        logger.info(
            "API Call logged",
            extra={
                "operation": "API_CALL",
                "url": url,
                "method": method,
                "status_code": status_code,
                "response_time": response_time.total_seconds() if response_time else "Unknown",
                "user_id": user_id,
            },
        )

    def log_flow_execution(self, flow_id: str, step_id: str, user_id: str, status: str) -> None:
        logger = self.get_logger("flows")
        logger.info(
            f"Executing flow: {flow_id} at step: {step_id}",
            extra={
                "operation": "FLOW_EXECUTION",
                "flow_id": flow_id,
                "step_id": step_id,
                "user_id": user_id,
                "status": status,
            },
        )

    def log_error(self, error_message: str, user_id: str = None) -> None:
        logger = self.get_logger("errors")
        logger.error(
            error_message,
            extra={
                "operation": "ERROR",
                "user_id": user_id,
            },
        )
