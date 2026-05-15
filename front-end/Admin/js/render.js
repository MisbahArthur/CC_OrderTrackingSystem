export function shortId(uuid) {
  return uuid ? uuid.slice(0, 8) : '\u2014';
}

export function formatCurrency(v) {
  if (v === null || v === undefined || v === '') return '\u2014';
  return '$' + parseFloat(v).toFixed(2);
}

export function formatDate(d) {
  if (!d) return '\u2014';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
      dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return d; }
}

export function getStatusColor(status, display) {
  const s = ((status || '') + ' ' + (display || '')).toLowerCase();
  if (s.includes('complete') || s.includes('finish')) return 'green';
  if (s.includes('progress') || s.includes('active')) return 'blue';
  if (s.includes('created') || s.includes('queue') || s.includes('schedule') || s.includes('picked')) return 'orange';
  if (s.includes('review') || s.includes('waiting') || s.includes('under')) return 'purple';
  return 'grey';
}

export function getStatusDisplay(repair) {
  return repair.repair_status_display || repair.repair_status || '\u2014';
}

const STATUS_OPEN = 'Picked-up';
const STATUS_IN_PROGRESS = 'Work in progress';
const STATUS_PARTS = 'Picking up parts';
const STATUS_FINISHED = 'Finished';
const STATUS_CLOSED = 'Closed';

function matchStatus(r, value) {
  return (r.repair_status || '') === value || (r.repair_status_display || '') === value;
}

function isOpen(r) {
  return matchStatus(r, STATUS_OPEN);
}

function isInProgress(r) {
  return matchStatus(r, STATUS_IN_PROGRESS) || matchStatus(r, STATUS_PARTS);
}

export function isComplete(r) {
  return matchStatus(r, STATUS_FINISHED);
}

function isClosed(r) {
  return matchStatus(r, STATUS_CLOSED);
}

export function groupByOrder(items) {
  const map = {};
  for (const r of items) {
    const oid = r.order_id || 'unknown';
    if (!map[oid]) map[oid] = { order_id: oid, repairs: [], customer_name: r.customer_name };
    map[oid].repairs.push(r);
  }
  return Object.values(map);
}

export function stripHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function actionButtonsHtml(r) {
  const complete = isComplete(r);
  return `
    <div class="table-actions">
      <button class="circle transparent small btn-edit ripple" data-repair-id="${r.repair_id}">
        <i class="small">edit</i>
        <div class="tooltip">Update</div>
      </button>
      ${complete ? `
      <button class="circle transparent small btn-close ripple" data-repair-id="${r.repair_id}">
        <i class="small">check_circle</i>
        <div class="tooltip">Close</div>
      </button>
      ` : ''}
    </div>
  `;
}

export function renderStats(repairs) {
  const total = repairs.length;
  const open = repairs.filter(r => isOpen(r)).length;
  const inProgress = repairs.filter(r => isInProgress(r)).length;
  const complete = repairs.filter(r => isComplete(r)).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-open').textContent = open;
  document.getElementById('stat-progress').textContent = inProgress;
  document.getElementById('stat-complete').textContent = complete;
  document.getElementById('dashboard-timestamp').textContent = 'Last updated: ' + new Date().toLocaleString();
}

export function renderRecentTable(repairs) {
  const tbody = document.getElementById('recent-table-body');
  const sorted = [...repairs].sort((a, b) => {
    const da = a.repair_finish || a.order_creation || '';
    const db = b.repair_finish || b.order_creation || '';
    return db.localeCompare(da);
  });
  const recent = sorted.slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="center-align">No repairs yet</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(r => `
    <tr>
      <td>${stripHtml(r.customer_name || '\u2014')}</td>
      <td>${stripHtml(r.repair_device || '\u2014')}</td>
      <td>${formatCurrency(r.repair_cost)}</td>
      <td class="status-cell"><span class="chip fill ripple ${getStatusColor(r.repair_status, r.repair_status_display)} small status-chip">${stripHtml(getStatusDisplay(r))}</span></td>
      <td>${r.repair_eta || '\u2014'}</td>
      <td>${actionButtonsHtml(r)}</td>
    </tr>
  `).join('');
}

export function renderFilterChips(repairs, currentFilter) {
  const container = document.getElementById('filter-chips');
  const counts = { all: repairs.length };
  counts.open = repairs.filter(r => isOpen(r)).length;
  counts.progress = repairs.filter(r => isInProgress(r)).length;
  counts.complete = repairs.filter(r => isComplete(r)).length;
  counts.closed = repairs.filter(r => isClosed(r)).length;

  const categories = { all: 'All', open: 'Open', progress: 'In Progress', complete: 'Completed', closed: 'Closed' };
  const colors = { all: '', open: 'orange', progress: 'blue', complete: 'green', closed: 'grey' };

  let html = '';
  for (const [key, label] of Object.entries(categories)) {
    const color = colors[key];
    let cls = 'chip ripple';
    if (currentFilter === key) {
      cls += ` fill${color ? ' ' + color : ' primary'}`;
    } else {
      cls += ` border${color ? ` ${color}-text ${color}-border` : ''}`;
    }
    html += `<button class="${cls}" data-filter="${key}">
      ${label} <span class="count" style="margin-left:4px;">${counts[key]}</span>
    </button>`;
  }

  container.innerHTML = html;
}

export function renderOrders(repairs, currentFilter) {
  const container = document.getElementById('order-groups');
  const empty = document.getElementById('orders-empty');
  const search = (document.getElementById('search-input').value || '').toLowerCase().trim();

  let filtered = [...repairs];
  if (currentFilter !== 'all') {
    filtered = filtered.filter(r => {
      if (currentFilter === 'open') return isOpen(r);
      if (currentFilter === 'progress') return isInProgress(r);
      if (currentFilter === 'complete') return isComplete(r);
      if (currentFilter === 'closed') return isClosed(r);
      return matchStatus(r, currentFilter);
    });
  }
  if (search) {
    filtered = filtered.filter(r =>
      (r.customer_name || '').toLowerCase().includes(search) ||
      (r.repair_device || '').toLowerCase().includes(search) ||
      (r.repair_id || '').toLowerCase().includes(search) ||
      (r.order_id || '').toLowerCase().includes(search) ||
      (r.repair_status || '').toLowerCase().includes(search)
    );
  }

  const groups = groupByOrder(filtered);

  if (groups.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  renderFilterChips(repairs, currentFilter);

  container.innerHTML = groups.map(g => `
    <div class="order-card small-margin">
      <div class="order-card-header row middle-align collapsed" data-toggle="group">
        <i class="arrow small">expand_more</i>
        <div>
          <span class="medium-text bold">${shortId(g.order_id)}</span>
          <span class="small-text" style="opacity:0.6;margin-left:8px;">${g.customer_name ? stripHtml(g.customer_name) : '(no name)'}</span>
        </div>
        <div class="max"></div>
        <span class="chip small ripple">${g.repairs.length} repair${g.repairs.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="order-card-body collapsed">
        <div class="scroll-x">
          <table class="stripes">
            <thead>
              <tr>
                <th>Repair ID</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Cost</th>
                <th>Status</th>
                <th>ETA</th>
                <th>Start</th>
                <th>Finish</th>
                <th class="center-align">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${g.repairs.map(r => `
                <tr>
                  <td class="repair-id">${shortId(r.repair_id)}</td>
                  <td>${stripHtml(r.customer_name || '\u2014')}</td>
                  <td>${stripHtml(r.repair_device || '\u2014')}</td>
                  <td>${formatCurrency(r.repair_cost)}</td>
                  <td class="status-cell"><span class="chip fill ripple ${getStatusColor(r.repair_status, r.repair_status_display)} small status-chip">${stripHtml(getStatusDisplay(r))}</span></td>
                  <td>${r.repair_eta || '\u2014'}</td>
                  <td class="small-text">${formatDate(r.repair_start)}</td>
                  <td class="small-text">${formatDate(r.repair_finish)}</td>
                  <td>${actionButtonsHtml(r)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `).join('');
}
