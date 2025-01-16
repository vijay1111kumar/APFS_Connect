import os
import json
import redis
import importlib.util
from typing import Dict, Optional, Any, List, Callable

from utils.logger import LogManager
from utils.file_handler import read_json_file, update_json_file

PROCESSOR_DIR = "processors"
FLOW_DIR = "flows"
ARCHIVE_DIR = "../archive/flows"

log_manager = LogManager()
logger = log_manager.get_logger("global_registry")


def get_functions_from_script(script_path: str) -> Dict[str, Callable]:
    functions = {}
    if not os.path.exists(script_path):
        return functions

    module_name = os.path.splitext(os.path.basename(script_path))[0]
    try:
        spec = importlib.util.spec_from_file_location(module_name, script_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if callable(attr) and attr.__module__ == module_name:
                functions[attr_name] = attr
    except Exception as e:
        raise RuntimeError(f"Failed to load functions from script '{script_path}': {e}")

    return functions


class GlobalRegistry:
    def __init__(self, redis_url: str = "redis://localhost:6379/10") -> None:
        self.redis_client = redis.StrictRedis.from_url(redis_url, decode_responses=True)
        self.flows_key = "global_registry:flows"
        self.triggers_key = "global_registry:triggers"
        self.flow_processors_key = "global_registry:flow_processors"
        self.processors_key = "global_registry:processors"

    @property
    def flows(self) -> Dict[str, Dict]:
        flows = self.redis_client.hgetall(self.flows_key)
        return {flow_id: json.loads(flow_data) for flow_id, flow_data in flows.items()} if flows else {}

    @property
    def triggers(self) -> Dict[str, str]:
        return self.redis_client.hgetall(self.triggers_key)

    @property
    def processors(self) -> Dict[str, Callable]:
        return self.redis_client.hgetall(self.processors_key)

    @property
    def flow_processors(self) -> Dict[str, List[str]]:
        return self.redis_client.hgetall(self.flow_processors_key)

    # Registry Management
    def load_flows(self) -> None:
        self.clear_registry()
        for file_name in os.listdir(FLOW_DIR):
            self.load_flow(file_name)
        self.register_global_processors()

        with open("redis_store.json", "w") as file:
            file.write(json.dumps(self.flows))

    def load_flow(self, flow_filename: str) -> None:
        from utils.validators import FlowValidator
        validator = FlowValidator()

        try:
            file_path = os.path.join(FLOW_DIR, flow_filename)
            flow = read_json_file(file_path)
            validation_error = validator.validate_flow(flow)
            if validation_error:
                logger.error(f"Validation error for flow: {flow_filename}")
                return

            self.register_flow(flow)
            logger.info(f"Successfully loaded flow: {flow.get('id')}")

        except json.JSONDecodeError as e:
            logger.error(f"Invalid json file: {flow_filename}, Error: {e}")
        except Exception as e:
            logger.error(f"Failed to load flow: {flow_filename}, Error: {e}")

    def deactivate_flow(self, flow_id: str) -> str:
        flow_filename = f"{flow_id}.json"
        file_path = os.path.join(FLOW_DIR, flow_filename)
        archive_file_path = os.path.join(ARCHIVE_DIR, flow_filename)

        if not os.path.exists(file_path):
            if self.redis_client.hexists(self.flows_key, flow_id):
                return f"Flow:{flow_id} is already inactive"
            return f"Flow:{flow_id} does not exist, cannot deactivate."

        os.rename(file_path, archive_file_path)
        self.unregister_flow(flow_id)
        logger.info(f"Successfully deactivated flow: {flow_id}")
        return ""

    def update_flow(self, flow_id: str, updated_data: dict) -> str:
        from utils.validators import FlowValidator
        validator = FlowValidator()

        try:
            current_flow_data = self.redis_client.hget(self.flows_key, flow_id)
            if not current_flow_data:
                return f"Flow with ID '{flow_id}' does not exist."

            current_flow_data = json.loads(current_flow_data)
            updated_flow_data = {**current_flow_data, **updated_data}

            validation_error = validator.validate_flow(updated_flow_data)
            if validation_error:
                return validation_error

            self.redis_client.hset(self.flows_key, flow_id, json.dumps(updated_flow_data))
            self.register_flow(updated_flow_data)
            logger.info(f"Successfully updated flow with ID '{flow_id}'")
            return ""

        except Exception as e:
            logger.error(f"Failed to update flow with ID '{flow_id}': {e}")
            return f"Error: {e}"

    def register_flow(self, flow: Dict) -> None:
        flow_id = flow["id"]
        steps = flow.get("steps", [])
        flow["steps_by_id"] = {step["id"]: step for step in steps}

        self.redis_client.hset(self.flows_key, flow_id, json.dumps(flow))
        self.redis_client.hset(self.triggers_key, flow["trigger"], flow_id)

        self.register_flow_processors(flow_id)
        logger.info(f"Flow '{flow_id}' registered.")

    def unregister_flow(self, flow_id: str) -> None:
        self.redis_client.hdel(self.flows_key, flow_id)
        self.redis_client.hdel(self.triggers_key, flow_id)
        self.redis_client.hdel(self.flow_processors_key, flow_id)
        logger.info(f"Flow '{flow_id}' unregistered successfully.")

    def register_global_processors(self) -> None:
        global_processors_script_path = os.path.join(PROCESSOR_DIR, "processors.py")
        functions = get_functions_from_script(global_processors_script_path)
        function_references = {func_name: f"{function.__module__}.{func_name}" for func_name, function in functions.items()}
        self.redis_client.hmset(self.processors_key, function_references)
        logger.info(f"Registered global processors ({len(function_references)})")

    def register_flow_processors(self, flow_id: str) -> None:
        flow_processor_script_path = os.path.join(PROCESSOR_DIR, f"{flow_id}.py")
        functions = get_functions_from_script(flow_processor_script_path)
        function_references = {func_name: f"{function.__module__}.{func_name}" for func_name, function in functions.items()}
        self.redis_client.hset(self.flow_processors_key, flow_id, json.dumps(function_references))
        logger.info(f"Registered processors for flow: {flow_id}")

    def clear_registry(self) -> None:
        self.redis_client.delete(self.flows_key)
        self.redis_client.delete(self.triggers_key)
        self.redis_client.delete(self.flow_processors_key)
        self.redis_client.delete(self.processors_key)
        logger.info("Global registry cleared.")

    def get_step_by_id(self, flow_id: str, step_id: str) -> Dict:
        flow = self.redis_client.hget(self.flows_key, flow_id)
        flow = json.loads(flow) if flow else {}

        return flow.get("steps_by_id", {}).get(step_id, {})

    def get_flow_by_trigger(self, trigger: str) -> Dict:
        flow_id = self.redis_client.hget(self.triggers_key, trigger)
        flow = self.redis_client.hget(self.flows_key, flow_id) if flow_id else ""
        return json.loads(flow) if flow else {}

    def get_processors_for_flow(self, flow_id: str) -> List[str]:
        flow_processors = self.redis_client.hget(self.flow_processors_key, flow_id)
        return json.loads(flow_processors) if flow_processors else []

    def get_processor_by_name(self, name: str) -> Callable:
        processor_path = self.redis_client.hget(self.processors_key, name)
        if not processor_path:
            return None
        
        print("Processor path", processor_path)
        module_name, func_name = processor_path.rsplit(".", 1)
        module = importlib.import_module(module_name)
        processor_function = getattr(module, func_name)
        return processor_function

    def refresh_registry(self) -> None:
        self.load_flows()
        logger.info("Global registry refreshed.")
