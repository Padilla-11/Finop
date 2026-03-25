let step = 1;
let prods = [];
let costos = [];

function goStep(s) {
  document.querySelectorAll('.fo-step-content').forEach(el => el.classList.add('hidden'));
  document.getElementById('step-' + s).classList.remove('hidden');
  document.getElementById('step-num').textContent = s;

  const pills = document.querySelectorAll('.fo-step-pill');
  pills.forEach((p, i) => {
    p.classList.remove('active', 'done');
    if (i + 1 < s) p.classList.add('done');
    if (i + 1 === s) p.classList.add('active');
  });

  document.getElementById('btn-back').style.visibility = s > 1 ? 'visible' : 'hidden';
  const btn = document.getElementById('btn-next');
  if (s === 3) {
    btn.innerHTML = 'Ir al Dashboard →';
    btn.className = 'fo-btn fo-btn-accent';
  } else {
    btn.innerHTML = 'Continuar →';
    btn.className = 'fo-btn fo-btn-primary';
  }
  step = s;
}

document.getElementById('btn-next').addEventListener('click', () => {
  if (step === 1) {
    let ok = true;
    if (!document.getElementById('neg-nombre').value.trim()) {
      document.getElementById('neg-nombre').classList.add('is-invalid');
      ok = false;
    } else {
      document.getElementById('neg-nombre').classList.remove('is-invalid');
    }
    if (!document.getElementById('neg-fecha').value) {
      document.getElementById('neg-fecha').classList.add('is-invalid');
      ok = false;
    } else {
      document.getElementById('neg-fecha').classList.remove('is-invalid');
    }
    if (!document.querySelectorAll('.fo-day-btn.selected').length) {
      document.getElementById('dias-error').style.display = 'block';
      ok = false;
    } else {
      document.getElementById('dias-error').style.display = 'none';
    }
    if (!ok) return;
  }

  if (step === 2 && !prods.length) {
    alert('Agrega al menos un producto para continuar.');
    return;
  }
  if (step === 3) {
    window.location.href = 'dashboard.html';
    return;
  }
  goStep(step + 1);
});

document.getElementById('btn-back').addEventListener('click', () => goStep(step - 1));
document.querySelectorAll('.fo-day-btn').forEach(b => b.addEventListener('click', () => b.classList.toggle('selected')));

function renderProds() {
  const el = document.getElementById('productos-list');
  el.innerHTML = prods.map((p, i) => `
      <div class="fo-card" style="margin-bottom:.5rem;padding:.75rem 1rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;">
          <div><div style="font-size:.875rem;font-weight:500;">${p.nombre}</div>
          <div class="fo-small">${p.cat || 'Sin categoría'} · ${formatCOP(p.precio)} · Margen: <strong style="color:var(--fo-accent-dark)">${formatPct((p.precio - p.costo) / p.precio * 100)}</strong></div></div>
          <div style="display:flex;gap:.375rem;flex-shrink:0;">
            <button class="fo-btn fo-btn-ghost fo-btn-sm" onclick="editProd(${i})">Editar</button>
            <button class="fo-btn fo-btn-danger fo-btn-sm" onclick="delProd(${i})">✕</button>
          </div>
        </div>
      </div>`).join('');
}

function renderCostos() {
  const el = document.getElementById('costos-list');
  el.innerHTML = costos.map((c, i) => `
      <div class="fo-card" style="margin-bottom:.5rem;padding:.75rem 1rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;">
          <div><div style="font-size:.875rem;font-weight:500;">${c.nombre}</div>
          <div class="fo-small">${c.freq.charAt(0).toUpperCase() + c.freq.slice(1)}: ${formatCOP(c.valor)} · Diario: <strong>${formatCOP(c.eq)}</strong></div></div>
          <button class="fo-btn fo-btn-danger fo-btn-sm" onclick="delCosto(${i})">✕</button>
        </div>
      </div>`).join('');
}

document.getElementById('btn-add-prod').addEventListener('click', () => {
  document.getElementById('prod-idx').value = -1;
  document.getElementById('modal-prod-title').textContent = 'Agregar producto';
  ['p-nombre', 'p-precio', 'p-costo', 'p-cat'].forEach(id => (document.getElementById(id).value = ''));
  document.getElementById('margen-prev').textContent = '—';
  showModal('modal-prod');
});

function editProd(i) {
  const p = prods[i];
  document.getElementById('prod-idx').value = i;
  document.getElementById('modal-prod-title').textContent = 'Editar producto';
  document.getElementById('p-nombre').value = p.nombre;
  document.getElementById('p-precio').value = p.precio;
  document.getElementById('p-costo').value = p.costo;
  document.getElementById('p-cat').value = p.cat;
  calcM();
  showModal('modal-prod');
}

function delProd(i) {
  if (confirm('¿Eliminar?')) {
    prods.splice(i, 1);
    renderProds();
  }
}

function calcM() {
  const pr = parseFloat(document.getElementById('p-precio').value) || 0;
  const co = parseFloat(document.getElementById('p-costo').value) || 0;
  document.getElementById('margen-prev').innerHTML = pr > 0
    ? `<span style="color:${(pr - co) / pr >= 0 ? 'var(--fo-accent-dark)' : 'var(--fo-danger)'}">${formatPct((pr - co) / pr * 100)}</span>`
    : '—';
}

document.getElementById('p-precio').addEventListener('input', calcM);
document.getElementById('p-costo').addEventListener('input', calcM);

document.getElementById('btn-save-prod').addEventListener('click', () => {
  const n = document.getElementById('p-nombre').value.trim();
  const pr = parseFloat(document.getElementById('p-precio').value);
  const co = parseFloat(document.getElementById('p-costo').value);
  let ok = true;

  if (!n) {
    document.getElementById('p-nombre').classList.add('is-invalid');
    ok = false;
  } else {
    document.getElementById('p-nombre').classList.remove('is-invalid');
  }
  if (!pr || pr <= 0) {
    document.getElementById('p-precio').classList.add('is-invalid');
    document.getElementById('p-precio-err').style.display = 'block';
    ok = false;
  } else {
    document.getElementById('p-precio').classList.remove('is-invalid');
    document.getElementById('p-precio-err').style.display = 'none';
  }
  if (isNaN(co) || co < 0) {
    document.getElementById('p-costo').classList.add('is-invalid');
    document.getElementById('p-costo-err').style.display = 'block';
    ok = false;
  } else {
    document.getElementById('p-costo').classList.remove('is-invalid');
    document.getElementById('p-costo-err').style.display = 'none';
  }
  if (!ok) return;

  const idx = parseInt(document.getElementById('prod-idx').value);
  const obj = {
    nombre: n,
    precio: pr,
    costo: co,
    cat: document.getElementById('p-cat').value.trim()
  };

  if (idx >= 0) {
    prods[idx] = obj;
  } else {
    prods.push(obj);
  }
  renderProds();
  hideModal('modal-prod');
});

document.getElementById('btn-add-costo').addEventListener('click', () => {
  ['c-nombre', 'c-valor'].forEach(id => (document.getElementById(id).value = ''));
  document.getElementById('c-freq').value = 'mensual';
  document.getElementById('eq-prev').textContent = '—';
  showModal('modal-costo');
});

function delCosto(i) {
  if (confirm('¿Eliminar?')) {
    costos.splice(i, 1);
    renderCostos();
  }
}

function calcEq() {
  const v = parseFloat(document.getElementById('c-valor').value) || 0;
  const f = document.getElementById('c-freq').value;
  const d = { diaria: 1, semanal: 7, mensual: 30 };
  document.getElementById('eq-prev').textContent = v > 0 ? formatCOP(v / d[f]) + ' / día' : '—';
}

document.getElementById('c-valor').addEventListener('input', calcEq);
document.getElementById('c-freq').addEventListener('change', calcEq);

document.getElementById('btn-save-costo').addEventListener('click', () => {
  const n = document.getElementById('c-nombre').value.trim();
  const v = parseFloat(document.getElementById('c-valor').value);
  const f = document.getElementById('c-freq').value;
  let ok = true;

  if (!n) {
    document.getElementById('c-nombre').classList.add('is-invalid');
    ok = false;
  } else {
    document.getElementById('c-nombre').classList.remove('is-invalid');
  }
  if (!v || v <= 0) {
    document.getElementById('c-valor').classList.add('is-invalid');
    document.getElementById('c-valor-err').style.display = 'block';
    ok = false;
  } else {
    document.getElementById('c-valor').classList.remove('is-invalid');
    document.getElementById('c-valor-err').style.display = 'none';
  }
  if (!ok) return;

  const d = { diaria: 1, semanal: 7, mensual: 30 };
  costos.push({ nombre: n, valor: v, freq: f, eq: v / d[f] });
  renderCostos();
  hideModal('modal-costo');
});

goStep(1);
