import uuid

from fastapi import APIRouter, Depends
from database import get_cassandra_session
from business_logic import calculate_actual_hours, parse_eta_hours, normalize_status, enrich_row

router = APIRouter()

#Base endpoint
@router.get("/")
def read_root():
    return {"message": "Welcome to the Order Tracking System API!"}

# Admin endpoints
@router.get("/admin/vieworders")
def get_orders(session=Depends(get_cassandra_session)):
    rows = session.execute("SELECT * FROM order_tracking")
    return [enrich_row(row) for row in rows]

@router.get("/admin/vieworders/{order_id}")
def get_order_repairs(order_id: str, session=Depends(get_cassandra_session)):
    rows = session.execute(
        "SELECT * FROM order_tracking WHERE order_id = %s", (uuid.UUID(order_id),)
    )
    result = [enrich_row(row) for row in rows]
    if not result:
        return {"message": "No repairs found for this order"}
    return result

# customer endpoints
@router.get("/customer/vieworders/{order_id}")
def get_order_repairs(order_id: str, session=Depends(get_cassandra_session)):
    rows = session.execute(
        "SELECT order_id, repair_id, customer_name, repair_device, repair_cost, repair_status, repair_eta FROM order_tracking WHERE order_id = %s", (uuid.UUID(order_id),)
    )
    result = [enrich_row(row) for row in rows]
    # result = [row for row in rows]
    if not result:
        return {"message": "No repairs found for this order"}
    return result
