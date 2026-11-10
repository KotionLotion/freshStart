(() => {
// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const val = id => $('#' + id).value.trim();

// Escape text before putting it into innerHTML
function esc(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---------- State (kept in memory only) ----------
const state = { experience: [], education: [] };

// ---------- Navigation ----------
// A step can have "sub views" (e.g. experience choice -> experience form).
// A sub view and its buttons share an id: "exp-form" and "exp-form-actions".
function showSub(step, id) {
  $$('.sub, [id$="-actions"]', step).forEach(el => {
    el.hidden = !(el.id === id || el.id === id + '-actions');
  });
  if (id === 'review') renderReview();
  if (id === 'preview') renderPreview();
}

function goStep(n) {
  $$('.step').forEach(s => (s.hidden = Number(s.dataset.step) !== n));
  $$('.stepper button').forEach(b => {
    const active = Number(b.dataset.go) === n;
    b.classList.toggle('is-active', active);
    active ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current');
  });
  const step = $(`.step[data-step="${n}"]`);
  showSub(step, $('.sub', step).id); // always open on the first view
  window.scrollTo({ top: 0 });
}

// ---------- Actions (called from data-action in the HTML) ----------
const actions = {
  saveExperience() {
    if (!val('expRole') && !val('expTasks')) return; // nothing typed, nothing saved
    state.experience.push({
      role: val('expRole'),
      where: val('expWhere'),
      start: val('expStart'),
      end: $('#expCurrent').checked ? 'Present' : val('expEnd'),
      tasks: val('expTasks'),
    });
    ['expRole', 'expWhere', 'expStart', 'expEnd', 'expTasks'].forEach(id => ($('#' + id).value = ''));
    $('#expCurrent').checked = false;
    $('#expEnd').disabled = false;
  },

  saveEducation() {
    if (!val('eduType') && !val('eduClass') && !val('eduSchool')) return;
    state.education.push({
      type: val('eduType'),
      course: val('eduClass'),
      school: val('eduSchool'),
      done: val('eduDone'),
      year: val('eduYear'),
    });
    ['eduType', 'eduClass', 'eduSchool', 'eduDone', 'eduYear'].forEach(id => ($('#' + id).value = ''));
  },

  clearEducation() {
    state.education = [];
  },

  // Prototype: reset everything. Swap for `location.href = '/'` on the real site.
  home() {
    state.experience = [];
    state.education = [];
    $$('dialog[open]').forEach(d => d.close());
    goStep(1);
  },
};

// ---------- One click handler for the whole page ----------
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-show],[data-open],[data-close],[data-action]');
  if (!t) return;
  if (t.dataset.action) actions[t.dataset.action]();
  if (t.dataset.close !== undefined) t.closest('dialog').close();
  if (t.dataset.open) $('#' + t.dataset.open).showModal();
  if (t.dataset.go) goStep(Number(t.dataset.go));
  if (t.dataset.show) showSub(t.closest('.step'), t.dataset.show);
});

// ---------- Small form behaviours ----------
$('#hasDisability').addEventListener('change', e => {
  $('#disabilityTypes').hidden = !e.target.checked;
});

$('#expCurrent').addEventListener('change', e => {
  $('#expEnd').disabled = e.target.checked;
  if (e.target.checked) $('#expEnd').value = '';
});

// ---------- Render review + preview ----------
function getContact() {
  const name = [val('firstName'), val('lastName')].filter(Boolean).join(' ');
  const lines = [val('email'), val('phone'), val('location'), val('website')].filter(Boolean);
  return { name, job: val('jobType'), lines };
}

function getSkills() {
  const picked = $$('input[name="skill"]:checked').map(i => i.value);
  const other = val('otherSkills').split(',').map(s => s.trim()).filter(Boolean);
  return [...picked, ...other];
}

function experienceHtml() {
  return state.experience.map(x => {
    const dates = [x.start, x.end].filter(Boolean).join(' – ');
    return `<p><strong>${esc(x.role)}</strong>${x.where ? ' · ' + esc(x.where) : ''}</p>
            ${dates ? `<p>${esc(dates)}</p>` : ''}
            ${x.tasks ? `<p>${esc(x.tasks)}</p>` : ''}`;
  }).join('');
}

function educationHtml() {
  return state.education.map(x => {
    const title = [x.course, x.type].filter(Boolean).join(' · ');
    const extra = [x.school, x.year, x.done && 'Finished: ' + x.done].filter(Boolean).join(' · ');
    return `<p><strong>${esc(title)}</strong></p>${extra ? `<p>${esc(extra)}</p>` : ''}`;
  }).join('');
}

function reviewBlock(title, step, body) {
  return `<div class="summary">
    <div class="summary-head"><h3>${title}</h3><button class="link" data-go="${step}">Edit</button></div>
    ${body}
  </div>`;
}

function renderReview() {
  const c = getContact();
  const skills = getSkills();

  $('#reviewList').innerHTML =
    reviewBlock('Contact details', 1,
      c.name || c.lines.length
        ? `<p><strong>${esc(c.name)}</strong></p>${c.lines.map(l => `<p>${esc(l)}</p>`).join('')}`
        : '<p>No contact details added yet</p>') +
    reviewBlock('Experience', 3,
      state.experience.length ? experienceHtml()
        : '<p>Optional. Add work, volunteering, or caregiving—or leave this section out.</p>') +
    reviewBlock('Education', 4,
      state.education.length ? educationHtml() : '<p>No education added yet</p>') +
    reviewBlock('Skills', 5,
      skills.length ? `<p>${skills.map(esc).join(', ')}</p>`
        : '<p>No skills selected yet. You can add some or leave this section out.</p>');
}

function renderPreview() {
  const c = getContact();
  const skills = getSkills();

  $('#paper').innerHTML = `
    <h2>${esc(c.name || 'Your name')}</h2>
    ${c.job ? `<p>${esc(c.job)}</p>` : ''}
    ${c.lines.map(l => `<p>${esc(l)}</p>`).join('')}
    <hr>
    ${state.experience.length ? `<h3>Experience</h3>${experienceHtml()}` : ''}
    ${state.education.length ? `<h3>Education</h3>${educationHtml()}` : ''}
    ${skills.length ? `<h3>Skills</h3><p>${skills.map(esc).join(', ')}</p>` : ''}`;
}

// ---------- Start ----------
goStep(1);
})();