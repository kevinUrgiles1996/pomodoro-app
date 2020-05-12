const timer = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const shortBreakButton = document.getElementById('shortBreakButton');
const longBreakButton = document.getElementById('longBreakButton');
const clearTimeButton = document.getElementById('clearTimeButton');

const settingsButton = document.querySelector('.settingsButton');
const modalContainer = document.querySelector('.modal-container');
const modal = document.querySelector('.modal');

const tomatoMinutesInput = document.getElementsByName('tomato-minutes')[0];
const shortBreakMinutesInput = document.getElementsByName('short-minutes')[0];
const longBreakMinutesInput = document.getElementsByName('long-minutes')[0];
const saveButton = document.querySelector('.saveButton');
const defaultButton = document.querySelector('.defaultButton');

// Default Values
let tomatoMinutes = 25;
let shortBreakMinutes = 5;
let longBreakMinutes = 15;

// Notifications and Service Worker registration
let swRegistration;

// INDEXED DB
let DB;

let totalSeconds;
let intervalId;
let timerType;

const countDown = () => {
  if (totalSeconds === 0) endTimer();

  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  timer.textContent = `${minutes}:${seconds}`;
  totalSeconds--;
};

const startContDown = minutes => {
  clearInterval(intervalId);
  totalSeconds = minutes * 60;
  intervalId = setInterval(countDown, 1000);
};

const endTimer = () => {
  clearInterval(intervalId);
  showLocalNotification('Pomodoro App', 'Timer has ended', swRegistration);
  setTimeout(() => saveOrUpdate(), 1000);
};

startButton.addEventListener('click', e => {
  startContDown(tomatoMinutes);
  timerType = 'pomodoros';
});
shortBreakButton.addEventListener('click', e => {
  startContDown(shortBreakMinutes);
  timerType = 'shortBreaks';
});
longBreakButton.addEventListener('click', e => {
  startContDown(longBreakMinutes);
  timerType = 'longBreaks';
});

clearTimeButton.addEventListener('click', e => {
  clearInterval(intervalId);
  timer.textContent = '00:00';
});

settingsButton.addEventListener('click', e => {
  tomatoMinutesInput.value = tomatoMinutes;
  shortBreakMinutesInput.value = shortBreakMinutes;
  longBreakMinutesInput.value = longBreakMinutes;
  modalContainer.classList.add('visible');
});

modalContainer.addEventListener('click', e => {
  modalContainer.classList.remove('visible');
});

modal.addEventListener('click', e => {
  e.stopPropagation();
});

const goToMainMenu = () => {
  modalContainer.classList.remove('visible');
  clearInterval(intervalId);
  timer.textContent = '00:00';
  showLocalNotification('Pomodoro App', 'Changes saved!', swRegistration);
};

saveButton.addEventListener('click', e => {
  tomatoMinutes = tomatoMinutesInput.value;
  shortBreakMinutes = shortBreakMinutesInput.value;
  longBreakMinutes = longBreakMinutesInput.value;
  goToMainMenu();
});

defaultButton.addEventListener('click', e => {
  tomatoMinutes = 25;
  shortBreakMinutes = 5;
  longBreakMinutes = 15;
  goToMainMenu();
});

// NOTIFICATIONS

const check = () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No service Worker support!');
  }
  if (!('PushManager' in window)) {
    throw new Error('No Push API Support!');
  }
};

const registerServiceWorker = async () => {
  const swRegistration = await navigator.serviceWorker.register('service.js');
  return swRegistration;
};

const requestNotificationPermission = async () => {
  const permission = await window.Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission not granted for Notification');
  }
};

const showLocalNotification = async (title, body, swRegistration) => {
  const options = { body };
  await swRegistration.showNotification(title, options);
};

const main = async () => {
  check();
  swRegistration = await registerServiceWorker();
  await requestNotificationPermission();
};

// INDEXED DB

const openDB = () => {
  let createDB = window.indexedDB.open('pomodoro', 1);
  createDB.onerror = () => console.error('There was an error openning the DB');
  createDB.onsuccess = () => (DB = createDB.result);
  // This method just runs once. Ideal to create Schemas
  createDB.onupgradeneeded = e => {
    let db = e.target.result;
    let objectStore = db.createObjectStore('records', {
      keyPath: 'date',
      autoIncrement: false,
    });
    objectStore.createIndex('date', 'date', { unique: false });
    objectStore.createIndex('pomodoros', 'pomodoros', { unique: false });
    objectStore.createIndex('shortBreaks', 'shortBreaks', { unique: false });
    objectStore.createIndex('longBreaks', 'longBreaks', { unique: false });
  };
};

saveNewRecord = objectStore => {
  const newRecord = {
    date: new Date().toLocaleDateString('en-US'),
    pomodoros: 0,
    shortBreaks: 0,
    longBreaks: 0,
  };
  newRecord[timerType] = 1;
  let recordAddRequest = objectStore.add(newRecord);
  recordAddRequest.onsuccess = () => {
    console.log('Record saved Succesfully!');
  };
  recordAddRequest.onerror = () => {
    console.log('There was an error saving the record');
  };
};

updateRecord = (data, objectStore) => {
  data[timerType]++;
  let recordUpdateRequest = objectStore.put(data);

  recordUpdateRequest.onsuccess = () => {
    console.log('Record updated successfully!');
  };
  recordUpdateRequest.onerror = () => {
    console.log('There was an error updating the record');
  };
};

const saveOrUpdate = () => {
  const key = new Date().toLocaleDateString('en-US');
  let transaction = DB.transaction(['records'], 'readwrite');
  let objectStore = transaction.objectStore('records');

  let recordGetRequest = objectStore.get(key);

  recordGetRequest.onsuccess = () => {
    let data = recordGetRequest.result;
    if (!data) saveNewRecord(objectStore);
    else updateRecord(data, objectStore);
  };

  recordGetRequest.onerror = () => {
    console.error('There was an error getting the record');
  };

  transaction.oncomplete = () => {
    console.log('Transaction completed');
  };
  transaction.onerror = () => {
    console.log('There was an error');
  };
};

document.addEventListener('DOMContentLoaded', e => {
  main();
  openDB();
});

// document.querySelector('.getAll').addEventListener('click', e => {
//   let transaction = DB.transaction(['records'], 'readwrite');
//   let objectStore = transaction.objectStore('records');
//   const all = objectStore.getAll();
//   all.onsuccess = e => {
//     console.log(e.target.result);
//   };
// });
