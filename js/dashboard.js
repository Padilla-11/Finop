/* Sidebar */
document.getElementById('sidebar-root').innerHTML = renderSidebar('dashboard');

/* Fecha actual */
document.getElementById('fecha-hoy').textContent = new Date().toLocaleDateString('es-CO', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

/* Últimas jornadas */
const ul = document.getElementById('ultimas-jornadas');
ul.innerHTML = HISTORIAL.slice(1, 5)
  .map(j => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--fo-border-light);">
      <div>
        <div style="font-size:.875rem;font-weight:500;">${formatDate(j.fecha)}</div>
        <div class="fo-small">${j.ingresos ? formatCOP(j.ingresos) : 'No operó'}</div>
      </div>
      ${getEstadoBadge(j.estado, j.equilibrio_superado)}
    </div>`)
  .join('');

/* Chart: Ingresos vs Gastos */
const ctx1 = document.getElementById('chart-ingresos').getContext('2d');
new Chart(ctx1, {
  type: 'bar',
  data: {
    labels: CHART_DATA.labels,
    datasets: [
      {
        label: 'Ingresos',
        data: CHART_DATA.ingresos.map(v => v || 0),
        backgroundColor: 'rgba(58,80,104,0.75)',
        borderRadius: 4,
        borderSkipped: false
      },
      {
        label: 'Gastos',
        data: CHART_DATA.gastos.map(v => v || 0),
        backgroundColor: 'rgba(76,175,130,0.55)',
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'DM Sans', size: 11 }, boxWidth: 10 } },
      tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + formatCOP(ctx.raw) } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 10 } } },
      y: {
        grid: { color: 'rgba(0,0,0,.04)' },
        ticks: { font: { family: 'DM Mono', size: 10 }, callback: v => '$' + (v / 1000) + 'k' }
      }
    }
  }
});

/* Chart: Margen */
const ctx2 = document.getElementById('chart-margen').getContext('2d');
new Chart(ctx2, {
  type: 'line',
  data: {
    labels: CHART_DATA.labels,
    datasets: [
      {
        label: 'Margen %',
        data: CHART_DATA.margen,
        borderColor: '#3A5068',
        backgroundColor: 'rgba(58,80,104,0.07)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#3A5068',
        fill: true,
        tension: 0.3,
        spanGaps: true
      },
      {
        label: 'Umbral 0%',
        data: Array(CHART_DATA.labels.length).fill(0),
        borderColor: 'rgba(224,82,82,0.5)',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + '%' } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { family: 'DM Mono', size: 10 }, callback: v => v + '%' } }
    }
  }
});
