import sys
import json
import redis
from typing import Dict, Optional, Any

sys.path.append("../")
from utils.logger import LogManager

log_manager = LogManager()
logger = log_manager.get_logger("temp_registry")

REDIS_DB = 10

class TempRegistry:
    def __init__(self, redis_url: str = f"redis://localhost:6379/{REDIS_DB}") -> None:
        self.redis_client = redis.StrictRedis.from_url(redis_url, decode_responses=True)

    def _get_user_key(self, user_id: str) -> str:
        return f"user:{user_id}"

    def user_in_temp_registry(self, user_id: str) -> bool:
        return self.redis_client.exists(self._get_user_key(user_id)) > 0

    def update_user_state(self, user_id: str, new_state: dict) -> None:
        user_key = self._get_user_key(user_id)
        existing_state = self.get_user_state(user_id) or {}
        updated_state = {**existing_state, **new_state}
        self.redis_client.set(user_key, json.dumps(updated_state))

    def clear_user_state(self, user_id: str) -> None:
        user_key = self._get_user_key(user_id)
        if self.user_in_temp_registry(user_id):
            # self.redis_client.delete(user_key)
            self.redis_client.set(user_key, json.dumps({}))
            logger.info(f"user state cleared for user '{user_id}'.")

    def get_user_state(self, user_id: str) -> Optional[Dict[str, Any]]:
        user_key = self._get_user_key(user_id)
        state = self.redis_client.get(user_key)
        return json.loads(state) if state else {}

    def update_user_step(self, user_id: str, step: dict) -> None:
        step_id = step.get("id", "")
        user_key = self._get_user_key(user_id)
        user_state = self.get_user_state(user_id) or {}
        user_state["current_step"] = step
        self.redis_client.set(user_key, json.dumps(user_state))
        logger.info(f"step updated for user '{user_id}': step_id='{step_id}'")

    def get_user_current_flow(self, user_id: str) -> Optional[str]:
        user_state = self.get_user_state(user_id)
        return user_state.get("current_flow", "") if user_state else ""

    def get_user_current_step(self, user_id: str) -> dict:
        user_state = self.get_user_state(user_id)
        return user_state.get("current_step", {}) if user_state else {}

    def load_new_flow_for_user(self, user_id: str, flow_id: str) -> None:
        user_key = self._get_user_key(user_id)
        user_state = self.get_user_state(user_id) or {}
        user_state["current_flow"] = flow_id
        user_state["current_step"] = ""
        self.redis_client.set(user_key, json.dumps(user_state))
        logger.info(f"New flow loaded for user '{user_id}': flow_id='{flow_id}'")

    def handle_user_flow_completion(self, user_id: str, next_flow_id: Optional[str]) -> None:
        if next_flow_id:
            logger.info(f"Loading next flow '{next_flow_id}' for user '{user_id}'.")
            self.load_new_flow_for_user(user_id, next_flow_id)
        else:
            logger.info(f"No next flow specified for user '{user_id}'. Clearing state.")
            self.clear_user_state(user_id)

    def update_visited_steps_for_user(self, user_id: str, step_id: str) -> None:
        user_key = self._get_user_key(user_id)
        user_state = self.get_user_state(user_id) or {}
        user_visited_steps = user_state.get("steps_visited", [])
        user_visited_steps.append(step_id)
        user_state["steps_visited"] = user_visited_steps
        self.redis_client.set(user_key, json.dumps(user_state))

    def get_user_visited_steps(self, user_id: str) -> list:
        user_state = self.get_user_state(user_id) or {}
        user_visited_steps = user_state.get("steps_visited",[])
        return user_visited_steps

    def update_user_step_as_pending(self, user_id: str, flow_id: str, step: Dict, processor_index: int = 0) -> None:
        user_key = self._get_user_key(user_id)
        user_state = self.get_user_state(user_id) or {}
        step["processor"][processor_index]["wait"] = False
        user_state.update({
            "flow_id": flow_id,
            "current_flow": flow_id,
            "current_step": step,
            "processor_index": processor_index,
            "pending_step": True,
        })
        self.redis_client.set(user_key, json.dumps(user_state))

    def user_has_pending_step(self, user_id: str) -> bool:
        user_state = self.get_user_state(user_id)
        return user_state.get("pending_step", False) if user_state else False

    def clear_user_pending_step(self, user_id: str) -> None:
        user_key = self._get_user_key(user_id)
        user_state = self.get_user_state(user_id) or {}
        user_state.pop("current_step", None)
        user_state.pop("processor_index", None)
        user_state.pop("pending_step", None)
        self.redis_client.set(user_key, json.dumps(user_state))

