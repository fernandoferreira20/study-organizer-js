/**
 * Study Organizer storage module.
 *
 * localStorage is a browser feature that allows a web page to save small
 * pieces of data even after the page is refreshed or the browser is closed.
 * This is helpful for a simple app like Study Organizer because we can keep
 * the list of tasks available the next time the user visits the page.
 *
 * In this project, we store tasks as text in localStorage, so we use JSON to
 * convert JavaScript data into a string format and back again.
 */

const STORAGE_KEY = "studyOrganizerTasks";

/**
 * Load saved tasks from localStorage.
 *
 * JSON.parse is needed because localStorage only stores strings. When we save
 * an array of tasks, we first convert it into a string with JSON.stringify.
 * When we read it back, we must convert that string back into a real JavaScript
 * array using JSON.parse.
 *
 * The try/catch block is useful because storage operations can fail if the
 * browser blocks access, the data is damaged, or the data is not valid JSON.
 * Instead of crashing the whole app, we can safely handle the error and return
 * an empty array.
 *
 * @returns {Array} A list of saved tasks or an empty array if nothing is stored.
 */
export function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (Array.isArray(parsedTasks)) {
      return parsedTasks;
    }

    return [];
  } catch (error) {
    console.error("Could not load tasks from storage:", error);
    return [];
  }
}

/**
 * Save the current task list into localStorage.
 *
 * JSON.stringify is needed because localStorage cannot store JavaScript arrays
 * or objects directly. It converts the data into a plain text string so the
 * browser can save it safely.
 *
 * The try/catch block helps us catch problems such as storage access errors
 * and prevents the application from breaking if something goes wrong.
 *
 * @param {Array} tasks The task list that should be saved.
 */
export function saveTasks(tasks) {
  try {
    const tasksToStore = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, tasksToStore);
  } catch (error) {
    console.error("Could not save tasks to storage:", error);
  }
}

/**
 * Remove all saved tasks from localStorage.
 *
 * This function is useful when the user wants to clear the app data, such as
 * when resetting the list or starting over with a fresh study plan.
 *
 * try/catch is still helpful here because removing data from storage can also
 * fail in some situations. Handling the error gracefully makes the app more
 * reliable for beginners and for different browser environments.
 */
export function clearTasks() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Could not clear tasks from storage:", error);
  }
}
