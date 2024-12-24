from registries.temp_registry import TempRegistry
from registries.global_registry import GlobalRegistry

temp_registry = TempRegistry()
global_registry = GlobalRegistry()

global_registry.load_flows()