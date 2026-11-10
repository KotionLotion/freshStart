(() => {
  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const getLanguage = () => 'en';

  const t = (key, replacements = {}) => {
    const lookup = {
      nextChapter: 'Your next chapter, with a little backup.',
      applyAsYourself: 'Apply as yourself.',
      applyAsYourselfText: 'Find a job helps you explore. Here, turn a good fit into an application that feels like you.',
      step1: 'Step 1 of 3 · Make it yours',
      step1Title: 'Let your strengths lead.',
      step1Text: 'Choose your introduction, resume and interview support. Share only what you want to.',
      step2: 'Step 2 of 3 · Review',
      step2Title: 'One last look. All your choice.',
      step2Text: 'Check exactly what this practice application includes before you send it.',
      step3: 'Step 3 of 3 · Ready',
      step3Title: 'You took the first step.',
      step3Text: 'A little preparation. A lot more confidence. Your next chapter is yours to write.',
      rolesTitle: '{count} role{plural} to make your own',
      exampleProfile: 'Example profile',
      workZoneAll: 'All workplaces',
      workZoneRemote: 'Remote / hybrid',
      backHome: '← Back to home',
    };
    const value = lookup[key] || key;
    return Object.entries(replacements).reduce((text, [token, replacement]) => text.replace(`{${token}}`, replacement), value);
  };

  function applyApplyTranslations() {
    return;
  }

  // ---------- Example data ----------
  const EXAMPLE = { name: 'Taylor Morgan', email: 'taylor.morgan@example.com' };

  const JOBS = [
    {
      id: 'customer-support-associate', title: 'Customer support associate',
      company: 'Open Door Services', type: 'Full-time', mode: 'Remote', pay: '$22–26 / hour',
      fit: 'A fit for your communication skills. Email and live chat, with paid training.',
      tags: ['Remote setup', 'Captions & text support'],
      strengths: ['Communication', 'Organisation'], // first one leads
    },
    {
      id: 'office-coordinator', title: 'Office coordinator',
      company: 'Common Ground Co-op', type: 'Full-time', mode: 'Hybrid', pay: '$24–28 / hour',
      fit: 'A fit for your organisation skills. Keep a welcoming team running smoothly.',
      tags: ['Wheelchair access', 'Quiet workspace'],
      strengths: ['Organisation', 'Communication'],
    },
    {
      id: 'community-library-assistant', title: 'Community library assistant',
      company: 'Neighbourhood Library', type: 'Part-time', mode: 'On-site', pay: '$19–23 / hour',
      fit: 'A fit for your people-first approach. Help visitors feel at home.',
      tags: ['Wheelchair access', 'Elevator / lift'],
      strengths: ['A people-first approach', 'Communication'],
    },
  ];

  // Suggested introductions (shown as the placeholder, used if nothing is typed)
  const INTROS = {
    'Communication': 'I bring clear communication, patience and a practical approach to helping people. I would love to put those strengths to work with your team.',
    'Organisation': 'I bring a careful, organised approach and I like keeping things running smoothly. I would love to put those strengths to work with your team.',
    'A people-first approach': 'I bring a people-first approach and I enjoy helping everyone feel at home. I would love to put those strengths to work with your team.',
  };

  // Hero text for each view
  const VIEWS = {
    list: { eyebrow: 'Your next chapter, with a little backup.', title: 'Apply as yourself.',
            text: 'Find a job helps you explore. Here, turn a good fit into an application that feels like you.' },
    1: { eyebrow: 'Step 1 of 3 · Make it yours', title: 'Let your strengths lead.',
         text: 'Choose your introduction, resume and interview support. Share only what you want to.' },
    2: { eyebrow: 'Step 2 of 3 · Review', title: 'One last look. All your choice.',
         text: 'Check exactly what this practice application includes before you send it.' },
    3: { eyebrow: 'Step 3 of 3 · Ready', title: 'You took the first step.',
         text: 'A little preparation. A lot more confidence. Your next chapter is yours to write.' },
  };

  // ---------- State ----------
  const state = { job: null, strength: '', zone: 'all', currentView: 'list' };

  // ---------- Views ----------
  function show(view, first = false) {
    state.currentView = String(view);
    ['list', 1, 2, 3].forEach(v => ($('#view-' + v).hidden = String(v) !== String(view)));

    const v = VIEWS[view];
    const language = getLanguage();
    $('#heroEyebrow').textContent = v.eyebrow;
    $('#heroTitle').textContent = v.title;
    $('#heroText').textContent = v.text;

    $$('.stepper li').forEach(li => {
      const on = li.dataset.step === String(view);
      li.classList.toggle('is-active', on);
      on ? li.setAttribute('aria-current', 'step') : li.removeAttribute('aria-current');
    });

    view = String(view);
    if (view === '2') renderReview();
    if (view === '3') {
      $('#s3Title').textContent = state.job.title;
      $('#s3Company').textContent = state.job.company;
    }
    if (!first) {
      window.scrollTo(0, 0);
      $('#heroTitle').focus(); // move focus to the new view's heading
    }
  }

  // ---------- Role list + comfort zone ----------
  function renderRoles() {
    const roles = JOBS.filter(j => state.zone === 'all' || j.mode !== 'On-site');
    const countLabel = `${roles.length} role${roles.length === 1 ? '' : 's'} to make your own`;
    $('#rolesTitle').textContent = countLabel;
    $('#roles').innerHTML = roles.map(j => `
      <article class="card role">
        <h3>${j.title}</h3>
        <p class="small">${j.company} · ${j.type} · ${j.mode} · ${j.pay}</p>
        <p>${j.fit}</p>
        <div class="role-foot">
          <p class="accent">${j.tags.join(' · ')}</p>
          <button class="btn btn-teal" type="button" data-job="${j.id}">Make this application mine →</button>
        </div>
      </article>`).join('');
  }

  function setZone(zone) {
    state.zone = zone;
    $('#zoneText').textContent = zone === 'all' ? 'All workplaces' : 'Remote / hybrid';
    $$('[data-zone]').forEach(b => b.setAttribute('aria-pressed', b.dataset.zone === zone));
    renderRoles();
  }

  // ---------- Step 1 ----------
  function renderStrengths() {
    $('#strengths').innerHTML = state.job.strengths.map(s =>
      `<button class="btn btn-white" type="button" data-strength="${s}" aria-pressed="${s === state.strength}">${s}</button>`
    ).join('');
    $('#leadWith').textContent = state.strength;
    $('#intro').placeholder = INTROS[state.strength];
  }

  function resetForm() {
    ['name', 'email', 'intro'].forEach(id => ($('#' + id).value = ''));
    $$('input[name="support"]').forEach(i => (i.checked = false));
    $('#shareSupport').checked = false;
    $('#includeResume').checked = true;
    $('#confirm').checked = false;
    $('#confirmError').hidden = true;
  }

  function chooseJob(id) {
    const job = JOBS.find(j => j.id === id);
    if (!state.job || state.job.id !== job.id) resetForm(); // new role = fresh application
    state.job = job;
    state.strength = job.strengths[0];

    $('#s1Title').textContent = job.title;
    $('#s1Company').textContent = job.company;
    $('#s1Meta').textContent = `${job.type} · ${job.mode} · ${job.pay}`;
    renderStrengths();
    show(1);
  }

  // ---------- Step 2 ----------
  function renderReview() {
    const job = state.job;
    const name = $('#name').value.trim() || EXAMPLE.name;
    const email = $('#email').value.trim() || EXAMPLE.email;
    const intro = $('#intro').value.trim() || INTROS[state.strength];
    const asked = $$('input[name="support"]:checked').map(i => i.value);
    const sharing = $('#shareSupport').checked && asked.length > 0;

    $('#s2Title').textContent = job.title;
    $('#s2Company').textContent = job.company;
    $('#s2From').textContent = `${name} · ${email}`;
    $('#s2Intro').textContent = intro;
    $('#s2Resume').textContent = $('#includeResume').checked
      ? 'Example resume attached · Taylor Morgan.pdf'
      : 'No resume included';

    $('#s2Support').innerHTML = sharing
      ? `<p>These requests will be shared with your application:</p>
         <ul class="support-list">${asked.map(a => `<li>${a}</li>`).join('')}</ul>`
      : '<p>No support requests will be shared. You can ask later.</p>';

    $('#confirmError').hidden = true;
  }

  function sendPractice() {
    if (!$('#confirm').checked) {
      $('#confirmError').hidden = false;
      $('#confirm').focus();
      return;
    }
    show(3);
  }

  // ---------- Events ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-job],[data-zone],[data-strength],[data-view],#sendBtn');
    if (!t) return;

    if (t.dataset.job) chooseJob(t.dataset.job);
    else if (t.dataset.zone) setZone(t.dataset.zone);
    else if (t.dataset.strength) { state.strength = t.dataset.strength; renderStrengths(); }
    else if (t.dataset.view) show(t.dataset.view);
    else if (t.id === 'sendBtn') sendPractice();
  });

  // ---------- Start ----------
  setZone('all');
  show('list', true);
})();