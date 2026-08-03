const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const addTask = document.getElementById("addTask");
const todoList = document.getElementById("todoList");
const addTaskModal = document.getElementById("addTaskModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const addBtn2 = document.getElementById("addBtn2");
const taskSchedule = document.getElementById("taskSchedule");
const stat_today = document.querySelector(".stat-card.blue .stat-number");
const stat_Scheduled = document.querySelector(".stat-card.yellow .stat-number");
const stat_all = document.querySelector(".stat-card.green .stat-number");
const stat_Overdue = document.querySelector(".stat-card.pink .stat-number");

function updateDashboardMetrics() {
  let data = JSON.parse(localStorage.getItem("Mytodolist")) || [];
  const todayFormattedString = new Date().toLocaleDateString("en-CA");

  if (stat_all) {
    stat_all.innerHTML = data.length;
  }

  if (stat_Scheduled) {
    const scheduledCount = data.filter(
      (task) => task.schedule && task.schedule.trim() !== "",
    ).length;
    stat_Scheduled.innerHTML = scheduledCount;
  }

  if (stat_today) {
    const todayCount = data.filter(
      (task) => task.schedule === todayFormattedString,
    ).length;
    stat_today.innerHTML = todayCount;
  }

  if (stat_Overdue) {
    const overdueCount = data.filter((task) => {
      return (
        task.schedule &&
        task.schedule.trim() !== "" &&
        task.schedule < todayFormattedString
      );
    }).length;
    stat_Overdue.innerHTML = overdueCount;
  }
}

function OpenAddTaskModal() {
  addTaskModal.style.display = "flex";
}
function closeModalF() {
  addTaskModal.style.display = "none";
  taskTitle.value = "";
  taskSchedule.value = "";
  taskDescription.value = "";
}

function list(e) {
  e.preventDefault();
  let title = taskTitle.value;
  let description = taskDescription.value;
  let taskschdule = taskSchedule.value;
  let hour = new Date().getHours();
  let min = new Date().getMinutes();
  let formatedmin = min < 10 ? "0" + min : min;
  let pa;

  const titleError = document.getElementById("titleError");
  const DescriptionErrror = document.getElementById("DescriptionErrror");
  pa = hour >= 12 ? "PM" : "AM";
  let time = `${hour}:${formatedmin}${pa}`;
  taskTitle.style.border = "";
  taskDescription.style.border = "";

  if (title == "") {
    taskTitle.style.border = "1px solid red";
    titleError.innerHTML = "input can't be empty";
  } else if (title.length <= 3) {
    titleError.innerHTML = "Your title must be greater than 3 words";
    taskTitle.style.border = "1px solid red";
    return false;
  } else if (description == "") {
    taskDescription.style.border = "1px solid red";
    DescriptionErrror.innerHTML = "input can't be empty";
    return false;
  }
  try {
    const currentTask = JSON.parse(localStorage.getItem("Mytodolist")) || [];
    const newTask = {
      id: Date.now(),
      title: title,
      description: description,
      schedule: taskschdule,
      timeCreated: time,
    };
    currentTask.push(newTask);
    localStorage.setItem("Mytodolist", JSON.stringify(currentTask));

    renderTask();
    updateDashboardMetrics();
    closeModalF();
  } catch (e) {
    alert(e);
  }
}

function renderTask() {
  const currentTask = JSON.parse(localStorage.getItem("Mytodolist")) || [];
  todoList.innerHTML = "";
  currentTask.forEach((task) => {
    todoList.innerHTML += ` <div class="task-item">
                  
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
                    <button class="delete-btn" onclick="deleteList(${task.id})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>`;
  });
  updateDashboardMetrics();
}
function deleteList(id) {
  let CurrentTask = JSON.parse(localStorage.getItem("Mytodolist")) || [];
  CurrentTask = CurrentTask.filter((task) => task.id !== id);
  localStorage.setItem("Mytodolist", JSON.stringify(CurrentTask));
  renderTask();
  updateDashboardMetrics();
}
renderTask();
addTask.addEventListener("click", list);
addBtn.addEventListener("click", OpenAddTaskModal);
addBtn2.addEventListener("click", OpenAddTaskModal);
closeModal.addEventListener("click", closeModalF);
cancelBtn.addEventListener("click", closeModalF);
