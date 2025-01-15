import os
import sys
import json
import importlib.util

from typing import Dict, Optional, Any, List, Callable

# sys.path.append("../")
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
    def __init__(self) -> None:
        self.flows: Dict[str, Dict] = {}
        self.triggers: Dict[str, str] = {}
        self.flow_processors: Dict[str, List[str]] = {}
        self.processors: Dict[str, Any] = {}

    def load_flows(self) -> None:
        validated_flows = []
        for file_name in os.listdir(FLOW_DIR):
            self.load_flow(file_name)    
            validated_flows.append(file_name)

        if not validated_flows:
            return
        
        # self.clear_registry()
        self.register_global_processors()


    def load_flow(self, flow_filename: str) -> None:
        from utils.validators import FlowValidator
        validator = FlowValidator()

        try:
            file_path = os.path.join(FLOW_DIR, flow_filename)
            with open(file_path, "r") as f:
                flow = json.load(f)

            validation_error = validator.validate_flow(flow)
            if validation_error:    
                # self.invalidate_file(file_path)
                return validation_error

            self.register_flow(flow)
            logger.info(f"Successfully loaded {flow.get('id')}")
            return ""
        
        except Exception as e:
            logger.error(f"Failed to validate flow: {flow_filename},  Error: {e}")
            return f"Error: {e}"

    def deactivate_flow(self, flow_id: str) -> str:
        flow_filename = f"{flow_id}.json"
        file_path = os.path.join(FLOW_DIR, flow_filename)
        archive_file_path = os.path.join(ARCHIVE_DIR, flow_filename)
        
        if not os.path.exists(file_path):
            if os.path.exists(archive_file_path):
                return f"Flow:{flow_id} is already inactive"
            return f"Flow:{flow_id} does not exists, cannot deactivate."
        
        os.rename(file_path, archive_file_path)
        self.unregister_flow(flow_id)
        logger.info(f"Successfully Deactivated {flow_id}")
        return ""

    def update_flow(self, flow_id: str, updated_data: dict):
        from utils.validators import FlowValidator
        validator = FlowValidator()

        try:
            flow_filename = f"{flow_id}.json"
            file_path = os.path.join(FLOW_DIR, flow_filename)
            current_flow_data = read_json_file(file_path)
            updated_flow_data = {**current_flow_data, **updated_data}

            validation_error = validator.validate_flow(updated_flow_data)
            if validation_error:    
                return validation_error

            update_json_file(file_path, updated_flow_data)
            self.register_flow(updated_flow_data)
            logger.info(f"Successfully updated {flow_id}")
            return ""
        
        except Exception as e:
            logger.error(f"Failed to validate flow: {flow_filename},  Error: {e}")
            return f"Error: {e}"

    def invalidate_file(self, file_path: str) -> None:
        directory, file_name = os.path.split(file_path)
        invalid_file_path = os.path.join(directory, f".{file_name}")
        os.rename(file_path, invalid_file_path)
        logger.error(f"File invalidated: {file_path}")

    def register_flow_processors(self, flow_id: str) -> None:
        flow_processor_script_path = os.path.join(PROCESSOR_DIR, f"{flow_id}.py")
        functions = get_functions_from_script(flow_processor_script_path)
        self.flow_processors[flow_id] = functions
        logger.info(f"Registered flow: {flow_id} processors({len(functions)})")

    def register_global_processors(self) -> None:
        global_processors_script_path = os.path.join(PROCESSOR_DIR, "processors.py")
        functions = get_functions_from_script(global_processors_script_path)
        self.processors = functions
        logger.info(f"Registered global processors({len(functions)})")

    def register_flow(self, flow: Dict) -> None:
        flow_id = flow["id"]
        self.flows[flow_id] = flow
        steps = flow.get("steps", [])
        steps_by_id = {step["id"]: step for step in steps}
        flow["steps_by_id"] = steps_by_id

        self.triggers[flow.get("trigger", "")] = flow_id
        self.register_flow_processors(flow_id)
        logger.info(f"Flow '{flow_id}' registered.")

    def unregister_flow(self, flow_id: str) -> None:
        self.flows.pop(flow_id, None)
        self.triggers.pop(flow_id, None)
        self.processors.pop(flow_id, None)
        self.flow_processors.pop(flow_id, None)
        logger.info(f"Flow '{flow_id}' unregistered successfully.")

    def clear_registry(self) -> None:
        self.flows.clear()
        self.triggers.clear()
        self.flow_processors.clear()
        self.processors.clear()
        logger.info("Global registry cleared.")

    def get_step_by_id(self, flow_id: str, step_id: str) -> Optional[Dict]:
        flow = self.flows.get(flow_id, {})
        step = flow.get("steps_by_id", {}).get(step_id, None)
        return step

    def get_flow_by_trigger(self, trigger: str) -> Optional[Dict]:
        flow_id = self.triggers.get(trigger)
        return self.flows.get(flow_id) if flow_id else None

    def get_processors_for_flow(self, flow_id: str) -> Optional[List[str]]:
        return self.flow_processors.get(flow_id)

    def get_processor_by_name(self, name: str) -> Optional[Any]:
        return self.processors.get(name)

    def refresh_registry(self, flow_dir: str) -> None:
        self.load_flows(flow_dir)
        logger.info("Global registry refreshed.")
