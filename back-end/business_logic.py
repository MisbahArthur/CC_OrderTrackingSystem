
def calculate_actual_hours(start , finish) -> float | None:
    if not start or not finish:
        return None
    return round((finish - start).total_seconds() / 3600, 2)

def enrich_row(row):
    # Note: Depending on your Postgres driver, you might need dict(row) instead of row._asdict()
    # - psycopg2.extras.NamedTupleCursor -> row._asdict() works
    # - psycopg2.extras.DictCursor -> dict(row) or just use row directly
    # - asyncpg -> dict(row)
    
    # Convert SQLAlchemy ORM object to dictionary dynamically
    d = {column.name: getattr(row, column.name) for column in row.__table__.columns}
    
    # Calculate actual hours
    d["actual_hours"] = calculate_actual_hours(d.get("repair_start"), d.get("repair_finish"))
    
    # Cast UUIDs to strings so they can be JSON serialized by FastAPI
    d["order_id"] = str(d["order_id"])
    d["repair_id"] = str(d["repair_id"])
    
    return d