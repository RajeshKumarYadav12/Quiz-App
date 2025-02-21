export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("QuizDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("quizHistory")) {
        db.createObjectStore("quizHistory", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Failed to open IndexedDB.");
    };
  });
};

export const saveAttempt = async (attempt) => {
  const db = await openDB();
  const transaction = db.transaction("quizHistory", "readwrite");
  const store = transaction.objectStore("quizHistory");
  store.add(attempt);
};

export const getAttempts = async () => {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction("quizHistory", "readonly");
    const store = transaction.objectStore("quizHistory");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};
