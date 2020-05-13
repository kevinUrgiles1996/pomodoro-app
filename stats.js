let DB;
let storedRecords;

const pomodoros = document.querySelector('.pomodoros');
const shortBreaks = document.querySelector('.shortBreaks');
const longBreaks = document.querySelector('.longBreaks');

let [totalPomodoros, totalShortBreaks, totalLongBreaks] = [0, 0, 0];

const openDB = () => {
  let createDB = window.indexedDB.open('pomodoro', 1);
  createDB.onsuccess = () => (DB = createDB.result);
  createDB.onerror = () => {
    console.error('There was an error openning the DB');
  };
};

const getRecordsFromDB = () => {
  let transaction = DB.transaction(['records'], 'readwrite');
  let objectStore = transaction.objectStore('records');
  const getRecords = objectStore.getAll();

  getRecords.onsuccess = e => {
    storedRecords = e.target.result;
    console.log(storedRecords);
  };
  getRecords.onerror = e => {
    console.log('There was an error getting the records');
  };
};

const drawChart = () => {
  const ctx = document.getElementById('myChart').getContext('2d');

  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: storedRecords.map(record => record.date),
      datasets: [
        {
          label: 'Pomodoros per day',
          data: storedRecords.map(record => parseInt(record.pomodoros)),
          borderWidth: 1,
          borderColor: 'red',
          backgroundColor: '#fff',
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              stepSize: 1,
            },
          },
        ],
      },
    },
  });
  storedRecords.map(record => {
    totalPomodoros += record.pomodoros;
    totalShortBreaks += record.shortBreaks;
    totalLongBreaks += record.longBreaks;
  });
  pomodoros.textContent = totalPomodoros;
  shortBreaks.textContent = totalShortBreaks;
  longBreaks.textContent = totalLongBreaks;
};

const main = () => {
  openDB();
  setTimeout(getRecordsFromDB, 500);
  setTimeout(() => {
    document.querySelector('.loading').style.display = 'none';
    document.querySelector('#myChart').style.display = 'block';
    drawChart();
  }, 1000);
};

main();
