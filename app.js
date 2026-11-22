// === נתונים התחלתיים ===
const INITIAL_IDEAS = [
  {
    id: 3,
    text: "כלי שמתקן שפה מעורבבת עברית-אנגלית. כותב בשפה אחת, והכלי מחליף מילים לשפה הנכונה לפי הקשר, היכרות איתי, והגיון לשוני/תחבירי",
    status: "new"
  },
  {
    id: 2,
    text: "אפליקציה לילדים (גילאי 11, 9, 4) שמלמדת ידע כללי + ידע ישראלי + מושגי יסוד במתמטיקה וחיים. הומוריסטי, מותאם גיל, ונשלח למכשיר הנייד",
    status: "new"
  },
  {
    id: 1,
    text: "גיגית מחשבות כמו של דמבלדור, אבל עם דגש על ביצוע – לא רק לשמור רעיונות אלא לדחוף אותם לביצוע בפועל",
    status: "progress"
  }
];

const INITIAL_TASKS = [
  {
    id: 100,
    text: "להקים WhatsApp Business ולחבר אותו ל-Zapier",
    done: false
  }
];

const INITIAL_CONTAINERS = [
  {
    id: 2001,
    company: "OOCL",
    number: "CSNU8366233",
    note: "",
    status: "בדרך לאשדוד",
    eta: "25 בנובמבר 2026",
    vessel: "IONIA",
    origin: "Xiamen (סין)",
    lastCheck: new Date().toLocaleString('he-IL'),
    source: "Terminal49"
  }
];

const TRACKING_API = 'https://terminal49-api-key-request.vercel.app/api/track';

// טעינה
let tasks = JSON.parse(localStorage.getItem('tasks') || 'null') || INITIAL_TASKS;
let ideas = JSON.parse(localStorage.getItem('ideas') || 'null') || INITIAL_IDEAS;
let containers = JSON.parse(localStorage.getItem('containers') || 'null') || INITIAL_CONTAINERS;

containers.forEach(c => { if (c.note === undefined) c.note = ''; });

if (containers.length === 0) {
  containers = INITIAL_CONTAINERS;
  localStorage.setItem('containers', JSON.stringify(containers));
}

if (!localStorage.getItem('ideas')) localStorage.setItem('ideas', JSON.stringify(ideas));
if (!localStorage.getItem('tasks')) localStorage.setItem('tasks', JSON.stringify(tasks));

renderTasks();
renderIdeas();
renderContainers();

// === משימות ===
function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  input.value = '';
  input.focus();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) { task.done = !task.done; saveTasks(); renderTasks(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = tasks.map(task => `
    <li class="${task.done ? 'done' : ''}">
      <div class="idea-header">
        <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${task.id})">
        <span>${escapeHtml(task.text)}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id})">מחק</button>
      </div>
    </li>
  `).join('');
}

function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }

// === רעיונות ===
function addIdea() {
  const input = document.getElementById('ideaInput');
  const text = input.value.trim();
  if (!text) return;
  ideas.unshift({ id: Date.now(), text, status: 'new' });
  saveIdeas();
  renderIdeas();
  input.value = '';
  input.focus();
}

function updateIdeaStatus(id, status) {
  const idea = ideas.find(i => i.id === id);
  if (idea) { idea.status = status; saveIdeas(); renderIdeas(); }
}

function deleteIdea(id) {
  ideas = ideas.filter(i => i.id !== id);
  saveIdeas();
  renderIdeas();
}

function getStatusLabel(status) {
  const map = { new: 'חדש', progress: 'בטיפול', execution: 'בביצוע', done: 'הושלם' };
  return map[status] || status;
}

function renderIdeas() {
  const list = document.getElementById('ideaList');
  list.innerHTML = ideas.map(idea => `
    <li>
      <div class="idea-header">
        <span class="status status-${idea.status}">${getStatusLabel(idea.status)}</span>
        <span>${escapeHtml(idea.text)}</span>
      </div>
      <div class="actions">
        <button class="action-btn" onclick="updateIdeaStatus(${idea.id}, 'progress')">בטיפול</button>
        <button class="action-btn" onclick="updateIdeaStatus(${idea.id}, 'execution')">בביצוע</button>
        <button class="action-btn" onclick="updateIdeaStatus(${idea.id}, 'done')">הושלם</button>
        <button class="delete-btn" onclick="deleteIdea(${idea.id})">מחק</button>
      </div>
    </li>
  `).join('');
}

function saveIdeas() { localStorage.setItem('ideas', JSON.stringify(ideas)); }

// === מכולות ===
async function checkContainer(container) {
  try {
    const url = `${TRACKING_API}?number=${encodeURIComponent(container.number)}&company=${encodeURIComponent(container.company)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.shipment) {
      container.status = data.shipment.destination === 'Ashdod' ? 'בדרך לאשדוד' : (data.status || 'במעקב');
      container.eta = data.shipment.etaAt ? new Date(data.shipment.etaAt).toLocaleDateString('he-IL') : 'לא ידוע';
      container.vessel = data.shipment.vessel || '';
      container.origin = data.shipment.origin || '';
      container.source = 'Terminal49';
    } else {
      container.status = data.status || 'לא זמין';
    }
    container.lastCheck = new Date().toLocaleString('he-IL');
  } catch (e) {
    container.status = 'שגיאה בבדיקה';
    container.lastCheck = new Date().toLocaleString('he-IL');
  }
}

async function manualCheckAll() {
  if (containers.length === 0) return alert('אין מכולות לבדיקה');
  
  const btn = document.querySelector('button[onclick="manualCheckAll()"]');
  if (btn) btn.textContent = 'בודק...';
  
  for (const c of containers) {
    c.status = 'בבדיקה...';
  }
  renderContainers();

  for (const c of containers) {
    await checkContainer(c);
    saveContainers();
    renderContainers();
  }

  if (btn) btn.textContent = 'בדוק עכשיו את כל המכולות';
  alert('הבדיקה הסתיימה');
}

function addContainer() {
  const company = document.getElementById('companyInput').value.trim();
  const number = document.getElementById('containerInput').value.trim();
  const note = document.getElementById('noteInput')?.value.trim() || '';
  if (!company || !number) return alert('הזן חברת ספנות ומספר מכולה');
  containers.unshift({
    id: Date.now(),
    company,
    number,
    note,
    status: 'ממתין לבדיקה',
    eta: 'לא ידוע',
    vessel: '',
    origin: '',
    lastCheck: null,
    source: ''
  });
  saveContainers();
  renderContainers();
  document.getElementById('companyInput').value = '';
  document.getElementById('containerInput').value = '';
  if (document.getElementById('noteInput')) document.getElementById('noteInput').value = '';
}

function deleteContainer(id) {
  containers = containers.filter(c => c.id !== id);
  saveContainers();
  renderContainers();
}

function updateNote(id, value) {
  const c = containers.find(x => x.id === id);
  if (c) {
    c.note = value;
    saveContainers();
    renderContainers();
  }
}

function renderContainers() {
  const list = document.getElementById('containerList');
  list.innerHTML = containers.map(c => `
    <li>
      <div class="idea-header">
        <strong>${escapeHtml(c.company)}</strong> — ${escapeHtml(c.number)}
        <button class="delete-btn" onclick="deleteContainer(${c.id})">מחק</button>
      </div>
      ${c.note ? `<div style="font-weight: 600; color: #38bdf8; margin: 0.35rem 0 0.2rem; font-size: 1rem;">📝 ${escapeHtml(c.note)}</div>` : ''}
      <div style="margin: 0.3rem 0 0.5rem;">
        <input type="text" 
          value="${escapeHtml(c.note || '')}" 
          placeholder="הוסף הערה / זיהוי למשלוח..."
          onchange="updateNote(${c.id}, this.value)"
          style="width: 100%; padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid #475569; background: #1e293b; color: #f8fafc; font-size: 0.9rem;">
      </div>
      <div style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.5;">
        <strong>סטטוס:</strong> ${escapeHtml(c.status || 'לא ידוע')}<br>
        <strong>מועד געה משוער לאשדוד:</strong> ${escapeHtml(c.eta || 'לא ידוע')}<br>
        ${c.vessel ? `<strong>אונייה:</strong> ${escapeHtml(c.vessel)}<br>` : ''}
        ${c.origin ? `<strong>נמל יציאה:</strong> ${escapeHtml(c.origin)}<br>` : ''}
        ${c.lastCheck ? `<span style="color:#94a3b8;">בדיקה אחרונה: ${escapeHtml(c.lastCheck)} ${c.source ? '(' + escapeHtml(c.source) + ')' : ''}</span>` : ''}
      </div>
    </li>
  `).join('');
}

function saveContainers() { localStorage.setItem('containers', JSON.stringify(containers)); }

// עזר
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Enter keys
document.getElementById('taskInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });
document.getElementById('ideaInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') addIdea(); });
document.getElementById('containerInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') addContainer(); });