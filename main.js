const timer = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const shortBreakButton = document.getElementById('shortBreakButton');
const longBreakButton = document.getElementById('longBreakButton');

let totalSeconds;
let intervalId;

const endTimer = () => {
  clearInterval(intervalId);
  setTimeout(() => {
    alert('Timer has ended');
  }, 1000);
};

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

startButton.addEventListener('click', (e) => startContDown(25));
shortBreakButton.addEventListener('click', (e) => startContDown(5));
longBreakButton.addEventListener('click', (e) => startContDown(15));

resetButton.addEventListener('click', (e) => {
  clearInterval(intervalId);
  timer.textContent = '00:00';
});
