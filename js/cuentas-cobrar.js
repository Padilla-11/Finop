document.getElementById('sidebar-root').innerHTML = renderSidebar('cuentas');
let cuentas = [...CUENTAS_COBRAR];
let cobroIdx = -1;

function estadoBadge(estado, dias) {
  if (estado === 'cobrado') return '<span class="fo-badge fo-badge-success">✓ Cobrada</span>';
  if (estado === 'cobrado_parcial') return '<span class="fo-badge fo-badge-warning">Parcial</span>';
  if (dias > 7) return '<span class="fo-badge fo-badge-danger">Vencida</span>';
  return '<span class="fo-badge fo-badge-neutral">Pendiente</span>';
}

function renderCuentas() {
  const filtro = document.getElementById('filtro-cc').value;
  const tbody = document.getElementById('cc-tbody');
  const lista = cuentas.filter(c => !filtro || c.estado === filtro);
  tbody.innerHTML =
    lista
      .map((c, i) => {
        const pend = c.total - c.cobrado;
        return `<tr>
        <td style="font-weight:500;">${c.cliente}</td>
        <td class="fo-small">${c.descripcion}</td>
        <td class="amount">${formatCOP(c.total)}</td>
        <td class="amount pos">${formatCOP(c.cobrado)}</td>
        <td class="amount ${pend > 0 ? 'neg' : ''}">${formatCOP(pend)}</td>
        <td>
          <span style="color:${c.dias > 7 ? 'var(--fo-danger)' : 'var(--fo-text-muted)'};font-weight:${c.dias > 7 ? '600' : '400'};" class="fo-small">
            ${c.dias} días
          </span>
        </td>
        <td>${estadoBadge(c.estado, c.dias)}</td>
        <td>
          ${c.estado !== 'cobrado' ? `<button class="fo-btn fo-btn-accent fo-btn-sm" onclick="abrirCobro(${cuentas.indexOf(c)})">Cobrar</button>` : ''}
        </td>
      </tr>`;
      })
      .join('') ||
    '<tr><td colspan="8" style="text-align:center;color:var(--fo-text-muted);padding:2rem;">Sin resultados</td></tr>';
}

function abrirCobro(idx) {
  const c = cuentas[idx];
  cobroIdx = idx;
  document.getElementById('cobro-title').textContent = 'Cobro — ' + c.cliente;
  document.getElementById('cobro-total').textContent = formatCOP(c.total);
  document.getElementById('cobro-ya').textContent = formatCOP(c.cobrado);
  document.getElementById('cobro-monto').value = c.total - c.cobrado;
  showModal('modal-cobro');
}

document.getElementById('btn-confirmar-cobro').addEventListener('click', () => {
  const monto = parseFloat(document.getElementById('cobro-monto').value);
  if (!monto || monto <= 0) {
    document.getElementById('cobro-monto').classList.add('is-invalid');
    document.getElementById('cobro-err').style.display = 'block';
    return;
  }
  const c = cuentas[cobroIdx];
  c.cobrado = Math.min(c.cobrado + monto, c.total);
  c.estado = c.cobrado >= c.total ? 'cobrado' : 'cobrado_parcial';
  renderCuentas();
  /* Actualizar KPI */
  const pendTotal = cuentas
    .filter(cc => cc.estado !== 'cobrado')
    .reduce((a, cc) => a + (cc.total - cc.cobrado), 0);
  document.getElementById('kpi-total').textContent = formatCOP(pendTotal);
  hideModal('modal-cobro');
});

function guardarCuenta() {
  const cliente = document.getElementById('n-cliente').value.trim();
  const monto = parseFloat(document.getElementById('n-monto').value);
  let ok = true;
  if (!cliente) {
    document.getElementById('n-cliente').classList.add('is-invalid');
    ok = false;
  } else {
    document.getElementById('n-cliente').classList.remove('is-invalid');
  }
  if (!monto || monto <= 0) {
    document.getElementById('n-monto').classList.add('is-invalid');
    document.getElementById('n-monto-err').style.display = 'block';
    ok = false;
  } else {
    document.getElementById('n-monto').classList.remove('is-invalid');
    document.getElementById('n-monto-err').style.display = 'none';
  }
  if (!ok) return;
  cuentas.unshift({
    id: cuentas.length + 1,
    cliente,
    descripcion: document.getElementById('n-desc').value.trim(),
    total: monto,
    cobrado: 0,
    estado: 'pendiente',
    fecha: new Date().toISOString().split('T')[0],
    dias: 0
  });
  renderCuentas();
  hideModal('modal-nueva');
}

renderCuentas();
