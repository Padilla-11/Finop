document.getElementById('sidebar-root').innerHTML = renderSidebar('historial');

const feed = document.getElementById('feed-detalle');
feed.innerHTML = MOVIMIENTOS_HOY.map(m => `
    <div class="fo-movement">
      ${getMovIcon(m.tipo)}
      <div class="fo-movement-info">
        <div class="fo-movement-desc">${m.descripcion}</div>
        <div class="fo-movement-meta">${getTipoBadge(m.tipo)} · ${m.hora} · ${m.usuario}</div>
      </div>
      <div class="fo-movement-amount ${m.signo < 0 ? 'neg' : 'pos'}">${m.signo < 0 ? '-' : '+'}${formatCOP(m.monto)}</div>
    </div>`).join('');

function solicitarCorreccion() {
  const j = document.getElementById('just-text').value.trim();
  if (!j) {
    document.getElementById('just-text').classList.add('is-invalid');
    return;
  }
  hideModal('modal-correccion');
  alert('Corrección registrada. Puedes editar los valores de esta jornada.');
}
