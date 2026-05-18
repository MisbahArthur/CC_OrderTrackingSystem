import { apiAddRepair, apiCloseRepair, apiCreateBulkRepairs, apiGetOrders, apiUpdateRepair } from './api.js';
import { getStatusDisplay, renderOrders, renderRecentTable, renderStats, shortId, stripHtml } from './render.js';
import { initTheme, toggleTheme } from './theme.js';

let repairs = [];
let currentView = 'dashboard';
let editingRepairId = null;
let closingRepairId = null;
let addingRepairOrderId = null;
let currentFilter = 'all';

function showView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('nav.left a[data-view], nav.bottom a[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });
  if (view === 'orders') renderOrders(repairs, currentFilter);
  if (view === 'dashboard') { renderStats(repairs); renderRecentTable(repairs); }
}

function resetRepairRows() {
  const container = document.getElementById('repair-rows');
  const rows = container.querySelectorAll('.repair-row');
  for (let i = 1; i < rows.length; i++) rows[i].remove();
  const first = container.querySelector('.repair-row');
  first.querySelectorAll('input, select').forEach(el => el.value = '');
  first.querySelector('.btn-remove-repair').style.display = 'none';
  first.querySelector('.repair-row-label').textContent = 'Repair #1';
}

function openCreateDialog() {
  document.getElementById('form-create').reset();
  resetRepairRows();
  editingRepairId = null;
  document.getElementById('dialog-create').showModal();
}

function openEditDialog(repairId) {
  const r = repairs.find(x => x.repair_id === repairId);
  if (!r) return;
  editingRepairId = repairId;
  document.getElementById('edit-cost').value = r.repair_cost !== null && r.repair_cost !== undefined ? r.repair_cost : '';
  document.getElementById('edit-eta').value = r.repair_eta || '';
  document.getElementById('edit-status').value = '';
  document.getElementById('edit-subtitle').textContent =
    'Editing repair ' + shortId(repairId) + ' \u2014 current status: ' + stripHtml(getStatusDisplay(r));
  document.getElementById('dialog-edit').showModal();
}

function openCloseDialog(repairId) {
  const r = repairs.find(x => x.repair_id === repairId);
  if (!r) return;
  closingRepairId = repairId;
  document.getElementById('close-message').textContent = 'Close repair ' + shortId(repairId) + '?';
  document.getElementById('close-details').innerHTML =
    '<div><strong>Device:</strong> ' + stripHtml(r.repair_device || '\u2014') + '</div>' +
    '<div><strong>Customer:</strong> ' + stripHtml(r.customer_name || '\u2014') + '</div>' +
    '<div><strong>Current status:</strong> ' + stripHtml(getStatusDisplay(r)) + '</div>';
  document.getElementById('dialog-close').showModal();
}

function openAddRepairDialog(orderId) {
  const order = repairs.find(x => x.order_id === orderId);
  if (!order) return;
  addingRepairOrderId = orderId;
  document.getElementById('form-add-repair').reset();
  document.getElementById('add-repair-status').value = '';
  document.getElementById('add-repair-order-label').textContent =
    'Order: ' + shortId(orderId) + ' — Customer: ' + stripHtml(order.customer_name || '(no name)');
  document.getElementById('dialog-add-repair').showModal();
}

function closeAllDialogs() {
  document.querySelectorAll('dialog').forEach(d => d.close());
}

function toggleOrderGroup(header) {
  header.classList.toggle('collapsed');
  const body = header.nextElementSibling;
  if (body) body.classList.toggle('collapsed');
}

function setFilter(filter) {
  currentFilter = filter;
  renderOrders(repairs, currentFilter);
}

async function handleCreate() {
  const customer = document.getElementById('create-customer').value.trim();
  if (!customer) { alert('Customer name is required.'); return; }

  const rows = document.querySelectorAll('.repair-row');
  const repairs = [];
  for (const row of rows) {
    const device = row.querySelector('.create-device').value.trim();
    const cost = row.querySelector('.create-cost').value;
    const eta = row.querySelector('.create-eta').value.trim();
    const status = row.querySelector('.create-status').value;
    if (!device || !cost || !eta) {
      alert('All fields are required in each repair row.');
      return;
    }
    repairs.push({
      repair_device: device,
      repair_cost: parseFloat(cost),
      repair_eta: eta,
      repair_status: status,
    });
  }

  try {
    await apiCreateBulkRepairs({ customer_name: customer, repairs });
    closeAllDialogs();
    await loadData();
  } catch (e) {
    alert('Failed to create order: ' + e.message);
  }
}

async function handleAddRepair() {
  if (!addingRepairOrderId) return;
  const device = document.getElementById('add-repair-device').value.trim();
  const cost = document.getElementById('add-repair-cost').value;
  const eta = document.getElementById('add-repair-eta').value.trim();
  const status = document.getElementById('add-repair-status').value;

  if (!device || !cost || !eta) {
    alert('Device, Cost, and ETA are required.');
    return;
  }

  try {
    await apiAddRepair(addingRepairOrderId, {
      repair_device: device,
      repair_cost: parseFloat(cost),
      repair_eta: eta,
      repair_status: status,
    });
    closeAllDialogs();
    addingRepairOrderId = null;
    await loadData();
  } catch (e) {
    alert('Failed to add repair: ' + e.message);
  }
}

function addRepairRow() {
  const container = document.getElementById('repair-rows');
  const template = container.querySelector('.repair-row');
  const clone = template.cloneNode(true);
  clone.querySelectorAll('input, select').forEach(el => el.value = '');
  const num = container.querySelectorAll('.repair-row').length + 1;
  clone.querySelector('.repair-row-label').textContent = 'Repair #' + num;
  clone.querySelector('.btn-remove-repair').style.display = '';
  container.appendChild(clone);
}

function removeRepairRow(el) {
  const row = el.closest('.repair-row');
  row.remove();
  const container = document.getElementById('repair-rows');
  const rows = container.querySelectorAll('.repair-row');
  rows.forEach((r, i) => {
    r.querySelector('.repair-row-label').textContent = 'Repair #' + (i + 1);
    const btn = r.querySelector('.btn-remove-repair');
    btn.style.display = rows.length <= 1 ? 'none' : '';
  });
}

async function handleEdit() {
  if (!editingRepairId) return;
  const r = repairs.find(x => x.repair_id === editingRepairId);
  if (!r) return;
  const status = document.getElementById('edit-status').value;
  const cost = document.getElementById('edit-cost').value;
  const eta = document.getElementById('edit-eta').value.trim();
  if (!status && !cost && !eta) {
    alert('At least one field must be filled.');
    return;
  }
  try {
    await apiUpdateRepair(r.order_id, editingRepairId, status, cost || undefined, eta || undefined);
    closeAllDialogs();
    await loadData();
  } catch (e) {
    alert('Failed to update repair: ' + e.message);
  }
}

async function handleClose() {
  if (!closingRepairId) return;
  const r = repairs.find(x => x.repair_id === closingRepairId);
  if (!r) return;
  try {
    await apiCloseRepair(r.order_id, closingRepairId);
    closeAllDialogs();
    await loadData();
  } catch (e) {
    alert('Failed to close repair: ' + e.message);
  }
}

async function loadData() {
  try {
    repairs = await apiGetOrders();
  } catch (e) {
    alert('Failed to load repairs from server:\n' + e.message +
      '\n\nMake sure the FastAPI backend is running.\nSet API_BASE in js/api.js if needed.');
    return;
  }
  renderStats(repairs);
  renderRecentTable(repairs);
  renderOrders(repairs, currentFilter);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  document.querySelectorAll('nav a[data-view]').forEach(el => {
    el.addEventListener('click', () => showView(el.dataset.view));
  });

  document.getElementById('btn-new-repair-side').addEventListener('click', openCreateDialog);
  document.getElementById('btn-new-repair-bottom').addEventListener('click', openCreateDialog);
  document.getElementById('btn-new-repair-orders').addEventListener('click', openCreateDialog);
  document.getElementById('btn-view-all-orders').addEventListener('click', () => showView('orders'));

  document.getElementById('btn-theme').addEventListener('click', toggleTheme);
  document.getElementById('btn-theme-mobile').addEventListener('click', toggleTheme);

  document.getElementById('btn-create-save').addEventListener('click', handleCreate);
  document.getElementById('btn-edit-save').addEventListener('click', handleEdit);
  document.getElementById('btn-close-confirm').addEventListener('click', handleClose);
  document.getElementById('btn-add-repair-save').addEventListener('click', handleAddRepair);
  document.getElementById('btn-add-repair-row').addEventListener('click', addRepairRow);

  document.getElementById('repair-rows').addEventListener('click', e => {
    const btn = e.target.closest('.btn-remove-repair');
    if (btn) removeRepairRow(btn);
  });

  document.getElementById('form-create').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleCreate(); }
  });
  document.getElementById('form-edit').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleEdit(); }
  });
  document.getElementById('form-add-repair').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddRepair(); }
  });

  document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(window._searchTimeout);
    window._searchTimeout = setTimeout(() => renderOrders(repairs, currentFilter), 250);
  });

  document.getElementById('recent-table-body').addEventListener('click', e => {
    const btn = e.target.closest('[data-repair-id]');
    if (!btn) return;
    if (btn.classList.contains('btn-edit')) openEditDialog(btn.dataset.repairId);
    if (btn.classList.contains('btn-close')) openCloseDialog(btn.dataset.repairId);
  });

  document.getElementById('order-groups').addEventListener('click', e => {
    const addBtn = e.target.closest('.btn-add-repair');
    if (addBtn) {
      openAddRepairDialog(addBtn.dataset.orderId);
      return;
    }
    const btn = e.target.closest('[data-repair-id]');
    if (btn) {
      if (btn.classList.contains('btn-edit')) openEditDialog(btn.dataset.repairId);
      if (btn.classList.contains('btn-close')) openCloseDialog(btn.dataset.repairId);
      return;
    }
    const header = e.target.closest('[data-toggle="group"]');
    if (header) toggleOrderGroup(header);
  });

  document.getElementById('filter-chips').addEventListener('click', e => {
    const chip = e.target.closest('[data-filter]');
    if (chip) setFilter(chip.dataset.filter);
  });

  loadData();
});
