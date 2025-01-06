from sqlalchemy.inspection import inspect

def serialize_model(model):
    """Convert a SQLAlchemy model instance into a dictionary."""
    return {column.key: getattr(model, column.key) for column in inspect(model).mapper.column_attrs}
