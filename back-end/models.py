from pydantic import BaseModel
import uuid
class UserBase(BaseModel):
    order_id: uuid.UUID
    customer_name: str
    order_creation_time: str 
    repair_status: str
    repair_cost: float
    repair_eta: str
    repair_device : str