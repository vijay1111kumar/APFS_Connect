import os
import json
import yaml
import logging
from typing import Dict, Any, List

import sys
sys.path.append("../")
from setup import global_registry, temp_registry

logger = logging.getLogger("validators")
DATASET_DIR = "datasets"
PROCESSORS_DIR = "processors"
SCHEMA_DIR = "schema"

TYPE_MAPPING = {
    "str": str,
    "int": int,
    "bool": bool,
    "dict": dict,
    "list": list,
    "float": float,
    "NoneType": type(None)
}

# processors are nothing but python functions
def get_processors_from_script(script_path):
    import ast

    function_names = []
    if not script_path or not os.path.exists(script_path):
        return function_names

    try:
        with open(script_path, "r") as file:
            tree = ast.parse(file.read(), filename=script_path)
        function_names = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        return function_names
    
    except Exception as e:
        logger.error(f"Failed to fetch processors from script: {script_path}, Error: {e}")
        return function_names

class FlowValidator:
    def __init__(self) -> None:
        pass

    def _load_schema(self, schema_file: str) -> Dict[str, Any]:
        schema_path = os.path.join(SCHEMA_DIR, schema_file)
        try:
            with open(schema_path, "r") as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            logger.error(f"Schema file '{schema_file}' not found in '{SCHEMA_DIR}'.")
            raise
        except yaml.YAMLError as e:
            logger.error(f"Error loading schema file '{schema_file}': {e}")
            raise

    def validate_against_schema(self, data: Dict[str, Any], schema: Dict[str, Any]) -> bool:
        errors = []
        
        for key, rules in schema.items():
            value = data.get(key)
            
            if rules.get("mandatory", False) and key not in data:
                errors.append(f"Missing mandatory key '{key}'")

            if value and not isinstance(value, TYPE_MAPPING.get(rules["type"], None)):
                errors.append(f"Key '{key}' must be of type {rules['type']}")

        if errors:
            logger.error(f", ".join(errors))
            return False
        
        return True
    
    def validate_flow_structure(self, flow: Dict[str, Any]) -> bool:

        end = flow.get("end", "")
        flow_id = flow.get("id", "")
        start = flow.get("start", "")
        steps = flow.get("steps", [])
        trigger = flow.get("trigger", "")
        step_ids = {step["id"] for step in steps}
        
        flow_schema = self._load_schema("flow.yaml")
        if not self.validate_against_schema(flow, flow_schema):
            logger.error(f"Flow: {flow_id} validation failed. Error: Invalid Schema.")
            return False

        if flow_id in global_registry.flows:
            logger.error(f"Flow: {flow_id} validation failed. Error: Flow with same id already exists.")
            return False

        if trigger in global_registry.triggers:
            logger.error(f"Flow: {flow_id} validation failed. Error: Conflicting triggers, a flow with this trigger:{trigger} already exists.")
            return False

        if not self.validate_start_and_end_steps(flow_id, step_ids, start, end):
            return False

        return True


    def validate_start_and_end_steps(self, flow_id: str, step_ids: List[Dict[str, Any]], start, end) -> bool:
        if not start in step_ids:
            logger.error(f"Flow validation failed: Start step ID '{start}' is not a valid step in flow '{flow_id}'.")
            return False

        if not end in step_ids:
            logger.error(f"Flow validation failed: End step ID '{end}' is not a valid step in flow '{flow_id}'.")
            return False

        return True

    def validate_dataset(self, flow_id: str, dataset_key: str) -> bool:
        if not dataset_key:
            return True

        dataset_path = os.path.join(DATASET_DIR, f"{dataset_key}.json")
        if not os.path.exists(dataset_path):
            logger.error(f"Flow validation failed: Dataset file '{dataset_key}.json' not found for flow '{flow_id}'.")
            return False
        
        return True

    def validate_steps_structure(self, flow_id: str, steps: List[Dict[str, Any]]) -> bool:

        step_ids = {step["id"] for step in steps}
        step_schema = self._load_schema("step.yaml")

        for step in steps:

            if not self.validate_against_schema(step, step_schema):
                logger.error(f"Flow: {flow_id} validation failed. Error: Invalid Schema.")
                return False
            
            if step.get("next_step") and step["next_step"] not in step_ids:
                logger.error(f"Step validation failed: 'next_step' ID '{step['next_step']}' is not valid in step '{step['id']}' of flow '{flow_id}'.")
                return False

        return True

    def collect_all_processors_in_step(self, step: dict) -> list:
        processors_in_step = []
        for processor_type in ["pre_processors", "post_processors", "processor"]:
            processors = step.get(processor_type, [])
            processors_in_step.extend(processors)
        return processors_in_step

    def validate_processors(self, flow_id: str, steps: List[Dict[str, Any]]) -> bool:

        all_processors_in_flow = []
        global_processors = get_processors_from_script(os.path.join(PROCESSORS_DIR, "processors.py"))
        flow_processors = get_processors_from_script(os.path.join(PROCESSORS_DIR, f"{flow_id}.py"))
        available_processors = global_processors + flow_processors

        for step in steps:
            all_processors_in_flow.extend(self.collect_all_processors_in_step(step))

        for processor in all_processors_in_flow:
            processor_name = processor.get("name", "")
            processer_available_as_function = processor_name in available_processors
            processer_available_as_script = os.path.exists(os.path.join(PROCESSORS_DIR, f"{processor_name}.py"))

            if not (processer_available_as_function or processer_available_as_script):
                logger.error(f"Processor validation failed: Unavailable Processor: {processor_name} mentioned in flow: {flow_id}.")
                return False

        return True


    def validate_flow(self, flow: Dict[str, Any]) -> bool:

        flow_id = flow.get("id", "")
        dataset = flow.get("dataset", "")
        steps = flow.get("steps", "")

        if not self.validate_flow_structure(flow):
            return False

        if not self.validate_dataset(flow_id, dataset):
            return False

        if not self.validate_steps_structure(flow_id, steps):
            return False

        if not self.validate_processors(flow_id, flow["steps"]):
            return False

        logger.info(f"Flow '{flow_id}' validated successfully.")
        return True

