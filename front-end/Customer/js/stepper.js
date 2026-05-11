const STEPS = [
  { key: 'Picked-up', label: 'Picked-up', icon: 'inventory_2' },
  { key: 'picking up parts', label: 'Picking up\nparts', icon: 'handyman' },
  { key: 'Work in progress', label: 'Work in\nprogress', icon: 'build' },
  { key: 'Finished', label: 'Finished', icon: 'check_circle' },
];

const STATUS_ORDER = {
  'Picked-up': 0,
  'picking up parts': 1,
  'Work in progress': 2,
  'Finished': 3,
};

export function getActiveStepIndex(status) {
  const idx = STATUS_ORDER[status];
  return idx !== undefined ? idx : -1;
}

export function renderStepper(currentStatus, containerEl) {
  const container = containerEl || document.getElementById('stepperContainer');
  if (!container) return;

  const activeIndex = getActiveStepIndex(currentStatus);

  const stepper = document.createElement('div');
  stepper.className = 'stepper';

  STEPS.forEach((step, index) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'step';

    const circle = document.createElement('div');
    circle.className = 'step-circle';

    if (index < activeIndex) {
      stepEl.classList.add('completed');
      circle.innerHTML = '<i class="material-symbols-outlined">check</i>';
    } else if (index === activeIndex) {
      stepEl.classList.add('active');
      circle.textContent = String(index + 1);
    } else {
      stepEl.classList.add('disabled');
      circle.textContent = String(index + 1);
    }

    const label = document.createElement('div');
    label.className = 'step-label';
    label.textContent = step.label.replace(/\n/g, ' ');

    stepEl.appendChild(circle);
    stepEl.appendChild(label);
    stepper.appendChild(stepEl);
  });

  container.innerHTML = '';
  container.appendChild(stepper);
}

export function getStatusMessage(status) {
  const messages = {
    'Picked-up': 'Your device has been received and is waiting to be assessed.',
    'picking up parts': 'We are sourcing the necessary parts for your repair.',
    'Work in progress': 'Your repair is currently being worked on.',
    'Finished': 'Your repair is complete and ready for pickup!',
  };
  return messages[status] || '';
}
