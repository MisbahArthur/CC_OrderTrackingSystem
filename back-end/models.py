from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
import uuid


class OrderTracking(BaseModel):
    order_id: uuid.UUID
    repair_id: uuid.UUID
    customer_name: str
    repair_device: str
    order_creation: uuid.UUID
    repair_cost: Decimal
    repair_start: Optional[datetime] = None
    repair_finish: Optional[datetime] = None
    repair_status: str = Field(..., pattern=r"^(Picked-up|Work in progress|picking up parts|Finished)$") #ensures only valid status values are accepted
    repair_eta: str
