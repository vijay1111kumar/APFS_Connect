
import sys
import requests
sys.path.append("../")

from core.messaging import send_text_message, send_media_message


bikes_inventory = {
    "scrambler": {
        "name": "Ducati Scrambler",
        "CC": "803 cc",
        "fuel": "Petrol",
        "on_road_price": "₹9,39,000",
        "power": "73 hp",
        "torque": "66.2 Nm",
        "description": "Compact, lightweight, and stylish with a retro vibe.",
        "image": "https://www.scramblerducati.com/wp-content/uploads/2024/10/Scrambler-Ducati-Icon-Dark-stream-34.png"
    },
    "panigale": {
        "name": "Ducati Panigale V4",
        "CC": "1103 cc",
        "fuel": "Petrol",
        "on_road_price": "₹23,50,000",
        "power": "214 hp",
        "torque": "124 Nm",
        "description": "High-performance superbike designed for ultimate speed.",
        "image": "https://images.ctfassets.net/x7j9qwvpvr5s/WyFIpWwZWJUWiyzQvwgaj/e9725eda0cf1abeaff7990a34f21bfde/1600_x_1000_-_3_4_ant_dx.jpg?fm=webp&q=90"
    },
    "multistrada": {
        "name": "Ducati Multistrada V4",
        "CC": "1158 cc",
        "fuel": "Petrol",
        "on_road_price": "₹22,00,000",
        "power": "170 hp",
        "torque": "125 Nm",
        "description": "Versatile adventure bike built for touring and performance.",
        "image": "https://images.ctfassets.net/x7j9qwvpvr5s/4qYYhkaDKcFvbkxuymqD1u/0a69684c931d200077e10c0c54e5dd05/Multistrada-V4-Rally-slide-content-800x354.jpg"
    }
}

data_store = {}

def process_bike_selection(payload):
    bike_id = payload.get("id")
    user_id = payload.get("user_id")

    bike_data = bikes_inventory.get(bike_id)
    if not bike_data:
        send_text_message(user_id, "Sorry, the selected bike is not available.")
        return

    bike_image = bike_data.pop("image", "")
    details = "\n".join([f"*{detail.upper()}*: {bike_data.get(detail)}" for detail in bike_data])

    send_media_message(
        phone_number=user_id,
        media_type="image",
        link=bike_image,
        caption=details
    )


def process_location_selection(payload):
    user_id = payload.get("user_id")
    selected_location = payload.get("value", "Unknown Location")

    if selected_location == "Unknown Location":
        send_text_message(user_id, "Invalid location selected. Please try again.")
        return

    # Save location temporarily for the user
    data_store[user_id] = {"location": selected_location}
    send_text_message(user_id, f"Location selected: {selected_location}. Please choose a time slot.")


def process_time_slot_selection(payload):
    user_id = payload.get("user_id")
    selected_time_slot = payload.get("value", "Unknown Time Slot")

    if selected_time_slot == "Unknown Time Slot":
        send_text_message(user_id, "Invalid time slot selected. Please try again.")
        return

    user_data = data_store.pop(user_id, {})
    location = user_data.get("location", "Unknown Location")

    if location == "Unknown Location":
        send_text_message(user_id, "Location information is missing. Please restart the booking process.")
        return

    confirmation_message = f"Your booking has been confirmed at {location} on {selected_time_slot}."
    send_text_message(user_id, confirmation_message)



def process_otp(payload):
    global data_store

    user_id = payload.get("user_id")
    otp = payload.get("otp")
    loan_id = data_store.get(user_id, {})

    print(f"PROCESS OTP PAYLOAD for loan : {loan_id}", payload)

    verify_url = f"https://app.loan2wheels.com/documents_fetcher/{loan_id}/verify"
    verify_payload = {"otp": otp}
    verify_response = requests.post(verify_url, json=verify_payload)

    print("VERIFY OTP API RESPONSE", verify_response.content)

    if verify_response.status_code != 200:
        send_text_message(user_id, "OTP verification failed. Please try again.")
        return

    document_links = verify_response.json().get("data", {}).get("documents", {})
    if not document_links:
        send_text_message(user_id, "No documents found for this Loan ID.")
        return

    print("LOGIN to TITAN")
    login_url = "https://app.loan2wheels.com/login"
    login_credentials = {"username": "aparoksha_user", "password": "admin@Loan2Wheels"}  
    login_response = requests.post(login_url, json=login_credentials)

    if login_response.status_code != 200:
        send_text_message(user_id, "Failed to authenticate. Please try again later.")
        return

    api_key = login_response.headers.get("Set-Cookie")
    if not api_key:
        send_text_message(user_id, "Failed to authenticate. Please try again later.")
        return

    print("LOGIN API KEY", api_key)

    for document_name, document_link in document_links.items():
        if not document_link:
            continue
        send_media_message(user_id, "image", document_link, f"Here is your {document_name}", api_key)

def process_loan_id(payload):
    global data_store

    import requests
    loan_id = payload.get("loan_id")
    user_id = payload.get("user_id")
    data_store[user_id] = loan_id

    print(f">>>> LOAN ID: {loan_id}  | user_id: {user_id}")

    url = f"https://app.loan2wheels.com/documents_fetcher/{loan_id}/otp"
    response = requests.post(url)

    if response.status_code != 200:
        print("Response from request OTP >>>>>>: ", response.content)
        send_text_message(user_id, "Failed to fetch OTP. Please check the Loan ID and try again.")
        return

    data = response.json().get("data", {})
    phone_number = data.get("customer_phone_number", "")
    otp = data.get("otp")

    if not phone_number or not otp:
        send_text_message(user_id, "Failed to fetch OTP. Please check the Loan ID and try again.")
        return

    print(f">>>>>>>>> Customer phone_number:{phone_number} | OTP: {otp}")
    # send_text_message(phone_number, f"Your OTP is: {otp}")
    # save_pending_step(user_id, {"loan_id": loan_id})


def process_love(payload):

    print("Failed love >>>", payload)
    user_id = payload.get("user_id")
    user_response = payload.get("user_response")

    print("processing love >>>", user_response)
    if user_response == "I love you":
        send_text_message(user_id, "❤️")
        return