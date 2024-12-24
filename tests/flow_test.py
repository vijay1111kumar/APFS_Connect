import sys
sys.path.append("../")

from setup import temp_registry, global_registry
from core.messaging import execute_flow

# Load sample flows into Global Registry
global_registry.register_flow({
    "id": "flow1",
    "trigger": "start",
    "is_active": True,  # Ensures the flow is not skipped
    "start": "step1",
    "steps": [
        {"id": "step1", "is_active": True, "next_step": "step2", "name": "Step 1"},
        {"id": "step2", "is_active": True, "next_step": "step3", "name": "Step 2"},
        {"id": "step3", "is_active": True, "next_step": None, "name": "Step 3"}
    ]
})

global_registry.register_flow({
    "id": "flow2",
    "trigger": "next",
    "is_active": True,  # Ensures the flow is not skipped
    "start": "stepA",
    "steps": [
        {"id": "stepA", "is_active": True, "next_step": "stepB", "name": "Step A"},
        {"id": "stepB", "is_active": False, "next_step": None, "name": "Step B"}
    ]
})

# Simulate user execution
execute_flow("user1", "flow1")
execute_flow("user2", "flow2", start_from_step="stepA")

# Test cycles
global_registry.register_flow({
    "id": "flow3",
    "trigger": "cycle",
    "is_active": True,  # Ensures the flow is not skipped
    "start": "stepX",
    "steps": [
        {"id": "stepX", "is_active": True, "next_step": "stepY", "name": "Step X"},
        {"id": "stepY", "is_active": True, "next_step": "stepX", "name": "Step Y"}
    ]
})
execute_flow("user3", "flow3")

# Test flow chaining
global_registry.register_flow({
    "id": "flow4",
    "trigger": "chain",
    "is_active": True,  # Ensures the flow is not skipped
    "next_flow": "flow1",
    "start": "stepZ",
    "steps": [
        {"id": "stepZ", "is_active": True, "next_step": None, "name": "Step Z"}
    ]
})
execute_flow("user4", "flow4")

