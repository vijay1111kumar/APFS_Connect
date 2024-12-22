import os
import sys
import json

from typing import Dict, Optional, Any, List

sys.path.append("../APFS_Connect/")
from utils.logger import LogManager

log_manager = LogManager()
logger = log_manager.get_logger("global_registry")


class GlobalRegistry:
    def __init__(self) -> None:
        self.flows: Dict[str, Dict] = {}
        self.triggers: Dict[str, str] = {}
        self.flow_processors: Dict[str, List[str]] = {}
        self.processors: Dict[str, Any] = {}

    def load_flows(self, flow_dir: str="/home/loan2wheels/LOS/APFS_Connect/datasets/flows") -> None:
        self.clear_registry()
        try:
            for file_name in os.listdir(flow_dir):
                file_path = os.path.join(flow_dir, file_name)

                if not self.validate_flow(file_path):
                    continue

                with open(file_path, "r") as f:
                    flow = json.load(f)

                self.register_flow(flow)
            logger.info(f"Successfully loaded {len(self.flows)} flows.")
        except Exception as e:
            logger.error(f"Error loading flows: {e}")

    def validate_flow(self, file_path: str) -> bool:
        file_name = os.path.basename(file_path)

        if not file_name.endswith(".json"):
            logger.warning(f"Invalid file extension: {file_name}")
            self.invalidate_file(file_path, reason="Invalid file extension")
            return False

        try:
            with open(file_path, "r") as f:
                flow = json.load(f)
        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON format: {file_name}")
            self.invalidate_file(file_path, reason="Invalid JSON format")
            return False

        flow_id = flow.get("id")
        if not flow_id:
            logger.warning(f"Flow ID missing: {file_name}")
            self.invalidate_file(file_path, reason="Flow ID missing")
            return False

        if flow_id in self.flows:
            logger.warning(f"Duplicate flow ID: {flow_id} in {file_name}")
            self.invalidate_file(file_path, reason="Duplicate flow ID")
            return False

        trigger = flow.get("trigger")
        if trigger and trigger in self.triggers:
            conflicting_flow_id = self.triggers[trigger]
            logger.warning(
                f"Conflicting trigger '{trigger}' found in {file_name} "
                f"and flow ID: {conflicting_flow_id}"
            )
            self.invalidate_file(file_path, reason="Conflicting trigger")
            return False

        return True

    def invalidate_file(self, file_path: str, reason: str) -> None:
        directory, file_name = os.path.split(file_path)
        invalid_file_path = os.path.join(directory, f".{file_name}")
        os.rename(file_path, invalid_file_path)
        logger.error(f"File invalidated: {file_path}. Reason: {reason}")

    def register_processor(self, name: str, function: Any) -> None:
        self.processors[name] = function
        logger.info(f"Processor '{name}' registered.")

    def register_flow(self, flow: Dict) -> None:
        flow_id = flow["id"]
        self.flows[flow_id] = flow

        trigger = flow.get("trigger")
        if trigger:
            self.triggers[trigger] = flow_id

        processors = [step.get("processor", {}).get("name", "")
                      for step in flow.get("steps", []) if "processor" in step]
        self.flow_processors[flow_id] = [p for p in processors if p]

        logger.info(f"Flow '{flow_id}' registered.")

    def clear_registry(self) -> None:
        self.flows.clear()
        self.triggers.clear()
        self.flow_processors.clear()
        self.processors.clear()
        logger.info("Global registry cleared.")

    def get_flow_by_trigger(self, trigger: str) -> Optional[Dict]:
        flow_id = self.triggers.get(trigger)
        return self.flows.get(flow_id) if flow_id else None

    def get_processors_for_flow(self, flow_id: str) -> Optional[List[str]]:
        return self.flow_processors.get(flow_id)

    def get_processor(self, name: str) -> Optional[Any]:
        return self.processors.get(name)

    def add_flow(self, flow: Dict) -> None:
        self.register_flow(flow)

    def refresh_registry(self, flow_dir: str) -> None:
        self.load_flows(flow_dir)
        logger.info("Global registry refreshed.")
