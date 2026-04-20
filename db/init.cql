
CREATE KEYSPACE IF NOT EXISTS order_keyspace 
WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

USE order_keyspace;

CREATE TABLE IF NOT EXISTS order_tracking (
    order_id UUID PRIMARY KEY,
    customer_name text,
    order_creation_time timestamp,
    repair_status text,
    repair_cost decimal,
    repair_eta text,
    repair_device text
);