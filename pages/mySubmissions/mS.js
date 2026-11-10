const APPLICATIONS = [
  {
    id: 'harbour-house-support',
    title: 'Support Worker',
    company: 'Harbour House Care',
    location: 'Bristol, UK',
    type: 'Part-time',
    submitted: '2026-10-12',
    status: 'Completed',
    contact: 'recruitment@harbourhousecare.co.uk',
    note: 'The team is reviewing applications. You can expect a response within 10 working days.',
    access: ['Wheelchair access', 'Elevator / lift', 'Accessible toilets', 'Quiet workspace', 'Captions & text support'],
    summary: 'This role includes onsite support for staff who need practical access adjustments and a calm working environment.'
  },
  {
    id: 'greenway-library',
    title: 'Community Library Assistant',
    company: 'Greenway Library',
    location: 'Manchester, UK',
    type: 'Full-time',
    submitted: '2026-10-05',
    status: 'Completed',
    contact: 'careers@greenwaylibrary.org',
    note: 'The shortlist is being finalised. Their team asked for your availability and work pattern details.',
    access: ['Wheelchair access', 'Elevator / lift', 'Accessible toilets', 'Flexible hours'],
    summary: 'The library team supports a flexible, welcoming environment with accessible spaces and practical adjustments for staff.'
  },
  {
    id: 'rivergate-admin',
    title: 'Administrative Assistant',
    company: 'Rivergate Housing',
    location: 'Leeds, UK',
    type: 'Fixed-term',
    submitted: '2026-09-22',
    status: 'Completed',
    contact: 'hello@rivergatehousing.org',
    note: 'This role is now closed to applications. Keep an eye on similar openings from the same team.',
    access: ['Wheelchair access', 'Accessible toilets', 'Captions & text support', 'Flexible hours'],
    summary: 'Rivergate Housing is committed to accessible workspaces and asks candidates about interview and role adjustments up front.'
  }
];

const state = { selectedId: APPLICATIONS[0]?.id ?? null };

const formatDate = (value) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

function renderList() {
  const list = document.getElementById('submissionList');
  const count = document.getElementById('submissionCount');

  if (!APPLICATIONS.length) {
    list.innerHTML = `
      <article class="card empty-state">
        <h3 class="header-title">No applications saved</h3>
        <p class="small">You have not submitted any roles yet. When you do, they will appear here with the date and details.</p>
      </article>
    `;
    count.textContent = '0';
    renderDetail(null);
    return;
  }

  count.textContent = String(APPLICATIONS.length);

  list.innerHTML = APPLICATIONS.map((item) => {
    const isSelected = item.id === state.selectedId;
    return `
      <article class="submission ${isSelected ? 'is-selected' : ''}" data-id="${item.id}">
        <div class="submission-top">
          <div>
            <h3>${item.title}</h3>
            <p class="meta">${item.company}</p>
          </div>
          <span class="badge">${item.status}</span>
        </div>
        <p class="small">${item.location} · ${item.type}</p>
        <div class="submission-bottom">
          <span class="mini">Submitted ${formatDate(item.submitted)}</span>
          <button class="btn btn-ghost" type="button" data-view="${item.id}">View details</button>
        </div>
      </article>
    `;
  }).join('');

  if (!APPLICATIONS.some((item) => item.id === state.selectedId)) {
    state.selectedId = APPLICATIONS[0].id;
  }

  renderDetail(APPLICATIONS.find((item) => item.id === state.selectedId) ?? APPLICATIONS[0]);
}

function renderDetail(app) {
  const details = document.getElementById('appDetail');

  if (!app) {
    details.innerHTML = `
      <div class="detail empty-state">
        <h2>No submission selected</h2>
        <p class="small">Choose a role from the list to view its details.</p>
      </div>
    `;
    return;
  }

  details.innerHTML = `
    <div class="detail">
      <div>
        <p class="label">Application</p>
        <h2>${app.title}</h2>
        <p class="company">${app.company}</p>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <span class="label">Submitted</span>
          <span class="detail-text">${formatDate(app.submitted)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Location</span>
          <span class="detail-text">${app.location}</span>
        </div>
        <div class="detail-item">
          <span class="label">Type</span>
          <span class="detail-text">${app.type}</span>
        </div>
        <div class="detail-item">
          <span class="label">Status</span>
          <span class="detail-text">${app.status}</span>
        </div>
      </div>

      <div class="summary-box">
        <h3>What happens next</h3>
        <p>${app.note}</p>
      </div>

      <div>
        <p class="label">Recruitment contact</p>
        <p class="detail-text muted">${app.contact}</p>
      </div>

      <div class="actions">
        <button class="btn btn-primary" type="button" data-detail="${app.id}">Application details</button>
        <button class="btn btn-danger" type="button" data-cancel="${app.id}">Cancel submission</button>
      </div>
    </div>
  `;
}

function renderDetailedView(app) {
  const detailView = document.getElementById('detailView');
  const listView = document.getElementById('listView');

  detailView.innerHTML = `
    <div class="detail-panel">
      <div class="top-row">
        <a class="link" href="#" data-back="true">← Back to submissions</a>
        <span class="badge">${app.status}</span>
      </div>

      <div class="detail-hero">
        <p class="eyebrow">Application details</p>
        <h2>${app.title}</h2>
        <p class="company">${app.company} · ${app.location}</p>
        <p>${app.type} · Submitted ${formatDate(app.submitted)}</p>
      </div>

      <div class="detail-sections">
        <section class="sub-panel">
          <h3>About this role</h3>
          <p>${app.summary}</p>
          <p>${app.note}</p>
        </section>

        <section class="sub-panel">
          <h3>Accessibility &amp; support available</h3>
          <div class="tag-list">
            ${app.access.map((item) => `<span class="tag">${item}</span>`).join('')}
          </div>
        </section>
      </div>

      <div class="notice" style="margin-top: 1rem;">
        <h3>What to ask before interview or acceptance</h3>
        <p>Ask the employer to confirm the accessibility features listed here and whether there are any other reasonable adjustments available for the role, interview or day-to-day work.</p>
        <p>You do not need to share a diagnosis to ask about wheelchair access, elevator access, quiet workspace, captions, flexible hours or other support.</p>
      </div>

      <div class="actions" style="margin-top: 1.25rem;">
        <button class="btn btn-primary" type="button" data-cancel="${app.id}">Cancel submission</button>
      </div>
    </div>
  `;

  listView.hidden = true;
  detailView.hidden = false;
  detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showListView() {
  const detailView = document.getElementById('detailView');
  const listView = document.getElementById('listView');
  listView.hidden = false;
  detailView.hidden = true;
}

function selectApplication(id) {
  const match = APPLICATIONS.find((item) => item.id === id);
  if (!match) return;
  state.selectedId = id;
  renderList();
}

function cancelApplication(id) {
  const index = APPLICATIONS.findIndex((item) => item.id === id);
  if (index === -1) return;

  APPLICATIONS.splice(index, 1);

  if (APPLICATIONS.length > 0) {
    state.selectedId = APPLICATIONS[Math.max(0, index - 1)].id;
  } else {
    state.selectedId = null;
  }

  showListView();
  renderList();
}

document.addEventListener('click', (event) => {
  const selection = event.target.closest('[data-id]');
  const viewButton = event.target.closest('[data-view]');
  const detailButton = event.target.closest('[data-detail]');
  const cancelButton = event.target.closest('[data-cancel]');
  const backButton = event.target.closest('[data-back]');

  if (backButton) {
    showListView();
    return;
  }

  if (cancelButton) {
    cancelApplication(cancelButton.dataset.cancel);
    return;
  }

  if (detailButton) {
    const app = APPLICATIONS.find((item) => item.id === detailButton.dataset.detail);
    if (app) renderDetailedView(app);
    return;
  }

  if (viewButton) {
    const app = APPLICATIONS.find((item) => item.id === viewButton.dataset.view);
    if (app) renderDetailedView(app);
    return;
  }

  if (selection && selection.dataset.id) {
    selectApplication(selection.dataset.id);
  }
});

renderList();
