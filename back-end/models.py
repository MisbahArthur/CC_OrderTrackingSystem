import uuid
from typing import Optional
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from database import Base
from sqlalchemy import Column, DateTime, String, Numeric
from sqlalchemy.dialects.postgresql import UUID


# # Extracted the regex pattern to a constant to avoid repeating it
STATUS_PATTERN = r"^(Picked-up|Work in progress|picking up parts|Finished|Closed)$"

class OrderTrackingDB(Base):
    __tablename__ = "order_tracking"
    order_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    repair_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    customer_name = Column(String, index=True)
    repair_device = Column(String)
    repair_cost = Column(Numeric)
    repair_start = Column(DateTime, nullable=True)
    repair_finish = Column(DateTime, nullable=True)
    repair_status = Column(String)
    repair_eta = Column(String)


class RepairItem(BaseModel):
    repair_device: str
    repair_cost: Decimal
    repair_start: Optional[datetime] = None
    repair_finish: Optional[datetime] = None
    repair_status: str = Field(..., pattern=STATUS_PATTERN)
    repair_eta: str

class BulkOrderCreate(BaseModel):
    customer_name: str
    repairs: list[RepairItem]

# Since AddRepairRequest was perfectly identical to RepairItem, 
# we can just inherit from it to keep your code DRY (Don't Repeat Yourself).
class AddRepairRequest(RepairItem):
    repair_device: str
    repair_cost: Decimal
    repair_start: Optional[datetime] = None
    repair_finish: Optional[datetime] = None
    repair_status: str = Field(..., pattern=STATUS_PATTERN)
    repair_eta: str

class OrderTracking(BaseModel):
    # Added IDs: Your Postgres tables and routes use these, so your response model should include them
    customer_name: str
    repair_device: str
    repair_cost: Decimal
    repair_start: Optional[datetime] = None
    repair_finish: Optional[datetime] = None
    repair_status: str = Field(..., pattern=STATUS_PATTERN)
    repair_eta: str
    
    # We added this based on your very first file! 
    # Since enrich_row() adds this key, Pydantic needs to know about it to allow FastAPI to return it.
    actual_hours: Optional[float] = None
