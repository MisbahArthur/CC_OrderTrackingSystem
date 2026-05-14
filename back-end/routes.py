import datetime
import uuid
from typing import Optional
from fastapi import APIRouter, Depends
from database import get_cassandra_session
from business_logic import enrich_row
from models import OrderTracking

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

@router.put("/admin/updateorder/{order_id}")
def update_order(order_id: str, repair_id: str, repair_status: Optional[str] = None,
                  repair_cost: Optional[float] = None, repair_eta: Optional[str] = None,
                  session=Depends(get_cassandra_session)):
    session.execute(
        "UPDATE order_tracking SET repair_status = %s, repair_cost = %s, repair_eta = %s WHERE order_id = %s AND repair_id = %s",
        (repair_status, repair_cost, repair_eta, uuid.UUID(order_id), uuid.UUID(repair_id))
    )
    return {"message": f"Order {order_id} repair {repair_id} updated"}

@router.post("/admin/createorder")
def create_order(order: OrderTracking, session=Depends(get_cassandra_session)):
    
    new_order_id = uuid.uuid4()
    new_repair_id = uuid.uuid1()
    creation_time = uuid.uuid1()
    current_time = datetime.datetime.now()

    query = """
        INSERT INTO order_tracking (order_id, repair_id, customer_name, repair_device, order_creation, repair_cost, repair_start, repair_finish, repair_status, repair_eta) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    session.execute(query, (new_order_id, new_repair_id, order.customer_name, order.repair_device, creation_time, order.repair_cost, current_time, None, order.repair_status, order.repair_eta))

    return {
        "message": "Order created successfully",
        "order_id": str(new_order_id),
        "repair_id": str(new_repair_id)
    }

@router.put("/admin/closeorder/{order_id}")
def close_order(order_id: str, repair_id: str, session=Depends(get_cassandra_session)):
    current_time = datetime.datetime.now()
    session.execute(
        "UPDATE order_tracking SET repair_status = %s, repair_finish = %s WHERE order_id = %s AND repair_id = %s",
        ("Closed", current_time, uuid.UUID(order_id), uuid.UUID(repair_id))
    )
    return {"message": f"Order {order_id} repair {repair_id} has been successfully closed"}

# customer endpoints
@router.get("/customer/vieworders/{order_id}")
def get_order_repairs(order_id: str, session=Depends(get_cassandra_session)):
    rows = session.execute(
        "SELECT order_id, repair_id, customer_name, repair_device, repair_cost, repair_status, repair_eta FROM order_tracking WHERE order_id = %s", (uuid.UUID(order_id),)
    )
    result = [enrich_row(row) for row in rows]
    closed= [row for row in result if row['repair_status'] == 'Closed']
    if closed:
        return {"message": "This order has been closed."}
    elif not result:
        return {"message": "No repairs found for this order"}
    return result
