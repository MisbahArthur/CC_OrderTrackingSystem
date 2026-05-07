import uuid

from fastapi import APIRouter, Depends
from database import get_cassandra_session
from models import UserBase

router = APIRouter()

@router.get("/")
def read_root():
    return {"message": "Welcome to the Order Tracking System API!"}

@router.get("/hello")
def read_root():
    return {"message": "Hello, World!"}

@router.get("/admin/vieworders")
def get_orders(session=Depends(get_cassandra_session)):
    rows = session.execute("SELECT * FROM order_tracking")
    return [row._asdict() for row in rows]
