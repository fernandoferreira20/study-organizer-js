// ======================================
// IMPORTS
// ======================================

import { loadTasks, saveTasks } from "./storage.js";
import { createTask, deleteTask, toggleTaskCompletion } from "./tasks.js";
import { renderTasks, updateDashboard } from "./ui.js";

// ======================================
// APPLICATION STATE
// ======================================

let tasks = [];

// ======================================
// HELPER FUNCTIONS
// ======================================

/**
 * Refresh the visible UI from the current application state.
 *
 * Helper functions improve readability because they group related steps into a
 * single, reusable action. Instead of repeating the same logic in many places,
 * we can call this function whenever the task list changes.
 */
function refreshApplication() {
  renderTasks(tasks);
  updateDashboard(tasks);
}

/**
 * Handle the form submission for creating a new task.
 *
 * The form is the place where the user enters task details. When it is
 * submitted, we collect the values, create a task object, update the app state,
 * and then refresh the UI.
 *
 * @param {Event} event The submit event from the form.
 */
function handleFormSubmit(event) {
  event.preventDefault();

    console.log(document.getElementById("task-name"));
    console.log(document.getElementById("task-subject"));
    console.log(document.getElementById("task-priority"));
    console.log(document.getElementById("task-deadline"));

  const form = event.target;
  const title = form.title.value.trim();
  const subject = form.subject.value.trim();
  const priority = form.priority.value.trim();
  const deadline = form.deadline.value.trim();

  if (!title || !subject || !priority || !deadline) {
    return;
  }

  const newTask = createTask(title, subject, priority, deadline);
  tasks = [...tasks, newTask];

  saveTasks(tasks);
  refreshApplication();
  form.reset();
}

/**
 * Handle clicks inside the task list.
 *
 * Event delegation is a useful pattern because we attach one event listener to a
 * parent container instead of adding listeners to every button. This keeps the
 * code smaller and helps when new tasks are rendered dynamically.
 *
 * @param {Event} event The click event from the task container.
 */
function handleTaskContainerClick(event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const taskCard = button.closest("[data-task-id]");

  if (!taskCard) {
    return;
  }

  const taskId = taskCard.dataset.taskId;

  if (button.dataset.action === "toggle-complete") {
    tasks = toggleTaskCompletion(tasks, taskId);
  }

  if (button.dataset.action === "delete") {
    tasks = deleteTask(tasks, taskId);
  }

  saveTasks(tasks);
  refreshApplication();
}

// ======================================
// APP INITIALIZATION
// ======================================

/**
 * Initialize the app when the page loads.
 *
 * Imports let this file use functions from the other modules. The app starts by
 * loading saved tasks from storage, placing them into the main state array, and
 * then rendering them to the screen.
 */
function initializeApp() {
  const savedTasks = loadTasks();
  tasks = savedTasks;

  refreshApplication();

  const taskForm = document.querySelector("#task-form");
  const taskContainer = document.querySelector("#tasks-container");

  if (taskForm) {
    taskForm.addEventListener("submit", handleFormSubmit);
  }

  if (taskContainer) {
    taskContainer.addEventListener("click", handleTaskContainerClick);
  }
}

// ======================================
// START APP
// ======================================

initializeApp();