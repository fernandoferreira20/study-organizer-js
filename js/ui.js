/**
 * Study Organizer UI module.
 *
 * This file is responsible for showing information to the user in the browser.
 * It does not contain the business logic for creating or changing tasks. That
 * separation makes the code easier to read, test, and maintain.
 *
 * In a web app, the DOM is the live tree of HTML elements that the browser
 * uses to display the page. We can change this tree with JavaScript by creating
 * elements, adding them to the page, and updating their text.
 */

/**
 * Get the task container element from the DOM.
 *
 * This helper keeps the code simple and avoids repeating the same selector.
 *
 * @returns {HTMLElement} The tasks container element.
 */
function getTasksContainer() {
  return document.querySelector("#tasks-container");
}

/**
 * Create a simple text element for a label.
 *
 * createElement() is used to create a new DOM node from scratch. This is a
 * beginner-friendly way to build user interface elements without writing raw
 * HTML strings.
 *
 * @param {string} tagName The HTML tag to create.
 * @param {string} text The text content to place inside the element.
 * @returns {HTMLElement} The created element.
 */
function createTextElement(tagName, text) {
  const element = document.createElement(tagName);
  element.textContent = text;
  return element;
}

/**
 * Show the empty state message inside the task list.
 *
 * Rendering means turning data into visible UI. In this case, we are turning a
 * list of tasks into a message that tells the user there is nothing to display.
 */
export function showEmptyState() {
  const container = getTasksContainer();

  if (!container) {
    return;
  }

  clearTaskContainer();
  container.appendChild(createTextElement("p", "No tasks yet. Add your first study task."));
}

/**
 * Remove every rendered task from the container.
 *
 * This helper is useful because the app may need to redraw the list after a task
 * is added, deleted, or updated. Clearing the container first keeps the UI
 * consistent and avoids duplicate content.
 */
export function clearTaskContainer() {
  const container = getTasksContainer();

  if (!container) {
    return;
  }

  container.innerHTML = "";
}

/**
 * Activate the correct filter button in the UI.
 *
 * This keeps the visible button state in sync with the current application
 * state. The script module decides which filter is active, and the UI module
 * handles the DOM update that makes the selected button look active.
 *
 * @param {string} filterName The filter that should be highlighted.
 */
export function setActiveFilter(filterName) {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filterName;
    button.classList.toggle("active", isActive);
  });
}

/**
 * Create a single task card element.
 *
 * createElement() and appendChild() are used to build the card step by step.
 * This is often better than writing a large HTML string because it is easier to
 * read and easier to update later.
 *
 * Avoiding excessive innerHTML is helpful because it reduces the chance of
 * mistakes when inserting user data. It also makes the code more predictable,
 * especially for beginners.
 *
 * @param {object} task The task object to display.
 * @returns {HTMLElement} A DOM element representing the task card.
 */
export function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";
  card.dataset.taskId = task.id;

  const title = createTextElement("h3", task.title);
  const subject = createTextElement("p", `Subject: ${task.subject}`);
  const priority = createTextElement("p", `Priority: ${task.priority}`);
  const deadline = createTextElement("p", `Deadline: ${task.deadline}`);
  const completed = createTextElement("p", `Completed: ${task.completed ? "Yes" : "No"}`);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const completeButton = document.createElement("button");
  completeButton.type = "button";
  completeButton.textContent = task.completed ? "Mark Incomplete" : "Complete";
  completeButton.dataset.action = "toggle-complete";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.dataset.action = "delete";

  actions.appendChild(completeButton);
  actions.appendChild(deleteButton);

  card.appendChild(title);
  card.appendChild(subject);
  card.appendChild(priority);
  card.appendChild(deadline);
  card.appendChild(completed);
  card.appendChild(actions);

  return card;
}

/**
 * Render all tasks into the main task list container.
 *
 * Rendering means taking data and turning it into visible elements on the page.
 * This function separates the UI responsibility from the task data itself.
 * Instead of directly changing the task array, it only decides how to display it.
 *
 * @param {Array} tasks The list of tasks to display.
 */
export function renderTasks(tasks) {
  const container = getTasksContainer();

  if (!container) {
    return;
  }

  clearTaskContainer();

  if (!tasks || tasks.length === 0) {
    showEmptyState();
    return;
  }

  tasks.forEach((task) => {
    container.appendChild(createTaskCard(task));
  });
}

/**
 * Update the dashboard summary values.
 *
 * This function shows the separation of responsibilities. The UI module handles
 * how information is displayed, while task data is managed elsewhere. The
 * dashboard values are calculated from the current task list and then rendered.
 *
 * @param {Array} tasks The current list of tasks.
 */
export function updateDashboard(tasks) {
  const totalTasks = tasks ? tasks.length : 0;
  const completedTasks = tasks ? tasks.filter((task) => task.completed).length : 0;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const totalElement = document.querySelector("#total-tasks");
  const completedElement = document.querySelector("#completed-tasks");
  const pendingElement = document.querySelector("#pending-tasks");
  const percentageElement = document.querySelector("#progress-percentage");
  const progressFillElement = document.querySelector("#progress-fill");

  if (totalElement) {
    totalElement.textContent = totalTasks;
  }

  if (completedElement) {
    completedElement.textContent = completedTasks;
  }

  if (pendingElement) {
    pendingElement.textContent = pendingTasks;
  }

  if (percentageElement) {
    percentageElement.textContent = `${progressPercentage}%`;
  }

  if (progressFillElement) {
    progressFillElement.style.width = `${progressPercentage}%`;
  }
}
