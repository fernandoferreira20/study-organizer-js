/**
 * Study Organizer task management module.
 *
 * This file is responsible for creating and changing task data in a safe,
 * beginner-friendly way. The goal is to keep task logic separate from the UI,
 * so the rest of the application can focus on displaying and collecting data.
 *
 * A task in this app is represented as a JavaScript object. Objects are useful
 * because they let us group related information together in one place, such as
 * the title, subject, deadline, and completion status.
 */

/**
 * Create a unique task ID.
 *
 * IDs are important because they let us identify one specific task even when
 * several tasks have similar titles or content. Without an ID, it would be
 * much harder to update, delete, or find a single task.
 *
 * The code uses crypto.randomUUID() when it is available because it creates a
 * very strong, unique value. If that API is not supported in a browser, we use
 * a fallback value based on the current time and a random number.
 *
 * @returns {string} A unique identifier for a task.
 */
function createTaskId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

/**
 * Create a new task object.
 *
 * This function shows the idea of object creation. We collect several pieces of
 * information and place them into one object so the task can be handled as a
 * single unit.
 *
 * @param {string} title The task title.
 * @param {string} subject The subject or category.
 * @param {string} priority The task priority.
 * @param {string} deadline The task deadline.
 * @returns {object} A new task object.
 */
export function createTask(title, subject, priority, deadline) {
  return {
    id: createTaskId(),
    title,
    subject,
    priority,
    deadline,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Delete a task from a task list without changing the original array.
 *
 * This function uses filter(). Filter creates a new array containing only the
 * items that match a condition. In this case, we keep every task except the one
 * whose id matches the id we want to remove.
 *
 * This is an example of immutability. Instead of changing the original array,
 * we return a new array. That makes the code safer because other parts of the
 * program cannot accidentally lose data.
 *
 * @param {Array} tasks The current list of tasks.
 * @param {string} id The id of the task to remove.
 * @returns {Array} A new array without the selected task.
 */
export function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

/**
 * Toggle the completion status of a task.
 *
 * This function uses map(). Map creates a new array by transforming each item.
 * We look at every task, and for the matching task we create a new object with
 * the completed value switched from true to false or false to true.
 *
 * Pure functions are useful because they always return the same result for the
 * same input and do not change any external data. This makes them easier to
 * test and reason about.
 *
 * @param {Array} tasks The current list of tasks.
 * @param {string} id The id of the task to update.
 * @returns {Array} A new array with the toggled task.
 */
export function toggleTaskCompletion(tasks, id) {
  return tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }

    return task;
  });
}

/**
 * Update one task in the list without mutating the original array.
 *
 * This function uses map() again. We create a new array and replace the old
 * version of the task with the updated version when the ids match.
 *
 * Immutability is helpful here because we avoid accidentally changing data that
 * other parts of the app may still be using.
 *
 * @param {Array} tasks The current list of tasks.
 * @param {object} updatedTask The new task data that should replace the old one.
 * @returns {Array} A new array with the updated task.
 */
export function updateTask(tasks, updatedTask) {
  return tasks.map((task) => {
    if (task.id === updatedTask.id) {
      return { ...updatedTask };
    }

    return task;
  });
}

/**
 * Find a task by its id.
 *
 * This function uses find(). Find searches through an array and returns the
 * first item that matches a condition. If no task matches, it returns undefined.
 * We convert that into null so the rest of the app can work with a clear value.
 *
 * Using a simple lookup function makes the code easier to read and helps keep
 * the task logic organized in one place.
 *
 * @param {Array} tasks The current list of tasks.
 * @param {string} id The id of the task to find.
 * @returns {object|null} The matching task or null if it was not found.
 */
export function findTask(tasks, id) {
  const foundTask = tasks.find((task) => task.id === id);
  return foundTask || null;
}
