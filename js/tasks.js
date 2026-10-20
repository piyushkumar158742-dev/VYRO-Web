'use strict';

let taskTransitionBusy = false;
const TASK_ANIMATION_FALLBACK = { complete: 500, reopen: 440 };
const TASK_PRIORITIES = new Set(['high', 'medium', 'low']);

V.tasks = () => {
  const pending = S.tasks.filter(task => !task.completed);
  const completed = S.tasks.filter(task => task.completed);

  const list = (items, kind) => `
    <section class="panel task-panel task-panel-${kind}">
      <header>
        <div>
          <h3>
            <span class="task-heading-icon" aria-hidden="true">${kind === 'pending' ? '◷' : '✓'}</span>
            ${kind === 'pending' ? 'Up next' : 'Completed'}
            <span class="task-count">${items.length}</span>
          </h3>
        </div>
        ${kind === 'pending' ? '<button class="btn ghost task-add-small" onclick="tm()">+ Add task</button>' : ''}
      </header>
      <div class="task-list">
        ${items.map((task, index) => `
          <div class="row task-row ${task.completed ? 'done task-completed' : ''}"
               data-task-id="${esc(task.id)}"
               style="--task-delay:${Math.min(index, 7) * 35}ms">
            <button class="chk ${task.completed ? 'on' : ''}"
                    onclick="tk(${Number(task.id)})"
                    aria-label="${task.completed ? 'Mark not done' : 'Mark done'}"
                    aria-pressed="${task.completed}">
              <span aria-hidden="true">${task.completed ? '✓' : ''}</span>
            </button>
            <div class="task-copy"><strong>${esc(task.title)}</strong></div>
            <span class="tag ${TASK_PRIORITIES.has(task.priority) ? task.priority : 'medium'}">${esc(TASK_PRIORITIES.has(task.priority) ? task.priority : 'medium')}</span>
            <button class="btn del task-delete" onclick="tdel(${Number(task.id)})" aria-label="Delete task">✕</button>
          </div>
        `).join('') || (kind === 'pending'
          ? '<div class="task-empty"><h4>You’re all caught up</h4></div>'
          : '<div class="task-empty task-empty-quiet"><span>Completed tasks will show up here.</span></div>')}
      </div>
    </section>`;

  return `<div class="tasks-page"><div class="tasks-columns">${list(pending, 'pending')}${list(completed, 'completed')}</div></div>`;
};

function tm() {
  ask(`<div class="form-heading"><span class="form-mark">✓</span><div><span class="form-eyebrow">STAY ON TRACK</span><h3>Add task</h3><p>Make the next step clear and manageable.</p></div></div>
    <form class="f standard-form" onsubmit="tsave(event)">
      <label>Task<input name="title" required maxlength="100" placeholder="What needs to get done?"></label>
      <label>Priority
        <select name="priority">
          <option value="high">High priority</option>
          <option value="medium" selected>Medium priority</option>
          <option value="low">Low priority</option>
        </select>
      </label>
      <div class="acts"><button type="button" class="btn ghost" onclick="shut()">Cancel</button><button class="btn">Add task</button></div>
    </form>`);
}

function tsave(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const title = String(form.get('title') || '').trim();
  const requestedPriority = String(form.get('priority') || 'medium');
  if (!title) return;
  const task = {
    id: uid(),
    title: title.slice(0, 100),
    completed: false,
    priority: TASK_PRIORITIES.has(requestedPriority) ? requestedPriority : 'medium'
  };
  S.tasks.push(task);
  if (!save()) {
    S.tasks = S.tasks.filter(item => item.id !== task.id);
    return;
  }
  shut();
  draw();
  toast('Task added');
}

function tk(id) {
  if (taskTransitionBusy) return;

  const task = S.tasks.find(item => String(item.id) === String(id));
  if (!task) return;

  const previous = !!task.completed;
  const next = !previous;
  const row = [...document.querySelectorAll('.task-row')]
    .find(element => String(element.dataset.taskId) === String(id));

  if (!row) {
    task.completed = next;
    if (!save()) task.completed = previous;
    draw();
    return;
  }

  taskTransitionBusy = true;
  const direction = next ? 'complete' : 'reopen';
  const animationClass = next ? 'task-animate-complete' : 'task-animate-reopen';
  const title = row.querySelector('.task-copy strong');
  const checkbox = row.querySelector('.chk');
  const checkmark = checkbox?.querySelector('span');

  row.classList.remove('task-animate-complete', 'task-animate-reopen');
  void row.offsetWidth;
  row.classList.add(animationClass);

  if (checkbox) {
    checkbox.classList.toggle('on', next);
    checkbox.setAttribute('aria-pressed', String(next));
    checkbox.setAttribute('aria-label', next ? 'Mark not done' : 'Mark done');
  }
  if (checkmark) checkmark.textContent = next ? '✓' : '';

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    if (title) title.removeEventListener('animationend', onAnimationEnd);
    clearTimeout(fallbackTimer);

    task.completed = next;
    if (!save()) task.completed = previous;
    taskTransitionBusy = false;
    draw();
  };
  const onAnimationEnd = event => {
    if (event.target === title && event.animationName === (next ? 'vyro-task-line-in' : 'vyro-task-line-out')) {
      finish();
    }
  };

  if (title) title.addEventListener('animationend', onAnimationEnd);
  const fallbackTimer = setTimeout(finish, TASK_ANIMATION_FALLBACK[direction]);
}

function tdel(id) {
  if (taskTransitionBusy) return;
  const previousTasks = S.tasks;
  S.tasks = previousTasks.filter(task => String(task.id) !== String(id));
  if (!save()) {
    S.tasks = previousTasks;
    return;
  }
  draw();
}
