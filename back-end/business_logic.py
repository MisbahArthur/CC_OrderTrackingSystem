import re

# Status map to normalize various status values to a consistent set of display values.
# e.g. Created -->Picked-up
STATUS_MAP = {
    "Created": "Picked-up",
    "In progress": "Work in progress",
    "Repair complete": "Finished",
    "Complete": "Finished",
    "Under review": "Work in progress",
    "In queue": "Picked-up",
    "Scheduled": "Picked-up",
}

def parse_eta_hours(eta_text: str | None) -> float | None:
    if not eta_text:
        return None
    match = re.search(r'([\d.]+)\s*h', eta_text.lower())
    return float(match.group(1)) if match else None


def calculate_actual_hours(start, finish) -> float | None:
    if not start or not finish:
        return None
    return round((finish - start).total_seconds() / 3600, 2)

def normalize_status(raw: str | None) -> str:
    if raw in STATUS_MAP:
        return STATUS_MAP[raw]
    return raw

# recalculates hours and normalizes status for a given row, returning an enriched dictionary for API response.
# note: look for a better solution.
def enrich_row(row):
    d = row._asdict()
    d["actual_hours"] = calculate_actual_hours(d.get("repair_start"), d.get("repair_finish"))
    d["estimated_hours"] = parse_eta_hours(d.get("repair_eta"))
    if d["actual_hours"] is not None and d["estimated_hours"] is not None:
        d["variance_hours"] = round(d["actual_hours"] - d["estimated_hours"], 2)
    else:
        d["variance_hours"] = None
    d["repair_status_display"] = normalize_status(d.get("repair_status"))
    return d
