import datetime
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import  get_database
from business_logic import enrich_row
from models import  BulkOrderCreate, AddRepairRequest, OrderTrackingDB

router = APIRouter()

# Base endpoint
@router.get("/")
def read_root():
    return {"message": "Welcome to the Order Tracking System API!"}


# Admin endpoints
@router.get("/admin/vieworders")
def get_orders(session: Session = Depends(get_database)):
    rows = session.query(OrderTrackingDB).all()
    return [enrich_row(row) for row in rows]

@router.get("/admin/vieworders/{order_id}")
def get_order_repairs(order_id: str, session: Session = Depends(get_database)):
    rows = session.query(OrderTrackingDB).filter(OrderTrackingDB.order_id == order_id).all()
    if not rows:
        return {"message": "No repairs found for this order"}
    return [enrich_row(row) for row in rows]
    

@router.put("/admin/updateorder/{order_id}")
def update_order(order_id: str, repair_id: str, repair_status: Optional[str] = None,
                    repair_cost: Optional[float] = None, repair_eta: Optional[str] = None, session: Session = Depends(get_database)):
        current_time = datetime.datetime.now()

        repair = session.query(OrderTrackingDB).filter(
            OrderTrackingDB.order_id == order_id, 
            OrderTrackingDB.repair_id == repair_id
        ).first()
        if not repair:
            raise HTTPException(status_code=404, detail="Repair not found")
        
        if repair_status:
            repair.repair_status = repair_status
        if repair_cost:
            repair.repair_cost = repair_cost
        if repair_eta:
            repair.repair_eta = repair_eta
        
        if repair_status == "Finished":
            repair.repair_finish = current_time

        session.commit()
        return {"message": f"Order {order_id} repair {repair_id} has been successfully updated"}

@router.post("/admin/createorders")
def create_orders_bulk(order: BulkOrderCreate, session: Session = Depends(get_database)):
    new_order_id = uuid.uuid4()
    current_time = datetime.datetime.now()
    creation_time = datetime.datetime.now()
    repair_ids = []

    for repair_item in order.repairs:
        new_repair_id = str(uuid.uuid4())
        new_entry = OrderTrackingDB(
            order_id=new_order_id,
            repair_id=new_repair_id,
            customer_name=order.customer_name,
            repair_device=repair_item.repair_device,
            repair_cost=repair_item.repair_cost,
            repair_start=repair_item.repair_start or current_time,
            repair_finish=repair_item.repair_finish,
            repair_status=repair_item.repair_status,
            repair_eta=repair_item.repair_eta
        )
        session.add(new_entry)
        repair_ids.append(new_repair_id)
    
    session.commit()
    return {"message": f"Order {new_order_id} with {len(order.repairs)} repairs has been successfully created", "order_id": new_order_id}

@router.post("/admin/addrepair/{order_id}")
def add_repair(order_id: str, repair: AddRepairRequest, session: Session = Depends(get_database)):
    existing_order = session.query(OrderTrackingDB).filter(OrderTrackingDB.order_id == order_id).first()
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")
    new_repair_id = uuid.uuid4()
    current_time = datetime.datetime.now()
    new_entry = OrderTrackingDB(
        order_id=order_id,
        repair_id=new_repair_id,
        customer_name=existing_order.customer_name,
        repair_device=repair.repair_device,
        repair_cost=repair.repair_cost,
        repair_start=repair.repair_start or current_time,
        repair_finish=repair.repair_finish,
        repair_status=repair.repair_status,
        repair_eta=repair.repair_eta
    )
    session.add(new_entry)
    session.commit()
    return {"message": f"Repair {new_repair_id} has been successfully added to order {order_id}", "repair_id": new_repair_id}

@router.put("/admin/closeorder/{order_id}")
def close_order(order_id: str, session: Session = Depends(get_database)):
    current_time = datetime.datetime.now().replace(microsecond=0)
    repair = session.query(OrderTrackingDB).filter(OrderTrackingDB.order_id == order_id).first()
    if not repair:
        raise HTTPException(status_code=404, detail="Order not found")
    
    repair.repair_status = "Closed"
    repair.repair_finish = current_time
    session.commit()
    return {"message": f"Order {order_id} has been successfully closed"}

# customer endpoints
@router.get("/customer/vieworders/{order_id}")
def get_customer_order_repairs(order_id: str, session: Session = Depends(get_database)):
    rows = session.query(OrderTrackingDB).filter(OrderTrackingDB.order_id == order_id).all()
    result = [enrich_row(row) for row in rows]
    
    closed = [row for row in result if row["repair_status"] == "Closed"]
    if closed:
        return {"message": "This order has been closed."}
    elif not result:
        return {"message": "No repairs found for this order"}
    
    allowed_keys = {"order_id", "repair_id", "customer_name", "repair_device", "repair_cost", "repair_status", "repair_eta", "actual_hours"}
    result = [{key: row[key] for key in allowed_keys} for row in result]
    return result