CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS order_tracking (
    order_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    repair_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    customer_name VARCHAR,
    repair_device VARCHAR,
    repair_cost NUMERIC,
    repair_start TIMESTAMP,
    repair_finish TIMESTAMP,
    repair_status VARCHAR,
    repair_eta VARCHAR,
    PRIMARY KEY (order_id, repair_id)
);
