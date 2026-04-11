/**
 * Storage utility with fallback to in-memory storage
 * Handles cases where localStorage is blocked by browser privacy settings
 */

let memoryStore = {};
let storageAvailable = false;

// Test if localStorage is available
function testStorageAvailable() {
  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn("⚠️  localStorage is not available (privacy mode or blocked by browser). Using in-memory fallback.", e.message);
    return false;
  }
}

storageAvailable = testStorageAvailable();

const storage = {
  getItem: (key) => {
    if (storageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn(`Failed to read from localStorage (key: ${key}), using memory store.`);
        return memoryStore[key] || null;
      }
    }
    return memoryStore[key] || null;
  },

  setItem: (key, value) => {
    if (storageAvailable) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.warn(`Failed to write to localStorage (key: ${key}), using memory store.`);
        memoryStore[key] = value;
      }
    } else {
      memoryStore[key] = value;
    }
  },

  removeItem: (key) => {
    if (storageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove from localStorage (key: ${key}), removing from memory store.`);
        delete memoryStore[key];
      }
    } else {
      delete memoryStore[key];
    }
  },

  clear: () => {
    if (storageAvailable) {
      try {
        window.localStorage.clear();
      } catch (e) {
        console.warn("Failed to clear localStorage, clearing memory store.");
        memoryStore = {};
      }
    } else {
      memoryStore = {};
    }
  },
};

export default storage;
