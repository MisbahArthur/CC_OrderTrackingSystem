
CREATE KEYSPACE IF NOT EXISTS order_keyspace 
WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

USE order_keyspace;
CREATE TABLE IF NOT EXISTS order_tracking (
    order_id UUID,
    repair_id TIMEUUID,
    customer_name text,
    repair_device text,
    order_creation TIMEUUID,
    repair_cost decimal,
    repair_start timestamp,
    repair_finish timestamp,
    repair_status text,
    repair_eta text,
    PRIMARY KEY (order_id, repair_id)
) WITH CLUSTERING ORDER BY (repair_id ASC);