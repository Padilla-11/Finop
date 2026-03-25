document.getElementById('sidebar-root').innerHTML = renderSidebar('configuracion');
let prods = [...PRODUCTOS];
let costos = [...COSTOS_FIJOS].map(c => {
  const freq = c.frecuencia || 'mensual';
  const d = { diaria: 1, semanal: 7, mensual: 30 };
  const valor = Number(c.valor) || 0;
  const equivalente = Number(c.equivalente_diario);
  const eq = Number.isFinite(equivalente)
    ? equivalente
    : (Number.isFinite(c.eq_diario) ? c.eq_diario : (d[freq] ? valor / d[freq] : 0));
  return { ...c, valor, frecuencia: freq, equivalente_diario: eq };
});
let emps = [...EMPLEADOS].map(e => {
  const valor = Number(e.valor_pago);
  const base = Number.isFinite(valor) ? valor : (Number(e.valor) || 0);
  const costo = Number(e.costo_diario);
  const tipo = e.tipo_pago || 'mensual';
  const d = { diaria: 1, semanal: 7, mensual: 30 };
  const costoDiario = Number.isFinite(costo) ? costo : (d[tipo] ? base / d[tipo] : 0);
  return { ...e, valor_pago: base, costo_diario: costoDiario, tipo_pago: tipo };
});
let cats = [
  'Insumos y materias primas',
  'Empaques y envases',
  'Transporte y domicilios',
  'Servicios públicos',
  'Mantenimiento',
  'Otros gastos'
];

document.querySelectorAll('.fo-day-btn').forEach(b => b.addEventListener('click', () => b.classList.toggle('selected')));

/* Productos */
function renderProds() {
  document.getElementById('prod-tbody').innerHTML = prods
    .map((p, i) => `
      <tr>
        <td style="font-weight:500;">${p.nombre}</td>
        <td><span class="fo-badge fo-badge-neutral">${p.categoria}</span></td>
        <td class="mono">${formatCOP(p.precio)}</td>
        <td class="mono">${formatCOP(p.costo)}</td>
        <td><span class="fo-badge fo-badge-success">${formatPct((p.precio - p.costo) / p.precio * 100)}</span></td>
        <td>${p.activo ? '<span class="fo-badge fo-badge-success">Activo</span>' : '<span class="fo-badge fo-badge-neutral">Inactivo</span>'}</td>
        <td><button class="fo-btn fo-btn-danger fo-btn-sm" onclick="delProd(${i})">Eliminar</button></td>
      </tr>`)
    .join('');
}
function delProd(i) {
  if (confirm('¿Eliminar?')) {
    prods.splice(i, 1);
    renderProds();
  }
}
function addProducto() {
  const n = document.getElementById('pc-nombre').value.trim();
  const pr = parseFloat(document.getElementById('pc-precio').value);
  const co = parseFloat(document.getElementById('pc-costo').value);
  const ca = document.getElementById('pc-cat').value.trim();
  if (!n) {
    document.getElementById('pc-nombre').classList.add('is-invalid');
    return;
  }
  prods.push({
    id: prods.length + 1,
    nombre: n,
    precio: pr || 0,
    costo: co || 0,
    categoria: ca || 'Sin categoría',
    activo: true
  });
  renderProds();
  hideModal('modal-prod-conf');
}

/* Costos */
function renderCostos() {
  const total = costos.reduce((a, c) => a + c.valor, 0);
  const dia = costos.reduce((a, c) => a + c.equivalente_diario, 0);
  document.getElementById('total-fijos').textContent = formatCOP(total);
  document.getElementById('total-fijos-dia').textContent = formatCOP(dia);
  document.getElementById('costos-tbody').innerHTML = costos
    .map((c, i) => `
      <tr>
        <td style="font-weight:500;">${c.nombre}</td>
        <td class="mono">${formatCOP(c.valor)}</td>
        <td style="text-transform:capitalize;">${c.frecuencia}</td>
        <td class="mono">${formatCOP(c.equivalente_diario)}</td>
        <td><button class="fo-btn fo-btn-danger fo-btn-sm" onclick="delCosto(${i})">Eliminar</button></td>
      </tr>`)
    .join('');
}
function delCosto(i) {
  if (confirm('¿Eliminar?')) {
    costos.splice(i, 1);
    renderCostos();
  }
}
document.getElementById('cf-valor').addEventListener('input', function () {
  const v = parseFloat(this.value) || 0;
  const f = document.getElementById('cf-freq').value;
  const d = { diaria: 1, semanal: 7, mensual: 30 };
  document.getElementById('cf-eq-prev').textContent = v > 0 ? formatCOP(v / d[f]) + '/día' : '—';
});
document.getElementById('cf-freq').addEventListener('change', function () {
  const v = parseFloat(document.getElementById('cf-valor').value) || 0;
  const d = { diaria: 1, semanal: 7, mensual: 30 };
  document.getElementById('cf-eq-prev').textContent = v > 0 ? formatCOP(v / d[this.value]) + '/día' : '—';
});
function addCosto() {
  const n = document.getElementById('cf-nombre').value.trim();
  const v = parseFloat(document.getElementById('cf-valor').value);
  const f = document.getElementById('cf-freq').value;
  if (!n) {
    document.getElementById('cf-nombre').classList.add('is-invalid');
    return;
  }
  if (!v || v <= 0) {
    document.getElementById('cf-valor').classList.add('is-invalid');
    document.getElementById('cf-err').style.display = 'block';
    return;
  }
  const d = { diaria: 1, semanal: 7, mensual: 30 };
  costos.push({
    id: costos.length + 1,
    nombre: n,
    valor: v,
    frecuencia: f,
    equivalente_diario: v / d[f]
  });
  renderCostos();
  hideModal('modal-costo-conf');
}

/* Empleados */
function renderEmps() {
  const totalDia = emps.reduce((a, e) => a + (Number(e.costo_diario) || 0), 0);
  const totalNode = document.getElementById('total-nomina-dia');
  if (totalNode) totalNode.textContent = formatCOP(totalDia);
  document.getElementById('emp-tbody').innerHTML = emps
    .map((e, i) => `
      <tr>
        <td style="font-weight:500;">${e.nombre}</td>
        <td class="fo-small">${e.cargo || '—'}</td>
        <td style="text-transform:capitalize;">${e.tipo_pago}</td>
        <td class="mono">${formatCOP(e.valor_pago)}</td>
        <td class="mono">${formatCOP(e.costo_diario)}</td>
        <td><button class="fo-btn fo-btn-danger fo-btn-sm" onclick="delEmp(${i})">Eliminar</button></td>
      </tr>`)
    .join('');
}
function delEmp(i) {
  if (confirm('¿Eliminar?')) {
    emps.splice(i, 1);
    renderEmps();
  }
}

document.getElementById('emp-valor').addEventListener('input', function () {
  const v = parseFloat(this.value) || 0;
  const t = document.getElementById('emp-tipo').value;
  const d = { diaria: 1, semanal: 7, mensual: 30 };
  document.getElementById('emp-eq-prev').textContent = v > 0 ? formatCOP(v / d[t]) + '/día' : '—';
});
document.getElementById('emp-tipo').addEventListener('change', function () {
  const v = parseFloat(document.getElementById('emp-valor').value) || 0;
  const d = { diaria: 1, semanal: 7, mensual: 30 };
  document.getElementById('emp-eq-prev').textContent = v > 0 ? formatCOP(v / d[this.value]) + '/día' : '—';
});
function addEmp() {
  const n = document.getElementById('emp-nombre').value.trim();
  const c = document.getElementById('emp-cargo').value.trim();
  const v = parseFloat(document.getElementById('emp-valor').value);
  const t = document.getElementById('emp-tipo').value;
  if (!n) {
    document.getElementById('emp-nombre').classList.add('is-invalid');
    return;
  }
  if (!v || v <= 0) {
    document.getElementById('emp-valor').classList.add('is-invalid');
    document.getElementById('emp-err').style.display = 'block';
    return;
  }
  const d = { diaria: 1, semanal: 7, mensual: 30 };
  emps.push({
    id: emps.length + 1,
    nombre: n,
    cargo: c,
    tipo_pago: t,
    valor_pago: v,
    costo_diario: v / d[t]
  });
  renderEmps();
  hideModal('modal-emp-conf');
}

/* Categorías */
function renderCats() {
  document.getElementById('cats-list').innerHTML = cats
    .map((c, i) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:.625rem 0;border-bottom:1px solid var(--fo-border-light);">
        <div style="display:flex;align-items:center;gap:.625rem;">
          <span class="fo-badge fo-badge-neutral">⊞</span>
          <span style="font-size:.875rem;">${c}</span>
        </div>
        <button class="fo-btn fo-btn-danger fo-btn-sm" onclick="delCat(${i})" style="${i < 6 ? 'opacity:.4;pointer-events:none;' : ''}">Eliminar</button>
      </div>`)
    .join('');
}
function delCat(i) {
  if (i < 6) {
    alert('Las categorías predefinidas no se pueden eliminar.');
    return;
  }
  if (confirm('¿Eliminar?')) {
    cats.splice(i, 1);
    renderCats();
  }
}
function addCategoria() {
  const n = document.getElementById('cat-nombre').value.trim();
  if (!n) {
    document.getElementById('cat-nombre').classList.add('is-invalid');
    return;
  }
  cats.push(n);
  renderCats();
  hideModal('modal-cat-conf');
}

/* Invitar usuario */
document.getElementById('u-rol').addEventListener('change', function () {
  const hints = {
    operador:
      'El operador puede abrir, registrar movimientos y cerrar jornadas, pero no ve los indicadores financieros.',
    propietario:
      'El propietario tiene acceso completo al negocio incluyendo historial, análisis y configuración.'
  };
  document.getElementById('rol-hint').textContent = hints[this.value];
});
function invitarUsuario() {
  const correo = document.getElementById('u-correo').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    document.getElementById('u-correo').classList.add('is-invalid');
    return;
  }
  alert('Invitación enviada a ' + correo);
  hideModal('modal-usuario-conf');
}

function guardarConfig() {
  const btn = document.getElementById('btn-guardar-config');
  btn.innerHTML = '✓ Guardado';
  btn.className = 'fo-btn fo-btn-accent fo-btn-sm';
  setTimeout(() => {
    btn.innerHTML = 'Guardar cambios';
    btn.className = 'fo-btn fo-btn-accent fo-btn-sm';
  }, 2000);
}

/* Init */
renderProds();
renderCostos();
renderEmps();
renderCats();
