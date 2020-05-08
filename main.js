const timer = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const shortBreakButton = document.getElementById('shortBreakButton');
const longBreakButton = document.getElementById('longBreakButton');

const configButton = document.querySelector('.configButton');
const modalContainer = document.querySelector('.modal-container');
const modal = document.querySelector('.modal');
const closeButton = document.querySelector('.close-button');

const tomatoMinutesInput = document.getElementsByName('tomato-minutes')[0];
const shortBreakMinutesInput = document.getElementsByName('short-minutes')[0];
const longBreakMinutesInput = document.getElementsByName('long-minutes')[0];
const saveButton = document.querySelector('.saveButton');
const defaultButton = document.querySelector('.defaultButton');

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

const startContDown = (minutes) => {
  clearInterval(intervalId);
  totalSeconds = minutes * 60;
  intervalId = setInterval(countDown, 1000);
};

const endTimer = () => {
  clearInterval(intervalId);
  setTimeout(() => alert('Timer has ended'), 1000);
};

startButton.addEventListener('click', (e) => startContDown(tomatoMinutes));
shortBreakButton.addEventListener('click', (e) =>
  startContDown(shortBreakMinutes)
);
longBreakButton.addEventListener('click', (e) =>
  startContDown(longBreakMinutes)
);

resetButton.addEventListener('click', (e) => {
  clearInterval(intervalId);
  timer.textContent = '00:00';
});

configButton.addEventListener('click', (e) => {
  tomatoMinutesInput.value = tomatoMinutes;
  shortBreakMinutesInput.value = shortBreakMinutes;
  longBreakMinutesInput.value = longBreakMinutes;
  modalContainer.classList.add('visible');
});

modalContainer.addEventListener('click', (e) => {
  modalContainer.classList.remove('visible');
});

modal.addEventListener('click', (e) => {
  e.stopPropagation();
});

saveButton.addEventListener('click', (e) => {
  tomatoMinutes = tomatoMinutesInput.value;
  shortBreakMinutes = shortBreakMinutesInput.value;
  longBreakMinutes = longBreakMinutesInput.value;
  modalContainer.classList.remove('visible');
  setTimeout(() => alert('Changes saved correctly'), 500);
});

defaultButton.addEventListener('click', (e) => {
  tomatoMinutes = 25;
  shortBreakMinutes = 5;
  longBreakMinutes = 15;
  modalContainer.classList.remove('visible');
  setTimeout(() => alert('Changes saved correctly'), 500);
});
