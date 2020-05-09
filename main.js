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
  notify('Timer has ended');
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
  notify('Changes saved correctly');
  mobileNotify('Changes saved correctly');
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

const enableNotifications = () => {
  if (!('Notification' in window)) {
    alert('This browser does not support system notifications');
  } else if (Notification.permission === 'denied') {
    Notification.requestPermission(permission => {
      if (permission !== 'granted') {
        enableNotifications();
      }
    });
  } else {
    console.log('Notifications enabled');
  }
};

const notify = message => {
  let notification = new Notification('Notification', {
    body: `${message}`,
  });
  setTimeout(notification.close.bind(notification), 1500);
};

const mobileNotify = message => {
  navigator.serviceWorker.ready.then(function (registration) {
    registration.showNotification(message);
  });
};

window.addEventListener('load', () => {
  enableNotifications();
  navigator.serviceWorker.register('sw.js');
  Notification.requestPermission(function (result) {
    if (result === 'granted') {
      navigator.serviceWorker.ready.then(function (registration) {
        registration.showNotification('Notification with ServiceWorker');
      });
    }
  });
});
