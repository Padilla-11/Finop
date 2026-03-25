document.getElementById('sidebar-root').innerHTML = renderSidebar('historial');

function filtrar() {
  const filtro = document.getElementById('filtro-estado').value;
  renderHistorial(filtro);
}

function renderHistorial(filtro = '') {
  const tbody = document.getElementById('historial-tbody');
  const rows = HISTORIAL.filter(j => {
    if (!filtro) return true;
    if (filtro === 'rentable') return j.equilibrio_superado === true;
    if (filtro === 'perdida') return j.equilibrio_superado === false;
    if (filtro === 'no_opero') return j.estado === 'no_opero';
    return true;
  });

  tbody.innerHTML = rows
    .map(j => {
      const esNoOpero = j.estado === 'no_opero';
      return `
        <tr class="${esNoOpero ? 'muted-row' : ''}">
          <td class="mono">${formatDate(j.fecha)}</td>
          <td style="text-transform:capitalize;">${esNoOpero ? '<em>Sin jornada</em>' : dayName(j.fecha)}</td>
          <td class="amount ${esNoOpero ? '' : 'pos'}">${j.ingresos ? formatCOP(j.ingresos) : '—'}</td>
          <td class="amount ${j.utilidad_neta === null ? '' : j.utilidad_neta >= 0 ? 'pos' : 'neg'}">${j.utilidad_neta !== null ? formatCOP(j.utilidad_neta) : '—'}</td>
          <td>${j.margen !== null ? `<span class="fo-badge ${j.margen >= 0 ? 'fo-badge-success' : 'fo-badge-danger'}">${formatPct(j.margen)}</span>` : '—'}</td>
          <td>${j.equilibrio_superado === true ? '<span style="color:var(--fo-accent-dark);">✓ Superado</span>' : j.equilibrio_superado === false ? '<span style="color:var(--fo-danger);">✗ No superado</span>' : '—'}</td>
          <td>${getEstadoBadge(j.estado, j.equilibrio_superado)}</td>
          <td>${esNoOpero ? '' : '<a href="detalle-jornada.html" class="fo-btn fo-btn-ghost fo-btn-sm">Ver</a>'}</td>
        </tr>`;
    })
    .join('');
}

renderHistorial();
