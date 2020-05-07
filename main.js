const timer = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

let totalSeconds;
let intervalId;

const countDown = () => {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  timer.textContent = `${minutes}:${seconds}`;
  totalSeconds--;
};

function startContDown() {
  totalSeconds = 25 * 60;
  intervalId = setInterval(countDown, 1000);
}

startButton.addEventListener('click', (e) => {
  clearInterval(intervalId);
  startContDown();
});

resetButton.addEventListener('click', (e) => {
  clearInterval(intervalId);
  timer.textContent = '00:00';
});
