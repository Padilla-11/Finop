/* ============================================================
   FINOP — Datos simulados y utilidades compartidas v1.0
   ============================================================ */

/* ── Formato de moneda COP ──────────────────────────────── */
function formatCOP(value) {
  return '$' + Math.abs(Math.round(value)).toLocaleString('es-CO');
}
function formatPct(value) {
  return (Math.round(value * 100) / 100).toFixed(1) + '%';
}
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' });
}
function dayName(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-CO', { weekday:'long' });
}

/* ── Mock: Productos ────────────────────────────────────── */
const PRODUCTOS = [
  { id:1, nombre:'Empanada',       precio:3000, costo:1100, categoria:'Alimentos', activo:true },
  { id:2, nombre:'Papa rellena',   precio:4500, costo:1800, categoria:'Alimentos', activo:true },
  { id:3, nombre:'Patacon',        precio:2500, costo:900,  categoria:'Alimentos', activo:true },
  { id:4, nombre:'Arepa de huevo', precio:3500, costo:1300, categoria:'Alimentos', activo:true },
  { id:5, nombre:'Carimanola',     precio:4000, costo:1600, categoria:'Alimentos', activo:true },
  { id:6, nombre:'Jugo personal',  precio:4000, costo:1200, categoria:'Bebidas',   activo:true },
];

/* ── Mock: Costos fijos ─────────────────────────────────── */
const COSTOS_FIJOS = [
  { id:1, nombre:'Arriendo local',      valor:800000,  frecuencia:'mensual',  eq_diario:26667 },
  { id:2, nombre:'Servicio de gas',     valor:120000,  frecuencia:'mensual',  eq_diario:4000  },
  { id:3, nombre:'Energía eléctrica',   valor:180000,  frecuencia:'mensual',  eq_diario:6000  },
  { id:4, nombre:'Internet y teléfono', valor:65000,   frecuencia:'mensual',  eq_diario:2167  },
];

/* ── Mock: Empleados ────────────────────────────────────── */
const EMPLEADOS = [
  { id:1, nombre:'Carlos Martínez', cargo:'Auxiliar de cocina', tipo_pago:'mensual', valor:1300000, costo_diario:43333 },
  { id:2, nombre:'Ana Gómez',       cargo:'Cajera',             tipo_pago:'mensual', valor:1200000, costo_diario:40000 },
];

/* ── Mock: Historial de jornadas (últimos 30 días) ──────── */
const HISTORIAL = [
  { id:20, fecha:'2025-03-14', estado:'abierta',  ingresos:287000,  utilidad_neta:null,   margen:null,   equilibrio_superado:null,  conteo:false },
  { id:19, fecha:'2025-03-13', estado:'cerrada',  ingresos:342000,  utilidad_neta:68400,  margen:20.0,   equilibrio_superado:true,  conteo:true  },
  { id:18, fecha:'2025-03-12', estado:'cerrada',  ingresos:198000,  utilidad_neta:-14000, margen:-7.1,   equilibrio_superado:false, conteo:true  },
  { id:17, fecha:'2025-03-11', estado:'no_opero', ingresos:null,    utilidad_neta:null,   margen:null,   equilibrio_superado:null,  conteo:false },
  { id:16, fecha:'2025-03-10', estado:'cerrada',  ingresos:415000,  utilidad_neta:92000,  margen:22.2,   equilibrio_superado:true,  conteo:true  },
  { id:15, fecha:'2025-03-09', estado:'cerrada',  ingresos:381000,  utilidad_neta:71000,  margen:18.6,   equilibrio_superado:true,  conteo:true  },
  { id:14, fecha:'2025-03-08', estado:'cerrada',  ingresos:294000,  utilidad_neta:24000,  margen:8.2,    equilibrio_superado:true,  conteo:false },
  { id:13, fecha:'2025-03-07', estado:'cerrada',  ingresos:316000,  utilidad_neta:51000,  margen:16.1,   equilibrio_superado:true,  conteo:true  },
  { id:12, fecha:'2025-03-06', estado:'cerrada',  ingresos:178000,  utilidad_neta:-28000, margen:-15.7,  equilibrio_superado:false, conteo:true  },
  { id:11, fecha:'2025-03-05', estado:'cerrada',  ingresos:392000,  utilidad_neta:84000,  margen:21.4,   equilibrio_superado:true,  conteo:true  },
  { id:10, fecha:'2025-03-04', estado:'no_opero', ingresos:null,    utilidad_neta:null,   margen:null,   equilibrio_superado:null,  conteo:false },
  { id:9,  fecha:'2025-03-03', estado:'cerrada',  ingresos:355000,  utilidad_neta:63000,  margen:17.7,   equilibrio_superado:true,  conteo:true  },
  { id:8,  fecha:'2025-03-02', estado:'cerrada',  ingresos:288000,  utilidad_neta:31000,  margen:10.8,   equilibrio_superado:true,  conteo:false },
  { id:7,  fecha:'2025-03-01', estado:'cerrada',  ingresos:241000,  utilidad_neta:-8000,  margen:-3.3,   equilibrio_superado:false, conteo:true  },
];

/* ── Mock: Movimientos jornada activa ───────────────────── */
const MOVIMIENTOS_HOY = [
  { id:1, tipo:'gasto_operativo',      descripcion:'Gas propano cilindro',     categoria:'Insumos',          monto:28000,  signo:-1, hora:'8:14 AM', usuario:'Juan P.' },
  { id:2, tipo:'compra_mercancia',     descripcion:'Harina de maíz 10kg',      categoria:'Compra mercancía', monto:42000,  signo:-1, hora:'8:45 AM', usuario:'Carlos M.' },
  { id:3, tipo:'ingreso_no_operativo', descripcion:'Préstamo amigo',           categoria:'No operativo',     monto:50000,  signo:+1, hora:'9:30 AM', usuario:'Juan P.' },
  { id:4, tipo:'gasto_operativo',      descripcion:'Empaque desechable x100',  categoria:'Empaques',         monto:15000,  signo:-1, hora:'10:15 AM',usuario:'Carlos M.' },
  { id:5, tipo:'cobro_cuenta_cobrar',  descripcion:'Cobro — Ana Torres',       categoria:'Cobro cartera',    monto:85000,  signo:+1, hora:'11:00 AM',usuario:'Juan P.' },
  { id:6, tipo:'retiro_dueno',         descripcion:'Retiro propietario',        categoria:'Retiro',           monto:50000,  signo:-1, hora:'12:00 PM',usuario:'Juan P.' },
];

/* ── Mock: Cuentas por cobrar ───────────────────────────── */
const CUENTAS_COBRAR = [
  { id:1, cliente:'Marco Rodríguez', descripcion:'Pedido empresarial - 40 arepas', total:140000, cobrado:0,      estado:'pendiente',       fecha:'2025-03-10', dias:4 },
  { id:2, cliente:'Laura Sánchez',   descripcion:'Desayuno corporativo',           total:95000,  cobrado:50000,  estado:'cobrado_parcial', fecha:'2025-03-08', dias:6 },
  { id:3, cliente:'Pedro Gómez',     descripcion:'Evento cumpleaños',              total:220000, cobrado:0,      estado:'pendiente',       fecha:'2025-03-05', dias:9 },
  { id:4, cliente:'Ana Torres',      descripcion:'Consumo semanal',               total:85000,  cobrado:85000,  estado:'cobrado',         fecha:'2025-03-01', dias:13 },
  { id:5, cliente:'Empresa XYZ',     descripcion:'Contrato desayunos mes',        total:380000, cobrado:190000, estado:'cobrado_parcial', fecha:'2025-02-28', dias:14 },
];

/* ── Mock: Datos para gráficas (últimos 14 días) ────────── */
const CHART_DATA = {
  labels:   ['28F','1M','2M','3M','4M','5M','6M','7M','8M','9M','10M','11M','12M','13M'],
  ingresos: [310000,241000,288000,355000,0,392000,178000,316000,294000,381000,415000,0,198000,342000],
  gastos:   [218000,183000,221000,260000,0,271000,167000,238000,241000,278000,298000,0,178000,248000],
  margen:   [29.7,-3.3,10.8,17.7,null,21.4,-15.7,16.1,8.2,18.6,22.2,null,-7.1,20.0],
};

/* ── Helpers de UI ──────────────────────────────────────── */
function showModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function hideModal(id)  { document.getElementById(id).classList.add('hidden'); }
function switchTab(tabGroup, tabId) {
  document.querySelectorAll(`[data-tab-group="${tabGroup}"]`).forEach(el => el.classList.remove('active'));
  document.querySelectorAll(`[data-tab-content="${tabGroup}"]`).forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-tab-group="${tabGroup}"][data-tab="${tabId}"]`).classList.add('active');
  document.querySelector(`[data-tab-content="${tabGroup}"][data-tab="${tabId}"]`).classList.add('active');
}
function getEstadoBadge(estado, superado) {
  if (estado === 'no_opero') return '<span class="fo-badge fo-badge-neutral">No operado</span>';
  if (estado === 'abierta')  return '<span class="fo-badge fo-badge-warning">En curso</span>';
  if (superado === true)  return '<span class="fo-badge fo-badge-success">✓ Rentable</span>';
  if (superado === false) return '<span class="fo-badge fo-badge-danger">✗ Pérdida</span>';
  return '<span class="fo-badge fo-badge-neutral">—</span>';
}
function getTipoBadge(tipo) {
  const map = {
    gasto_operativo:      { label:'Gasto operativo',    class:'fo-badge-danger'  },
    compra_mercancia:     { label:'Compra mercancía',   class:'fo-badge-info'    },
    ingreso_no_operativo: { label:'Ingreso no oper.',   class:'fo-badge-neutral' },
    retiro_dueno:         { label:'Retiro dueño',       class:'fo-badge-warning' },
    cobro_cuenta_cobrar:  { label:'Cobro cartera',      class:'fo-badge-success' },
  };
  const t = map[tipo] || { label:tipo, class:'fo-badge-neutral' };
  return `<span class="fo-badge ${t.class}">${t.label}</span>`;
}
function getMovIcon(tipo) {
  const map = {
    gasto_operativo: 'gasto', compra_mercancia: 'compra',
    ingreso_no_operativo: 'ingreso', retiro_dueno: 'retiro',
    cobro_cuenta_cobrar: 'cobro'
  };
  const emoji = { gasto:'💸', compra:'📦', ingreso:'💵', retiro:'🏦', cobro:'✅' };
  const cls = map[tipo] || 'gasto';
  return `<div class="fo-movement-icon ${cls}">${emoji[cls]}</div>`;
}

/* ── Sidebar HTML template ──────────────────────────────── */
function renderSidebar(activePage) {
  const navItems = [
    { page:'dashboard',       href:'dashboard.html',       icon:'grid',    label:'Dashboard',          section:null },
    { page:'jornada',         href:'jornada-activa.html',  icon:'clock',   label:'Jornada activa',     section:null },
    { page:'historial',       href:'historial.html',       icon:'calendar',label:'Historial',           section:null },
    { page:'analisis',        href:'analisis.html',        icon:'ai',      label:'Análisis IA',         section:'Análisis' },
    { page:'simulador',       href:'simulador.html',       icon:'chart',   label:'Simulador',           section:null },
    { page:'cuentas',         href:'cuentas-cobrar.html',  icon:'users',   label:'Cuentas por cobrar',  section:null },
    { page:'configuracion',   href:'configuracion.html',   icon:'settings',label:'Configuración',       section:'Sistema' },
  ];
  const icons = {
    grid:     '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    clock:    '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    ai:       '<circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    chart:    '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    users:    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>',
  };
  let html = `<aside class="fo-sidebar">
    <div class="fo-sidebar-brand">
      <div class="fo-brand-logo">
        <div class="fo-brand-icon"><svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg></div>
        <span class="fo-brand-name">FinOp</span>
      </div>
      <div class="fo-brand-sub">Análisis financiero</div>
    </div>
    <nav class="fo-sidebar-nav">`;
  let lastSection = null;
  navItems.forEach(item => {
    if (item.section && item.section !== lastSection) {
      html += `<div class="fo-nav-section">${item.section}</div>`;
      lastSection = item.section;
    } else if (!item.section && lastSection !== 'main') {
      if (item.page === 'dashboard') { html += '<div class="fo-nav-section">Principal</div>'; lastSection = 'main'; }
    }
    html += `<a href="${item.href}" class="fo-nav-item${activePage===item.page?' active':''}" data-page="${item.page}">
      <svg class="fo-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons[item.icon]}</svg>
      ${item.label}
    </a>`;
  });
  html += `</nav>
    <div class="fo-sidebar-footer">
      <div class="fo-user-chip">
        <div class="fo-avatar">JP</div>
        <div>
          <div class="fo-user-name">Juan Pérez</div>
          <div class="fo-user-business">Fritos y Fritos</div>
          <div class="fo-user-role">Propietario</div>
        </div>
      </div>
    </div>
  </aside>`;
  return html;
}
