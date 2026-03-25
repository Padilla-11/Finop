'use strict';

/* ──────────────────────────────────────────────
   ESTADO DE LA APLICACION
────────────────────────────────────────────── */
document.getElementById('sidebar-root').innerHTML = renderSidebar('jornada');

const MOVIMIENTOS_KEY = 'finop_movimientos_hoy';
function loadMovimientosHoy() {
  const raw = window.localStorage.getItem(MOVIMIENTOS_KEY);
  if (!raw) return MOVIMIENTOS_HOY;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    /* noop */
  }
  return MOVIMIENTOS_HOY;
}
let movimientosHoy = loadMovimientosHoy();

let pasoActual = 1;
let conteoOmitido = false;
let conteoData = {}; // { [productoId]: { unidades, precio, costo } }
let cajaFinal = null; // se asigna en paso 2
let resultados = null; // se calcula en paso 4
let cajaListenerBound = false;

/* Constantes derivadas de los datos simulados */
const CAJA_INICIAL = 150000;
function getIngresosBrutos() {
  return PRODUCTOS.reduce((acc, p) => {
    const d = conteoData[p.id] || { unidades: 0, precio: p.precio };
    return acc + (d.unidades * d.precio);
  }, 0);
}

function getCajaEsperada() {
  return CAJA_INICIAL + getIngresosBrutos() - GASTOS_JORNADA;
}
const GASTOS_JORNADA = (function () {
  return movimientosHoy
    .filter(m => m.tipo === 'gasto_operativo' || m.tipo === 'compra_mercancia')
    .reduce((acc, m) => acc + m.monto, 0);
})();
const COSTOS_FIJOS_DIA = 83000; /* no confundir con el array COSTOS_FIJOS de finop.js */

/* Fecha legible para topbar y confirmacion */
const FECHA_HOY = new Date().toLocaleDateString('es-CO', {
  weekday: 'long', day: 'numeric', month: 'long'
});

/* ──────────────────────────────────────────────
   INICIALIZACION
────────────────────────────────────────────── */
document.getElementById('topbar-meta').textContent = 'Jornada del ' + FECHA_HOY + ' · Abierta 8:00 AM';
renderConteo();
goToPaso(1);

/* ──────────────────────────────────────────────
   PASO 1 — CONTEO
────────────────────────────────────────────── */
function renderConteo() {
  /* Inicializar conteoData con 0 para todos los productos */
  PRODUCTOS.forEach(p => {
    if (!conteoData[p.id]) {
      conteoData[p.id] = { unidades: 0, precio: p.precio, costo: p.costo };
    }
  });

  const tbody = document.getElementById('conteo-tbody');
  tbody.innerHTML = PRODUCTOS.map(p => `
    <tr>
      <td style="font-weight:500;">
        ${p.nombre}
        <br><span class="fo-small" style="color:var(--fo-text-muted);">${p.categoria}</span>
      </td>
      <td class="mono">${formatCOP(p.precio)}</td>
      <td class="mono" style="color:var(--fo-text-secondary);">${formatCOP(p.costo)}</td>
      <td style="text-align:center;">
        <input
          type="number"
          class="fo-input conteo-input"
          value="${conteoData[p.id].unidades}"
          min="0"
          step="1"
          oninput="onConteoInput(this, ${p.id})"
        >
      </td>
      <td class="amount" id="sub-${p.id}" style="text-align:right;">
        ${formatCOP(conteoData[p.id].unidades * p.precio)}
      </td>
    </tr>
  `).join('');

  actualizarTotalesConteo();
}

function onConteoInput(input, pid) {
  const un = Math.max(0, parseInt(input.value) || 0);
  input.value = un; /* corregir si ingresaron negativo */
  const prod = PRODUCTOS.find(p => p.id === pid);
  if (!prod) return;

  conteoData[pid] = { unidades: un, precio: prod.precio, costo: prod.costo };
  const cell = document.getElementById('sub-' + pid);
  if (cell) cell.textContent = formatCOP(un * prod.precio);
  actualizarTotalesConteo();
  refreshAfterDataChange();
}

function actualizarTotalesConteo() {
  let totalUn = 0;
  let totalIng = 0;
  PRODUCTOS.forEach(p => {
    const d = conteoData[p.id] || { unidades: 0, precio: p.precio, costo: p.costo };
    totalUn += d.unidades;
    totalIng += d.unidades * d.precio;
  });

  document.getElementById('tfoot-uds').textContent = totalUn + ' uds';
  document.getElementById('tfoot-total').textContent = formatCOP(totalIng);
  document.getElementById('preview-ingresos').textContent = formatCOP(totalIng);

  /* Vista previa por productos con unidades > 0 */
  const vendidos = PRODUCTOS.filter(p => (conteoData[p.id]?.unidades || 0) > 0);
  if (vendidos.length === 0) {
    document.getElementById('preview-productos').textContent = 'Ingresa unidades para ver el detalle.';
  } else {
    document.getElementById('preview-productos').innerHTML = vendidos.map(p => {
      const d = conteoData[p.id];
      const mg = (d.precio - d.costo) / d.precio * 100;
      return `<div style="display:flex;justify-content:space-between;padding:.2rem 0;">
        <span>${p.nombre} <strong>×${d.unidades}</strong></span>
        <span style="color:var(--fo-accent-dark);">Mrg ${formatPct(mg)}</span>
      </div>`;
    }).join('');
  }
}

function refreshAfterDataChange() {
  if (pasoActual >= 2) {
    const hint = document.getElementById('hint-caja-esp');
    if (hint) hint.textContent = formatCOP(getCajaEsperada());
  }
  if (pasoActual >= 3) renderValidacion();
  if (pasoActual >= 4) renderResumen();
  if (pasoActual >= 5) renderConfirmacion();
}

document.getElementById('btn-omitir').addEventListener('click', () => {
  conteoOmitido = true;
  const btn = document.getElementById('btn-omitir');
  btn.innerHTML = '✓ Conteo omitido';
  btn.disabled = true;
  goToPaso(2);
});

/* ──────────────────────────────────────────────
   PASO 2 — CAJA FINAL
────────────────────────────────────────────── */
function initPaso2() {
  document.getElementById('hint-caja-ini').textContent = formatCOP(CAJA_INICIAL);
  document.getElementById('hint-caja-esp').textContent = formatCOP(getCajaEsperada());

  /* Si ya tenia un valor previo, restaurarlo */
  if (cajaFinal !== null) {
    document.getElementById('caja-final-input').value = cajaFinal;
  }
  if (!cajaListenerBound) {
    document.getElementById('caja-final-input').addEventListener('input', () => {
      const raw = document.getElementById('caja-final-input').value.trim();
      const val = parseFloat(raw);
      cajaFinal = !raw || isNaN(val) ? null : val;
      refreshAfterDataChange();
    });
    cajaListenerBound = true;
  }
  document.getElementById('caja-final-input').focus();
}

function validarCajaFinal() {
  const raw = document.getElementById('caja-final-input').value.trim();
  const wrap = document.getElementById('caja-big-wrap');
  const msg = document.getElementById('caja-error-msg');

  if (raw === '' || raw === null) {
    wrap.classList.add('error');
    msg.style.display = 'block';
    document.getElementById('caja-final-input').focus();
    return false;
  }

  const val = parseFloat(raw);
  if (isNaN(val) || val < 0) {
    wrap.classList.add('error');
    msg.style.display = 'block';
    msg.textContent = 'Ingresa un valor valido (mayor o igual a cero).';
    document.getElementById('caja-final-input').focus();
    return false;
  }

  wrap.classList.remove('error');
  msg.style.display = 'none';
  cajaFinal = val;
  return true;
}

/* ──────────────────────────────────────────────
   PASO 3 — VALIDACION
────────────────────────────────────────────── */
function renderValidacion() {
  const cajaEsperada = getCajaEsperada();
  document.getElementById('val-esperada').textContent = formatCOP(cajaEsperada);
  document.getElementById('val-registrada').textContent = formatCOP(cajaFinal || 0);

  const diff = (cajaFinal || 0) - cajaEsperada;
  const abs = Math.abs(diff);
  const diffBox = document.getElementById('diff-box');
  const diffLbl = document.getElementById('diff-lbl');
  const diffVal = document.getElementById('diff-valor');
  const diffHint = document.getElementById('diff-hint');
  const badge = document.getElementById('val-badge');
  const alert = document.getElementById('val-alert');
  const alertIcon = document.getElementById('val-icon');
  const alertMsg = document.getElementById('val-msg');

  diffVal.textContent = (diff < 0 ? '-' : '+') + formatCOP(abs);
  diffLbl.textContent = 'Diferencia';

  diffBox.classList.remove('ok', 'small', 'large');
  badge.className = 'fo-badge';

  if (abs <= 5000) {
    diffBox.classList.add('ok');
    badge.classList.add('fo-badge-success');
    badge.textContent = 'Cuadra';
    alert.className = 'fo-alert success';
    alertIcon.textContent = '✅';
    alertMsg.textContent = 'La caja registrada coincide con los movimientos del dia.';
    diffHint.textContent = 'Diferencia dentro del rango esperado.';
  } else if (abs <= 30000) {
    diffBox.classList.add('small');
    badge.classList.add('fo-badge-warning');
    badge.textContent = 'Revisar';
    alert.className = 'fo-alert warning';
    alertIcon.textContent = '⚠️';
    alertMsg.textContent = 'Hay una diferencia moderada. Revisa si falta registrar algun movimiento.';
    diffHint.textContent = 'Diferencia moderada.';
  } else {
    diffBox.classList.add('large');
    badge.classList.add('fo-badge-danger');
    badge.textContent = 'Alta diferencia';
    alert.className = 'fo-alert danger';
    alertIcon.textContent = '⚠️';
    alertMsg.textContent = 'La diferencia es alta. Revisa la caja y los movimientos registrados.';
    diffHint.textContent = 'Diferencia alta.';
  }

  /* Desglose de caja esperada */
  const desglose = document.getElementById('val-desglose');
  const movs = movimientosHoy.map(m => {
    const clase = m.signo > 0 ? 'text-pos' : 'text-neg';
    return `<div class="desglose-row">
      <span class="lbl ${clase}">${m.signo > 0 ? '+' : '−'} ${m.descripcion.slice(0, 30)}</span>
      <span class="val ${clase}">${m.signo > 0 ? '+' : '−'}${formatCOP(m.monto)}</span>
    </div>`;
  }).join('');
  desglose.innerHTML = movs || '<div class="fo-muted" style="text-align:center;padding:1rem 0;">Sin movimientos registrados.</div>';
}

/* ──────────────────────────────────────────────
   PASO 4 — RESUMEN
────────────────────────────────────────────── */
function calcularResultados() {
  let ingresos = 0;
  let costo = 0;

  if (conteoOmitido) {
    const baseCaja = cajaFinal !== null ? cajaFinal : getCajaEsperada();
    ingresos = Math.max((baseCaja - CAJA_INICIAL) + GASTOS_JORNADA, 0);
  } else {
    ingresos = getIngresosBrutos();
  }

  costo = ingresos * 0.8;
  const utilBruta = ingresos * 0.2;
  const utilNeta = utilBruta - COSTOS_FIJOS_DIA;
  const margen = ingresos > 0 ? (utilNeta / ingresos) * 100 : 0;

  resultados = {
    ingresos,
    costo,
    utilBruta,
    utilNeta,
    margen,
    equilibrio: COSTOS_FIJOS_DIA / 0.2,
    diffCaja: (cajaFinal || 0) - getCajaEsperada()
  };
}

function renderResumen() {
  calcularResultados();

  document.getElementById('r-ingresos').textContent = formatCOP(resultados.ingresos);
  document.getElementById('r-costo').textContent = formatCOP(resultados.costo);
  document.getElementById('r-util-bruta').textContent = formatCOP(resultados.utilBruta);
  document.getElementById('r-gastos').textContent = formatCOP(GASTOS_JORNADA);
  document.getElementById('r-fijos').textContent = formatCOP(COSTOS_FIJOS_DIA);
  document.getElementById('r-neta').textContent = formatCOP(resultados.utilNeta);
  document.getElementById('r-margen').textContent = formatPct(resultados.margen);
  document.getElementById('r-equilibrio').textContent = formatCOP(resultados.equilibrio);
  document.getElementById('r-diff').textContent = formatCOP(resultados.diffCaja);

  const badge = document.getElementById('r-precision-badge');
  if (conteoOmitido) {
    badge.className = 'fo-badge fo-badge-warning';
    badge.textContent = 'Estimado';
  } else {
    badge.className = 'fo-badge fo-badge-success';
    badge.textContent = 'Preciso';
  }

  /* Resultado del dia */
  const resCard = document.getElementById('result-card');
  const resIcon = document.getElementById('res-icon');
  const resTitle = document.getElementById('res-title');
  const resSub = document.getElementById('res-sub');
  resCard.classList.remove('rentable', 'perdida', 'equilibrio');

  if (resultados.utilNeta > 0) {
    resCard.classList.add('rentable');
    resIcon.textContent = '✅';
    resTitle.textContent = 'Dia rentable';
    resSub.textContent = 'Superaste los costos y generaste utilidad.';
  } else if (resultados.utilNeta < 0) {
    resCard.classList.add('perdida');
    resIcon.textContent = '⚠️';
    resTitle.textContent = 'Dia con perdida';
    resSub.textContent = 'No se cubrieron los costos del dia.';
  } else {
    resCard.classList.add('equilibrio');
    resIcon.textContent = '➖';
    resTitle.textContent = 'Punto de equilibrio';
    resSub.textContent = 'Se cubrieron los costos sin utilidad.';
  }

  /* Barra margen */
  const bar = document.getElementById('margen-bar');
  const barLbl = document.getElementById('margen-bar-lbl');
  const pct = Math.max(0, Math.min(100, resultados.margen));
  bar.style.width = pct + '%';
  barLbl.textContent = Math.round(resultados.margen) + '%';

  /* Detalle de ventas */
  const wrap = document.getElementById('r-detalle-ventas');
  if (conteoOmitido) {
    wrap.innerHTML = '<div class="fo-muted" style="text-align:center;padding:1rem 0;">Conteo omitido. No hay detalle por producto.</div>';
  } else {
    const rows = PRODUCTOS.map(p => {
      const d = conteoData[p.id] || { unidades: 0, precio: p.precio, costo: p.costo };
      if (!d.unidades) return '';
      const sub = d.unidades * d.precio;
      const mg = d.precio > 0 ? (d.precio - d.costo) / d.precio * 100 : 0;
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid var(--fo-border-light);">
          <div>
            <div style="font-size:.875rem;font-weight:500;">${p.nombre}</div>
            <div class="fo-small">${d.unidades} uds · Mrg <span style="color:var(--fo-accent-dark);">${formatPct(mg)}</span></div>
          </div>
          <div class="mono" style="font-size:.9rem;font-weight:500;">${formatCOP(sub)}</div>
        </div>`;
    }).filter(Boolean).join('');
    wrap.innerHTML = rows || '<div class="fo-muted" style="text-align:center;padding:1rem 0;">Sin ventas registradas.</div>';
  }
}

/* ──────────────────────────────────────────────
   PASO 5 — CONFIRMACION
────────────────────────────────────────────── */
function renderConfirmacion() {
  if (!resultados) calcularResultados();

  document.getElementById('cf-fecha').textContent = FECHA_HOY;
  document.getElementById('cf-ingresos').textContent = formatCOP(resultados.ingresos);
  document.getElementById('cf-neta').textContent = formatCOP(resultados.utilNeta);
  document.getElementById('cf-margen').textContent = formatPct(resultados.margen);
  document.getElementById('cf-diff').textContent = formatCOP(resultados.diffCaja);

  const estado = document.getElementById('cf-estado');
  if (resultados.utilNeta > 0) {
    estado.innerHTML = '<span class="fo-badge fo-badge-success">Rentable</span>';
  } else if (resultados.utilNeta < 0) {
    estado.innerHTML = '<span class="fo-badge fo-badge-danger">Perdida</span>';
  } else {
    estado.innerHTML = '<span class="fo-badge fo-badge-neutral">Equilibrio</span>';
  }

  const diffAlert = document.getElementById('cf-diff-alert');
  const diffText = document.getElementById('cf-diff-alert-text');
  if (Math.abs(resultados.diffCaja) > 30000) {
    diffAlert.style.display = 'block';
    diffText.textContent = 'Existe una diferencia alta de caja. Registra una justificacion si es necesario.';
  } else {
    diffAlert.style.display = 'none';
  }

  const conteoAlert = document.getElementById('cf-conteo-alert');
  conteoAlert.style.display = conteoOmitido ? 'block' : 'none';
}

/* ──────────────────────────────────────────────
   NAVEGACION
────────────────────────────────────────────── */
function goToPaso(n) {
  pasoActual = n;
  document.querySelectorAll('.paso').forEach(el => el.classList.remove('visible'));
  document.getElementById('paso-' + n).classList.add('visible');

  const steps = [1, 2, 3, 4, 5];
  steps.forEach(i => {
    const ste = document.getElementById('ste-' + i);
    if (!ste) return;
    ste.classList.remove('active', 'done');
    if (i < n) ste.classList.add('done');
    if (i === n) ste.classList.add('active');
  });

  document.getElementById('btn-anterior').style.visibility = n === 1 ? 'hidden' : 'visible';
  document.getElementById('btn-siguiente').style.display = n === 5 ? 'none' : 'inline-flex';

  if (n === 2) initPaso2();
  if (n === 3) renderValidacion();
  if (n === 4) renderResumen();
  if (n === 5) renderConfirmacion();
}

document.getElementById('btn-siguiente').addEventListener('click', () => {
  if (pasoActual === 2 && !validarCajaFinal()) return;
  goToPaso(pasoActual + 1);
});

document.getElementById('btn-anterior').addEventListener('click', () => {
  goToPaso(pasoActual - 1);
});

document.getElementById('btn-confirmar').addEventListener('click', () => {
  const btn = document.getElementById('btn-confirmar');
  btn.disabled = true;
  btn.innerHTML = '<svg class="fo-spin" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-18 0" opacity=".3"/><path d="M12 3a9 9 0 0 1 9 9"/></svg> Cerrando...';
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1200);
});
