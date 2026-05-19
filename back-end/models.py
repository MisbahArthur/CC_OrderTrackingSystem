from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class RepairItem(BaseModel):
    repair_device: str
    repair_cost: Decimal
    repair_start: Optional[datetime] = None
    repair_finish: Optional[datetime] = None
    repair_status: str = Field(..., pattern=r"^(Picked-up|Work in progress|picking up parts|Finished|Closed)$")
    repair_eta: str


class BulkOrderCreate(BaseModel):
    customer_name: str
    repairs: list[RepairItem]


class AddRepairRequest(BaseModel):
    repair_device: str
    repair_cost: Decimal
    repair_start: Optional[datetime] = None
    repair_finish: Optional[datetime] = None
    repair_status: str = Field(..., pattern=r"^(Picked-up|Work in progress|picking up parts|Finished|Closed)$")
    repair_eta: str


class OrderTracking(BaseModel):
    customer_name: str
    repair_device: str
    repair_cost: Decimal
    repair_start: Optional[datetime] = None
    repair_finish: Optional[datetime] = None
    repair_status: str = Field(..., pattern=r"^(Picked-up|Work in progress|picking up parts|Finished|Closed)$")
    repair_eta: str
