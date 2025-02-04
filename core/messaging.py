import os
import sys
import json
import requests
import subprocess

from typing import Dict, Optional, Any
from datetime import datetime
from sqlalchemy import func, or_, and_
from uuid import uuid4

sys.path.append("../APFS_Connect/")
from utils.logger import LogManager
from settings import BASE_URL, HEADERS, MEDIA_URL
from database import get_db
from database.models import CampaignUserConversationMetadata
from requests_toolbelt.multipart.encoder import MultipartEncoder


log_manager = LogManager()
logger = log_manager.get_logger("messages")


def execute_flow(user_id: str, flow_id: str, start_from_step: Optional[dict] = {}, user_response: dict = {}) -> None:

    try: 
        from setup import global_registry, temp_registry

        if not (user_id and flow_id):
            logger.error(f"Invalid flow execution request: flow='{flow_id}', user='{user_id}'")
            return

        # Check for pending step
        user_state = temp_registry.get_user_state(user_id)
        flow = global_registry.flows.get(flow_id, {})
        if not flow:
            logger.error(f"Flow with ID '{flow_id}' not found!")
            return

        if not flow.get("is_active", False):
            logger.warning(f"Flow '{flow_id}' is inactive. Skipping execution.")
            return

        current_step_id = start_from_step.get("id") or flow.get("start")
        if not current_step_id:
            logger.error(f"Flow '{flow_id}' does not have a start step defined!")
            return

        while current_step_id:

            steps_visited = temp_registry.get_user_visited_steps(user_id)
            if current_step_id in steps_visited:
                logger.error(f"Cycle detected in flow '{flow_id}' at step '{current_step_id}'. Aborting execution.")
                temp_registry.clear_user_state(user_id)
                return

            # Retrieve the step from temp_registry if available
            user_state = temp_registry.get_user_state(user_id)
            current_step = user_state.get("current_step") if user_state else ""
            if not current_step:
                current_step = global_registry.get_step_by_id(flow_id, current_step_id)

            if not current_step or not current_step.get("is_active", False):
                logger.error(f"Step '{current_step_id}' is invalid or inactive. Skipping.")
                break

            logger.info(f"Executing step '{current_step_id}' in flow '{flow_id}' for user '{user_id}'.")

            next_step_id = execute_step(flow_id, current_step, user_id, user_response)
            if next_step_id == "wait":
                return

            if not next_step_id:
                next_flow_id = flow.get("next_flow")
                if next_flow_id:
                    flow_id = next_flow_id
                    logger.info(f"Flow '{flow_id}' completed. Loading next flow '{next_flow_id}' for user '{user_id}'.")
                    temp_registry.handle_user_flow_completion(user_id, next_flow_id)
                    execute_flow(user_id, next_flow_id)
                else:
                    logger.info(f"Flow '{flow_id}' completed for user '{user_id}'. Clearing state.")
                    temp_registry.clear_user_state(user_id)
                break


            next_step = global_registry.get_step_by_id(flow_id, next_step_id)
            temp_registry.update_user_step(user_id, next_step)
            temp_registry.update_visited_steps_for_user(user_id, current_step_id)
            current_step_id = next_step_id

    except Exception as e:
        logger.error(f"Faield to execute flow Error: {e}")


def execute_step(flow_id: str, step: dict, user_id: str, user_response: dict = {}) -> Optional[str]:
    import time
    from setup import temp_registry

    try:
        processor_index = 0
        user_state = temp_registry.get_user_state(user_id)
        user_has_pending_step = temp_registry.user_has_pending_step(user_id)
        if user_state and user_state.get("id", "") == step["id"]:
            processor_index = user_state.get("processor_index", 0)

        if not user_has_pending_step:
            # Pre-processors
            pre_processors = step.get("pre_processors", [])
            for pre_processor in pre_processors:
                run_processor(flow_id, pre_processor, user_id, user_response)

            # Handle Content
            content = step.get("content", {})
            handle_content(content, user_id)

        # Main Processors
        processors = step.get("processor", [])
        for idx, processor in enumerate(processors[processor_index:], start=processor_index):
            if processor.get("wait", False):
                # Save the current state and return "wait" to stop execution
                logger.info(f"Step '{step['id']}' paused for user '{user_id}' at processor index {idx}.")
                temp_registry.update_user_step_as_pending(user_id, flow_id, step, processor_index=idx)
                return "wait"
            run_processor(flow_id, processor, user_id, user_response)

        # Clear pending state for this step after all processors are executed
        temp_registry.clear_user_pending_step(user_id)

        # Post-processors
        post_processors = step.get("post_processors", [])
        for post_processor in post_processors:
            run_processor(flow_id, post_processor, user_id, user_response)
            time.sleep(2)

        # On Success
        on_success = step.get("on_success")
        if on_success:
            logger.info(f"Step '{step['id']}' succeeded: {on_success}")

        return step.get("next_step")

    except Exception as e:
        # On Fail
        on_fail = step.get("on_fail")
        if on_fail:
            logger.error(f"Step '{step['id']}' failed: {on_fail}")
        logger.error(f"Error executing step '{step['id']}': {e}")
        return None



def handle_content(content: Dict, user_id: str) -> None:

    if not (content and user_id):
        return
    
    content_type: Optional[str] = content.get("type")

    if content_type == "text":
        send_text_message(user_id, content["body"])

    elif content_type in ["image", "video", "audio"]:
        send_media_message(
            user_id, content_type, link=content["body"], caption=content.get("caption")
        )

    elif content_type == "interactive":
        send_interactive_message(user_id, content["body"])

    else:
        logger.warning(f"Unsupported content type: {content_type}")


def send_text_message(phone_number: str, text: str) -> None:
    payload: Dict = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "text",
        "text": {"preview_url": False, "body": text},
    }
    send_message(payload)

def send_media_message(
    phone_number: str,
    media_type: str,
    link: Optional[str] = None,
    caption: Optional[str] = None,
) -> None:
    payload: Dict = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": media_type,
        media_type: {"link": link},
    }
    if caption:
        payload[media_type]["caption"] = caption
    send_message(payload)

def send_interactive_message(phone_number: str, interactive_content: Dict) -> None:
    payload: Dict = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "interactive",
        "interactive": interactive_content,
    }
    send_message(payload)

def send_message(payload: Dict) -> None:
    try:
        phone_number = payload.get("to", "")
        response: requests.Response = requests.post(
            BASE_URL, headers=HEADERS, json=payload
        )
        response.raise_for_status()
        log_conversation(phone_number, {"type": "text", "content": payload, "direction": "outgoing"})
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send message: {e} Error: {response.content}")

def log_conversation(phone_number, message_details):
    from setup import temp_registry

    user_state = temp_registry.get_user_state(phone_number)
    current_campaign_job = user_state.get("campaign_job_id")
    MESSAGE_DUMP_DIR = os.getenv("MESSAGE_DUMP_DIR", "")

    if not current_campaign_job:
        with open(f"{MESSAGE_DUMP_DIR}/{phone_number}.json", "a") as file:
            file.write(json.dumps(message_details) + "\n")
            return 

    with get_db() as db:  
        metadata = db.query(CampaignUserConversationMetadata).filter(
            and_(
                CampaignUserConversationMetadata.phone_no == str(phone_number),
                CampaignUserConversationMetadata.campaign_job_id == current_campaign_job
            )
        ).first()

        if metadata:
            history = metadata.message_history or []
            history.append({
                "timestamp": datetime.now().isoformat(),
                **message_details
            })
            metadata.message_history = history
        else:
            new_metadata = CampaignUserConversationMetadata(
                id=str(uuid4()), 
                phone_no=str(phone_number),
                campaign_job_id=current_campaign_job,
                message_history=[{
                    "timestamp": datetime.now().isoformat(),
                    **message_details
                }],
                created_at=datetime.now()
            )
            db.add(new_metadata)

        db.commit()

def run_processor(
    flow_id: str, processor_data: Dict, user_id: str, user_response: Optional[Dict] = None
) -> None:
    
    # Processors precedence:
    # 1. script
    # 2. Flow processor (Processer as function in {flow_id}.py)
    # 3. Global processor (Processor as function) in processor.py

    try:
        from setup import global_registry

        processor_name = processor_data.get("name", "")
        payload_template = processor_data.get("payload_template", {"user_response": "{{user_response}}"})
        payload = format_template(payload_template, user_response)
        payload["user_id"] = user_id

        if isinstance(processor_name, str) and processor_name.endswith(".py"):
            logger.info(f"Executing processor:{processor_name} as script'")
            execute_processor_script(processor_executor, payload)

        flow_processor_mapping = json.loads(global_registry.flow_processors.get(flow_id))
        processor_executor = flow_processor_mapping.get(processor_name)
        if not processor_executor:
            processor_executor = global_registry.get_processor_by_name(processor_name)
            # processor_executor = global_registry.processors.get(processor_name)

        if not processor_executor:
            logger.warning(f"Processor '{processor_name}' not found!")
            return

        if callable(processor_executor):
            logger.info(f"Executing processor: {processor_name} as function with payload: {payload}")
            processor_executor(payload)
        else:
            logger.error(f"Processor '{processor_name}' has an invalid executor.")

    except Exception as e:
        logger.error(f"Error executing processor '{processor_name}': {e}")


def execute_processor_script(script_path: str, payload: Dict[str, Any]) -> None:
    try:
        payload_json = json.dumps(payload)
        subprocess.run(["python", script_path, payload_json], check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error executing script '{script_path}': {e}")

def format_template(template: Dict, context: Optional[Dict]) -> Dict:
    def replace_placeholders(value: Any) -> Any:
        if isinstance(value, str) and context:
            for key, val in context.items():
                value = value.replace(f"{{{{{key}}}}}", str(val))
        return value

    return {key: replace_placeholders(val) for key, val in template.items()}


import requests
import mimetypes
import os
from requests_toolbelt.multipart.encoder import MultipartEncoder

def upload_media(file_path: str) -> str:
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return None

    # Determine MIME type
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type is None:
        logger.error(f"Unsupported file type for {file_path}")
        return None

    # Correctly format multipart form-data
    form_data = MultipartEncoder(
        fields={
            "file": (os.path.basename(file_path), open(file_path, "rb"), mime_type),
            "messaging_product": "whatsapp",
            "type": mime_type
        }
    )

    # Update headers with correct Content-Type
    headers = HEADERS
    headers["Content-Type"] = form_data.content_type

    # Send the request
    response = requests.post(MEDIA_URL, headers=headers, data=form_data)

    if response.status_code == 200:
        media_id = response.json().get("id")
        return media_id
    
    logger.error(f"Media upload failed: {response.text}")
    return None


def send_local_media_message(phone_number: str, file_path: str, caption: str = None) -> None:
    
    media_id = upload_media(file_path)
    if not media_id:
        logger.error("Failed to upload media. Message not sent.")
        return

    extension = file_path.split(".")[-1].lower()
    if extension in ["jpg", "jpeg", "png"]:
        media_type = "image"
    elif extension in ["mp4", "mov", "avi"]:
        media_type = "video"
    elif extension in ["pdf", "docx", "xlsx"]:
        media_type = "document"
    else:
        logger.error(f"Unsupported media type: {extension}")
        return

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone_number,
        "type": media_type,
        media_type: {
            "id": media_id
        }
    }

    if caption:
        payload[media_type]["caption"] = caption

    headers = HEADERS
    headers["Content-Type"] = "application/json"

    response = requests.post(BASE_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        print("Message sent successfully!")
    else:
        logger.error(f"Failed to send message: {response.text}")

def send_template_message(phone_number: str, template_name: str, placeholders:list=[]) -> None:
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone_number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "en"}
        }
    }

    if placeholders:
        payload["template"]["components"] = [
            {
                "type": "body",
                "parameters": [{"type": "text", "text": str(placeholder)} for placeholder in placeholders]
            }
        ]

    send_message(payload)
