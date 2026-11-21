// טעינת נתונים מ-localStorage
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let ideas = JSON.parse(localStorage.getItem('ideas') || '[]');

// הצגה ראשונית
renderTasks();
renderIdeas();

// משימות
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
      <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${task.id})">
      <span>${escapeHtml(task.text)}</span>
      <button class="delete-btn" onclick="deleteTask(${task.id})">מחק</button>
    </li>
  `).join('');
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// רעיונות
function addIdea() {
  const input = document.getElementById('ideaInput');
  const text = input.value.trim();
  if (!text) return;

  ideas.push({ id: Date.now(), text });
  saveIdeas();
  renderIdeas();
  input.value = '';
  input.focus();
}

function deleteIdea(id) {
  ideas = ideas.filter(i => i.id !== id);
  saveIdeas();
  renderIdeas();
}

function renderIdeas() {
  const list = document.getElementById('ideaList');
  list.innerHTML = ideas.map(idea => `
    <li>
      <span>${escapeHtml(idea.text)}</span>
      <button class="delete-btn" onclick="deleteIdea(${idea.id})">מחק</button>
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