document.getElementById('sidebar-root').innerHTML = renderSidebar('analisis');

const RESPUESTAS = {
  default: [
    "Basándome en tu historial de los últimos 30 días, puedo decirte que tu negocio tiene una tendencia positiva en los fines de semana. Los sábados generan en promedio 62% más ingresos que los lunes. ¿Quieres que analice algún aspecto específico?",
    "Tu punto de equilibrio diario es de aproximadamente $280.000. En los últimos 30 días lo alcanzaste en 18 de 22 jornadas operadas, que es un buen resultado. El principal reto está en los días con gastos inusuales.",
    "Para mejorar tu rentabilidad, la acción de mayor impacto sería revisar el precio de tus productos de mayor volumen. Una variación del 5% en precios puede mejorar tu margen en 2-3 puntos porcentuales."
  ],
  margen:
    "Tu margen promedio del 18.4% está por debajo del 20% recomendado para negocios de alimentos. Las principales palancas son: (1) subir el precio de la arepa de choclo en $500, (2) revisar el proveedor de harina de maíz, (3) reducir los gastos del miércoles que son atípicamente altos.",
  dias:
    "Tus mejores días son los sábados ($415.000 promedio) y los jueves ($365.000). Los peores son los miércoles ($245.000) y los lunes ($260.000). Si debes reducir días, considera sacrificar lunes y miércoles primero.",
  equilibrio:
    "Tu punto de equilibrio diario es de $280.000. Esto significa que necesitas vender ese valor cada día para cubrir todos tus costos fijos y variables. En el último mes lo alcanzaste el 82% de los días operativos."
};
let respIdx = 0;

function addBubble(text, role, typing = false) {
  const wrap = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.innerHTML = `
      <div>
        <div class="fo-chat-sender">${role === 'ai' ? '🤖 FinOp IA' : '👤 Tú'}</div>
        <div class="fo-chat-bubble ${role}">
          ${typing ? '<span class="fo-typing-dot"></span><span class="fo-typing-dot"></span><span class="fo-typing-dot"></span>' : text}
        </div>
      </div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  return div;
}

function sendMsg() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  document.getElementById('sugerencias-wrap').style.display = 'none';
  addBubble(text, 'user');
  const typingDiv = addBubble('', 'ai', true);
  const lower = text.toLowerCase();
  let resp = RESPUESTAS.default[respIdx % RESPUESTAS.default.length];
  respIdx++;
  if (lower.includes('margen') || lower.includes('rentab')) resp = RESPUESTAS.margen;
  if (lower.includes('día') || lower.includes('dias') || lower.includes('operar')) resp = RESPUESTAS.dias;
  if (lower.includes('equilibrio') || lower.includes('vender')) resp = RESPUESTAS.equilibrio;
  setTimeout(() => {
    typingDiv.querySelector('.fo-chat-bubble').innerHTML = resp;
    document.getElementById('chat-messages').scrollTop = 9999;
  }, 1400);
}

function sendSugerencia(text) {
  document.getElementById('chat-input').value = text;
  sendMsg();
}

function generarDiagnostico() {
  const btn = document.getElementById('btn-generar');
  btn.disabled = true;
  btn.innerHTML = '<svg class="fo-spin" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-18 0" opacity=".3"/><path d="M12 3a9 9 0 0 1 9 9"/></svg> Analizando...';
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.43-4.52"/></svg> Regenerar';
    document.getElementById('diag-fecha').textContent =
      'Generado ahora · ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) + ' AM';
  }, 2200);
}

function setPeriodo(dias, btn) {
  document.querySelectorAll('.periodo-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelector('.fo-card-subtitle').textContent = `Diagnóstico — últimos ${dias} días`;
}

/* Mensaje inicial */
addBubble(
  '¡Hola! He analizado el desempeño de <strong>Fritos y Fritos</strong> en los últimos 30 días. Detecté 4 situaciones importantes que debes atender. ¿Por cuál quieres empezar, o tienes alguna pregunta específica?',
  'ai'
);
