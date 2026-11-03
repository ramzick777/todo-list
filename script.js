const STORAGE_KEY = 'simple-todo-tasks-v1';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const remainingCount = document.querySelector('#remaining-count');
const totalCount = document.querySelector('#total-count');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('.filter');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(task =>
      task && typeof task.id === 'string' &&
      typeof task.text === 'string' &&
      typeof task.completed === 'boolean'
    ) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text) {
  return {
    id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    text,
    completed: false
  };
}

function render() {
  list.replaceChildren();
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' completed' : ''}`;

    const check = document.createElement('button');
    check.className = 'check';
    check.type = 'button';
    check.setAttribute('aria-label', task.completed ? 'Отметить как невыполненную' : 'Отметить как выполненную');
    check.setAttribute('aria-pressed', String(task.completed));
    check.textContent = task.completed ? '✓' : '';
    check.addEventListener('click', () => toggleTask(task.id));

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const remove = document.createElement('button');
    remove.className = 'delete-button';
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Удалить задачу');
    remove.title = 'Удалить задачу';
    remove.textContent = '×';
    remove.addEventListener('click', () => deleteTask(task.id));

    item.append(check, text, remove);
    list.append(item);
  });

  const remaining = tasks.filter(task => !task.completed).length;
  remainingCount.textContent = remaining;
  totalCount.textContent = `${tasks.length} ${pluralize(tasks.length)}`;
  emptyState.hidden = visibleTasks.length !== 0;
  list.hidden = visibleTasks.length === 0;
  clearCompletedButton.hidden = !tasks.some(task => task.completed);
}

function pluralize(number) {
  const n = Math.abs(number) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return 'задач';
  if (last > 1 && last < 5) return 'задачи';
  if (last === 1) return 'задача';
  return 'задач';
}

function addTask(text) {
  tasks.unshift(createTask(text));
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }
  addTask(text);
  input.value = '';
  input.focus();
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    render();
  });
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

render();
