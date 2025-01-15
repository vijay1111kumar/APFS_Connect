from celery.result import AsyncResult

from utils.logger import LogManager
from utils.resources import handle_request
from utils.api import send_success
from utils.scheduler import celery_app

log_manager = LogManager()
logger = log_manager.get_logger("jobs")

class JobResource:

    def on_get(self, req, resp, id=None):
        with handle_request(logger, resp):
            if id:
                result = AsyncResult(id, app=celery_app)
                job_info = {
                    "id": result.id,
                    "status": result.status,
                    "result": result.result,
                    "traceback": result.traceback,
                    "task_name": result.task_name,
                }
                return send_success(resp, data=job_info)
            
            result = []
            inspect = celery_app.control.inspect()
            scheduled_jobs = inspect.scheduled()
            if not scheduled_jobs:
                return send_success(resp, data=result, message="No scheduled jobs found.")

            for worker, jobs in scheduled_jobs.items():
                for job in jobs:
                    result.append({
                        "worker": worker,
                        "id": job["request"]["id"],
                        "task": job["request"]["name"],
                        "args": job["request"]["args"],
                        "eta": job.get("eta"),
                    })
            
            return send_success(resp, data=result)


    def on_post(self, req, resp):
        with handle_request(logger, resp):
            data = req.media
            # Should be able to add any kind of job to pipiline.
            return send_success(resp, f"Job added successfully.") 


    def on_delete(self, req, resp, id):
        with handle_request(logger, resp):
            celery_app.control.revoke(id, terminate=True)
            return send_success(resp, f"Job {id} cancelled successfully.")