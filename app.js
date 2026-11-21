// === נתונים התחלתיים (מסונכרנים מהצ'אט עם Grok) ===
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

// טעינה
let tasks = JSON.parse(localStorage.getItem('tasks') || 'null') || INITIAL_TASKS;
let ideas = JSON.parse(localStorage.getItem('ideas') || 'null') || INITIAL_IDEAS;

// אם אין כלום ב-localStorage, נשמור את ההתחלתיים
if (!localStorage.getItem('ideas')) {
  localStorage.setItem('ideas', JSON.stringify(ideas));
}
if (!localStorage.getItem('tasks')) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

renderTasks();
renderIdeas();

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
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
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

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

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
  if (idea) {
    idea.status = status;
    saveIdeas();
    renderIdeas();
  }
}

function deleteIdea(id) {
  ideas = ideas.filter(i => i.id !== id);
  saveIdeas();
  renderIdeas();
}

function getStatusLabel(status) {
  const map = {
    new: 'חדש',
    progress: 'בטיפול',
    execution: 'בביצוע',
    done: 'הושלם'
  };
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

function saveIdeas() {
  localStorage.setItem('ideas', JSON.stringify(ideas));
}

// עזר
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Enter key
document.getElementById('taskInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});
document.getElementById('ideaInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') addIdea();
});