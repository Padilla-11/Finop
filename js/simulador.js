document.getElementById('sidebar-root').innerHTML = renderSidebar('simulador');

/* Valores base del negocio real */
const BASE = { precio: 3500, costo: 1200, volumen: 68, fijos: 1150000, dias: 6 };

function calcResultados(p) {
  const ingrDiarios = p.precio * p.volumen;
  const costoVendido = p.costo * p.volumen;
  const utilBruta = ingrDiarios - costoVendido;
  const diasMes = Math.round((p.dias / 7) * 30);
  const fijosDay = p.fijos / diasMes;
  const gastosOper = 43000;
  const utilNeta = utilBruta - gastosOper - fijosDay;
  const margen = ingrDiarios > 0 ? (utilNeta / ingrDiarios * 100) : 0;
  const margenC = p.precio > 0 ? (p.precio - p.costo) / p.precio : 0;
  const equilibrio = margenC > 0 ? (fijosDay + gastosOper) / margenC : 0;
  return { ingrDiarios, utilBruta, utilNeta, margen, equilibrio, fijosDay };
}

function varBadge(v) {
  if (Math.abs(v) < 0.1) return '<span class="fo-badge fo-badge-neutral">Sin cambio</span>';
  const pos = v > 0;
  return `<span class="fo-badge ${pos ? 'fo-badge-success' : 'fo-badge-danger'}">${pos ? '▲' : '▼'} ${Math.abs(v).toFixed(1)}%</span>`;
}

function updateSim() {
  const precio = parseInt(document.getElementById('v-precio').value);
  const costo = parseInt(document.getElementById('v-costo').value);
  const vol = parseInt(document.getElementById('v-vol').value);
  const fijos = parseInt(document.getElementById('v-fijos').value);
  const dias = parseInt(document.getElementById('v-dias').value);

  document.getElementById('v-precio-val').textContent = formatCOP(precio);
  document.getElementById('v-costo-val').textContent = formatCOP(costo);
  document.getElementById('v-vol-val').textContent = vol + ' uds/día';
  document.getElementById('v-fijos-val').textContent = formatCOP(fijos);
  document.getElementById('v-dias-val').textContent = dias + ' día' + (dias !== 1 ? 's' : '');

  const sim = calcResultados({ precio, costo, volumen: vol, fijos, dias });
  const base = calcResultados(BASE);
  const varIng = base.ingrDiarios > 0 ? ((sim.ingrDiarios - base.ingrDiarios) / base.ingrDiarios) * 100 : 0;
  const varNeta = base.utilNeta > 0 ? ((sim.utilNeta - base.utilNeta) / base.utilNeta) * 100 : 0;
  const varMargen = sim.margen - base.margen;

  document.getElementById('compare-tbody').innerHTML = [
    ['Ingresos diarios estimados', formatCOP(base.ingrDiarios), formatCOP(sim.ingrDiarios), varIng],
    ['Utilidad bruta', formatCOP(base.utilBruta), formatCOP(sim.utilBruta), (sim.utilBruta - base.utilBruta) / Math.abs(base.utilBruta) * 100],
    ['Costos fijos del día', formatCOP(base.fijosDay), formatCOP(sim.fijosDay), base.fijosDay > 0 ? (sim.fijosDay - base.fijosDay) / base.fijosDay * 100 : 0],
    ['Utilidad neta', formatCOP(base.utilNeta), formatCOP(sim.utilNeta), varNeta],
    ['Margen de ganancia', formatPct(base.margen), formatPct(sim.margen), varMargen],
    ['Punto de equilibrio', formatCOP(base.equilibrio), formatCOP(sim.equilibrio), (sim.equilibrio - base.equilibrio) / base.equilibrio * 100]
  ]
    .map(([label, bVal, sVal, v]) => `
      <tr>
        <td class="row-label">${label}</td>
        <td class="compare-cell-h mono">${bVal}</td>
        <td class="compare-cell-h mono ${sim.utilNeta >= base.utilNeta ? 'better' : 'worse'}">${sVal}</td>
        <td style="text-align:right;">${varBadge(v)}</td>
      </tr>`)
    .join('');

  /* Badge estado */
  const badge = document.getElementById('sim-badge');
  if (sim.utilNeta > base.utilNeta) {
    badge.className = 'fo-badge fo-badge-success';
    badge.textContent = 'Mejora';
  } else if (sim.utilNeta < base.utilNeta) {
    badge.className = 'fo-badge fo-badge-danger';
    badge.textContent = 'Empeora';
  } else {
    badge.className = 'fo-badge fo-badge-neutral';
    badge.textContent = 'Sin cambio';
  }

  /* Conclusión */
  const diff = sim.utilNeta - base.utilNeta;
  const pct = base.utilNeta > 0 ? Math.abs((diff / base.utilNeta) * 100).toFixed(0) : 0;
  let conclusion = '';
  if (Math.abs(diff) < 1000) {
    conclusion = 'Los cambios actuales no generan una diferencia significativa en la utilidad neta diaria.';
  } else if (diff > 0) {
    conclusion = `<strong>Con estos cambios tu utilidad neta diaria aumentaría ${formatCOP(diff)}</strong>, lo que representa una mejora del <strong>${pct}%</strong> en tu rentabilidad.
      ${sim.margen > 20 ? ' Además, tu margen superaría el umbral recomendado del 20%.' : ''}`;
  } else {
    conclusion = `Con estos cambios tu utilidad neta diaria <strong>disminuiría ${formatCOP(Math.abs(diff))}</strong> (${pct}% menos). 
      ${sim.equilibrio > base.equilibrio ? `Tu punto de equilibrio también subiría a ${formatCOP(sim.equilibrio)}, haciéndolo más difícil de alcanzar.` : ''}`;
  }
  document.getElementById('conclusion-text').innerHTML = conclusion;
  document.getElementById('conclusion-card').style.background = diff > 0 ? 'var(--fo-success-lt)' : diff < 0 ? 'var(--fo-danger-lt)' : 'var(--fo-info-lt)';
  document.getElementById('conclusion-card').style.borderColor = diff > 0 ? '#a8dfc4' : diff < 0 ? '#f5b8b8' : 'var(--fo-surface-dark)';
}

function resetVariables() {
  document.getElementById('v-precio').value = BASE.precio;
  document.getElementById('v-costo').value = BASE.costo;
  document.getElementById('v-vol').value = BASE.volumen;
  document.getElementById('v-fijos').value = BASE.fijos;
  document.getElementById('v-dias').value = BASE.dias;
  updateSim();
}

function guardarEscenario() {
  showModal('modal-guardar');
}
function confirmarGuardar() {
  const n = document.getElementById('esc-nombre').value.trim();
  if (!n) {
    document.getElementById('esc-nombre').classList.add('is-invalid');
    return;
  }
  const wrap = document.getElementById('escenarios-guardados');
  const btn = document.createElement('button');
  btn.className = 'esc-btn';
  btn.textContent = n;
  btn.onclick = function () {
    cargarEscenario('custom', this);
  };
  wrap.appendChild(btn);
  hideModal('modal-guardar');
}

const ESCENARIOS = {
  base: { precio: 3500, costo: 1200, vol: 68, fijos: 1165000, dias: 6 },
  'subir-precios': { precio: 3850, costo: 1200, vol: 68, fijos: 1165000, dias: 6 },
  'abrir-domingo': { precio: 3500, costo: 1200, vol: 75, fijos: 1165000, dias: 7 }
};
function cargarEscenario(key, btn) {
  document.querySelectorAll('.esc-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const e = ESCENARIOS[key] || ESCENARIOS.base;
  document.getElementById('v-precio').value = e.precio;
  document.getElementById('v-costo').value = e.costo;
  document.getElementById('v-vol').value = e.vol;
  document.getElementById('v-fijos').value = e.fijos;
  document.getElementById('v-dias').value = e.dias;
  updateSim();
}

updateSim();
