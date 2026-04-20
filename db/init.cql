
CREATE KEYSPACE IF NOT EXISTS order_keyspace 
WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

USE order_keyspace;

CREATE TABLE IF NOT EXISTS order_to_be_repaired (
    order_id text,
    order_creation_time timeuuid,
    customer_name text,
    repair_status text,
    repair_cost decimal,
    repair_eta text,
    repair_device text,
    PRIMARY KEY (order_id, order_creation_time)
) WITH CLUSTERING ORDER BY (order_creation_time DESC);

CREATE TABLE IF NOT EXISTS orders (
    order_id text,
    repair_device text,
    repair_status text,
    repair_start timestamp,
    repair_finish timestamp,
    repair_cost decimal,
    order_creation timestamp,
    PRIMARY KEY (order_id, repair_device)
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id text PRIMARY KEY,
    customer_name text,
    customer_mobile text,
    customer_email text
);

CREATE TABLE IF NOT EXISTS parts (
    part_id text PRIMARY KEY,
    part_name text,
    part_cost decimal
);