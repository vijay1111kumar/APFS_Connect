import os
import sys
import json
import importlib.util

from typing import Dict, Optional, Any, List, Callable

sys.path.append("../")
from utils.logger import LogManager

PROCESSOR_DIR = "processors"
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

    def load_flows(self, flow_dir: str="/home/loan2wheels/LOS/APFS_Connect/flows") -> None:
        from utils.validators import FlowValidator
        validator = FlowValidator()
        validated_flows = []

        for file_name in os.listdir(flow_dir):
            try:
                file_path = os.path.join(flow_dir, file_name)
                with open(file_path, "r") as f:
                    flow = json.load(f)

                invalid_file = validator.validate_flow(flow) == False
                if invalid_file:    
                    self.invalidate_file(file_path)
                    continue
                    
                validated_flows.append(flow)

            except Exception as e:
                logger.error(f"Failed to validate flow: {file_name},  Error: {e}")

        self.clear_registry()
        self.register_global_processors()
        for valid_flow in validated_flows:
            self.register_flow(valid_flow)
            logger.info(f"Successfully loaded {valid_flow.get('id')}")

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
