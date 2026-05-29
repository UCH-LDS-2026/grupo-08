const API = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null');

if (token && usuarioActual) mostrarDashboard();

// --- AUTH ---
function switchAuth(modo) {
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', (modo === 'login' && i === 0) || (modo === 'registro' && i === 1)));
  document.getElementById('form-login').style.display = modo === 'login' ? 'block' : 'none';
  document.getElementById('form-registro').style.display = modo === 'registro' ? 'block' : 'none';
  document.getElementById('auth-alert').innerHTML = '';
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return showAlert('auth-alert', data.error, 'error');
    token = data.token;
    usuarioActual = data.usuario;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuarioActual));
    mostrarDashboard();
  } catch { showAlert('auth-alert', 'Error de conexión con el servidor', 'error'); }
}

async function registro() {
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const rol = document.getElementById('reg-rol').value;
  try {
    const res = await fetch(`${API}/auth/registro`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, rol })
    });
    const data = await res.json();
    if (!res.ok) return showAlert('auth-alert', data.error, 'error');
    showAlert('auth-alert', 'Cuenta creada. Ahora iniciá sesión.', 'success');
    switchAuth('login');
  } catch { showAlert('auth-alert', 'Error de conexión con el servidor', 'error'); }
}

function logout() {
  token = null; usuarioActual = null;
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('btn-logout').style.display = 'none';
  document.getElementById('user-info').style.display = 'none';
}

function mostrarDashboard() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('btn-logout').style.display = 'inline-block';
  document.getElementById('user-info').style.display = 'inline';
  document.getElementById('user-info').textContent = `${usuarioActual.nombre} · ${formatRol(usuarioActual.rol)}`;

  // Mostrar "Agregar Vehículo" solo para dueño o admin
  const puedeAgregarVehiculo = ['dueno', 'admin'].includes(usuarioActual.rol);
  document.getElementById('tab-agregar-vehiculo').style.display = puedeAgregarVehiculo ? '' : 'none';

  // Mostrar "Agregar servicio al historial" solo para taller o admin
  const puedeCargarHistorial = ['taller', 'admin'].includes(usuarioActual.rol);
  document.getElementById('card-agregar-historial').style.display = puedeCargarHistorial ? '' : 'none';

  cargarMisVehiculos();
  document.getElementById('hist-fecha').valueAsDate = new Date();
}

// --- NAVEGACIÓN ---
function switchPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`panel-${id}`).classList.add('active');
  event.target.classList.add('active');
}

// --- VEHÍCULOS ---
async function cargarMisVehiculos() {
  const res = await fetch(`${API}/vehiculos/mis-vehiculos`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  const lista = document.getElementById('lista-vehiculos');
  if (!data.vehiculos || !data.vehiculos.length) return lista.innerHTML = '<div class="empty">No tenés vehículos registrados aún.</div>';
  lista.innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Patente</th><th>Marca</th><th>Modelo</th><th>Año</th><th>Kilometraje</th></tr></thead>
      <tbody>
        ${data.vehiculos.map(v => `<tr>
          <td>${v.id}</td>
          <td><strong>${v.patente}</strong></td>
          <td>${v.marca}</td>
          <td>${v.modelo}</td>
          <td>${v.anio || '-'}</td>
          <td>${v.kilometraje !== undefined ? v.kilometraje + ' km' : '-'}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

async function agregarVehiculo() {
  const body = {
    patente: document.getElementById('veh-patente').value.trim().toUpperCase(),
    marca: document.getElementById('veh-marca').value,
    modelo: document.getElementById('veh-modelo').value,
    anio: parseInt(document.getElementById('veh-anio').value),
    kilometraje: parseInt(document.getElementById('veh-kilometraje').value) || 0
  };
  try {
    const res = await fetch(`${API}/vehiculos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return showAlert('vehiculo-alert', data.error, 'error');
    showAlert('vehiculo-alert', `Vehículo ${body.patente} registrado exitosamente`, 'success');
    ['veh-patente','veh-marca','veh-modelo','veh-anio','veh-kilometraje'].forEach(id => document.getElementById(id).value = '');
    cargarMisVehiculos();
  } catch { showAlert('vehiculo-alert', 'Error de conexión', 'error'); }
}

async function buscarPatente() {
  const patente = document.getElementById('input-patente').value.toUpperCase().trim();
  if (!patente) return;
  const res = await fetch(`${API}/vehiculos/patente/${patente}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  const div = document.getElementById('resultado-busqueda');
  if (!res.ok) return div.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
  const v = data.vehiculo;
  div.innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Patente</th><th>Marca</th><th>Modelo</th><th>Año</th><th>Kilometraje</th><th>Cliente</th><th>Correo</th></tr></thead>
      <tbody><tr>
        <td>${v.id}</td>
        <td><strong>${v.patente}</strong></td>
        <td>${v.marca}</td>
        <td>${v.modelo}</td>
        <td>${v.anio || '-'}</td>
        <td>${v.kilometraje !== undefined ? v.kilometraje + ' km' : '-'}</td>
        <td>${v.dueno_nombre}</td>
        <td>${v.dueno_email}</td>
      </tr></tbody>
    </table>`;
}

// --- HISTORIAL ---
async function verHistorial() {
  const valor = document.getElementById('input-vehiculo-id').value.trim();
  if (!valor) return;
  // Si es solo dígitos → buscar por ID; si tiene letras → buscar por patente
  const url = /^\d+$/.test(valor)
    ? `${API}/historial/vehiculo/${valor}`
    : `${API}/historial/patente/${valor.toUpperCase()}`;
  const res = await fetch(url);
  const data = await res.json();
  const div = document.getElementById('resultado-historial');
  if (!res.ok) return div.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
  const veh = data.vehiculo;
  const filaVehiculo = `
    <div style="margin-bottom:14px;padding:12px 16px;background:#eef0f5;border-radius:8px;font-size:0.9rem;">
      <strong>ID ${veh.id} · ${veh.patente}</strong> &nbsp;|&nbsp;
      ${veh.marca} ${veh.modelo} ${veh.anio} &nbsp;|&nbsp;
      🛣️ ${veh.kilometraje} km
    </div>`;
  if (!data.historial || !data.historial.length) {
    return div.innerHTML = filaVehiculo + '<div class="empty">No hay historial para este vehículo.</div>';
  }
  div.innerHTML = filaVehiculo + data.historial.map(h => `
    <div class="historial-item">
      <div class="tipo">${h.tipo_servicio}</div>
      <div class="desc">${h.descripcion || '-'}</div>
      <div class="meta">📅 ${h.fecha_servicio} &nbsp;·&nbsp; 🛣️ ${h.kilometraje_servicio ? h.kilometraje_servicio + ' km' : 'N/A'} &nbsp;·&nbsp; 🔧 ${h.nombre_taller}</div>
    </div>`).join('');
}

async function agregarHistorial() {
  const body = {
    vehiculo_id: parseInt(document.getElementById('hist-vehiculo-id').value),
    tipo_servicio: document.getElementById('hist-tipo').value,
    descripcion: document.getElementById('hist-descripcion').value,
    fecha_servicio: document.getElementById('hist-fecha').value,
    kilometraje_servicio: parseInt(document.getElementById('hist-kilometraje').value)
  };
  try {
    const res = await fetch(`${API}/historial`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return showAlert('historial-alert', data.error, 'error');
    showAlert('historial-alert', 'Servicio registrado exitosamente', 'success');
    ['hist-vehiculo-id','hist-descripcion','hist-kilometraje'].forEach(id => document.getElementById(id).value = '');
  } catch { showAlert('historial-alert', 'Error de conexión', 'error'); }
}

// --- CAMBIO DE CONTRASEÑA ---
async function cambiarPassword() {
  const passwordActual = document.getElementById('cp-actual').value;
  const passwordNueva = document.getElementById('cp-nueva').value;
  const confirmarPasswordNueva = document.getElementById('cp-confirmar').value;

  if (!passwordActual || !passwordNueva || !confirmarPasswordNueva) {
    return showAlert('cambiar-password-alert', 'Todos los campos son obligatorios', 'error');
  }
  if (passwordNueva !== confirmarPasswordNueva) {
    return showAlert('cambiar-password-alert', 'La nueva contraseña y la confirmación no coinciden', 'error');
  }
  if (passwordNueva.length < 6) {
    return showAlert('cambiar-password-alert', 'La contraseña debe tener al menos 6 caracteres', 'error');
  }

  try {
    const res = await fetch(`${API}/auth/cambiar-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ passwordActual, passwordNueva, confirmarPasswordNueva })
    });
    const data = await res.json();
    if (!res.ok) return showAlert('cambiar-password-alert', data.error, 'error');
    showAlert('cambiar-password-alert', 'Contraseña actualizada correctamente', 'success');
    document.getElementById('cp-actual').value = '';
    document.getElementById('cp-nueva').value = '';
    document.getElementById('cp-confirmar').value = '';
  } catch {
    showAlert('cambiar-password-alert', 'Error de conexión con el servidor', 'error');
  }
}

// --- HELPERS ---
function formatRol(rol) {
  const roles = { dueno: 'Dueño', taller: 'Taller', admin: 'Administrador' };
  return roles[rol] || rol;
}

function showAlert(id, msg, tipo) {
  document.getElementById(id).innerHTML = `<div class="alert alert-${tipo}">${msg}</div>`;
  setTimeout(() => document.getElementById(id).innerHTML = '', 4000);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (document.getElementById('form-login').style.display !== 'none') login();
  }
});
