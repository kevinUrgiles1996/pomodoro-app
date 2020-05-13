let DB;
let storedRecords;

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
          label: '# of pomodoros per day',
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
              fixedStepSize: 1,
            },
          },
        ],
      },
    },
  });
};

const main = () => {
  openDB();
  setTimeout(getRecordsFromDB, 500);
  setTimeout(drawChart, 1000);
  // drawChart();
};

main();
