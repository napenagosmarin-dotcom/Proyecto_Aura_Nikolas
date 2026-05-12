document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = 'Cargando...';
  errorEl.classList.add('visible');

  const data = {
    Email: document.getElementById('Email').value,
    Contrasena: document.getElementById('Contrasena').value
  };

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok && result.user) {
      errorEl.classList.remove('visible');
      localStorage.setItem('user', JSON.stringify(result.user));

      const idRol = Number(result.user.IDRol);

      if (idRol === 2) {
        window.location.href = '/src/pages/admin.html';
      } else {
        window.location.href = '/src/pages/reservas.html';
      }

    } else {
      errorEl.textContent = result.message || 'Email o contraseña incorrectos';
      errorEl.classList.add('visible');
    }

  } catch (error) {
    errorEl.textContent = 'Error de conexión al servidor';
    errorEl.classList.add('visible');
    console.error('Connection error:', error);
  }
});