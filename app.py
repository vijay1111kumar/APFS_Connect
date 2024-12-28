import os
import sys
import falcon
import random
import json

from falcon import media
from werkzeug.utils import secure_filename
from falcon_multipart.middleware import MultipartMiddleware

from core.webhook import WhatsAppWebhook
sys.path.append("../APFS_Connect/")
from utils.logger import LogManager



# Directory to save uploaded files
UPLOAD_DIR = "upload"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Validation function (example placeholder)
def validate_flow(file_path):
    # Example validation logic
    # Replace this with your actual validation logic
    if file_path.endswith(".xlsx") or file_path.endswith(".xls"):
        return {"status": "success", "message": "Flow validated successfully."}
    else:
        return {"status": "error", "message": "Invalid file format."}

dates = [ "01 February", "02 February", "03 February", "04 February", "05 February", "06 February", "07 February", "08 February", "09 February", "10 February", "11 February", "12 February", "13 February", "14 February", "15 February", "16 February", "17 February", "18 February", "19 February", "20 February", "21 February", "22 February", "23 February", "24 February", "25 February", "26 February", "27 February", "28 February", "29 February", "30 February"]
class FlowResource:
    def on_get(self, req, resp, id):
        mock_data = {
            "1": {
                "title": "Diwali Promotion",
                "subtitle": "Offering zero processing fees",
                "growth_rate": 12,
                "values": [random.randint(1000, 6000) for i in range(30)],
                "dates": dates,
            },
            "2": {
                "title": "New Year Sale",
                "subtitle": "Interest rates as low as 16%",
                "growth_rate": -5,
                "values": [random.randint(1000, 6000) for i in range(30)] ,
                "dates": dates,
            },
            "4": {
                "title": "Summer Promo",
                "subtitle": "Chance to Win 2 ton A/C",
                "growth_rate": -5,
                "values": [random.randint(1000, 6000) for i in range(30)],
                "dates": dates,
            },
        }

        # Get the data for the given flow ID
        flow_data = mock_data.get(id, {"error": "Flow not found"})

        resp.media = flow_data
        resp.status = falcon.HTTP_200
        
    def on_post(self, req, resp):
        # Parse the multipart form data
        form = req.get_media()
        try:
            name = form.get("name")
            date = form.get("date")
            time = form.get("time")
            flow = form.get("flow")
            file = form.get("file")

            # Ensure all required fields are present
            if not all([name, date, time, flow, file]):
                resp.media = {"status": "error", "message": "Missing required fields."}
                resp.status = falcon.HTTP_400
                return

            # Save the uploaded file
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_DIR, filename)

            with open(file_path, "wb") as f:
                while True:
                    chunk = file.stream.read(4096)
                    if not chunk:
                        break
                    f.write(chunk)

            # Validate the flow
            validation_result = validate_flow(file_path)

            if validation_result["status"] == "success":
                resp.media = {"status": "success", "message": validation_result["message"]}
                resp.status = falcon.HTTP_201
            else:
                resp.media = {"status": "error", "message": validation_result["message"]}
                resp.status = falcon.HTTP_400

        except Exception as e:
            resp.media = {"status": "error", "message": f"An error occurred: {str(e)}"}
            resp.status = falcon.HTTP_500



class AnalyticsAPI:
    def generate_dummy_users(self):
        return [
            {"user_id": f"user_{i}", "messages_sent": random.randint(10, 100), "messages_received": random.randint(5, 50)}
            for i in range(1, 11)
        ]

    def on_get_overview(self, req, resp):
        category = req.get_param("category", default="all")

        data = {
            "promotions": [
                {"title": "Total Sent", "current_value": 1200, "past_value": 1100, "trend": 10},
                {"title": "Replies", "current_value": 800, "past_value": 850, "trend": -6},
                {"title": "Response Rate", "current_value": "66.7%", "past_value": "65.0%", "trend": 2},
                {"title": "Most Successful", "current_value": "Diwali Promo", "past_value": "Onam Promo", "trend": 3},
                {"title": "Unopened", "current_value": 300, "past_value": 350, "trend": 14},
                {"title": "Average Replies", "current_value": 5, "past_value": 4.5, "trend": 11},
            ],
            "reminders": [
                {"title": "Total Sent", "current_value": 500, "past_value": 450, "trend": 11},
                {"title": "Acknowledged", "current_value": 350, "past_value": 300, "trend": 17},
                {"title": "Completion Rate", "current_value": "70%", "past_value": "65%", "trend": 8},
                {"title": "Missed", "current_value": 50, "past_value": 70, "trend": -29},
                {"title": "Retry Success", "current_value": 30, "past_value": 25, "trend": 20},
                {"title": "Retry Rate", "current_value": "60%", "past_value": "50%", "trend": 20},
            ],
            "flows": [
                {"title": "Triggered", "current_value": 200, "past_value": 180, "trend": 11},
                {"title": "Completed", "current_value": 150, "past_value": 130, "trend": 15},
                {"title": "Drop-offs", "current_value": 50, "past_value": 60, "trend": -17},
                {"title": "Completion Rate", "current_value": "75%", "past_value": "70%", "trend": 7},
                {"title": "Most Successful Flow", "current_value": "Loan Approval Flow", "past_value": None, "trend": None},
                {"title": "Least Successful Flow", "current_value": "Feedback Flow", "past_value": None, "trend": None},
            ],
            "messages": [
                {"title": "Total Sent", "current_value": 1000, "past_value": 950, "trend": 5},
                {"title": "Total Received", "current_value": 900, "past_value": 850, "trend": 6},
                {"title": "Replies", "current_value": 700, "past_value": 750, "trend": -7},
                {"title": "Average Response Time", "current_value": "5 mins", "past_value": "6 mins", "trend": 17},
                {"title": "Most Active User", "current_value": "User123", "past_value": None, "trend": None},
                {"title": "Reply Rate", "current_value": "70%", "past_value": "75%", "trend": -7},
            ],
        }

        resp.media = data.get(category, [])


    def on_get_promotions(self, req, resp):
        promotions = [
            {
                "id": 1,
                "name": "Diwali Promotion",
                "start_date": "2024-10-15",
                "end_date": "2024-10-20",
                "connect_flow": "Diwali Flow",
                "users_reached": 345,
                "status": "Active",
            },
            {
                "id": 2,
                "name": "New Year Sale",
                "start_date": "2024-12-31",
                "connect_flow": "New Year Flow",
                "users_reached": 785,
                "end_date": "2025-01-05",
                "status": "Scheduled",
            },
            {
                "id": 3,
                "name": "Summer Promo",
                "start_date": "2024-06-01",
                "connect_flow": "Summer Flow",
                "users_reached": 677,
                "end_date": "2024-06-10",
                "status": "Completed",
            },
        ]

        # Send response
        resp.media  = promotions
        resp.status = falcon.HTTP_200

    def on_get_remainders(self, req, resp):
        # Reminders analytics
        resp.media = {
            "total_reminders_sent": 200,
            "completion_rate": "75%",
            "retry_analysis": {"successful_retries": 20, "failed_retries": 5},
            "missed_reminders": 10,
        }

    def on_get_user_stats(self, req, resp):
        # User-level analytics
        resp.media = {
            "engagement": {
                "messages_sent": 2000,
                "messages_read": 1500,
                "reply_percentage": "65%",
            },
            "activity": {
                "active_users": 300,
                "inactive_users": 50,
            },
            "flow_completion": {
                "completed": 400,
                "discontinued": 100,
                "drop_off_steps": {
                    "step1": 20,
                    "step2": 40,
                    "step3": 40,
                },
            },
            "retention": {
                "returning_users": 250,
                "churned_users": 50,
            },
        }

    def on_get_content_performance(self, req, resp):
        # Content performance analytics
        resp.media = {
            "read_rate_by_type": {"text": "85%", "image": "75%", "video": "65%"},
            "interaction_rate": {"cta": "90%", "plain_text": "50%"},
        }

    def on_get_time_based(self, req, resp):
        resp.media = {
            "hourly_trends": {
                "hours": ["9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
                "interactions": [50, 120, 180, 100, 70],
            },
            "weekly_trends": {
                "days": ["Monday", "Wednesday", "Friday", "Sunday"],
                "interactions": [300, 500, 700, 400],
            },
            "message_delivery": {
                "average_delivery_time": "5 seconds",
                "retry_success": {
                    "morning": 15,
                    "afternoon": 20,
                    "evening": 10,
                },
            },
        }


    def on_get_error_failures(self, req, resp):
        resp.media = {
            "delivery_failures": {
                "user_offline": 20,
                "invalid_number": 10,
                "other": 5,
            },
            "failed_flows": 8,
            "scheduler_failures": 3,
        }

    def on_get_team_productivity(self, req, resp):
        # Team productivity metrics
        resp.media = {
            "average_processing_time": "2 minutes",
            "scheduler_efficiency": "95%",
        }

    def on_get_flow_stats(self, req, resp):
        resp.media = [
            {
                "flow_id": "flow_1",
                "name": "Diwali Promotion",
                "completion_rate": "80%",
                "drop_off_steps": {"step1": 5, "step2": 10, "step3": 5},
            },
            {
                "flow_id": "flow_2",
                "name": "New Year Reminder",
                "completion_rate": "50%",
                "drop_off_steps": {"step1": 15, "step2": 20, "step3": 10},
            },
            {
                "flow_id": "flow_3",
                "name": "Feedback Survey",
                "completion_rate": "30%",
                "drop_off_steps": {"step1": 25, "step2": 15, "step3": 10},
            },
        ]

    def on_get_summary(self, req, resp):
        resp.media = {
            "overview": {
                "total_messages_sent": 12345,
                "active_users": 234,
                "flows_completed": 567,
            },
            "promotions": {
                "total_promotions_sent": 150,
                "response_rate": "60%",
            },
            "reminders": {
                "total_reminders_sent": 200,
                "completion_rate": "75%",
            },
            "user_engagement": {
                "messages_sent": 2000,
                "reply_percentage": "65%",
            },
            "flow_stats": {
                "most_engaging_flow": "Diwali Promotion",
                "least_engaging_flow": "Feedback Survey",
            },
            "time_based": {
                "peak_hour": "12 PM",
                "most_active_day": "Friday",
            },
            "errors": {
                "delivery_failures": 35,
                "failed_flows": 8,
            },
        }

    def on_get_test(self, req, resp):
        resp.media = {
            "cards": [
                {"title": "Card Title 1", "description": "Card description for item 1."},
                {"title": "Card Title 2", "description": "Card description for item 2."},
                {"title": "Card Title 3", "description": "Card description for item 3."},
            ],
            "table": [
                {"name": "John Doe", "email": "john@example.com", "role": "Admin"},
                {"name": "Jane Smith", "email": "jane@example.com", "role": "User"},
                {"name": "Robert Brown", "email": "robert@example.com", "role": "Manager"},
            ],
            "actions": [
                {"label": "Approve", "type": "success"},
                {"label": "Reject", "type": "error"},
                {"label": "Pending", "type": "warning"},
            ],
        }


app = falcon.App(middleware=[MultipartMiddleware()])
analytics = AnalyticsAPI()
flow_resource = FlowResource()


# Add routes
app.add_route('/whatsapp', WhatsAppWebhook())
app.add_route("/apfsconnect/api/analytics/flows/{id}", flow_resource)
app.add_route("/apfsconnect/api/analytics/test", analytics, suffix="test")
app.add_route("/apfsconnect/api/analytics/overview", analytics, suffix="overview")
app.add_route("/apfsconnect/api/analytics/promotions", analytics, suffix="promotions")
app.add_route("/apfsconnect/api/analytics/remainders", analytics, suffix="remainders")
app.add_route("/apfsconnect/api/analytics/user-stats", analytics, suffix="user_stats")
app.add_route("/apfsconnect/api/analytics/content-performance", analytics, suffix="content_performance")
app.add_route("/apfsconnect/api/analytics/time-based", analytics, suffix="time_based")
app.add_route("/apfsconnect/api/analytics/error-failures", analytics, suffix="error_failures")
app.add_route("/apfsconnect/api/analytics/team-productivity", analytics, suffix="team_productivity")
app.add_route("/apfsconnect/api/analytics/flow-stats", analytics, suffix="flow_stats")
app.add_route("/apfsconnect/api/analytics/summary", analytics, suffix="summary")

log_manager = LogManager()
logger = log_manager.get_logger("server")

if __name__ == "__main__":
    from wsgiref.simple_server import make_server

    try:
        logger.info("Starting the server on port 9999...")
        with make_server("", 9999, app) as httpd:
            httpd.serve_forever()
    except Exception as e:
        logger.error(f"Error starting the server: {e}")
