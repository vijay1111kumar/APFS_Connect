from sqlalchemy.orm import Session
from typing import Any, Dict, List
from database.models import Promotion, Flow, Campaign, Remainder, User

class Repository:
    def __init__(self, model):
        self.model = model

    def create(self, db: Session, data: Dict[str, Any]):
        obj = self.model(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def read(self, db: Session, obj_id: str):
        return db.query(self.model).filter(self.model.id == obj_id).first()

    def read_all(self, db: Session):
        return db.query(self.model).all()

    def update(self, db: Session, obj_id: str, data: Dict[str, Any]):
        obj = db.query(self.model).filter(self.model.id == obj_id).first()
        if not obj:
            return None
        for key, value in data.items():
            setattr(obj, key, value)
        db.commit()
        db.refresh(obj)
        return obj

    def delete(self, db: Session, obj_id: str):
        obj = db.query(self.model).filter(self.model.id == obj_id).first()
        if not obj:
            return None
        db.delete(obj)
        db.commit()
        return obj

promotion_repo = Repository(Promotion)
flow_repo = Repository(Flow)
campaign_repo = Repository(Campaign)
remainder_repo = Repository(Remainder)
user_repo = Repository(User)
