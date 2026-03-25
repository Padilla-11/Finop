document.getElementById('pass1').addEventListener('input', function () {
  const value = this.value;
  const wrap = document.getElementById('strength-wrap');
  const bar = document.getElementById('strength-bar');
  const lbl = document.getElementById('strength-lbl');

  if (!value) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';

  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = [
    { p: '25%', c: 'var(--fo-danger)', t: 'Muy débil' },
    { p: '50%', c: 'var(--fo-warning)', t: 'Débil' },
    { p: '75%', c: '#d4a017', t: 'Moderada' },
    { p: '100%', c: 'var(--fo-accent)', t: 'Fuerte' }
  ];

  const level = levels[Math.max(score - 1, 0)];
  bar.style.width = level.p;
  bar.style.background = level.c;
  lbl.textContent = 'Fortaleza: ' + level.t;
});

document.getElementById('register-form').addEventListener('submit', function (event) {
  event.preventDefault();
  let ok = true;

  const validate = (id, cond, errId) => {
    document.getElementById(id).classList.toggle('is-invalid', !cond);
    if (errId) {
      document.getElementById(errId).style.display = cond ? 'none' : 'block';
    }
    if (!cond) ok = false;
  };

  validate('nombre', document.getElementById('nombre').value.trim().length >= 2);
  validate(
    'correo',
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('correo').value.trim())
  );

  const pass1 = document.getElementById('pass1').value;
  const pass2 = document.getElementById('pass2').value;
  validate('pass1', pass1.length >= 8, 'pass1-err');
  validate('pass2', pass1 === pass2 && pass2.length > 0, 'pass2-err');

  if (!document.getElementById('terminos').checked) {
    document.getElementById('term-err').style.display = 'block';
    ok = false;
  } else {
    document.getElementById('term-err').style.display = 'none';
  }

  if (!ok) return;

  const btn = document.getElementById('btn-reg');
  btn.disabled = true;
  btn.innerHTML = '<svg class="fo-spin" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-18 0" opacity=".3"/><path d="M12 3a9 9 0 0 1 9 9"/></svg> Creando cuenta...';

  setTimeout(() => {
    window.location.href = 'onboarding.html';
  }, 1400);
});
