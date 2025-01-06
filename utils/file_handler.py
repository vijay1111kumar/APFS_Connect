import json

def update_json_file(file_path: str, data: dict) -> None:
    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)

def read_json_file(file_path: str) -> dict:
    with open(file_path, "r") as f:
        return json.load(f)