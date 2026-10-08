from database.database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
columns = inspector.get_columns('users')
for column in columns:
    print(f"Column: {column['name']}, Type: {column['type']}")
