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

export async function apiUpdateRepair(orderId, repairId, repairStatus, repairCost, repairEta) {
  const params = new URLSearchParams({ repair_id: repairId });
  if (repairStatus) params.set('repair_status', repairStatus);
  if (repairCost !== undefined && repairCost !== null && repairCost !== '') params.set('repair_cost', repairCost);
  if (repairEta) params.set('repair_eta', repairEta);
  const res = await fetch(API_BASE + `/admin/updateorder/${orderId}?${params}`, {
    method: 'PUT',
    headers: { 'accept': 'application/json' },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export async function apiCloseRepair(orderId, repairId) {
  const res = await fetch(API_BASE + `/admin/closeorder/${orderId}?repair_id=${repairId}`, {
    method: 'PUT',
    headers: { 'accept': 'application/json' },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
