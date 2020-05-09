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

// Notifications

let swRegistration;

let totalSeconds;
let intervalId;

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
  // alert('Timer has ended');
  showLocalNotification('Pomodoro App', 'Timer has Ended', swRegistration);
};

startButton.addEventListener('click', e => {
  startContDown(tomatoMinutes);
});
shortBreakButton.addEventListener('click', e => {
  startContDown(shortBreakMinutes);
});
longBreakButton.addEventListener('click', e => {
  startContDown(longBreakMinutes);
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

const clearTimer = () => {
  modalContainer.classList.remove('visible');
  clearInterval(intervalId);
  timer.textContent = '00:00';
  // alert('Changes saved correctly');
  showLocalNotification('Pomodoro App', 'Changes saved!', swRegistration);
};

saveButton.addEventListener('click', e => {
  tomatoMinutes = tomatoMinutesInput.value;
  shortBreakMinutes = shortBreakMinutesInput.value;
  longBreakMinutes = longBreakMinutesInput.value;
  clearTimer();
});

defaultButton.addEventListener('click', e => {
  tomatoMinutes = 25;
  shortBreakMinutes = 5;
  longBreakMinutes = 15;
  clearTimer();
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

const showLocalNotification = (title, body, swRegistration) => {
  const options = {
    body,
  };
  swRegistration.showNotification(title, options);
};

const main = async () => {
  check();
  swRegistration = await registerServiceWorker();
  await requestNotificationPermission();
};

main();
