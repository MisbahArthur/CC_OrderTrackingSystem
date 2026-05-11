import { initTheme } from './theme.js';
import { fetchOrder } from './api.js';
import { renderStepper, getStatusMessage } from './stepper.js';

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
  card.className = 'border padding elevate small-elevate';

  const cost = data.repair_cost;
  const costDisplay = cost ? `$${parseFloat(cost).toFixed(2)}` : '—';
  const status = data.repair_status_display || data.repair_status;
  const msg = getStatusMessage(status);

  card.innerHTML = `
    <div class="small-text" style="font-weight:600;margin-bottom:0.5rem;">
      Repair: ${data.repair_id || '—'}
    </div>
    <div class="row">
      <div class="s12 m6">
        <div class="small-text">Customer</div>
        <div class="medium-text">${data.customer_name || '—'}</div>
      </div>
      <div class="s12 m6">
        <div class="small-text">Device</div>
        <div class="medium-text">${data.repair_device || '—'}</div>
      </div>
      <div class="s12 m6">
        <div class="small-text">Repair Cost</div>
        <div class="medium-text">${costDisplay}</div>
      </div>
      <div class="s12 m6">
        <div class="small-text">Estimated Time</div>
        <div class="medium-text">${data.repair_eta || '—'}</div>
      </div>
    </div>
    <div class="margin-top">
      <h6 class="center-align">Repair Progress</h6>
      <div class="stepper-container margin-top"></div>
      <div class="status-message center-align margin-top small-text">${msg}</div>
    </div>
  `;

  const stepperContainer = card.querySelector('.stepper-container');
  renderStepper(status, stepperContainer);

  return card;
}

function populateOrders(orders) {
  const container = $('repairCardsContainer');
  container.innerHTML = '';

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

  initTheme();
}

document.addEventListener('DOMContentLoaded', init);
