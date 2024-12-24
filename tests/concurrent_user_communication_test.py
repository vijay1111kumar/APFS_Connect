import sys
sys.path.append("../")

from threading import Thread
from setup import temp_registry, global_registry
from core.messaging import execute_flow

def simulate_user(user_id: str, flow_id: str):
    execute_flow(user_id, flow_id)

global_registry.register_flow({
    "id": "flow1",
    "trigger": "start",
    "is_active": True, 
    "start": "step1",
    "steps": [
        {"id": "step1", "is_active": True, "next_step": "step2", "name": "Step 1"},
        {"id": "step2", "is_active": True, "next_step": "step3", "name": "Step 2"},
        {"id": "step3", "is_active": True, "next_step": None, "name": "Step 3"}
    ]
})

threads = [
    Thread(target=simulate_user, args=(f"user_{i}", "flow1"))
    for i in range(5) 
]

for thread in threads:
    thread.start()

for thread in threads:
    thread.join()
