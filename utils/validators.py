import os
import re
import sys
import yaml
import logging

from typing import Dict, Any, List
from sqlalchemy import Enum
from sqlalchemy.inspection import inspect

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

    def validate_against_schema(self, data: Dict[str, Any], schema: Dict[str, Any]) -> str:
        errors = []
        
        for key, rules in schema.items():
            value = data.get(key)
            
            if rules.get("mandatory", False) and key not in data:
                errors.append(f"Missing mandatory key '{key}'")

            if value and not isinstance(value, TYPE_MAPPING.get(rules["type"], None)):
                errors.append(f"Key '{key}' must be of type {rules['type']}")

        if errors:
            logger.error(f", ".join(errors))
            return f", ".join(errors)
        
        return ""
    
    def validate_flow_structure(self, flow: Dict[str, Any]) -> str:
        errors = []

        end = flow.get("end", "")
        flow_id = flow.get("id", "")
        start = flow.get("start", "")
        steps = flow.get("steps", [])
        trigger = flow.get("trigger", "")
        step_ids = {step["id"] for step in steps}
        
        flow_schema = self._load_schema("flow_file.yaml")
        schema_validation_error =  self.validate_against_schema(flow, flow_schema)
        if schema_validation_error:
            errors.append(schema_validation_error)

        if flow_id in global_registry.flows:
            errors.append(f"Flow with same id already exists.")

        if trigger in global_registry.triggers:
            errors.append(f"Conflicting triggers, a flow with this trigger:{trigger} already exists.")

        invalid_steps_error = self.validate_start_and_end_steps(flow_id, step_ids, start, end)
        if invalid_steps_error:
            errors.append(invalid_steps_error)

        if errors:
            return ", ".join(errors)
        
        return ""


    def validate_start_and_end_steps(self, flow_id: str, step_ids: List[Dict[str, Any]], start, end) -> str:

        errors = []
        if not start in step_ids:
            errors.append(f"Flow validation failed: Start step ID '{start}' is missing in flow '{flow_id}'.")

        if not end in step_ids:
            errors.append(f"Flow validation failed: End step ID '{end}' is missing in flow '{flow_id}'.")

        if errors:
            return ", ".join(errors)

        return ""

    def validate_dataset(self, flow_id: str, dataset_key: str) -> str:
        if not dataset_key:
            return ""

        dataset_path = os.path.join(DATASET_DIR, f"{dataset_key}.json")
        if not os.path.exists(dataset_path):
            return f"Dataset file '{dataset_key}.json' not found for flow '{flow_id}'."
        
        return ""

    def validate_steps_structure(self, flow_id: str, steps: List[Dict[str, Any]]) -> str:

        errors = []
        step_ids = {step["id"] for step in steps}
        step_schema = self._load_schema("step.yaml")

        for step_index, step in enumerate(steps):

            schema_validation_error = self.validate_against_schema(step, step_schema)
            if schema_validation_error:
                errors.append(f"Invalid Step{step_index} Schema, Error: {schema_validation_error}")
            
            if step.get("next_step") and step["next_step"] not in step_ids:
                errors.append(f"'next_step' ID '{step['next_step']}' is not valid in step '{step['id']}' of flow '{flow_id}'.")

        if errors:
            return ", ".join(errors)

        return ""

    def collect_all_processors_in_step(self, step: dict) -> list:
        processors_in_step = []
        for processor_type in ["pre_processors", "post_processors", "processor"]:
            processors = step.get(processor_type, [])
            processors_in_step.extend(processors)
        return processors_in_step

    def validate_processors(self, flow_id: str, steps: List[Dict[str, Any]]) -> str:

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
                return f"Processor validation failed: Unavailable Processor: {processor_name} mentioned in flow: {flow_id}."
            
        return ""


    def validate_flow(self, flow: Dict[str, Any]) -> str:

        errors = []
        flow_id = flow.get("id", "")
        dataset = flow.get("dataset", "")
        steps = flow.get("steps", "")

        print("Validating flow structure")
        flow_validation_error = self.validate_flow_structure(flow)
        if flow_validation_error:
            errors.append(flow_validation_error)

        dataset_validation_error = self.validate_dataset(flow_id, dataset)
        if dataset_validation_error:
            errors.append(dataset_validation_error)

        steps_validation_error = self.validate_steps_structure(flow_id, steps)
        if steps_validation_error:
            errors.append(steps_validation_error)

        processors_validation_error =  self.validate_processors(flow_id, flow["steps"])
        if processors_validation_error:
            errors.append(processors_validation_error)

        if errors:
            logger.error(f"Flow '{flow_id}' validation failed.")
            return ", ".join(errors)

        logger.info(f"Flow '{flow_id}' validated successfully.")
        return ""


def get_enum_values(model, field_name):
    try:
        # Inspect the model to get the mapper
        mapper = inspect(model)
        print(mapper)
        if not mapper:
            raise ValueError(f"Cannot inspect model: {model}")

        # Get the column for the provided field name
        columns = mapper.columns
        if not field_name in columns :
            raise ValueError(f"Field '{field_name}' does not exist in model '{model.__name__}'.")

        # Check if the column is of type Enum
        column = columns.get(field_name)
        if not isinstance(column.type, Enum):
            raise ValueError(f"Field '{field_name}' in model '{model.__name__}' is not an ENUM type.")

        # Return the ENUM values
        return column.type.enums

    except Exception as e:
        logger.error(f"Error getting ENUM values for field '{field_name}' in model '{model}': {e}")
        raise

class SchemaValidator:
    def __init__(self, schema_dir="schema"):
        self.schema_dir = schema_dir

    def load_schema(self, schema_name: str) -> Dict[str, Any]:
        try:
            with open(f"{self.schema_dir}/{schema_name}.yaml", "r") as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            raise Exception(f"Schema file '{schema_name}' not found.")
        except yaml.YAMLError as e:
            raise Exception(f"Error loading schema file '{schema_name}': {e}")

    def validate(self, data: Dict[str, Any], schema: Dict[str, Any], model=None) -> Dict[str, Any]:
        errors = {}
        validated_data = data

        for field, rules in schema.items():
            value = data.get(field)

            # Check mandatory fields
            if rules.get("mandatory", False) and value is None:
                errors[field] = "This field is required."
                continue

            # Validate data type
            expected_type = rules.get("type")
            if value is not None and not isinstance(value, self._get_type(expected_type)):
                errors[field] = f"Expected type '{expected_type}', got '{type(value).__name__}'"
                continue

            # Validate allowed characters
            allowed_chars = rules.get("allowed_chars")
            if allowed_chars and not self._validate_chars(value, allowed_chars):
                errors[field] = f"Invalid characters for '{allowed_chars}'"
                continue

            # Validate enum values
            if expected_type == "enum" and model:
                try:
                    enum_values = get_enum_values(model, field)
                    if value not in enum_values:
                        errors[field] = f"Invalid value '{value}', allowed: {enum_values}"
                        continue
                    validated_data[field] = value
                except ValueError as e:
                    errors[field] = str(e)
                    continue

        if errors:
            raise ValueError(f"Validation errors: {errors}")

        return validated_data

    def _get_type(self, type_name: str):
        type_mapping = {
            "str": str,
            "int": int,
            "bool": bool,
            "float": float,
            "enum": str,
        }
        return type_mapping.get(type_name)

    def _validate_chars(self, value: str, allowed: str) -> bool:
        patterns = {
            "alpha": r"^[A-Za-z]+$",
            "numeric": r"^[0-9]+$",
            "alphanumeric": r"^[A-Za-z0-9]+$",
            "email": r"^[^@]+@[^@]+\.[^@]+$",
            "phone": r"^\+?[0-9]{10,15}$",
        }
        pattern = patterns.get(allowed)
        return bool(re.match(pattern, value)) if pattern else True

    def validate_partial(self, data: Dict[str, Any], schema: Dict[str, Any], model=None) -> Dict[str, Any]:
        validated_data = data
        errors = []

        for field, value in data.items():
            if field not in schema:
                raise ValueError(f"Unknown field '{field}'")

            rules = schema[field]
            if rules.get("mandatory", False) and not value:
                errors[field] = "Mandatory field: {field} cannot be empty"
                continue

            # Validate data type
            expected_type = rules.get("type")
            if value is not None and not isinstance(value, self._get_type(expected_type)):
                errors[field] = f"Expected type '{expected_type}', got '{type(value).__name__}'"
                continue

            # Validate allowed characters
            allowed_chars = rules.get("allowed_chars")
            if allowed_chars and not self._validate_chars(value, allowed_chars):
                errors[field] = f"Invalid characters for '{allowed_chars}'"
                continue

            # Validate enum values
            if expected_type == "enum" and model:
                try:
                    enum_values = get_enum_values(model, field)
                    if value not in enum_values:
                        errors[field] = f"Invalid value '{value}', allowed: {enum_values}"
                        continue
                    validated_data[field] = value
                except ValueError as e:
                    errors[field] = str(e)
                    continue

        return validated_data