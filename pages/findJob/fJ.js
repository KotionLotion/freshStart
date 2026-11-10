(() => {
  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ---------- Example jobs ----------
  // tags    = chips shown on the card
  // support = list shown on the detail page (defaults to tags minus "Remote")
  const JOBS = [
    {
      id: 'customer-support-associate', title: 'Customer support associate', type: 'Full time',
      company: 'Open Door Services', mode: 'Remote', area: '', pay: '$22–26 / hour',
      about: 'Help customers by email and live chat. Paid training included.',
      tags: ['Remote', 'Captions & text support', 'Flexible hours'],
      support: ['Quiet workspace', 'Captions & text support', 'Flexible hours'],
    },
    {
      id: 'community-library-assistant', title: 'Community library assistant', type: 'Part time',
      company: 'Neighbourhood Library', mode: 'On site', area: 'City centre', pay: '$19–23 / hour',
      about: 'Welcome visitors, organise books and support community activities.',
      tags: ['Wheelchair access', 'Elevator / lift', 'Accessible toilets'],
    },
    {
      id: 'office-coordinator', title: 'Office coordinator', type: 'Full time',
      company: 'Common Ground Co-op', mode: 'Hybrid', area: 'City centre', pay: '$24–28 / hour',
      about: 'Keep a friendly team organised with scheduling and everyday admin.',
      tags: ['Wheelchair access', 'Quiet workspace', 'Captions & text support'],
    },
    {
      id: 'digital-content-assistant', title: 'Digital content assistant', type: 'Contract',
      company: 'Better Together Studio', mode: 'Remote', area: '', pay: '$25–30 / hour',
      about: 'Write and review clear, accessible content for community projects.',
      tags: ['Remote', 'Flexible hours', 'Captions & text support'],
    },
    {
      id: 'retail-team-member', title: 'Retail team member', type: 'Part time',
      company: 'Good Neighbour Market', mode: 'On site', area: 'Riverside', pay: '$18–21 / hour',
      about: 'Help shoppers and keep the shop welcoming. No experience needed.',
      tags: ['Wheelchair access', 'Accessible toilets', 'Flexible hours'],
    },
    {
      id: 'it-support-apprentice', title: 'IT support apprentice', type: 'Apprenticeship',
      company: 'New Path Technology', mode: 'Hybrid', area: 'North district', pay: '$20–24 / hour',
      about: 'Learn practical IT skills with a mentor and paid, on-the-job training.',
      tags: ['Wheelchair access', 'Elevator / lift', 'Quiet workspace'],
    },
  ];

  const supportOf = job => job.support || job.tags.filter(t => t !== 'Remote');
  const featuresOf = job => [...new Set([...job.tags, ...supportOf(job)])];
  const chips = list => `<ul class="tags">${list.map(t => `<li>${t}</li>`).join('')}</ul>`;

  // ---------- Elements ----------
  const listView = $('#list-view');
  const detailView = $('#detail-view');
  let savedScroll = 0;

  // ---------- Filtering ----------
  const getFilters = () => ({
    type: $('#jobType').value,
    needs: $$('input[name="need"]:checked').map(i => i.value),
  });

  const matches = (job, f) =>
    (!f.type || job.type === f.type) && f.needs.every(n => featuresOf(job).includes(n));

  function updateNeedSummary() {
    const needs = getFilters().needs;
    $('#needSummary').textContent =
      needs.length === 0 ? 'Choose access needs'
      : needs.length === 1 ? needs[0]
      : `${needs.length} access needs selected`;
  }

  // ---------- Job list ----------
  function jobCard(job) {
    const meta = [job.mode, job.area, job.pay].filter(Boolean).join(' · ');
    return `<article class="card job">
      <div class="job-head"><h3>${job.title}</h3><span class="badge">${job.type}</span></div>
      <p class="meta"><strong>${job.company}</strong> · ${meta}</p>
      <p>${job.about}</p>
      <div class="job-foot">
        ${chips(job.tags)}
        <a class="btn btn-outline" href="#${job.id}" data-job="${job.id}" aria-label="View job: ${job.title}">View job →</a>
      </div>
    </article>`;
  }

  function renderList() {
    const f = getFilters();
    const found = JOBS.filter(job => matches(job, f));
    const filtered = f.type || f.needs.length;

    $('#count').textContent = `${found.length} matching ${found.length === 1 ? 'opportunity' : 'opportunities'}`;
    $('#results-title').textContent = filtered ? 'Matching opportunities' : 'All opportunities';
    $('#jobs').innerHTML = found.map(jobCard).join('');
    $('#empty').hidden = found.length > 0;
  }

  function clearFilters() {
    $('#jobType').value = '';
    $$('input[name="need"]').forEach(i => (i.checked = false));
    updateNeedSummary();
    renderList();
  }

  // ---------- Job details ----------
  function detailHtml(job) {
    const meta = [job.type.replace(' ', '-'), job.mode, job.area, job.pay].filter(Boolean).join(' · ');
    return `
      <section class="hero">
        <div class="wrap">
          <a class="link" href="#" data-back>← Back to matching jobs</a>
          <p class="eyebrow">Find your next chapter</p>
          <h1 id="detail-title" tabindex="-1">${job.title}</h1>
          <p class="lead">${job.company}</p>
          <p>${meta}</p>
        </div>
      </section>
      <div class="wrap detail">
        <article class="card">
          <p class="eyebrow">About this role</p>
          <p>${job.about}</p>
          <h2>A place for your skills</h2>
          <p>Everyone deserves a fair chance. Focus on your skills and what helps you do your best work. You choose whether to share a disability or your background.</p>
        </article>
        <article class="card">
          <p class="eyebrow">Workplace support</p>
          <p>Listed for this example opportunity:</p>
          ${chips(supportOf(job))}
        </article>
        <article class="card">
          <h2>Ask about support before applying</h2>
          <p>You can ask: “Can you confirm the access features listed here, and tell me about the adjustments available for the interview and the role?”</p>
          <p>You do not need to share a diagnosis to ask about access.</p>
          <p class="hint">Access can vary by site and team. Confirm details with the employer before visiting or applying.</p>
          <p class="hint">Your filter choices are not shared with employers.</p>
        </article>
        <p class="hint">Example opportunity · This prototype previews job browsing and filtering, not a live vacancy or application.</p>
      </div>`;
  }

  // The URL hash decides the view: #job-id = details, anything else = list
  function route() {
    const job = JOBS.find(j => j.id === location.hash.slice(1));

    if (job) {
      detailView.innerHTML = detailHtml(job);
      listView.hidden = true;
      detailView.hidden = false;
      document.title = `${job.title} | Fresh Start Inc.`;
      window.scrollTo(0, 0);
      $('#detail-title').focus();
    } else {
      const wasOpen = !detailView.hidden;
      detailView.hidden = true;
      listView.hidden = false;
      document.title = 'Find a job | Fresh Start Inc.';
      if (wasOpen) window.scrollTo(0, savedScroll);
    }
  }

  // ---------- Events ----------
  $('#showJobs').addEventListener('click', () => {
    renderList();
    $('#needSummary').closest('details').open = false;
    $('#results-title').focus();
  });
  $('#clearFilters').addEventListener('click', clearFilters);
  $('#emptyClear').addEventListener('click', clearFilters);
  $$('input[name="need"]').forEach(i => i.addEventListener('change', updateNeedSummary));

  // Remember scroll position when opening a job so "Back" lands in the same spot
  $('#jobs').addEventListener('click', e => {
    if (e.target.closest('[data-job]')) savedScroll = window.scrollY;
  });
  window.addEventListener('hashchange', route);

  // ---------- Start ----------
  renderList();
  route();
})();