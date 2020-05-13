const timer = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const shortBreakButton = document.getElementById('shortBreakButton');
const longBreakButton = document.getElementById('longBreakButton');
const clearTimeButton = document.getElementById('clearTimeButton');

const settingsButton = document.querySelector('.settingsButton');
const modalContainer = document.querySelector('.modal-container');
const modal = document.querySelector('.modal');

const pomodoroMinutesInput = document.getElementsByName('tomato-minutes')[0];
const shortBreakMinutesInput = document.getElementsByName('short-minutes')[0];
const longBreakMinutesInput = document.getElementsByName('long-minutes')[0];
const saveButton = document.querySelector('.saveButton');
const defaultButton = document.querySelector('.defaultButton');

// Default Values, inserted the first time to the DB and to reset values
const defaultValues = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 10,
};

//Variables that store changes
let pomodoroMinutes, shortBreakMinutes, longBreakMinutes;

// Date Options
const dateOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

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
  startContDown(pomodoroMinutes);
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
  pomodoroMinutesInput.value = pomodoroMinutes;
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
  pomodoroMinutes = pomodoroMinutesInput.value;
  shortBreakMinutes = shortBreakMinutesInput.value;
  longBreakMinutes = longBreakMinutesInput.value;
  saveMinutesToDB();
  goToMainMenu();
});

defaultButton.addEventListener('click', e => {
  pomodoroMinutes = 25;
  shortBreakMinutes = 5;
  longBreakMinutes = 15;
  saveMinutesToDB();
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
  createDB.onsuccess = () => (DB = createDB.result);
  createDB.onerror = () => console.error('There was an error openning the DB');
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

    let valueObjectStore = db.createObjectStore('values', {
      keyPath: 'key',
      autoIncrement: true,
    });

    valueObjectStore.createIndex('pomodoroMinutes', 'pomodoroMinutes', {
      unique: false,
    });
    valueObjectStore.createIndex('shortBreakMinutes', 'shortBreakMinutes', {
      unique: false,
    });
    valueObjectStore.createIndex('longBreakMinutes', 'longBreakMinutes', {
      unique: false,
    });
    let valueAddRequest = valueObjectStore.add(defaultValues);
    valueAddRequest.onsuccess = () => {
      console.log('Default values added');
    };
    valueAddRequest.onerror = () => {
      console.log('There was an error saving the default values');
    };
  };
};

saveNewRecord = objectStore => {
  const newRecord = {
    date: new Date()
      .toLocaleDateString('en-US', dateOptions)
      .replace(',', '')
      .replace(',', ''),
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

updateExistingRecord = (data, objectStore) => {
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
  const key = new Date()
    .toLocaleDateString('en-US', dateOptions)
    .replace(',', '')
    .replace(',', '');
  let transaction = DB.transaction(['records'], 'readwrite');
  let objectStore = transaction.objectStore('records');

  let recordGetRequest = objectStore.get(key);

  recordGetRequest.onsuccess = () => {
    let data = recordGetRequest.result;
    if (!data) saveNewRecord(objectStore);
    else updateExistingRecord(data, objectStore);
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

const saveMinutesToDB = () => {
  let transaction = DB.transaction(['values'], 'readwrite');
  let objectStore = transaction.objectStore('values');
  let key = 1;

  let valueGetRequest = objectStore.get(key);

  valueGetRequest.onsuccess = () => {
    let data = valueGetRequest.result;
    data.pomodoroMinutes = parseInt(pomodoroMinutes);
    data.shortBreakMinutes = parseInt(shortBreakMinutes);
    data.longBreakMinutes = parseInt(longBreakMinutes);

    let valueUpdateRequest = objectStore.put(data);

    valueUpdateRequest.onsuccess = () => {
      console.log('Values updated successfully!');
    };
    valueUpdateRequest.onerror = () => {
      console.log('There was an error updating the value');
    };
  };

  valueGetRequest.onerror = () => {
    console.log('There was an error getting values');
  };
};

// To store the corresponding minutes in changing variables
const getValuesFromDB = () => {
  let transaction = DB.transaction(['values'], 'readwrite');
  let objectStore = transaction.objectStore('values');
  const getValues = objectStore.getAll();

  getValues.onsuccess = e => {
    const dbValues = e.target.result[0];
    pomodoroMinutes = dbValues.pomodoroMinutes;
    shortBreakMinutes = dbValues.shortBreakMinutes;
    longBreakMinutes = dbValues.longBreakMinutes;
  };

  getValues.onerror = e => {
    console.log('There was an error getting the values');
    alert('Refresh the page');
  };
};

document.addEventListener('DOMContentLoaded', e => {
  main();
  openDB();
  setTimeout(getValuesFromDB, 500);
});
