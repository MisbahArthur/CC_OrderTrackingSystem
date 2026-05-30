import { fetchOrder } from './api.js';
import { renderStepper } from './stepper.js';
import { initTheme } from './theme.js';

const $ = (id) => document.getElementById(id);

function show(id) {
  document.querySelectorAll('[id^="view"]').forEach((el) => {
    el.style.display = el.id === id ? '' : 'none';
  });
}

function showTraceContent(show) {
  $('traceContent').style.display = show ? '' : 'none';
  $('loadingSpinner').style.display = 'none';
  $('traceError').style.display = 'none';
}

function showTraceError(msg) {
  $('traceContent').style.display = 'none';
  $('loadingSpinner').style.display = 'none';
  $('traceError').style.display = '';
  $('traceErrorMessage').textContent = msg;
}

function showTraceLoading() {
  $('traceContent').style.display = 'none';
  $('loadingSpinner').style.display = '';
  $('traceError').style.display = 'none';
}

function createRepairCard(data) {
  const card = document.createElement('article');
  card.className = 'bg-white dark:bg-zinc-800 rounded-xl shadow-none border border-gray-100 dark:border-zinc-700 p-5 mb-4';

  const orderId = data.order_id || '—';
  const repairId = data.repair_id || '—';
  const customerName = data.customer_name || '—';
  const device = data.repair_device || '—';
  const cost = data.repair_cost;
  const costDisplay = cost ? `$${parseFloat(cost).toFixed(2)}` : '—';
  const eta = data.repair_eta || '—';
  const status = data.repair_status_display || data.repair_status;
  const date = data.repair_start
    ? new Date(data.repair_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  card.innerHTML = `
    <div class="flex justify-between items-start mb-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Track Order</h2>
        <p class="text-xs text-gray-400 mt-1">Order ID: ${orderId}</p>
      </div>
      <div class="text-lg font-bold text-teal-500">${costDisplay}</div>
    </div>
    <div class="stepper-container mb-4"></div>
    <div class="bg-gray-50 dark:bg-zinc-700 rounded-xl p-4">
      <div class="flex items-center gap-2 mb-3">
        <i class="ph ph-wrench text-teal-600 text-lg"></i>
        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Repair Info</h3>
      </div>
      <div class="space-y-2 text-sm">
        <div class="font-bold text-gray-900 dark:text-white">${customerName}</div>
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-zinc-400">Repair ID</span>
          <span class="text-gray-900 dark:text-white font-medium">${repairId}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-zinc-400">Device</span>
          <span class="text-gray-900 dark:text-white font-medium">${device}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-zinc-400">ETA</span>
          <span class="text-gray-900 dark:text-white font-medium">${eta}</span>
        </div>
        <hr class="border-t border-gray-200 dark:border-zinc-600 my-2">
        <div class="flex justify-between">
          <span class="text-gray-500 dark:text-zinc-400">Cost</span>
          <strong class="text-gray-900 dark:text-white font-bold">${costDisplay}</strong>
        </div>
      </div>
    </div>
  `;

  const stepperContainer = card.querySelector('.stepper-container');
  renderStepper(status, stepperContainer);

  return card;
}

function populateOrders(orders) {
  const container = $('repairCardsContainer');
  container.innerHTML = '';
  container.className = orders.length > 1 ? 'lg:grid lg:grid-cols-2 lg:gap-4' : '';

  orders.forEach((data) => {
    const card = createRepairCard(data);
    container.appendChild(card);
  });
}

async function handleTrack(e) {
  e.preventDefault();
  const input = $('orderIdInput');
  const orderId = input.value.trim();

  $('landingError').style.display = 'none';
  history.replaceState(null, '', window.location.pathname);

  if (!orderId) {
    $('landingError').textContent = 'Please enter an Order ID.';
    $('landingError').style.display = '';
    return;
  }

  show('viewTrace');
  showTraceLoading();

  try {
    const orders = await fetchOrder(orderId);
    populateOrders(orders);
    showTraceContent(true);
  } catch (err) {
    showTraceError(err.message || 'Something went wrong. Please try again.');
  }
}

function handleBack() {
  $('landingError').style.display = 'none';
  show('viewLanding');
}

function handleRetry() {
  handleTrack(new Event('submit'));
}

function init() {
  const form = $('trackForm');
  form.addEventListener('submit', handleTrack);

  $('backBtn').addEventListener('click', handleBack);
  $('retryBtn').addEventListener('click', handleRetry);

  $('orderIdInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') form.dispatchEvent(new Event('submit'));
  });

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');
  if (orderId) {
    $('orderIdInput').value = orderId;
    handleTrack(new Event('submit'));
  }

  initTheme();
}

document.addEventListener('DOMContentLoaded', init);
