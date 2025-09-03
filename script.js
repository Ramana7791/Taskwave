const els = {
  list: document.getElementById('list'),
  form: document.getElementById('newTaskForm'),
  input: document.getElementById('taskInput'),
  stats: document.getElementById('stats'),
  chips: Array.from(document.querySelectorAll('.chip[data-filter]')),
  empty: document.getElementById('emptyState'),
  clearCompleted: document.getElementById('clearCompleted'),
  exportBtn: document.getElementById('exportBtn'),
};

const STORAGE_KEY = 'todo.tasks.v1';
let tasks = [];
let filter = 'all';

function load() {
  try { tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { tasks = []; }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function render() {
  const remaining = tasks.filter(t => !t.done).length;
  els.stats.textContent = `${remaining} left • ${tasks.length} total`;

  const visible = tasks.filter(t =>
    filter === 'active' ? !t.done :
    filter === 'completed' ? t.done :
    true
  );
  els.list.innerHTML = '';
  visible.forEach(t => els.list.appendChild(renderItem(t)));

  els.empty.hidden = tasks.length !== 0;
  els.clearCompleted.disabled = tasks.every(t => !t.done);
}

function renderItem(task) {
  const li = document.createElement('li');
  li.className = 'item' + (task.done ? ' completed' : '');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;
  checkbox.addEventListener('change', () => toggle(task.id));

  const label = document.createElement('label');
  label.textContent = task.title;

  const editBtn = makeBtn('✏️', () => startEdit(task));
  const delBtn = makeBtn('🗑️', () => remove(task.id), 'delete');

  const actions = document.createElement('div');
  actions.style.display = "flex";
  actions.style.gap = "6px";
  actions.append(editBtn, delBtn);

  // ✅ Checkbox + Label on left, Actions on right
  li.append(checkbox, label, actions);

  return li;
}

function makeBtn(text, fn, cls = '') {
  const b = document.createElement('button');
  b.className = 'icon-btn ' + cls;
  b.textContent = text;
  b.addEventListener('click', fn);
  return b;
}

function add(title) {
  if (title.trim()) {
    tasks.push({ id: Date.now().toString(), title, done: false });
    save(); render();
  }
}
function toggle(id) {
  const t = tasks.find(x => x.id === id);
  if (t) { t.done = !t.done; save(); render(); }
}
function remove(id) {
  tasks = tasks.filter(t => t.id !== id);
  save(); render();
}
function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  save(); render();
}

function startEdit(task) {
  const newTitle = prompt('Edit task:', task.title);
  if (newTitle !== null) {
    task.title = newTitle.trim() || task.title;
    save(); render();
  }
}

els.form.addEventListener('submit', e => {
  e.preventDefault();
  add(els.input.value);
  els.input.value = '';
});

els.chips.forEach(c =>
  c.addEventListener('click', () => {
    filter = c.dataset.filter;
    els.chips.forEach(x => x.setAttribute('aria-pressed', x === c));
    render();
  })
);

els.clearCompleted.addEventListener('click', clearCompleted);

els.exportBtn.addEventListener('click', e => {
  e.preventDefault();
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tasks.json';
  a.click();
});

load();
render();
