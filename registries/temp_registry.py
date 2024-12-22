import sys
sys.path.append("../APFS_Connect/")

from utils.logger import LogManager
from typing import Dict, Optional, Any

log_manager = LogManager()
logger = log_manager.get_logger("temp_registry")

class TempRegistry:
    def __init__(self) -> None:
        self.user_data: Dict[str, Dict[str, Any]] = {}

    def user_in_temp_registry(self, user_id: str) -> bool:
        return user_id in self.user_data.keys()

    def save_user_state(self, user_id: str, flow_id: str, step_id: Optional[str] = None) -> None:
        if not self.user_in_temp_registry(user_id):
            self.user_data[user_id] = {}

        self.user_data[user_id]["current_flow"] = flow_id
        self.user_data[user_id]["current_step"] = step_id
        logger.info(f"user state saved for user '{user_id}': flow_id='{flow_id}', step_id='{step_id}'")

    def clear_user_state(self, user_id: str) -> None:
        if self.user_in_temp_registry(user_id):
            self.user_data.pop(user_id)
            logger.info(f"user state cleared for user '{user_id}'.")

    def get_user_state(self, user_id: str) -> Optional[Dict[str, Any]]:
        state = self.user_data.get(user_id, None)
        logger.debug(f"user state retrieved for user '{user_id}': {state}")
        return state

    def update_user_step(self, user_id: str, step_id: str) -> None:
        if self.user_in_temp_registry(user_id):
            self.user_data[user_id]["current_step"] = step_id
            logger.info(f"user step updated for user '{user_id}': step_id='{step_id}'")

    def get_user_current_flow(self, user_id: str) -> Optional[str]:
        state = self.get_user_state(user_id)
        flow_id = state.get("current_flow") if state else None
        logger.debug(f"Current flow for user '{user_id}': {flow_id}")
        return flow_id

    def get_user_current_step(self, user_id: str) -> Optional[str]:
        state = self.get_user_state(user_id)
        step_id = state.get("current_step") if state else None
        logger.debug(f"Current step for user '{user_id}': {step_id}")
        return step_id

    def load_new_flow_for_user(self, user_id: str, flow_id: str) -> None:
        if not self.user_in_temp_registry(user_id):
            self.user_data[user_id] = {}
        self.user_data[user_id]["current_flow"] = flow_id
        self.user_data[user_id]["current_step"] = None
        logger.info(f"New flow loaded for user '{user_id}': flow_id='{flow_id}'")

    def handle_user_flow_completion(self, user_id: str, next_flow_id: Optional[str]) -> None:
        if next_flow_id:
            logger.info(f"Loading next flow '{next_flow_id}' for user '{user_id}'.")
            self.load_new_flow_for_user(user_id, next_flow_id)
        else:
            logger.info(f"No next flow specified for user '{user_id}'. Clearing state.")
            self.clear_user_state(user_id)

