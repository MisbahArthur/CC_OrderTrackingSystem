import { apiCloseRepair, apiCreateRepair, apiGetOrders, apiUpdateRepair } from './api.js';
import { getStatusDisplay, renderOrders, renderRecentTable, renderStats, shortId, stripHtml } from './render.js';
import { initTheme, toggleTheme } from './theme.js';

let repairs = [];
let currentView = 'dashboard';
let editingRepairId = null;
let closingRepairId = null;
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

function openCreateDialog() {
  document.getElementById('form-create').reset();
  document.getElementById('create-status').value = '';
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
  const device = document.getElementById('create-device').value.trim();
  const cost = document.getElementById('create-cost').value;
  const eta = document.getElementById('create-eta').value.trim();
  const status = document.getElementById('create-status').value;

  if (!customer || !device || !cost || !eta) {
    alert('All fields are required.');
    return;
  }

  try {
    await apiCreateRepair({
      customer_name: customer,
      repair_device: device,
      repair_cost: parseFloat(cost),
      repair_eta: eta,
      repair_status: status,
    });
    closeAllDialogs();
    await loadData();
  } catch (e) {
    alert('Failed to create repair: ' + e.message);
  }
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

  document.getElementById('form-create').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleCreate(); }
  });
  document.getElementById('form-edit').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleEdit(); }
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
