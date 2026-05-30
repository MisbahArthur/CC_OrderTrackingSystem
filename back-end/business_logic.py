import re

def calculate_actual_hours(start, finish) -> float | None:
    if not start or not finish:
        return None
    return round((finish - start).total_seconds() / 3600, 2)

def enrich_row(row):
    d = row._asdict()
    d["actual_hours"] = calculate_actual_hours(d.get("repair_start"), d.get("repair_finish"))
    return d
