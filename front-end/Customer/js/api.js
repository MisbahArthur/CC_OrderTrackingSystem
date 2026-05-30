const API_BASE = 'http://localhost:8000';

export async function fetchOrder(orderId) {
  const url = `${API_BASE}/customer/vieworders/${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  const data = await res.json();

  if (data.message && (!Array.isArray(data) || data.length === 0)) {
    throw new Error(data.message || 'No repairs found for this order');
  }

  const orders = Array.isArray(data) ? data : [data];

  if (orders.length === 0) {
    throw new Error('No repairs found for this order');
  }

  return orders;
}
