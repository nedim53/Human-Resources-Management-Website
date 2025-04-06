document.addEventListener('DOMContentLoaded', function () {
  // Funkcija za kreiranje gradienta
  function createGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  }

  // 1. Grafikon za broj kandidata po gradu (Pie chart)
  const gradDataJSON = JSON.parse(document.getElementById('gradChart').getAttribute('data-grad'));
  const gradLabels = gradDataJSON.map(stat => stat.grad);
  const gradValues = gradDataJSON.map(stat => stat.broj);

  const gradChartCtx = document.getElementById('gradChart').getContext('2d');
  new Chart(gradChartCtx, {
    type: 'pie',
    data: {
      labels: gradLabels,
      datasets: [{
        label: 'Broj prijava po gradovima',
        data: gradValues,
        backgroundColor: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'],
        borderColor: '#fff',
        borderWidth: 2,
      }]
    },
    options: {
      plugins: {
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#ccc',
          padding: 10,
          cornerRadius: 5,
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#fff',
            font: {
              size: 14,
            }
          }
        }
      },
      layout: {
        padding: 20,
      },
    }
  });

  // 2. Grafikon za statistiku obrazovanja (Bar Chart)
  const obrazovanjeData = JSON.parse(document.getElementById('obrazovanjeChart').getAttribute('data-obrazovanje'));
  const obrazovanjeLabels = obrazovanjeData.map(stat => stat.nivo_obrazovanja);
  const obrazovanjeValues = obrazovanjeData.map(stat => stat.broj);

  const obrazovanjeChartCtx = document.getElementById('obrazovanjeChart').getContext('2d');
  new Chart(obrazovanjeChartCtx, {
    type: 'bar',
    data: {
      labels: obrazovanjeLabels,
      datasets: [{
        label: 'Broj kandidata po nivou obrazovanja',
        data: obrazovanjeValues,
        backgroundColor: createGradient(obrazovanjeChartCtx, '#36a2eb', '#007bff'),
        borderColor: '#007bff',
        borderWidth: 1,
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ccc',
            font: {
              size: 12,
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          }
        },
        x: {
          ticks: {
            color: '#ccc',
            font: {
              size: 12,
            }
          }
        }
      },
      plugins: {
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#ccc',
          padding: 10,
          cornerRadius: 5,
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#fff',
            font: {
              size: 14,
            }
          }
        }
      }
    }
  });

  // 3. Grafikon za uspješnost kandidata (Bar Chart)
  const uspjehData = JSON.parse(document.getElementById('uspjehChart').getAttribute('data-uspjeh'));
  const uspjehLabels = uspjehData.map(stat => `Konkurs ID ${stat.konkurs_id}`);
  const uspjehPozvani = uspjehData.map(stat => stat.pozvani);
  const uspjehUkupno = uspjehData.map(stat => stat.ukupno);

  const uspjehChartCtx = document.getElementById('uspjehChart').getContext('2d');
  new Chart(uspjehChartCtx, {
    type: 'bar',
    data: {
      labels: uspjehLabels,
      datasets: [
        {
          label: 'Pozvani na intervju',
          data: uspjehPozvani,
          backgroundColor: createGradient(uspjehChartCtx, '#ff6f61', '#c3423f'),
          borderColor: '#c3423f',
          borderWidth: 1,
        },
        {
          label: 'Ukupno prijavljeni',
          data: uspjehUkupno,
          backgroundColor: createGradient(uspjehChartCtx, '#ffc107', '#ff9800'),
          borderColor: '#ff9800',
          borderWidth: 1,
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ccc',
            font: {
              size: 12,
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          }
        },
        x: {
          ticks: {
            color: '#ccc',
            font: {
              size: 12,
            }
          }
        }
      },
      plugins: {
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#ccc',
          padding: 10,
          cornerRadius: 5,
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#fff',
            font: {
              size: 14,
            }
          }
        }
      }
    }
  });
});
