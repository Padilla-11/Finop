document.getElementById('toggle-pass').addEventListener('click', function () {
  const input = document.getElementById('contrasena');
  input.type = input.type === 'password' ? 'text' : 'password';
});

document.getElementById('login-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const correo = document.getElementById('correo').value.trim();
  const pass = document.getElementById('contrasena').value;
  const btn = document.getElementById('btn-login');
  const err = document.getElementById('login-error');
  let ok = true;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    document.getElementById('correo').classList.add('is-invalid');
    ok = false;
  } else {
    document.getElementById('correo').classList.remove('is-invalid');
  }

  if (!pass) {
    document.getElementById('contrasena').classList.add('is-invalid');
    ok = false;
  } else {
    document.getElementById('contrasena').classList.remove('is-invalid');
  }

  if (!ok) return;

  btn.disabled = true;
  btn.innerHTML = '<svg class="fo-spin" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-18 0" opacity=".3"/><path d="M12 3a9 9 0 0 1 9 9"/></svg> Verificando...';

  setTimeout(() => {
    if (correo === 'demo@finop.co' && pass === 'demo123') {
      window.location.href = 'dashboard.html';
    } else {
      err.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = 'Iniciar sesión';
    }
  }, 1200);
});
