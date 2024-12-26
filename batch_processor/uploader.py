import pandas as pd
from typing import Dict, List

from utils.logger import LogManager

log_manager = LogManager()
logger = log_manager.get_logger("promotions")

class Uploader:
    @staticmethod
    def validate_excel(file_path: str, required_columns: List[str]) -> bool:
        try:
            df = pd.read_excel(file_path)
            for column in required_columns:
                if column not in df.columns:
                    raise ValueError(f"Missing required column: {column}")
            return True
        except Exception as e:
            print(f"Validation failed: {e}")
            return False

    @staticmethod
    def parse_excel(file_path: str) -> List[Dict]:
        import pandas as pd
        try:
            df = pd.read_excel(file_path)
            if "Phone Number" not in df.columns:
                raise ValueError("Excel must contain a 'Phone Number' column.")
            return df.to_dict(orient="records")
        except Exception as e:
            logger.error(f"Failed to parse Excel file: {e}")
            return []
