// ======================================
// IMPORTS
// ======================================

import { loadTasks, saveTasks } from "./storage.js";
import { createTask, deleteTask, toggleTaskCompletion, updateTask } from "./tasks.js";
import { renderTasks, updateDashboard, setActiveFilter } from "./ui.js";

// ======================================
// APPLICATION STATE
// ======================================

let tasks = [];
let currentFilter = "all";
let searchQuery = "";
let currentSort = "newest";
let editingTaskId = null;

// ======================================
// HELPER FUNCTIONS
// ======================================

/**
 * Return the tasks that should be visible for the current filter.
 *
 * The filter() method creates a new array instead of changing the original one.
 * That is important because the main tasks array should remain the complete
 * source of truth. The UI can display a filtered view without losing any data.
 *
 * @returns {Array} The tasks that match the selected filter.
 */
function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter((task) => task.completed === false);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed === true);
  }

  if (currentFilter === "high") {
    return tasks.filter((task) => task.priority === "High");
  }

  return tasks;
}

/**
 * Search the current task list using a case-insensitive text match.
 *
 * Search state is another part of the application's view. It allows the user to
 * narrow the visible list without changing the original tasks array.
 *
 * @param {Array} tasksToSearch The list of tasks that should be searched.
 * @returns {Array} A new array containing only matching tasks.
 */
function getSearchedTasks(tasksToSearch) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return tasksToSearch;
  }

  return tasksToSearch.filter((task) => {
    const title = String(task.title || "").toLowerCase();
    const subject = String(task.subject || "").toLowerCase();
    const priority = String(task.priority || "").toLowerCase();

    return title.includes(normalizedQuery) || subject.includes(normalizedQuery) || priority.includes(normalizedQuery);
  });
}

/**
 * Sort the current task list using a copied array.
 *
 * Array sorting should happen on a copy because sort() changes the array that it
 * is called on. We want to keep the original data intact and create a new view
 * for the UI instead of mutating the app state.
 *
 * @param {Array} tasksToSort The list of tasks that should be sorted.
 * @returns {Array} A new array arranged according to the selected sort option.
 */
function getSortedTasks(tasksToSort) {
  const sortedTasks = [...tasksToSort];

  if (currentSort === "oldest") {
    return sortedTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  if (currentSort === "deadline") {
    return sortedTasks.sort((a, b) => {
      if (!a.deadline && !b.deadline) {
        return 0;
      }

      if (!a.deadline) {
        return 1;
      }

      if (!b.deadline) {
        return -1;
      }

      return a.deadline.localeCompare(b.deadline);
    });
  }

  if (currentSort === "priority") {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };

    return sortedTasks.sort((a, b) => {
      const priorityA = priorityOrder[a.priority] ?? 99;
      const priorityB = priorityOrder[b.priority] ?? 99;
      return priorityA - priorityB;
    });
  }

  return sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Return the full list of tasks that should be displayed.
 *
 * The display order is filter first, then search, then sort. This keeps the
 * logic easy to read and ensures that each step only changes the visible view.
 *
 * @returns {Array} The tasks that should be rendered.
 */
function getVisibleTasks() {
  const filteredTasks = getFilteredTasks();
  const searchedTasks = getSearchedTasks(filteredTasks);
  return getSortedTasks(searchedTasks);
}

/**
 * Refresh the visible UI from the current application state.
 *
 * Helper functions improve readability because they group related steps into a
 * single, reusable action. Instead of repeating the same logic in many places,
 * we can call this function whenever the task list changes.
 */
function refreshApplication() {
  renderTasks(getVisibleTasks());
  updateDashboard(tasks);
}

/**
 * Reset the task form and return it to create mode.
 *
 * The same form is reused for both creating and updating tasks. Resetting it
 * keeps the UI simple and ensures the user can switch between the two actions.
 */
function resetTaskForm() {
  const taskForm = document.querySelector("#task-form");

  if (taskForm) {
    taskForm.reset();
  }

  editingTaskId = null;
  setFormMode(false);
}

/**
 * Change the form into edit mode for a specific task.
 *
 * Editing state is stored separately from the task list so the app knows which
 * task should be updated. Using the task ID is safer than using an array index,
 * because the task may be filtered, searched, or sorted in the visible list.
 *
 * @param {string} taskId The id of the task that should be edited.
 */
function startEditingTask(taskId) {
  const taskToEdit = tasks.find((task) => task.id === taskId);

  if (!taskToEdit) {
    return;
  }

  const taskForm = document.querySelector("#task-form");

  if (!taskForm) {
    return;
  }

  editingTaskId = taskId;
  taskForm.title.value = taskToEdit.title;
  taskForm.subject.value = taskToEdit.subject;
  taskForm.priority.value = taskToEdit.priority;
  taskForm.deadline.value = taskToEdit.deadline;

  setFormMode(true);
  taskForm.title.focus();
}

/**
 * Leave edit mode and return the form to its default state.
 */
function cancelEditingTask() {
  resetTaskForm();
}

/**
 * Update the form button text and cancel button visibility.
 *
 * @param {boolean} isEditing Whether the form is currently in edit mode.
 */
function setFormMode(isEditing) {
  const submitButton = document.querySelector("#task-submit-btn");
  const cancelButton = document.querySelector("#cancel-edit-btn");

  if (submitButton) {
    submitButton.textContent = isEditing ? "Update Task" : "Add Task";
  }

  if (cancelButton) {
    cancelButton.hidden = !isEditing;
  }
}

/**
 * Handle the form submission for creating or updating a task.
 *
 * The same form is reused for both actions. If an edit is in progress, the app
 * updates the existing task instead of creating a new one. The old completed
 * and createdAt values are preserved while the editable fields are changed.
 *
 * @param {Event} event The submit event from the form.
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const title = form.title.value.trim();
  const subject = form.subject.value.trim();
  const priority = form.priority.value.trim();
  const deadline = form.deadline.value.trim();

  if (!title || !subject || !priority || !deadline) {
    return;
  }

  if (editingTaskId) {
    const taskToUpdate = tasks.find((task) => task.id === editingTaskId);

    if (taskToUpdate) {
      const updatedTask = {
        ...taskToUpdate,
        title,
        subject,
        priority,
        deadline,
      };

      tasks = updateTask(tasks, updatedTask);
    }
  } else {
    const newTask = createTask(title, subject, priority, deadline);
    tasks = [...tasks, newTask];
  }

  saveTasks(tasks);
  refreshApplication();
  resetTaskForm();
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

  if (button.dataset.action === "edit") {
    startEditingTask(taskId);
    return;
  }

  if (button.dataset.action === "toggle-complete") {
    tasks = toggleTaskCompletion(tasks, taskId);
  }

  if (button.dataset.action === "delete") {
    tasks = deleteTask(tasks, taskId);
  }

  saveTasks(tasks);
  refreshApplication();
}

/**
 * Handle clicks on the filter buttons.
 *
 * Application state is the current view the user is looking at. In this app,
 * the active filter is part of that state. Updating it here keeps the logic
 * centralized and makes the UI easy to understand.
 *
 * @param {Event} event The click event from the filter buttons container.
 */
function handleFilterClick(event) {
  const filterButton = event.target.closest("button[data-filter]");

  if (!filterButton) {
    return;
  }

  currentFilter = filterButton.dataset.filter || "all";
  setActiveFilter(currentFilter);
  refreshApplication();
}

/**
 * Handle typing inside the search input.
 *
 * Search state is updated here so the visible list can react immediately as the
 * user types without changing the original tasks array.
 *
 * @param {Event} event The input event from the search field.
 */
function handleSearchInput(event) {
  searchQuery = event.target.value;
  refreshApplication();
}

/**
 * Handle changes to the sort dropdown.
 *
 * Sort state controls the ordering of the displayed tasks. Like search state,
 * it only affects the visible view and should not change the saved task data.
 *
 * @param {Event} event The change event from the sort select.
 */
function handleSortChange(event) {
  currentSort = event.target.value;
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

  setActiveFilter(currentFilter);
  refreshApplication();

  const taskForm = document.querySelector("#task-form");
  const taskContainer = document.querySelector("#tasks-container");
  const filterContainer = document.querySelector(".filter-buttons");
  const searchInput = document.querySelector("#task-search");
  const sortSelect = document.querySelector("#task-sort");
  const cancelEditButton = document.querySelector("#cancel-edit-btn");

  if (taskForm) {
    taskForm.addEventListener("submit", handleFormSubmit);
  }

  if (taskContainer) {
    taskContainer.addEventListener("click", handleTaskContainerClick);
  }

  if (filterContainer) {
    filterContainer.addEventListener("click", handleFilterClick);
  }

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", handleSortChange);
  }

  if (cancelEditButton) {
    cancelEditButton.addEventListener("click", cancelEditingTask);
  }
}

// ======================================
// START APP
// ======================================

initializeApp();