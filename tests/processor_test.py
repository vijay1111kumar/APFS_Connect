import sys
sys.path.append("../")

from unittest.mock import Mock
from setup import temp_registry, global_registry
from core.messaging import execute_flow

# Mock Processors
def proc1(payload):
    print(f"Executing proc1 with payload: {payload}")

def proc2(payload):
    print(f"Executing proc2 with payload: {payload} (PAUSES)")
    return "wait"  # Simulate wait condition

def proc3(payload):
    print(f"Executing proc3 with payload: {payload}")

# Register processors in the Global Registry
global_registry.processors.update({
    "proc1": proc1,
    "proc2": proc2,
    "proc3": proc3,
})

# Mock Flow
mock_flow = {
    "id": "example_flow",
    "is_active": True,
    "start": "step1",
    "steps": [
        {
            "id": "step1",
            "processor": [
                {"name": "proc1"},
                {"name": "proc2", "wait": True},
                {"name": "proc3"}
            ],
            "next_step": None,
            "is_active": True
        }
    ]
}

# Add the flow to the Global Registry
global_registry.flows[mock_flow["id"]] = mock_flow
global_registry.flow_processors[mock_flow["id"]] = {
    "proc1": proc1,
    "proc2": proc2,
    "proc3": proc3,
}




def test_processor_wait_and_resume():
    user_id = "test_user"
    flow_id = "example_flow"

    # Step 1: Start the flow
    print("\n=== Starting the Flow ===")
    execute_flow(user_id, flow_id)

    # Step 2: Verify TempRegistry for Pending Step
    pending_step = temp_registry.get_pending_step(user_id)
    assert pending_step is not None, "Pending step should exist after processor with 'wait'."
    assert pending_step["step"]["id"] == "step1", "Pending step should be 'step1'."
    assert pending_step["processor_index"] == 1, "Processor index should point to 'proc2'."

    print(f"Saved pending step: {pending_step}")

    # Step 3: Simulate user response and resume the flow
    print("\n=== Resuming the Flow ===")
    execute_flow(user_id, flow_id)

    # Step 4: Verify that the flow resumed correctly
    pending_step_after_resumption = temp_registry.get_pending_step(user_id)
    assert pending_step_after_resumption is None, "Pending step should be cleared after flow completion."
    print("Flow completed successfully.")



test_processor_wait_and_resume()