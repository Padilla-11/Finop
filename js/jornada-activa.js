document.getElementById('sidebar-root').innerHTML = renderSidebar('jornada');

const MOVIMIENTOS_KEY = 'finop_movimientos_hoy';

function loadMovimientosHoy() {
  const raw = window.localStorage.getItem(MOVIMIENTOS_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    MOVIMIENTOS_HOY.length = 0;
    parsed.forEach(m => MOVIMIENTOS_HOY.push(m));
  } catch (err) {
    /* noop */
  }
}

function saveMovimientosHoy() {
  window.localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(MOVIMIENTOS_HOY));
}

loadMovimientosHoy();

/* Feed de movimientos */
function renderFeed() {
  const feed = document.getElementById('movimientos-feed');
  feed.innerHTML = MOVIMIENTOS_HOY
    .map(m => `
      <div class="fo-movement">
        ${getMovIcon(m.tipo)}
        <div class="fo-movement-info">
          <div class="fo-movement-desc">${m.descripcion}</div>
          <div class="fo-movement-meta">${m.categoria} · ${m.hora} · ${m.usuario}</div>
        </div>
        <div class="fo-movement-amount ${m.signo < 0 ? 'neg' : 'pos'}">${m.signo < 0 ? '-' : '+'}${formatCOP(m.monto)}</div>
      </div>`)
    .join('');
  document.getElementById('mov-count').textContent = MOVIMIENTOS_HOY.length + ' registros';

  const cajaActualEl = document.getElementById('caja-actual');
  const gastosHoyEl = document.getElementById('gastos-hoy');
  if (cajaActualEl) {
    const cajaEst = 150000 + MOVIMIENTOS_HOY.reduce((acc, m) => acc + m.monto * m.signo, 0);
    cajaActualEl.textContent = formatCOP(cajaEst);
  }
  if (gastosHoyEl) {
    const gastos = MOVIMIENTOS_HOY
      .filter(m => m.tipo === 'gasto_operativo' || m.tipo === 'compra_mercancia')
      .reduce((acc, m) => acc + m.monto, 0);
    gastosHoyEl.textContent = '-' + formatCOP(gastos);
  }
}
renderFeed();

/* Abrir modal según tipo */
const MODAL_TITLES = {
  gasto_operativo: 'Registrar gasto operativo',
  compra_mercancia: 'Registrar compra de mercancía',
  ingreso_no_operativo: 'Registrar ingreso no operativo',
  retiro_dueno: 'Registrar retiro del dueño',
  credito: 'Nueva venta a crédito'
};
function openModal(tipo) {
  document.getElementById('mov-tipo').value = tipo;
  document.getElementById('modal-mov-title').textContent = MODAL_TITLES[tipo] || 'Registrar movimiento';
  document.getElementById('mov-desc').value = '';
  document.getElementById('mov-monto').value = '';
  document.getElementById('mov-nota').value = '';
  document.getElementById('cat-wrap').style.display = tipo === 'gasto_operativo' ? 'block' : 'none';
  ['mov-desc', 'mov-monto'].forEach(id => document.getElementById(id).classList.remove('is-invalid'));
  showModal('modal-mov');
}

document.getElementById('btn-save-mov').addEventListener('click', () => {
  const desc = document.getElementById('mov-desc').value.trim();
  const monto = parseFloat(document.getElementById('mov-monto').value);
  const tipo = document.getElementById('mov-tipo').value;
  let ok = true;
  if (!desc) {
    document.getElementById('mov-desc').classList.add('is-invalid');
    ok = false;
  } else {
    document.getElementById('mov-desc').classList.remove('is-invalid');
  }
  if (!monto || monto <= 0) {
    document.getElementById('mov-monto').classList.add('is-invalid');
    document.getElementById('monto-err').style.display = 'block';
    ok = false;
  } else {
    document.getElementById('mov-monto').classList.remove('is-invalid');
    document.getElementById('monto-err').style.display = 'none';
  }
  if (!ok) return;

  const signo = ['ingreso_no_operativo', 'cobro_cuenta_cobrar'].includes(tipo) ? 1 : -1;
  const nuevoMov = {
    id: MOVIMIENTOS_HOY.length + 1,
    tipo,
    descripcion: desc,
    categoria: document.getElementById('mov-cat').value || '—',
    monto,
    signo,
    hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    usuario: 'Juan P.'
  };
  MOVIMIENTOS_HOY.unshift(nuevoMov);
  renderFeed();
  saveMovimientosHoy();
  hideModal('modal-mov');
});

document.getElementById('btn-abrir-jornada').addEventListener('click', () => {
  hideModal('modal-apertura');
});
