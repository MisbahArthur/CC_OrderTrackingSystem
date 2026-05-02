from pydantic import BaseModel

class UserBase(BaseModel):
    user_id: int
    username: str
    email: str