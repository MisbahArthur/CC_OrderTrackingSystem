from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
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
    repair_status: str
    repair_eta: str
