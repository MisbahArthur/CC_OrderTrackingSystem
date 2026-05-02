from fastapi import APIRouter, Depends
from database import get_cassandra_session
from models import UserBase

router = APIRouter()

@router.get("/hello")
def read_root():
    return {"message": "Hello, World!"}

@router.get("/users/{user_id}", response_model=UserBase)
def get_user(user_id: int, session = Depends(get_cassandra_session)):
    query = "SELECT user_id, username, email FROM users WHERE user_id = %s"
    row = session.execute(query, (user_id,)).one()
    return row # FastAPI/Pydantic converts the Row object to JSON