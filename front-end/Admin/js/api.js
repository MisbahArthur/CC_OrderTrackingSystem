export const API_BASE = 'http://localhost:8000';

export async function apiGetOrders() {
  const res = await fetch(API_BASE + '/admin/vieworders');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export async function apiCreateRepair(data) {
  const res = await fetch(API_BASE + '/admin/createorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export async function apiUpdateRepair(id, data) {
  const res = await fetch(API_BASE + `/admin/updaterepair/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export async function apiCloseRepair(id) {
  const res = await fetch(API_BASE + `/admin/closerepair/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repair_status: 'Complete' }),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
