const API = '/api';
let token = localStorage.getItem('token');
let usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null');

if (token && usuarioActual) mostrarDashboard();

// --- ESCAPE HTML (prevención de XSS) ---
function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// --- AUTH ---
function switchAuth(modo) {
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active',
    (modo === 'login' && i === 0) || (modo === 'registro' && i === 1)));
  document.getElementById('form-login').style.display    = modo === 'login'    ? 'block' : 'none';
  document.getElementById('form-registro').style.display = modo === 'registro' ? 'block' : 'none';
  document.getElementById('auth-alert').textContent = '';
}

async function login() {
  const email    = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return showAlert('auth-alert', data.error, 'error');
    token         = data.token;
    usuarioActual = data.usuario;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuarioActual));
    mostrarDashboard();
  } catch { showAlert('auth-alert', 'Error de conexión con el servidor', 'error'); }
}

async function registro() {
  const nombre   = document.getElementById('reg-nombre').value;
  const email    = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  try {
    const res  = await fetch(`${API}/auth/registro`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
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
  document.getElementById('dashboard').style.display    = 'none';
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('btn-logout').style.display   = 'none';
  document.getElementById('user-info').style.display    = 'none';
}

function mostrarDashboard() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('dashboard').style.display    = 'block';
  document.getElementById('btn-logout').style.display   = 'inline-block';
  document.getElementById('user-info').style.display    = 'inline';
  document.getElementById('user-info').textContent = `${usuarioActual.nombre} · ${formatRol(usuarioActual.rol)}`;

  const rol     = usuarioActual.rol;
  const esAdmin = rol === 'admin';

  // Vehículos: dueno y admin
  const tabVeh = document.getElementById('tab-agregar-vehiculo');
  if (tabVeh) tabVeh.style.display = ['dueno', 'admin'].includes(rol) ? '' : 'none';

  // Registrar servicio: mecanico y admin
  const tabServ = document.getElementById('tab-registrar-servicio');
  if (tabServ) tabServ.style.display = ['mecanico', 'admin'].includes(rol) ? '' : 'none';

  // Panel Usuarios: solo admin
  const tabAdminU = document.getElementById('tab-admin-usuarios');
  if (tabAdminU) tabAdminU.style.display = esAdmin ? '' : 'none';

  // Panel Talleres: solo admin
  const tabAdminT = document.getElementById('tab-admin-talleres');
  if (tabAdminT) tabAdminT.style.display = esAdmin ? '' : 'none';

  // Fecha de hoy en formulario de servicio
  const fechaServ = document.getElementById('serv-fecha');
  if (fechaServ) fechaServ.valueAsDate = new Date();

  // Sidebar: iniciales, nombre y rol
  const _ini = document.getElementById('sidebar-initials');
  const _nom = document.getElementById('sidebar-name');
  const _rol = document.getElementById('sidebar-role');
  if (_ini) _ini.textContent = usuarioActual.nombre.charAt(0).toUpperCase();
  if (_nom) _nom.textContent = usuarioActual.nombre;
  if (_rol) { _rol.textContent = formatRol(rol); _rol.className = 'sidebar-role-badge role-' + rol; }

  if (rol === 'dueno' || rol === 'admin') cargarMisVehiculos();
}

// --- NAVEGACIÓN ---
function switchPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`panel-${id}`).classList.add('active');
  const navItem = document.querySelector(`.nav-tab[data-panel="${id}"]`);
  if (navItem) navItem.classList.add('active');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}

// --- VEHÍCULOS ---
async function cargarMisVehiculos() {
  const res  = await fetch(`${API}/vehiculos/mis-vehiculos`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  const lista = document.getElementById('lista-vehiculos');
  if (!data.vehiculos || !data.vehiculos.length) {
    lista.textContent = '';
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'No tenés vehículos registrados aún.';
    lista.appendChild(e);
    return;
  }
  lista.innerHTML = `
    <div class="vehicles-grid">
      ${data.vehiculos.map(v => `
        <div class="vehicle-card">
          <div class="vehicle-card-header">
            <span class="vehicle-plate">${escapeHTML(v.patente)}</span>
            <span class="vehicle-id-badge">ID #${escapeHTML(v.id)}</span>
          </div>
          <div class="vehicle-card-body">
            <div class="vehicle-model">${escapeHTML(v.marca)} ${escapeHTML(v.modelo)}</div>
            <div class="vehicle-meta">
              <span class="vehicle-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${escapeHTML(v.anio ?? '—')}
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
    patente:     document.getElementById('veh-patente').value.trim().toUpperCase(),
    marca:       document.getElementById('veh-marca').value,
    modelo:      document.getElementById('veh-modelo').value,
    anio:        parseInt(document.getElementById('veh-anio').value),
    kilometraje: parseInt(document.getElementById('veh-kilometraje').value) || 0
  };
  try {
    const res  = await fetch(`${API}/vehiculos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return showAlert('vehiculo-alert', data.error, 'error');
    showAlert('vehiculo-alert', `Vehículo ${escapeHTML(body.patente)} registrado exitosamente`, 'success');
    ['veh-patente','veh-marca','veh-modelo','veh-anio','veh-kilometraje'].forEach(id => document.getElementById(id).value = '');
    cargarMisVehiculos();
  } catch { showAlert('vehiculo-alert', 'Error de conexión', 'error'); }
}

async function buscarPatente() {
  const patente = document.getElementById('input-patente').value.toUpperCase().trim();
  if (!patente) return;
  const res  = await fetch(`${API}/vehiculos/patente/${patente}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  const div  = document.getElementById('resultado-busqueda');
  if (!res.ok) {
    div.textContent = '';
    const err = document.createElement('div');
    err.className = 'alert alert-error';
    err.textContent = res.status === 403
      ? 'No tenés permiso para consultar este vehículo.'
      : (data.error || 'Vehículo no encontrado');
    div.appendChild(err);
    return;
  }
  const v = data.vehiculo;
  const ownerNombre  = v.dueno_nombre != null ? escapeHTML(v.dueno_nombre) : 'Información reservada';
  const ownerEmail   = v.dueno_email  != null ? escapeHTML(v.dueno_email)  : 'Correo reservado';
  const ownerInitial = v.dueno_nombre != null ? escapeHTML(v.dueno_nombre.charAt(0).toUpperCase()) : '?';
  const km = v.kilometraje !== undefined ? Number(v.kilometraje).toLocaleString('es-AR') + ' km' : '—';
  div.innerHTML = `
    <div class="vehicle-identity-card">
      <div class="vic-header">
        <div>
          <div class="vic-plate-large">${escapeHTML(v.patente)}</div>
          <div class="vic-subtitle">${escapeHTML(v.marca)} ${escapeHTML(v.modelo)}${v.anio ? ' · ' + escapeHTML(v.anio) : ''}</div>
        </div>
        <span class="vic-id-chip">ID #${escapeHTML(v.id)}</span>
      </div>
      <div class="vic-specs">
        ${v.vin ? `<div class="vic-spec"><span class="vic-spec-label">VIN</span><span class="vic-spec-value">${escapeHTML(v.vin)}</span></div>` : ''}
        <div class="vic-spec"><span class="vic-spec-label">Patente</span><span class="vic-spec-value">${escapeHTML(v.patente)}</span></div>
        <div class="vic-spec"><span class="vic-spec-label">Año</span><span class="vic-spec-value">${escapeHTML(v.anio ?? '—')}</span></div>
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
  const url = /^\d+$/.test(valor)
    ? `${API}/historial/vehiculo/${valor}`
    : `${API}/historial/patente/${valor.toUpperCase()}`;
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  const div  = document.getElementById('resultado-historial');
  if (!res.ok) {
    div.textContent = '';
    const err = document.createElement('div');
    err.className = 'alert alert-error';
    err.textContent = data.error;
    div.appendChild(err);
    return;
  }
  const veh = data.vehiculo;
  const km  = veh.kilometraje !== undefined ? Number(veh.kilometraje).toLocaleString('es-AR') + ' km' : '—';

  const vehicleHeader = `
    <div class="historial-vehicle-header">
      <div class="hvh-left">
        <span class="hvh-plate">${escapeHTML(veh.patente)}</span>
        <span class="hvh-info">${escapeHTML(veh.marca)} ${escapeHTML(veh.modelo)}${veh.anio ? ' · ' + escapeHTML(veh.anio) : ''}</span>
      </div>
      <span class="hvh-km">${km}</span>
    </div>`;

  if (!data.historial || !data.historial.length) {
    div.innerHTML = vehicleHeader + '<div class="empty">Este vehículo no tiene servicios registrados aún.</div>';
    return;
  }

  const tipoBadge = { service: 'badge-service', reparacion: 'badge-reparacion', inspeccion: 'badge-inspeccion', siniestro: 'badge-siniestro' };

  const timelineHTML = `
    <div class="historial-count">${data.historial.length} registro${data.historial.length !== 1 ? 's' : ''} encontrado${data.historial.length !== 1 ? 's' : ''}</div>
    <div class="service-timeline">
      ${data.historial.map(h => {
        const badgeClass = tipoBadge[h.tipo_servicio] || 'badge-default';
        const kmServ = h.kilometraje_servicio != null ? Number(h.kilometraje_servicio).toLocaleString('es-AR') + ' km' : '—';
        const desc   = h.descripcion      ? escapeHTML(h.descripcion)      : '—';
        const taller = h.nombre_taller    ? escapeHTML(h.nombre_taller)    : (h.nombre_mecanico ? escapeHTML(h.nombre_mecanico) : '—');
        return `
          <div class="timeline-item">
            <div class="timeline-dot-col"><div class="timeline-dot"></div><div class="timeline-connector"></div></div>
            <div class="timeline-content">
              <div class="timeline-card">
                <div class="timeline-card-top">
                  <div class="timeline-date-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    ${escapeHTML(h.fecha_servicio)}
                    <span class="timeline-km-chip">${kmServ}</span>
                  </div>
                  <span class="timeline-type-badge ${badgeClass}">${escapeHTML(h.tipo_servicio)}</span>
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

// --- REGISTRAR SERVICIO (mecánico / admin — usa PATENTE) ---
async function registrarServicio() {
  const body = {
    patente:              document.getElementById('serv-patente').value.trim().toUpperCase(),
    tipo_servicio:        document.getElementById('serv-tipo').value,
    descripcion:          document.getElementById('serv-descripcion').value,
    fecha_servicio:       document.getElementById('serv-fecha').value,
    kilometraje_servicio: parseInt(document.getElementById('serv-kilometraje').value)
  };
  try {
    const res  = await fetch(`${API}/historial`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return showAlert('servicio-alert', data.error, 'error');
    showAlert('servicio-alert', `Servicio registrado para el vehículo ${escapeHTML(body.patente)}`, 'success');
    ['serv-patente','serv-descripcion','serv-kilometraje'].forEach(id => document.getElementById(id).value = '');
  } catch { showAlert('servicio-alert', 'Error de conexión', 'error'); }
}

// --- CAMBIO DE CONTRASEÑA ---
async function cambiarPassword() {
  const passwordActual         = document.getElementById('cp-actual').value;
  const passwordNueva          = document.getElementById('cp-nueva').value;
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
    const res  = await fetch(`${API}/auth/cambiar-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ passwordActual, passwordNueva, confirmarPasswordNueva })
    });
    const data = await res.json();
    if (!res.ok) return showAlert('cambiar-password-alert', data.error, 'error');
    showAlert('cambiar-password-alert', 'Contraseña actualizada correctamente', 'success');
    document.getElementById('cp-actual').value    = '';
    document.getElementById('cp-nueva').value     = '';
    document.getElementById('cp-confirmar').value = '';
  } catch { showAlert('cambiar-password-alert', 'Error de conexión con el servidor', 'error'); }
}

// --- ADMIN: CREAR USUARIO (con taller selector para mecánico) ---
function onRolAdminChange() {
  const rol = document.getElementById('admin-rol').value;
  const campos = document.getElementById('taller-profile-fields');
  if (campos) campos.style.display = rol === 'mecanico' ? 'block' : 'none';
  if (rol === 'mecanico') cargarTalleresSelector();
}

function limpiarFormularioAdmin() {
  ['admin-nombre', 'admin-email', 'admin-password'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const sel = document.getElementById('admin-taller-id');
  if (sel) sel.value = '';
  document.getElementById('admin-rol').value = 'dueno';
  const campos = document.getElementById('taller-profile-fields');
  if (campos) campos.style.display = 'none';
}

async function cargarTalleresSelector() {
  try {
    const res  = await fetch(`${API}/talleres`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const sel  = document.getElementById('admin-taller-id');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Seleccioná un taller —</option>';
    (data.talleres || []).forEach(t => {
      const opt = document.createElement('option');
      opt.value       = t.id;
      opt.textContent = `${escapeHTML(t.nombre_taller)} (${escapeHTML(t.direccion)})`;
      sel.appendChild(opt);
    });
  } catch { /* silencioso */ }
}

async function crearUsuarioAdmin() {
  const nombre   = document.getElementById('admin-nombre').value.trim();
  const email    = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  const rol      = document.getElementById('admin-rol').value;

  if (!nombre || !email || !password || !rol) {
    return showAlert('admin-usuarios-alert', 'Todos los campos son obligatorios', 'error');
  }

  let taller_id = null;
  if (rol === 'mecanico') {
    taller_id = document.getElementById('admin-taller-id')?.value;
    if (!taller_id) {
      return showAlert('admin-usuarios-alert',
        'Para crear un usuario mecánico, debe asociarlo a un taller.', 'error');
    }
    taller_id = parseInt(taller_id);
  }

  try {
    const res  = await fetch(`${API}/auth/admin/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nombre, email, password, rol, taller_id })
    });
    const data = await res.json();
    if (!res.ok) return showAlert('admin-usuarios-alert', data.error, 'error');
    showAlert('admin-usuarios-alert',
      `Usuario ${escapeHTML(data.email)} creado con rol ${escapeHTML(formatRol(data.rol))}`, 'success');
    limpiarFormularioAdmin();
  } catch { showAlert('admin-usuarios-alert', 'Error de conexión con el servidor', 'error'); }
}

// --- ADMIN: TALLERES ---
async function crearTaller() {
  const nombre_taller = document.getElementById('taller-nombre').value.trim();
  const direccion     = document.getElementById('taller-direccion').value.trim();
  const telefono      = document.getElementById('taller-telefono').value.trim();
  const certificado   = document.getElementById('taller-certificado').checked ? 1 : 0;

  if (!nombre_taller || !direccion) {
    return showAlert('admin-taller-crear-alert', 'El nombre y la dirección del taller son obligatorios', 'error');
  }

  try {
    const res  = await fetch(`${API}/talleres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nombre_taller, direccion, telefono: telefono || null, certificado })
    });
    const data = await res.json();
    if (!res.ok) return showAlert('admin-taller-crear-alert', data.error, 'error');
    showAlert('admin-taller-crear-alert', `Taller "${escapeHTML(nombre_taller)}" creado (ID ${escapeHTML(data.id)})`, 'success');
    ['taller-nombre','taller-direccion','taller-telefono'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('taller-certificado').checked = true;
    cargarListaTalleres();
  } catch { showAlert('admin-taller-crear-alert', 'Error de conexión', 'error'); }
}

async function cargarListaTalleres() {
  const div = document.getElementById('lista-talleres-admin');
  if (!div) return;
  try {
    const res  = await fetch(`${API}/talleres`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.talleres || !data.talleres.length) {
      div.textContent = '';
      const e = document.createElement('div');
      e.className = 'empty'; e.textContent = 'No hay talleres registrados aún.';
      div.appendChild(e);
      return;
    }
    div.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border,#e5e7eb);text-align:left;">
            <th style="padding:8px 10px;">ID</th>
            <th style="padding:8px 10px;">Nombre</th>
            <th style="padding:8px 10px;">Dirección</th>
            <th style="padding:8px 10px;">Teléfono</th>
            <th style="padding:8px 10px;">Cert.</th>
            <th style="padding:8px 10px;">Mecánicos</th>
          </tr>
        </thead>
        <tbody>
          ${data.talleres.map(t => `
            <tr style="border-bottom:1px solid var(--border,#e5e7eb);">
              <td style="padding:8px 10px;">${escapeHTML(t.id)}</td>
              <td style="padding:8px 10px;">${escapeHTML(t.nombre_taller)}</td>
              <td style="padding:8px 10px;">${escapeHTML(t.direccion)}</td>
              <td style="padding:8px 10px;">${escapeHTML(t.telefono ?? '—')}</td>
              <td style="padding:8px 10px;">${t.certificado ? '✓' : '—'}</td>
              <td style="padding:8px 10px;">${escapeHTML(t.cantidad_mecanicos ?? 0)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch { showAlert('admin-taller-crear-alert', 'Error al cargar talleres', 'error'); }
}

// --- HELPERS ---
function formatRol(rol) {
  const roles = { dueno: 'Dueño', mecanico: 'Mecánico', admin: 'Administrador', taller: 'Taller' };
  return roles[rol] || rol;
}

function showAlert(id, msg, tipo) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  const div = document.createElement('div');
  div.className = `alert alert-${tipo}`;
  div.textContent = msg;
  el.appendChild(div);
  setTimeout(() => { if (el) el.textContent = ''; }, 4000);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (document.getElementById('form-login').style.display !== 'none') login();
  }
});
