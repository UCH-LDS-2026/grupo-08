const API = '/api';
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

  // Sidebar: poblar iniciales, nombre y badge de rol
  const _ini = document.getElementById('sidebar-initials');
  const _nom = document.getElementById('sidebar-name');
  const _rol = document.getElementById('sidebar-role');
  if (_ini) _ini.textContent = usuarioActual.nombre.charAt(0).toUpperCase();
  if (_nom) _nom.textContent = usuarioActual.nombre;
  if (_rol) { _rol.textContent = formatRol(usuarioActual.rol); _rol.className = 'sidebar-role-badge role-' + usuarioActual.rol; }
}

// --- NAVEGACIÓN ---
function switchPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`panel-${id}`).classList.add('active');
  // data-panel evita depender de event.target que puede apuntar a SVG u otro hijo
  const navItem = document.querySelector(`.nav-tab[data-panel="${id}"]`);
  if (navItem) navItem.classList.add('active');
  // En mobile cerrar sidebar al navegar
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

// --- SIDEBAR MOBILE ---
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}

// --- VEHÍCULOS ---
async function cargarMisVehiculos() {
  const res = await fetch(`${API}/vehiculos/mis-vehiculos`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  const lista = document.getElementById('lista-vehiculos');
  if (!data.vehiculos || !data.vehiculos.length) {
    return lista.innerHTML = '<div class="empty">No tenés vehículos registrados aún.</div>';
  }
  lista.innerHTML = `
    <div class="vehicles-grid">
      ${data.vehiculos.map(v => `
        <div class="vehicle-card">
          <div class="vehicle-card-header">
            <span class="vehicle-plate">${v.patente}</span>
            <span class="vehicle-id-badge">ID #${v.id}</span>
          </div>
          <div class="vehicle-card-body">
            <div class="vehicle-model">${v.marca} ${v.modelo}</div>
            <div class="vehicle-meta">
              <span class="vehicle-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${v.anio || '—'}
              </span>
              <span class="vehicle-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                ${v.kilometraje !== undefined ? Number(v.kilometraje).toLocaleString('es-AR') + ' km' : '—'}
              </span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;
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
  const ownerNombre  = v.dueno_nombre  || '—';
  const ownerEmail   = v.dueno_email   || '—';
  const ownerInitial = v.dueno_nombre  ? v.dueno_nombre.charAt(0).toUpperCase() : '?';
  const km = v.kilometraje !== undefined ? Number(v.kilometraje).toLocaleString('es-AR') + ' km' : '—';
  div.innerHTML = `
    <div class="vehicle-identity-card">
      <div class="vic-header">
        <div>
          <div class="vic-plate-large">${v.patente}</div>
          <div class="vic-subtitle">${v.marca} ${v.modelo}${v.anio ? ' · ' + v.anio : ''}</div>
        </div>
        <span class="vic-id-chip">ID #${v.id}</span>
      </div>
      <div class="vic-specs">
        ${v.vin ? `<div class="vic-spec"><span class="vic-spec-label">VIN</span><span class="vic-spec-value">${v.vin}</span></div>` : ''}
        <div class="vic-spec"><span class="vic-spec-label">Patente</span><span class="vic-spec-value">${v.patente}</span></div>
        <div class="vic-spec"><span class="vic-spec-label">Año</span><span class="vic-spec-value">${v.anio || '—'}</span></div>
        <div class="vic-spec"><span class="vic-spec-label">Kilometraje</span><span class="vic-spec-value">${km}</span></div>
      </div>
      <div class="vic-owner">
        <div class="vic-owner-avatar">${ownerInitial}</div>
        <div class="vic-owner-info">
          <div class="vic-owner-label">Propietario registrado</div>
          <div class="vic-owner-name">${ownerNombre}</div>
          <div class="vic-owner-email">${ownerEmail}</div>
        </div>
      </div>
    </div>`;
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
  const km = veh.kilometraje !== undefined ? Number(veh.kilometraje).toLocaleString('es-AR') + ' km' : '—';

  const vehicleHeader = `
    <div class="historial-vehicle-header">
      <div class="hvh-left">
        <span class="hvh-plate">${veh.patente}</span>
        <span class="hvh-info">${veh.marca} ${veh.modelo}${veh.anio ? ' · ' + veh.anio : ''}</span>
      </div>
      <span class="hvh-km">${km}</span>
    </div>`;

  if (!data.historial || !data.historial.length) {
    return div.innerHTML = vehicleHeader +
      '<div class="empty">Este vehículo no tiene servicios registrados aún.</div>';
  }

  const tipoBadge = { service: 'badge-service', reparacion: 'badge-reparacion', inspeccion: 'badge-inspeccion', siniestro: 'badge-siniestro' };

  const timelineHTML = `
    <div class="historial-count">${data.historial.length} registro${data.historial.length !== 1 ? 's' : ''} encontrado${data.historial.length !== 1 ? 's' : ''}</div>
    <div class="service-timeline">
      ${data.historial.map(h => {
        const badgeClass = tipoBadge[h.tipo_servicio] || 'badge-default';
        const kmServ = h.kilometraje_servicio ? Number(h.kilometraje_servicio).toLocaleString('es-AR') + ' km' : '—';
        const desc = h.descripcion || '—';
        const taller = h.nombre_taller || '—';
        return `
          <div class="timeline-item">
            <div class="timeline-dot-col">
              <div class="timeline-dot"></div>
              <div class="timeline-connector"></div>
            </div>
            <div class="timeline-content">
              <div class="timeline-card">
                <div class="timeline-card-top">
                  <div class="timeline-date-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    ${h.fecha_servicio}
                    <span class="timeline-km-chip">${kmServ}</span>
                  </div>
                  <span class="timeline-type-badge ${badgeClass}">${h.tipo_servicio}</span>
                </div>
                <div class="timeline-service-desc">${desc}</div>
                <div class="timeline-taller-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                  ${taller}
                </div>
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>
    <div class="timeline-end">— fin del historial —</div>`;

  div.innerHTML = vehicleHeader + timelineHTML;
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
