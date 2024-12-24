
import time
from rich.live import Live
from rich.table import Table
from setup import temp_registry, global_registry

def generate_global_registry_table():
    table = Table(title="Global Registry")
    table.add_column("Flow ID", style="cyan", justify="left")
    table.add_column("Trigger", style="green", justify="left")
    table.add_column("Processors", style="magenta", justify="left")

    for flow_id, flow in global_registry.flows.items():
        trigger = flow.get("trigger", "N/A")
        processors = ", ".join(global_registry.flow_processors.get(flow_id, []))
        table.add_row(flow_id, trigger, processors)
    return table

def generate_temp_registry_table():
    table = Table(title="Temp Registry")
    table.add_column("User ID", style="cyan", justify="left")
    table.add_column("Current Flow", style="green", justify="left")
    table.add_column("Current Step", style="magenta", justify="left")

    for user_id, data in temp_registry.user_data.items():
        current_flow = data.get("current_flow", "N/A")
        current_step = data.get("current_step", "N/A")
        table.add_row(user_id, current_flow, current_step)
    return table

def monitor():
    with Live(refresh_per_second=1) as live:
        while True:

            global_table = generate_global_registry_table()
            temp_table = generate_temp_registry_table()
            
            combined_output = Table.grid(padding=(1, 2))
            combined_output.add_row(global_table)
            combined_output.add_row(temp_table)
            
            live.update(combined_output)
            time.sleep(0.5)  # Refresh every 0.5 seconds

def start_monitoring():
    import threading
    monitor_thread = threading.Thread(target=monitor, daemon=True)
    monitor_thread.start()


start_monitoring()