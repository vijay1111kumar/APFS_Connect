from sqlalchemy import and_
from database.repositories import Repository
from sqlalchemy_serializer import serialize_collection

class BaseResource:

    def __init__(self, repo: Repository, entity_name: str, logger):
        self.entity_name = entity_name
        self.repo = repo
        self.logger = logger
        self.restricted_fields = ["id", "created_at", "modified_at", "created_by", "modified_by"]  # Override in child classes if needed

    def check_restricted_fields(self, req_body):
        return [field for field in req_body.keys() if field in self.restricted_fields]

    def handle_filter(self, db, model, filters):
        query = db.query(model)
        filter_conditions = []

        for key, value in filters.items():
            if hasattr(model, key):
                filter_conditions.append(getattr(model, key) == value)

        if filter_conditions:
            query = query.filter(and_(*filter_conditions))

        return serialize_collection(query.all())
    
    def handle_get(self, db, id=None):
        if id:
            record = self.repo.read(db, id)
            if not record:
                return None, f"{self.entity_name} with id: {id} not found"
            return record.to_dict(), None
        
        return serialize_collection(self.repo.read_all(db)), None

    def handle_post(self, db, req_body):
        try:
            record = self.repo.create(db, req_body)
        except Exception as e:
            return None, str(e)
        return record.to_dict(), ""

    def handle_patch(self, db, id, req_body):
        record = self.repo.update(db, id, req_body)
        if not record:
            return None, f"{self.entity_name} with id: {id} not found"
        return record.to_dict(), None

    def handle_delete(self, db, id):
        record = self.repo.delete(db, id)
        if not record:
            return None, f"{self.entity_name} with id: {id} not found"
        return f"{self.entity_name} deleted successfully", None
