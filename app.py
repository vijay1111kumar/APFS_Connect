import sys
import falcon

sys.path.append("../APFS_Connect/")
from utils.logger import LogManager
from setup import global_registry

app: falcon.App = falcon.App()

log_manager = LogManager()
logger = log_manager.get_logger("server")

if __name__ == "__main__":
    from wsgiref.simple_server import make_server

    try:
        global_registry.load_flows()
        logger.info("Starting the server on port 9999...")
        with make_server("", 9999, app) as httpd:
            httpd.serve_forever()
    except Exception as e:
        logger.error(f"Error starting the server: {e}")