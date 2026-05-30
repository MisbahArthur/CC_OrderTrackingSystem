const STEPS = [
  { key: 'Picked-up', label: 'Picked-up', icon: 'ph-toolbox' },
  { key: 'Picking up parts', label: 'Picking up parts', icon: 'ph-wrench' },
  { key: 'Work in progress', label: 'Work in progress', icon: 'ph-gear' },
  { key: 'Finished', label: 'Finished', icon: 'ph-check-circle' },
];

const STATUS_ORDER = {
  'Picked-up': 0,
  'Picking up parts': 1,
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

  const timeline = document.createElement('div');
  timeline.className = 'timeline';

  STEPS.forEach((step, index) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'timeline-step';

    const icon = document.createElement('div');
    icon.className = 'timeline-icon';

    const label = document.createElement('span');
    label.className = 'timeline-label';

    if (index < activeIndex) {
      icon.classList.add('completed');
      label.classList.add('completed');
      icon.innerHTML = '<i class="ph ph-check"></i>';
      label.textContent = step.label;
    } else if (index === activeIndex) {
      icon.classList.add('active');
      label.classList.add('active');
      icon.innerHTML = `<i class="${step.icon}"></i>`;
      label.textContent = step.label;
    } else {
      icon.classList.add('pending');
      label.classList.add('pending');
      icon.innerHTML = `<i class="${step.icon}"></i>`;
      label.textContent = step.label;
    }

    stepEl.appendChild(icon);
    stepEl.appendChild(label);
    timeline.appendChild(stepEl);
  });

  container.innerHTML = '';
  container.appendChild(timeline);
}
