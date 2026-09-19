const STORAGE_KEY = "Mytodolist";

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskSchedule = document.getElementById("taskSchedule");
const addTaskButton = document.getElementById("addTask");
const todoList = document.getElementById("todoList");
const addTaskModal = document.getElementById("addTaskModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const addBtn = document.getElementById("addBtn");
const addBtn2 = document.getElementById("addBtn2");
const modalTitle = document.getElementById("modalTitle");

const statToday = document.getElementById("stat-Today");
const statScheduled = document.getElementById("stat-Scheduled");
const statAll = document.getElementById("stat-all");
const statOverdue = document.getElementById("stat-Overdue");

let currentFilter = "all";

function getTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function clearInputStyles() {
  taskTitle.style.border = "";
  taskDescription.style.border = "";
  document.getElementById("titleError").textContent = "";
  document.getElementById("descriptionError").textContent = "";
}

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${period}`;
}

function updateDashboardMetrics() {
  const tasks = getTasks();
  const todayFormattedString = new Date().toLocaleDateString("en-CA");

  if (statAll) statAll.textContent = tasks.length;
  if (statScheduled) {
    const scheduledCount = tasks.filter((task) => task.schedule && task.schedule.trim() !== "").length;
    statScheduled.textContent = scheduledCount;
  }
  if (statToday) {
    const todayCount = tasks.filter((task) => task.schedule === todayFormattedString).length;
    statToday.textContent = todayCount;
  }
  if (statOverdue) {
    const overdueCount = tasks.filter((task) => {
      return task.schedule && task.schedule.trim() !== "" && task.schedule < todayFormattedString;
    }).length;
    statOverdue.textContent = overdueCount;
  }
}

function openAddTaskModal(task = null) {
  if (task) {
    taskTitle.value = task.title;
    taskDescription.value = task.description;
    taskSchedule.value = task.schedule || "";
    addTaskModal.dataset.mode = "edit";
    addTaskModal.dataset.taskId = String(task.id);
    modalTitle.textContent = "Edit Task";
    addTaskButton.textContent = "Save Changes";
  } else {
    addTaskModal.dataset.mode = "add";
    addTaskModal.dataset.taskId = "";
    modalTitle.textContent = "Add New Task";
    addTaskButton.textContent = "Add Task";
  }

  addTaskModal.classList.add("active");
  addTaskModal.setAttribute("aria-hidden", "false");
  taskTitle.focus();
}

function closeModalF() {
  addTaskModal.classList.remove("active");
  addTaskModal.setAttribute("aria-hidden", "true");
  taskTitle.value = "";
  taskDescription.value = "";
  taskSchedule.value = "";
  addTaskModal.dataset.mode = "add";
  addTaskModal.dataset.taskId = "";
  modalTitle.textContent = "Add New Task";
  addTaskButton.textContent = "Add Task";
  clearInputStyles();
}

function handleAddTask(event) {
  event.preventDefault();

  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  const schedule = taskSchedule.value;
  const mode = addTaskModal.dataset.mode || "add";

  clearInputStyles();

  if (!title) {
    taskTitle.style.border = "1px solid red";
    document.getElementById("titleError").textContent = "Title cannot be empty";
    return;
  }

  if (title.length <= 3) {
    taskTitle.style.border = "1px solid red";
    document.getElementById("titleError").textContent = "Title must be more than 3 characters";
    return;
  }

  if (!description) {
    taskDescription.style.border = "1px solid red";
    document.getElementById("descriptionError").textContent = "Description cannot be empty";
    return;
  }

  const currentTasks = getTasks();

  if (mode === "edit") {
    const taskId = Number(addTaskModal.dataset.taskId);
    const taskIndex = currentTasks.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
      currentTasks[taskIndex] = {
        ...currentTasks[taskIndex],
        title,
        description,
        schedule,
      };
      saveTasks(currentTasks);
      renderTask();
      closeModalF();
    }
    return;
  }

  const newTask = {
    id: Date.now(),
    title,
    description,
    schedule,
    timeCreated: getCurrentTime(),
    completed: false,
  };

  currentTasks.push(newTask);
  saveTasks(currentTasks);
  renderTask();
  closeModalF();
}

function deleteList(id) {
  const tasks = getTasks().filter((task) => task.id !== id);
  saveTasks(tasks);
  renderTask();
}

function toggleTaskComplete(id) {
  const tasks = getTasks();
  const task = tasks.find((item) => item.id === id);

  if (!task) return;

  task.completed = !task.completed;
  saveTasks(tasks);
  renderTask();
}

function getVisibleTasks() {
  const tasks = getTasks();

  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function reorderTasks(draggedTaskId, targetTaskId) {
  const tasks = getTasks();
  const draggedIndex = tasks.findIndex((task) => task.id === draggedTaskId);
  const targetIndex = tasks.findIndex((task) => task.id === targetTaskId);

  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
    return;
  }

  const [draggedTask] = tasks.splice(draggedIndex, 1);
  tasks.splice(targetIndex, 0, draggedTask);
  saveTasks(tasks);
}

function renderTask() {
  const tasks = getVisibleTasks();
  todoList.innerHTML = "";

  if (tasks.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <h3>No tasks yet</h3>
        <p>Start by adding your first task.</p>
      </div>
    `;
    updateDashboardMetrics();
    return;
  }

  tasks.forEach((task) => {
    const taskItem = document.createElement("div");
    taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
    taskItem.dataset.taskId = String(task.id);
    taskItem.draggable = true;

    taskItem.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(task.id));
      taskItem.classList.add("dragging");
    });

    taskItem.addEventListener("dragend", () => {
      taskItem.classList.remove("dragging");
      document.querySelectorAll(".task-item").forEach((item) => item.classList.remove("drag-over"));
    });

    taskItem.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      taskItem.classList.add("drag-over");
    });

    taskItem.addEventListener("dragleave", () => {
      taskItem.classList.remove("drag-over");
    });

    taskItem.addEventListener("drop", (event) => {
      event.preventDefault();
      taskItem.classList.remove("drag-over");
      const draggedTaskId = Number(event.dataTransfer.getData("text/plain"));
      const targetTaskId = Number(taskItem.dataset.taskId);
      reorderTasks(draggedTaskId, targetTaskId);
      renderTask();
    });

    taskItem.innerHTML = `
      <label class="task-checkbox">
        <input type="checkbox" ${task.completed ? "checked" : ""} data-task-toggle="${task.id}">
      </label>
      <div class="task-content">
        <div class="task-meta">
          <span class="task-time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${task.timeCreated}
          </span>
          <span class="task-schedule">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span class="schedule-date">${task.schedule || "No date"}</span>
          </span>
        </div>
        <p class="task-title">${task.title}</p>
        <p class="task-description">${task.description}</p>
      </div>
      <div class="task-actions">
        <button class="edit-btn" type="button" data-task-edit="${task.id}" aria-label="Edit task">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
          </svg>
        </button>
        <button class="delete-btn" type="button" data-task-delete="${task.id}" aria-label="Delete task">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    todoList.appendChild(taskItem);
  });

  updateDashboardMetrics();
}

addTaskButton.addEventListener("click", handleAddTask);
addBtn.addEventListener("click", () => openAddTaskModal());
addBtn2.addEventListener("click", () => openAddTaskModal());
closeModal.addEventListener("click", closeModalF);
cancelBtn.addEventListener("click", closeModalF);

document.querySelector(".modal-overlay").addEventListener("click", closeModalF);

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });
    renderTask();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && addTaskModal.classList.contains("active")) {
    closeModalF();
  }
});

document.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-task-edit]");
  if (editButton) {
    const taskId = Number(editButton.dataset.taskEdit);
    const task = getTasks().find((item) => item.id === taskId);
    if (task) {
      openAddTaskModal(task);
    }
    return;
  }

  const deleteButton = event.target.closest("[data-task-delete]");
  if (deleteButton) {
    deleteList(Number(deleteButton.dataset.taskDelete));
    return;
  }

  const toggleCheck = event.target.closest("[data-task-toggle]");
  if (toggleCheck) {
    toggleTaskComplete(Number(toggleCheck.dataset.taskToggle));
  }
});

renderTask();
