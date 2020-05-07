const timer = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const shortBreakButton = document.getElementById('shortBreakButton');
const longBreakButton = document.getElementById('longBreakButton');

let totalSeconds;
let intervalId;

const countDown = () => {
  if (totalSeconds === 0) {
    clearInterval(intervalId);
    setTimeout(() => {
      alert('Timer has ended');
    }, 1000);
  }

  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  timer.textContent = `${minutes}:${seconds}`;
  totalSeconds--;
};

const startContDown = () => {
  clearInterval(intervalId);
  intervalId = setInterval(countDown, 1000);
};

startButton.addEventListener('click', (e) => {
  totalSeconds = 25 * 60;
  startContDown();
});

shortBreakButton.addEventListener('click', (e) => {
  totalSeconds = 0.5 * 60;
  startContDown();
});

longBreakButton.addEventListener('click', (e) => {
  totalSeconds = 15 * 60;
  startContDown();
});

resetButton.addEventListener('click', (e) => {
  clearInterval(intervalId);
  timer.textContent = '00:00';
});
