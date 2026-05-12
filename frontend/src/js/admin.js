// Verificar sesión y rol
const userData = localStorage.getItem('user');
if (!userData) window.location.href = '/src/pages/login.html';
const user = JSON.parse(userData);
if (user.IDRol !== 2) window.location.href = '/src/pages/reservas.html';

const adminName = document.getElementById('adminName');
const newItemBtn = document.getElementById('newItemBtn');
const searchInput = document.getElementById('searchInput');
let currentSection = 'dashboard';

if (adminName) {
    adminName.textContent = `Bienvenido, ${user.NombreUsuario}`;
}

// Cerrar sesión
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '/src/pages/login.html';
    });
}

// Botón Nuevo Item
if (newItemBtn) {
    newItemBtn.addEventListener('click', () => {
        abrirModalCrear();
    });
}

// Navegación — ahora usa .admin-nav-item y .stat-card (dashboard cards)
const navItems = document.querySelectorAll('.admin-nav-item');
const sections = document.querySelectorAll('.admin-section');
const titles = {
    dashboard:    'Panel de Control',
    reservas:     'Gestión de Reservas',
    habitaciones: 'Gestión de Habitaciones',
    usuarios:     'Gestión de Usuarios',
    clientes:     'Gestión de Clientes',
    cabanas:      'Gestión de Cabañas',
    paquetes:     'Gestión de Paquetes',
    servicios:    'Gestión de Servicios'
};

function switchSection(sectionId) {
    // Actualizar items de navegación del sidebar
    navItems.forEach(n => {
        n.classList.toggle('active', n.dataset.section === sectionId);
    });

    // Actualizar secciones
    sections.forEach(s => s.classList.remove('active'));
    
    currentSection = sectionId;
    const targetSection = document.getElementById(`section-${currentSection}`);
    if (targetSection) targetSection.classList.add('active');
    
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.textContent = titles[currentSection];
    
    updateHeader(currentSection);
    cargarSeccion(currentSection);

    // Si navegamos fuera de dashboard, el scroll debería ir arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

navItems.forEach(item => {
    item.addEventListener('click', () => switchSection(item.dataset.section));
});

// Hacer que las tarjetas del dashboard funcionen como acceso rápido (Delegación de eventos)
function initStatCards() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    statsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.stat-card');
        if (card) {
            const section = card.dataset.section;
            if (section) switchSection(section);
        }
    });
}
document.addEventListener('DOMContentLoaded', initStatCards);
// Si ya cargó el script, intentamos inicializar de una vez
initStatCards();

function cargarSeccion(section) {
    switch(section) {
        case 'dashboard':    cargarDashboard();    break;
        case 'reservas':     cargarReservas();     break;
        case 'habitaciones': cargarHabitaciones(); break;
        case 'usuarios':     cargarUsuarios();     break;
        case 'clientes':     cargarClientes();     break;
        case 'cabanas':      cargarCabanas();      break;
        case 'paquetes':     cargarPaquetes();     break;
        case 'servicios':    cargarServicios();    break;
    }
}

function updateHeader(section) {
    if (!newItemBtn) return;
    newItemBtn.style.display = 'inline-flex';
    
    switch(section) {
        case 'habitaciones': newItemBtn.textContent = '+ Nueva habitación'; break;
        case 'clientes':     newItemBtn.textContent = '+ Nuevo cliente';     break;
        case 'cabanas':      newItemBtn.textContent = '+ Nueva cabaña';      break;
        case 'usuarios':     newItemBtn.textContent = '+ Nuevo usuario';     break;
        case 'paquetes':     newItemBtn.textContent = '+ Nuevo paquete';     break;
        case 'servicios':    newItemBtn.textContent = '+ Nuevo servicio';    break;
        default:             newItemBtn.style.display = 'none';
    }
}

// ===== RESERVAS =====
async function cargarReservas() {
    const list = document.getElementById('reservasList');
    if (!list.innerHTML.trim()) {
        list.innerHTML = '<p style="color:rgba(255,255,255,0.4); padding:2rem;">Cargando reservas...</p>';
    }

    try {
        const [resReservas, resEstados] = await Promise.all([
            fetch('/api/reservations'),
            fetch('/api/estadosreserva')
        ]);
        
        if (!resReservas.ok) throw new Error(`Error reservaciones: ${resReservas.status}`);
        if (!resEstados.ok) throw new Error(`Error estados: ${resEstados.status}`);

        const reservas = await resReservas.json();
        const estados  = await resEstados.json();

        if (!Array.isArray(reservas) || reservas.length === 0) {
            list.innerHTML = '<p style="color:rgba(255,255,255,0.4); padding:2rem;">No hay reservas registradas en el sistema.</p>';
            return;
        }

        list.innerHTML = `
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cliente</th>
                            <th>Documento</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Total</th>
                            <th>Pago</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reservas.map(r => `
                            <tr>
                                <td><span style="color:var(--color-acento);font-weight:600;">#${r.IdReserva}</span></td>
                                <td style="color:#fff;font-weight:500;">${r.NombreUsuario}</td>
                                <td>${r.NroDocumentoCliente}</td>
                                <td>${r.FechaInicio ? new Date(r.FechaInicio).toLocaleDateString('es-CO') : '-'}</td>
                                <td>${r.FechaFinalizacion ? new Date(r.FechaFinalizacion).toLocaleDateString('es-CO') : '-'}</td>
                                <td style="color:#fff;font-weight:600;">$${r.MontoTotal?.toLocaleString('es-CO') ?? '0'}</td>
                                <td>${r.NomMetodoPago ?? '-'}</td>
                                <td><span class="badge badge-${r.NombreEstadoReserva?.toLowerCase()}">${r.NombreEstadoReserva}</span></td>
                                <td>
                                    <select class="estado-select" onchange="cambiarEstado(${r.IdReserva}, this.value)">
                                        ${estados.map(e => `
                                            <option value="${e.IdEstadoReserva}" ${e.IdEstadoReserva === r.IdEstadoReserva ? 'selected' : ''}>
                                                ${e.NombreEstadoReserva}
                                            </option>
                                        `).join('')}
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        list.innerHTML = '<p style="color:#ef4444; padding:2rem;">Error al cargar reservas.</p>';
        console.error('Error cargando reservas:', error);
    }
}

async function cambiarEstado(idReserva, idEstado) {
    try {
        const response = await fetch(`/api/reservations/${idReserva}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ IdEstadoReserva: idEstado })
        });
        if (response.ok) {
            cargarReservas();
            mostrarNotificacion('Estado de la reserva actualizado.', 'success');
        }
        else mostrarNotificacion('Error al cambiar el estado de la reserva.', 'error');
    } catch (error) {
        mostrarNotificacion('Error de conexión al servidor.', 'error');
    }
}

// ===== HABITACIONES =====
async function cargarHabitaciones() {
    const container = document.getElementById('habitacionesGrid');
    if (!container) return;
    if (!container.innerHTML.trim()) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.4);">Cargando habitaciones...</p>';
    }

    try {
        const response = await fetch('/api/habitaciones');
        const habitaciones = await response.json();

        if (!habitaciones.length) {
            container.innerHTML = '<p style="color:rgba(255,255,255,0.4);">No hay habitaciones registradas.</p>';
            return;
        }

        container.innerHTML = habitaciones.map(h => {
            const estado      = h.Estado === 1 ? 'Disponible' : 'Mantenimiento';
            const estadoClass = h.Estado === 1 ? 'status-disponible' : 'status-mantenimiento';
            const precio      = h.Precio ? `$${Number(h.Precio).toLocaleString('es-CO')}` : '$0';
            return `
                <article class="room-card">
                    <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
                         alt="${h.NombreHabitacion || 'Habitación'}" />
                    <div class="room-card-body">
                        <div>
                            <h3>${h.NombreHabitacion || 'Habitación'}</h3>
                            <p>${h.Descripcion || 'Descripción breve de la habitación.'}</p>
                        </div>
                        <div class="room-info">
                            <span class="room-price">${precio}</span>
                            <span class="badge-status ${estadoClass}">${estado}</span>
                        </div>
                        <div class="card__acciones" style="display:flex; gap:8px; margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.05);">
                            <button onclick="editarHabitacion(${h.IDHabitacion})" class="btn-icon-admin" title="Editar">
                                <i data-lucide="edit-2" style="width:16px;"></i>
                            </button>
                            <button onclick="eliminarHabitacion(${h.IDHabitacion})" class="btn-icon-admin btn-delete" title="Eliminar">
                                <i data-lucide="trash-2" style="width:16px;"></i>
                            </button>
                        </div>
                    </div>
                </article>`;
        }).join('');
        if (window.lucide) lucide.createIcons({ parent: container });
    } catch (error) {
        container.innerHTML = '<p style="color:#ef4444;">Error al cargar habitaciones.</p>';
        console.error('Error cargando habitaciones:', error);
    }
}

// ===== USUARIOS =====
async function cargarUsuarios() {
    const list = document.getElementById('usuariosList');
    if (!list.innerHTML.trim()) {
        list.innerHTML = '<p style="color:rgba(255,255,255,0.4); padding:2rem;">Cargando usuarios...</p>';
    }

    try {
        const response = await fetch('/api/usuarios');
        const usuarios = await response.json();

        list.innerHTML = `
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>País</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${usuarios.map(u => `
                            <tr>
                                <td><span style="color:var(--color-acento);font-weight:600;">${u.IDUsuario}</span></td>
                                <td style="color:#fff;font-weight:500;">${u.NombreUsuario}</td>
                                padding-right:1rem;
                                <td>${u.Apellido || '-'}</td>
                                <td>${u.Email}</td>
                                <td>${u.Telefono || '-'}</td>
                                <td>${u.Pais || '-'}</td>
                                <td>
                                    <span class="badge ${u.IDRol === 2 ? 'badge-completada' : 'badge-confirmada'}">
                                        ${u.IDRol === 2 ? 'Admin' : 'Cliente'}
                                    </span>
                                </td>
                                <td>
                                    <div style="display:flex; gap:8px;">
                                        <button onclick="editarUsuario(${u.IDUsuario})" class="btn-icon-admin" title="Editar">
                                            <i data-lucide="edit-2" style="width:16px;"></i>
                                        </button>
                                        <button onclick="eliminarUsuario(${u.IDUsuario})" class="btn-icon-admin btn-delete" title="Eliminar">
                                            <i data-lucide="trash-2" style="width:16px;"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
        if (window.lucide) lucide.createIcons({ parent: list });
    } catch (error) {
        list.innerHTML = '<p style="color:#ef4444; padding:2rem;">Error al cargar usuarios.</p>';
        console.error('Error cargando usuarios:', error);
    }
}

// ===== CLIENTES =====
async function cargarClientes() {
    const list = document.getElementById('clientesList');
    if (!list.innerHTML.trim()) {
        list.innerHTML = '<p style="color:rgba(255,255,255,0.4); padding:2rem;">Cargando clientes...</p>';
    }

    try {
        const response = await fetch('/api/clientes');
        const clientes = await response.json();
        window.clientesData = clientes; // Guardar globalmente para acceso rápido

        list.innerHTML = `
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientes.map(c => {
                            const isActive = c.Estado === 1;
                            const statusIcon = isActive ? 'check-circle-2' : 'x-circle';
                            const statusClass = isActive ? 'btn-status-active' : 'btn-status-inactive';
                            const statusTitle = isActive ? 'Desactivar' : 'Activar';

                            return `
                            <tr>
                                <td><span style="color:var(--color-acento);font-weight:600;">${c.NroDocumento}</span></td>
                                <td style="color:#fff;font-weight:500;">${c.Nombre}</td>
                                <td>${c.Apellido || '-'}</td>
                                <td>${c.Email}</td>
                                <td>${c.Telefono || '-'}</td>
                                <td>
                                    <span class="badge ${isActive ? 'badge-confirmada' : 'badge-cancelada'}">
                                        ${isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div style="display:flex; gap:8px;">
                                        <button onclick="toggleEstadoCliente('${c.IDCliente}', ${c.Estado})" class="btn-icon-admin ${statusClass}" title="${statusTitle}">
                                            <i data-lucide="${statusIcon}" style="width:16px;"></i>
                                        </button>
                                        <button onclick="verDetalleCliente('${c.IDCliente}')" class="btn-icon-admin btn-view" title="Ver Detalle">
                                            <i data-lucide="eye" style="width:16px;"></i>
                                        </button>
                                        <button onclick="editarCliente('${c.IDCliente}')" class="btn-icon-admin btn-edit" title="Editar">
                                            <i data-lucide="edit-2" style="width:16px;"></i>
                                        </button>
                                        <button onclick="eliminarCliente('${c.IDCliente}')" class="btn-icon-admin btn-delete" title="Eliminar">
                                            <i data-lucide="trash-2" style="width:16px;"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>`;
        if (window.lucide) lucide.createIcons({ parent: list });
    } catch (error) {
        list.innerHTML = '<p style="color:#ef4444; padding:2rem;">Error al cargar clientes.</p>';
        console.error('Error cargando clientes:', error);
    }
}

// ===== CABAÑAS =====
async function cargarCabanas() {
    const list = document.getElementById('cabanasList');
    if (!list) return;
    if (!list.innerHTML.trim()) {
        list.innerHTML = '<p style="color:rgba(255,255,255,0.4); padding:2rem;">Cargando cabañas...</p>';
    }

    try {
        const response = await fetch('/api/cabanas');
        const cabanas = await response.json();

        if (!cabanas.length) {
            list.innerHTML = '<p style="color:rgba(255,255,255,0.4); padding:2rem;">No hay cabañas registradas.</p>';
            return;
        }

        list.innerHTML = `
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Capacidad</th>
                            <th>Precio/Noche</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cabanas.map(c => {
                            const { texto, clase } = etiquetaEstadoCabana(c.Estado);
                            
                            // Determinar icono y clase según el estado
                            let statusIcon = 'power';
                            let statusClass = 'btn-status';
                            switch(Number(c.Estado)) {
                                case 1: statusIcon = 'settings';      statusClass = 'btn-status-mantenimiento'; break;
                                case 2: statusIcon = 'lock';          statusClass = 'btn-status-reservada'; break;
                                case 3: statusIcon = 'refresh-cw';    statusClass = 'btn-status-limpieza'; break;
                                case 4: statusIcon = 'x-circle';      statusClass = 'btn-status-nodisponible'; break;
                                case 5: statusIcon = 'check-circle'; statusClass = 'btn-status-disponible'; break;
                                case 6: statusIcon = 'x-circle';      statusClass = 'btn-status-nodisponible'; break;
                                case 7: statusIcon = 'calendar';      statusClass = 'btn-status-reservada'; break;
                                default: statusIcon = 'power';        statusClass = 'btn-status';
                            }

                            return `
                            <tr>
                                <td><span style="color:var(--color-acento);font-weight:600;">${c.IDCabana}</span></td>
                                <td style="color:#fff;font-weight:500;">${c.NombreCabana}</td>
                                <td>${c.CapacidadPersonas} pers.</td>
                                <td style="color:#fff;font-weight:600;">$${Number(c.PrecioNoche || 0).toLocaleString('es-CO')}</td>
                                <td><span class="badge ${clase}">${texto}</span></td>
                                <td>
                                    <div style="display:flex; gap:8px;">
                                        <button onclick="mostrarDetallesCabana(${c.IDCabana})" class="btn-icon-admin btn-view" title="Ver Detalle">
                                            <i data-lucide="eye" style="width:16px;"></i>
                                        </button>
                                        <button onclick="toggleEstadoCabana(${c.IDCabana}, ${c.Estado || 0})" class="btn-icon-admin ${statusClass}" title="Cambiar Estado (Actual: ${texto})">
                                            <i data-lucide="${statusIcon}" style="width:16px;"></i>
                                        </button>
                                        <button onclick="editarCabana(${c.IDCabana})" class="btn-icon-admin" title="Editar">
                                            <i data-lucide="edit-2" style="width:16px;"></i>
                                        </button>
                                        <button onclick="eliminarCabana(${c.IDCabana})" class="btn-icon-admin btn-delete" title="Eliminar">
                                            <i data-lucide="trash-2" style="width:16px;"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>`;
        if (window.lucide) lucide.createIcons({ parent: list });
    } catch (error) {
        list.innerHTML = '<p style="color:#ef4444; padding:2rem;">Error al cargar cabañas.</p>';
        console.error('Error cargando cabañas:', error);
    }
}

// —— Helpers de Estado ——————————————————————————————————————————————————
function etiquetaEstadoCabana(estado) {
    switch (Number(estado)) {
        case 1: return { texto: 'Mantenimiento', clase: 'badge-pendiente' };
        case 2: return { texto: 'Reservada',     clase: 'badge-completada' };
        case 3: return { texto: 'En limpieza',   clase: 'badge-pendiente' };
        case 4: return { texto: 'Inactiva',      clase: 'badge-cancelada' };
        case 5: return { texto: 'Disponible',    clase: 'badge-confirmada' };
        case 6: return { texto: 'No disponible', clase: 'badge-cancelada' };
        case 7: return { texto: 'Reservado',     clase: 'badge-completada' };
        default: return { texto: 'Desconocido',  clase: 'badge-cancelada' };
    }
}

function siguienteEstado(actual) {
    const s = Number(actual);
    if (s === 1) return 5; // Mantenimiento -> Disponible
    if (s === 5) return 7; // Disponible -> Reservado (Nuevo)
    if (s === 7) return 3; // Reservado -> Limpieza
    if (s === 3) return 6; // Limpieza -> No disponible
    if (s === 6) return 1; // No disponible -> Mantenimiento
    return 5;
}

// —— Handlers de Modales —————————————————————————————————————————————————
window.cerrarModal = () => document.getElementById('modalOverlay').classList.remove('activo');
window.cerrarDetalle = () => document.getElementById('detalleModalOverlay').classList.remove('activo');
window.cerrarConfirmacion = () => document.getElementById('confirmModalOverlay').classList.remove('activo');

window.mostrarConfirmacion = (titulo, mensaje, onConfirm) => {
    document.getElementById('confirmTitle').textContent = titulo;
    document.getElementById('confirmMessage').textContent = mensaje;
    const okBtn = document.getElementById('confirmOkBtn');
    
    // Clonar el botón para eliminar listeners anteriores
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    
    newOkBtn.addEventListener('click', () => {
        onConfirm();
        cerrarConfirmacion();
    });
    
    document.getElementById('confirmModalOverlay').classList.add('activo');
    if (window.lucide) lucide.createIcons({ parent: document.getElementById('confirmModalOverlay') });
};

window.mostrarNotificacion = (mensaje, tipo = 'info', titulo = '') => {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${tipo}`;
    
    let icon = 'info';
    if (tipo === 'success') icon = 'check-circle';
    if (tipo === 'error') icon = 'alert-circle';
    if (tipo === 'warning') icon = 'alert-triangle';
    
    if (!titulo) {
        if (tipo === 'success') titulo = '¡Éxito!';
        if (tipo === 'error') titulo = 'Error';
        if (tipo === 'warning') titulo = 'Atención';
        if (tipo === 'info') titulo = 'Información';
    }

    toast.innerHTML = `
        <div class="toast__icon">
            <i data-lucide="${icon}"></i>
        </div>
        <div class="toast__content">
            <span class="toast__title">${titulo}</span>
            <span class="toast__message">${mensaje}</span>
        </div>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons({ parent: toast });

    // Auto eliminar después de 5 segundos
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
};

// —— Acciones de Clientes ————————————————————————————————————————————————
window.editarCliente = async (id) => {
    try {
        const res = await fetch(`/api/clientes/${id}`);
        const data = await res.json();
        document.getElementById('modalTitle').textContent = 'Editar Cliente';
        document.getElementById('modalContent').innerHTML = renderForm('clientes', data);
        document.getElementById('modalOverlay').classList.add('activo');
    } catch (e) { mostrarNotificacion('Error al cargar datos del cliente.', 'error'); }
};

window.toggleEstadoCliente = async (id, actual) => {
    const nuevo = actual === 1 ? 0 : 1;
    try {
        const res = await fetch(`/api/clientes/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Estado: nuevo })
        });
        if (res.ok) {
            cargarClientes();
            mostrarNotificacion(`Cliente ${nuevo === 1 ? 'activado' : 'desactivado'} con éxito.`, 'success');
        }
        else mostrarNotificacion('Error al cambiar el estado del cliente.', 'error');
    } catch (e) { mostrarNotificacion('Error de conexión al servidor.', 'error'); }
};

window.eliminarCliente = async (id) => {
    mostrarConfirmacion(
        '¿Eliminar Cliente?',
        '¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.',
        async () => {
            try {
                const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    cargarClientes();
                    mostrarNotificacion('Cliente eliminado correctamente.', 'success');
                } else {
                    mostrarNotificacion('No se pudo eliminar el cliente.', 'error');
                }
            } catch (e) {
                mostrarNotificacion('Error de conexión al servidor.', 'error');
            }
        }
    );
};

window.verDetalleCliente = (id) => {
    try {
        // En lugar de hacer fetch, buscamos en los datos que YA tenemos cargados en la tabla
        // Esto garantiza que si se ve en la tabla, se verá en el detalle
        let c = (window.clientesData || []).find(item => 
            String(item.NroDocumento) === String(id) || 
            String(item.IDCliente) === String(id) ||
            String(item.id) === String(id)
        );

        if (!c) {
            mostrarNotificacion('No se encontraron datos para este cliente en la memoria local.', 'warning');
            return;
        }

        // Normalización de valores con búsqueda exhaustiva para el email
        const getVal = (obj, key) => obj[key] !== undefined ? obj[key] : '-';
        
        // El email es crítico, buscamos en todas las variantes posibles
        const email = c.Email || c.email || c.Correo || c.correo || c.Mail || c.mail || '-';
        const nombre = getVal(c, 'Nombre');
        const apellido = getVal(c, 'Apellido');
        const idCli = getVal(c, 'IDCliente');
        const documento = getVal(c, 'NroDocumento') !== '-' ? getVal(c, 'NroDocumento') : id;
        const telefono = getVal(c, 'Telefono');
        const direccion = getVal(c, 'Direccion');
        const idRol = getVal(c, 'IDRol');
        const estadoVal = c.Estado !== undefined ? c.Estado : 1;
        const estadoTxt = estadoVal == 1 ? 'Activo' : 'Inactivo';
        
        document.getElementById('detalleTitulo').textContent = `Detalle de Vista: ${nombre} ${apellido}`;
        document.getElementById('detalleContent').style.padding = "0"; 
        document.getElementById('detalleContent').innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.8rem; padding: 1.2rem; background: rgba(13, 11, 46, 0.4);">
                
                <!-- Correo Principal (Ancho total) -->
                <div style="width: 100%; padding: 0.8rem 1.2rem; background: rgba(0, 212, 255, 0.05); border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.1); display: flex; align-items: center; gap: 0.8rem; box-sizing: border-box;">
                    <i data-lucide="mail" style="color: var(--color-acento); width: 20px;"></i>
                    <span style="color: rgba(255,255,255,0.5); font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">Email:</span>
                    <b style="color: #fff; font-size: 1rem; letter-spacing: 0.3px;">${email}</b>
                </div>

                <!-- Datos principales en 3 columnas ajustadas -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; width: 100%;">
                    <div style="background: rgba(255,255,255,0.02); padding: 0.8rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <p style="color: var(--color-acento); font-size: 0.7rem; text-transform: uppercase; margin-bottom: 0.6rem; font-weight: 700; opacity: 0.8;">Identificación</p>
                        <div style="display: flex; flex-direction: column; gap: 0.4rem; color: #fff; font-size: 0.85rem;">
                            <span><b style="color: var(--color-acento); opacity: 0.7;">ID:</b> ${idCli}</span>
                            <span><b style="color: var(--color-acento); opacity: 0.7;">Doc:</b> ${documento}</span>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.02); padding: 0.8rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <p style="color: var(--color-acento); font-size: 0.7rem; text-transform: uppercase; margin-bottom: 0.6rem; font-weight: 700; opacity: 0.8;">Cliente</p>
                        <div style="display: flex; flex-direction: column; gap: 0.4rem; color: #fff; font-size: 0.85rem;">
                            <span style="font-weight: 600;">${nombre}</span>
                            <span style="font-weight: 600;">${apellido}</span>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.02); padding: 0.8rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <p style="color: var(--color-acento); font-size: 0.7rem; text-transform: uppercase; margin-bottom: 0.6rem; font-weight: 700; opacity: 0.8;">Contacto</p>
                        <div style="display: flex; flex-direction: column; gap: 0.4rem; color: #fff; font-size: 0.85rem;">
                            <span><b style="color: var(--color-acento); opacity: 0.7;">Tel:</b> ${telefono}</span>
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><b style="color: var(--color-acento); opacity: 0.7;">Dir:</b> ${direccion}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer Compacto (Ancho total) -->
                <div style="width: 100%; display: flex; justify-content: space-between; padding: 0.6rem 1.2rem; background: rgba(123, 47, 247, 0.08); border-radius: 10px; border: 1px solid rgba(123, 47, 247, 0.15); box-sizing: border-box;">
                    <span style="color: #fff; font-size: 0.85rem; font-weight: 500;"><i data-lucide="shield-check" style="width: 14px; vertical-align: middle; margin-right: 4px; color: var(--color-acento);"></i> Estado: <b style="color: var(--color-acento)">${estadoTxt}</b></span>
                    <span style="color: #fff; font-size: 0.85rem; font-weight: 500;"><i data-lucide="shield" style="width: 14px; vertical-align: middle; margin-right: 4px; color: var(--color-acento);"></i> Rol: <b style="color: var(--color-acento)">${idRol == 2 ? 'Administrador' : 'Cliente'}</b></span>
                </div>

            </div>`;
        if (window.lucide) lucide.createIcons({ parent: document.getElementById('detalleContent') });
        document.getElementById('detalleModalOverlay').classList.add('activo');
    } catch (e) { 
        console.error('Error:', e);
        mostrarNotificacion('Error al mostrar los detalles del cliente.', 'error'); 
    }
};



// —— Acciones de Cabañas —————————————————————————————————————————————————
window.mostrarDetallesCabana = async (id) => {
    try {
        const res = await fetch(`/api/cabanas/${id}`);
        let c = await res.json();
        
        if (Array.isArray(c)) c = c[0];
        if (c.data) c = c.data;

        const { texto } = etiquetaEstadoCabana(c.Estado || c.estado);

        document.getElementById('detalleTitulo').textContent = `Ficha de Cabaña`;
        document.getElementById('detalleContent').innerHTML = `
            <div style="position:relative; margin-bottom:2rem;">
                <img src="${c.ImagenCabana || c.imagenCabana || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'}" 
                     alt="${c.NombreCabana || c.nombreCabana}" 
                     style="width:100%; height:300px; object-fit:cover; border-radius:20px; box-shadow:0 15px 40px rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1);">
                <div style="position:absolute; bottom:-15px; right:20px; background:var(--color-secundario); color:#fff; padding:0.8rem 1.5rem; border-radius:14px; font-weight:700; box-shadow:0 8px 20px rgba(0,0,0,0.4); border:1px solid rgba(0,212,255,0.3);">
                    ${c.NombreCabana || c.nombreCabana}
                </div>
            </div>
            <div class="ver-cabana-info">
                <p style="margin-bottom:1.5rem; color:rgba(255,255,255,0.7); font-style:italic; font-size:1.1rem;">"${c.Descripcion || c.descripcion || 'Sin descripción detallada disponible.'}"</p>
                <p style="font-weight:700; color:var(--color-acento); margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem; font-size:1rem;">
                    <i data-lucide="layout-list" style="width:18px;"></i> Especificaciones Técnicas
                </p>
                <div class="ver-cabana-datos">
                    <span><i data-lucide="users"></i> <b style="color:var(--color-acento)">Capacidad:</b> ${c.CapacidadPersonas || c.capacidadPersonas} personas</span>
                    <span><i data-lucide="dollar-sign"></i> <b style="color:var(--color-acento)">Precio:</b> $${Number(c.PrecioNoche || c.precioNoche).toLocaleString('es-CO')}</span>
                    <span><i data-lucide="check-circle-2"></i> <b style="color:var(--color-acento)">Estado:</b> ${texto}</span>
                </div>
            </div>`;
        if (window.lucide) lucide.createIcons({ parent: document.getElementById('detalleContent') });
        document.getElementById('detalleModalOverlay').classList.add('activo');
    } catch (e) { 
        console.error('Error:', e);
        mostrarNotificacion('Error al cargar detalles de la cabaña.', 'error'); 
    }
};

window.toggleEstadoCabana = async (id, actual) => {
    const nuevo = siguienteEstado(actual);
    try {
        const res = await fetch(`/api/cabanas/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Estado: nuevo })
        });
        if (res.ok) {
            cargarCabanas();
            mostrarNotificacion('Estado de la cabaña actualizado correctamente.', 'success');
        } else {
            mostrarNotificacion('Error al cambiar el estado de la cabaña.', 'error');
        }
    } catch (e) { mostrarNotificacion('Error de conexión al servidor.', 'error'); }
};

window.editarCabana = async (id) => {
    try {
        const res = await fetch(`/api/cabanas/${id}`);
        const data = await res.json();
        document.getElementById('modalTitle').textContent = '✏️ Editar Cabaña';
        document.getElementById('modalContent').innerHTML = renderForm('cabanas', data);
        document.getElementById('modalOverlay').classList.add('activo');
    } catch (e) { mostrarNotificacion('Error al cargar datos de la cabaña.', 'error'); }
};

window.eliminarCabana = async (id) => {
    mostrarConfirmacion(
        '¿Eliminar Cabaña?',
        '¿Está seguro de que desea eliminar esta cabaña? Esta acción no se puede deshacer.',
        async () => {
            try {
                const res = await fetch(`/api/cabanas/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    cargarCabanas();
                    mostrarNotificacion('Cabaña eliminada correctamente.', 'success');
                } else {
                    mostrarNotificacion('No se pudo eliminar la cabaña.', 'error');
                }
            } catch (e) {
                mostrarNotificacion('Error de conexión al servidor.', 'error');
            }
        }
    );
};


// ===== PAQUETES =====
async function cargarPaquetes() {
    const list = document.getElementById('paquetesList');
    if (!list.innerHTML.trim()) {
        list.innerHTML = '<p style="color:rgba(255,255,255,0.4); padding:2rem;">Cargando paquetes...</p>';
    }

    try {
        const response = await fetch('/api/paquetes');
        const paquetes = await response.json();

        list.innerHTML = `
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Habitación</th>
                            <th>Servicio</th>
                            <th>Precio</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paquetes.map(p => `
                            <tr>
                                <td><span style="color:var(--color-acento);font-weight:600;">${p.IDPaquete}</span></td>
                                <td style="color:#fff;font-weight:500;">${p.NombrePaquete}</td>
                                <td>${p.NombreHabitacion}</td>
                                <td>${p.NombreServicio}</td>
                                <td style="color:#fff;font-weight:600;">$${p.Precio?.toLocaleString('es-CO') ?? '0'}</td>
                                <td>
                                    <span class="badge ${p.Estado === 1 ? 'badge-confirmada' : 'badge-cancelada'}">
                                        ${p.Estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div style="display:flex; gap:8px;">
                                        <button onclick="editarPaquete(${p.IDPaquete})" class="btn-icon-admin" title="Editar">
                                            <i data-lucide="edit-2" style="width:16px;"></i>
                                        </button>
                                        <button onclick="eliminarPaquete(${p.IDPaquete})" class="btn-icon-admin btn-delete" title="Eliminar">
                                            <i data-lucide="trash-2" style="width:16px;"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
        if (window.lucide) lucide.createIcons({ parent: list });
    } catch (error) {
        list.innerHTML = '<p style="color:#ef4444; padding:2rem;">Error al cargar paquetes.</p>';
        console.error('Error cargando paquetes:', error);
    }
}

// ===== SERVICIOS =====
async function cargarServicios() {
    const list = document.getElementById('serviciosList');
    if (!list.innerHTML.trim()) {
        list.innerHTML = '<p style="color:rgba(255,255,255,0.4); padding:2rem;">Cargando servicios...</p>';
    }

    try {
        const response = await fetch('/api/servicios');
        const servicios = await response.json();

        list.innerHTML = `
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Duración</th>
                            <th>Máx. Personas</th>
                            <th>Costo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${servicios.map(s => `
                            <tr>
                                <td><span style="color:var(--color-acento);font-weight:600;">${s.IDServicio}</span></td>
                                <td style="color:#fff;font-weight:500;">${s.NombreServicio}</td>
                                <td>${s.Descripcion}</td>
                                <td>${s.Duracion}</td>
                                <td>${s.CantidadMaximaPersonas}</td>
                                <td style="color:#fff;font-weight:600;">$${s.Costo?.toLocaleString('es-CO') ?? '0'}</td>
                                <td>
                                    <div style="display:flex; gap:8px;">
                                        <button onclick="editarServicio(${s.IDServicio})" class="btn-icon-admin" title="Editar">
                                            <i data-lucide="edit-2" style="width:16px;"></i>
                                        </button>
                                        <button onclick="eliminarServicio(${s.IDServicio})" class="btn-icon-admin btn-delete" title="Eliminar">
                                            <i data-lucide="trash-2" style="width:16px;"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
        if (window.lucide) lucide.createIcons({ parent: list });
    } catch (error) {
        list.innerHTML = '<p style="color:#ef4444; padding:2rem;">Error al cargar servicios.</p>';
        console.error('Error cargando servicios:', error);
    }
}

// ===== DASHBOARD LOGIC =====
let chartCabanas = null;
let chartClientes = null;
let chartReservas = null;
let chartPaquetes = null;
let chartServicios = null;

async function cargarDashboard() {
    // Resetear stats con animación
    ['stat-cabanas', 'stat-habitaciones', 'stat-clientes', 'stat-paquetes', 'stat-servicios', 'stat-reservas', 'stat-usuarios']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.textContent = '...'; el.classList.add('loading-num'); }
        });

    try {
        const [cabanas, habitaciones, clientes, paquetes, servicios, reservas, usuarios] = await Promise.all([
            cabanasAPI.getAll(),
            habitacionesAPI.getAll(),
            clientesAPI.getAll(),
            paquetesAPI.getAll(),
            serviciosAPI.getAll(),
            reservasAPI.getAll(),
            fetch('/api/usuarios').then(res => res.json())
        ]);

        // Reservas
        const elRes = document.getElementById('stat-reservas');
        if (elRes) animarNumero(elRes, reservas.length);
        const subRes = document.getElementById('stat-reservas-sub');
        if (subRes) subRes.textContent = `${reservas.length} totales`;

        // Usuarios
        const elUsr = document.getElementById('stat-usuarios');
        if (elUsr) animarNumero(elUsr, usuarios.length);
        const subUsr = document.getElementById('stat-usuarios-sub');
        if (subUsr) subUsr.textContent = `${usuarios.length} registrados`;

        // Cabañas
        const elCabanas = document.getElementById('stat-cabanas');
        if (elCabanas) animarNumero(elCabanas, cabanas.length);
        const cabanasActivas = cabanas.filter(c => Number(c.Estado) === 5).length;
        const subCab = document.getElementById('stat-cabanas-activas');
        if (subCab) subCab.textContent = `${cabanasActivas} disponibles`;

        // Habitaciones
        const elHab = document.getElementById('stat-habitaciones');
        if (elHab) animarNumero(elHab, habitaciones.length);
        const habActivas = habitaciones.filter(h => h.Estado === 1).length;
        const subHab = document.getElementById('stat-habitaciones-sub');
        if (subHab) subHab.textContent = `${habActivas} disponibles`;

        // Clientes
        const elCli = document.getElementById('stat-clientes');
        if (elCli) animarNumero(elCli, clientes.length);
        const clientesActivos = clientes.filter(c => c.Estado === 1).length;
        const subCli = document.getElementById('stat-clientes-activos');
        if (subCli) subCli.textContent = `${clientesActivos} activos`;

        // Paquetes
        const elPaq = document.getElementById('stat-paquetes');
        if (elPaq) animarNumero(elPaq, paquetes.length);
        const paqActivos = paquetes.filter(p => p.Estado === 1).length;
        const subPaq = document.getElementById('stat-paquetes-sub');
        if (subPaq) subPaq.textContent = `${paqActivos} activos`;

        // Servicios
        const elSer = document.getElementById('stat-servicios');
        if (elSer) animarNumero(elSer, servicios.length);
        const subSer = document.getElementById('stat-servicios-sub');
        if (subSer) subSer.textContent = `${servicios.length} registrados`;

        // Renderizar gráficas
        renderGraficaCabanas(cabanas);
        renderGraficaClientes(clientes);
        renderGraficaReservas(reservas);
        renderGraficaPaquetes(paquetes);
        renderGraficaServicios(servicios);

    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

function animarNumero(el, destino, duracion = 800) {
    let inicio = 0;
    const pasos = 30;
    const intervalo = duracion / pasos;
    let paso = 0;
    el.classList.remove('loading-num');
    
    const timer = setInterval(() => {
        paso++;
        const valor = Math.round(inicio + (destino - inicio) * (paso / pasos));
        el.textContent = valor;
        if (paso >= pasos) {
            clearInterval(timer);
            el.textContent = destino;
        }
    }, intervalo);
}

function renderGraficaCabanas(cabanas) {
    const ctx = document.getElementById('grafica-cabanas');
    if (!ctx) return;
    if (chartCabanas) chartCabanas.destroy();

    const data = {
        labels: ['Mantenimiento', 'Reservada', 'Limpieza', 'Inactiva', 'Disponible'],
        datasets: [{
            data: [
                cabanas.filter(c => Number(c.Estado) === 1).length,
                cabanas.filter(c => Number(c.Estado) === 2 || Number(c.Estado) === 7).length,
                cabanas.filter(c => Number(c.Estado) === 3).length,
                cabanas.filter(c => Number(c.Estado) === 4 || Number(c.Estado) === 6).length,
                cabanas.filter(c => Number(c.Estado) === 5).length
            ],
            backgroundColor: ['#f59e0b', '#00d4ff', '#7b2ff7', '#ef4444', '#10b981'],
            borderWidth: 0
        }]
    };

    chartCabanas = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: 'rgba(255,255,255,0.6)', padding: 20 }
                }
            },
            cutout: '70%'
        }
    });
}

function renderGraficaClientes(clientes) {
    const ctx = document.getElementById('grafica-clientes');
    if (!ctx) return;
    if (chartClientes) chartClientes.destroy();

    const activos = clientes.filter(c => c.Estado === 1).length;
    const inactivos = clientes.length - activos;

    chartClientes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Activos', 'Inactivos'],
            datasets: [{
                label: 'Clientes',
                data: [activos, inactivos],
                backgroundColor: ['#10b981', '#ef4444'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderGraficaReservas(reservas) {
    const ctx = document.getElementById('grafica-reservas');
    if (!ctx) return;
    if (chartReservas) chartReservas.destroy();

    const estados = {};
    reservas.forEach(r => {
        const est = r.NombreEstadoReserva || 'Desconocido';
        estados[est] = (estados[est] || 0) + 1;
    });

    const labels = Object.keys(estados);
    const colorMap = {
        'Cancelada': '#ef4444',
        'Completada': '#10b981',
        'Confirmada': '#00d4ff',
        'Pendiente': '#f59e0b',
        'Procesando': '#7b2ff7'
    };
    const backgroundColors = labels.map(label => colorMap[label] || '#7b2ff7');

    chartReservas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reservas',
                data: Object.values(estados),
                backgroundColor: backgroundColors,
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                y: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderGraficaPaquetes(paquetes) {
    const ctx = document.getElementById('grafica-paquetes');
    if (!ctx) return;
    if (chartPaquetes) chartPaquetes.destroy();

    const activos = paquetes.filter(p => p.Estado === 1).length;
    const inactivos = paquetes.length - activos;

    chartPaquetes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Activos', 'Inactivos'],
            datasets: [{
                label: 'Paquetes',
                data: [activos, inactivos],
                backgroundColor: ['#e040fb', 'rgba(255,255,255,0.1)'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderGraficaServicios(servicios) {
    const ctx = document.getElementById('grafica-servicios');
    if (!ctx) return;
    if (chartServicios) chartServicios.destroy();

    const activos = servicios.filter(s => s.Estado === 1).length;
    const inactivos = servicios.length - activos;

    chartServicios = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Activos', 'Inactivos'],
            datasets: [{
                label: 'Servicios',
                data: [activos, inactivos],
                backgroundColor: ['#10b981', 'rgba(255,255,255,0.1)'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ===== INICIALIZAR =====
switchSection('reservas');
// -- Acciones de Habitaciones ---------------------------------------------
window.editarHabitacion = async (id) => {
    try {
        const res = await fetch(`/api/habitaciones/${id}`);
        const data = await res.json();
        document.getElementById('modalTitle').textContent = 'Editar Habitación';
        document.getElementById('modalContent').innerHTML = renderForm('habitaciones', data);
        document.getElementById('modalOverlay').classList.add('activo');
    } catch (e) { mostrarNotificacion('Error al cargar datos de la habitación.', 'error'); }
};
window.eliminarHabitacion = async (id) => {
    mostrarConfirmacion(
        '¿Eliminar Habitación?',
        '¿Está seguro de que desea eliminar esta habitación? Esta acción no se puede deshacer.',
        async () => {
            try {
                const res = await fetch(`/api/habitaciones/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    cargarHabitaciones();
                    mostrarNotificacion('Habitación eliminada correctamente.', 'success');
                } else {
                    mostrarNotificacion('Error al eliminar habitación.', 'error');
                }
            } catch (e) {
                mostrarNotificacion('Error de conexión al servidor.', 'error');
            }
        }
    );
};

// -- Acciones de Usuarios -------------------------------------------------
window.editarUsuario = async (id) => {
    try {
        const res = await fetch(`/api/usuarios/${id}`);
        const data = await res.json();
        document.getElementById('modalTitle').textContent = 'Editar Usuario';
        document.getElementById('modalContent').innerHTML = renderForm('usuarios', data);
        document.getElementById('modalOverlay').classList.add('activo');
    } catch (e) { mostrarNotificacion('Error al cargar datos del usuario.', 'error'); }
};
window.eliminarUsuario = async (id) => {
    mostrarConfirmacion(
        '¿Eliminar Usuario?',
        '¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.',
        async () => {
            try {
                const res = await fetch('/api/usuarios/' + id, { method: 'DELETE' });
                if (res.ok) {
                    cargarUsuarios();
                    mostrarNotificacion('Usuario eliminado con éxito.', 'success');
                } else {
                    mostrarNotificacion('Error al eliminar el usuario.', 'error');
                }
            } catch (e) {
                mostrarNotificacion('Error de conexión al servidor.', 'error');
            }
        }
    );
};

// -- Acciones de Paquetes -------------------------------------------------
window.editarPaquete = async (id) => {
    try {
        const [resP, resH, resS] = await Promise.all([
            fetch(`/api/paquetes/${id}`),
            fetch('/api/habitaciones'),
            fetch('/api/servicios')
        ]);
        const data = await resP.json();
        const extra = {
            habitaciones: await resH.json(),
            servicios: await resS.json()
        };
        document.getElementById('modalTitle').textContent = 'Editar Paquete';
        document.getElementById('modalContent').innerHTML = renderForm('paquetes', data, extra);
        document.getElementById('modalOverlay').classList.add('activo');
    } catch (e) { mostrarNotificacion('Error al cargar datos del paquete.', 'error'); }
};
window.eliminarPaquete = async (id) => {
    mostrarConfirmacion(
        '¿Eliminar Paquete?',
        '¿Está seguro de que desea eliminar este paquete? Esta acción no se puede deshacer.',
        async () => {
            try {
                const res = await fetch('/api/paquetes/' + id, { method: 'DELETE' });
                if (res.ok) {
                    cargarPaquetes();
                    mostrarNotificacion('Paquete eliminado con éxito.', 'success');
                } else {
                    mostrarNotificacion('Error al eliminar el paquete.', 'error');
                }
            } catch (e) {
                mostrarNotificacion('Error de conexión al servidor.', 'error');
            }
        }
    );
};

// -- Acciones de Servicios ------------------------------------------------
window.editarServicio = async (id) => {
    try {
        const res = await fetch(`/api/servicios/${id}`);
        const data = await res.json();
        document.getElementById('modalTitle').textContent = 'Editar Servicio';
        document.getElementById('modalContent').innerHTML = renderForm('servicios', data);
        document.getElementById('modalOverlay').classList.add('activo');
    } catch (e) { mostrarNotificacion('Error al cargar datos del servicio.', 'error'); }
};
window.eliminarServicio = async (id) => {
    mostrarConfirmacion(
        '¿Eliminar Servicio?',
        '¿Está seguro de que desea eliminar este servicio? Esta acción no se puede deshacer.',
        async () => {
            try {
                const res = await fetch('/api/servicios/' + id, { method: 'DELETE' });
                if (res.ok) {
                    cargarServicios();
                    mostrarNotificacion('Servicio eliminado con éxito.', 'success');
                } else {
                    mostrarNotificacion('Error al eliminar el servicio.', 'error');
                }
            } catch (e) {
                mostrarNotificacion('Error de conexión al servidor.', 'error');
            }
        }
    );
};

// —— Funciones de Creación —————————————————————————————————————————————
async function abrirModalCrear() {
    const title = titles[currentSection]?.replace('Gestión de ', 'Nueva/o ') || 'Nuevo Registro';
    document.getElementById('modalTitle').textContent = title;
    
    let extra = {};
    if (currentSection === 'paquetes') {
        try {
            const [resH, resS] = await Promise.all([
                fetch('/api/habitaciones'),
                fetch('/api/servicios')
            ]);
            extra.habitaciones = await resH.json();
            extra.servicios = await resS.json();
        } catch (e) { console.error('Error cargando dependencias'); }
    }

    document.getElementById('modalContent').innerHTML = renderForm(currentSection, null, extra);
    document.getElementById('modalOverlay').classList.add('activo');
}

function renderForm(section, data = null, extra = {}) {
    const isEdit = !!data;
    let fields = '';

    switch(section) {
        case 'habitaciones':
            fields = `
                <div class="form-group">
                    <label>🏨 NOMBRE HABITACIÓN</label>
                    <input type="text" name="NombreHabitacion" value="${data?.NombreHabitacion || ''}" required>
                </div>
                <div class="form-group">
                    <label>📝 DESCRIPCIÓN</label>
                    <textarea name="Descripcion">${data?.Descripcion || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>💰 PRECIO</label>
                    <input type="number" name="Precio" value="${data?.Precio || ''}" required>
                </div>
                <div class="form-group">
                    <label>⚙️ ESTADO</label>
                    <select name="Estado">
                        <option value="1" ${data?.Estado === 1 ? 'selected' : ''}>Disponible</option>
                        <option value="0" ${data?.Estado === 0 ? 'selected' : ''}>Mantenimiento</option>
                    </select>
                </div>`;
            break;
        case 'clientes':
            fields = `
                <div class="form-group">
                    <label>🆔 NRO DOCUMENTO</label>
                    <input type="text" name="NroDocumento" value="${data?.NroDocumento || ''}" ${isEdit ? 'readonly' : ''} required>
                </div>
                <div class="form-group">
                    <label>👤 NOMBRE</label>
                    <input type="text" name="Nombre" value="${data?.Nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label>👤 APELLIDO</label>
                    <input type="text" name="Apellido" value="${data?.Apellido || ''}">
                </div>
                <div class="form-group">
                    <label>📧 EMAIL</label>
                    <input type="email" name="Email" value="${data?.Email || ''}" required>
                </div>
                <div class="form-group">
                    <label>📞 TELÉFONO</label>
                    <input type="text" name="Telefono" value="${data?.Telefono || ''}">
                </div>
                <div class="form-group">
                    <label>📍 DIRECCIÓN</label>
                    <input type="text" name="Direccion" value="${data?.Direccion || ''}">
                </div>`;
            break;
        case 'cabanas':
            fields = `
                <div class="form-group">
                    <label>🏠 NOMBRE DE LA CABAÑA</label>
                    <input type="text" name="NombreCabana" value="${data?.NombreCabana || ''}" required>
                </div>
                <div class="form-group">
                    <label>📝 DESCRIPCIÓN</label>
                    <textarea name="Descripcion">${data?.Descripcion || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>👥 CAPACIDAD DE PERSONAS</label>
                    <input type="number" name="CapacidadPersonas" value="${data?.CapacidadPersonas || ''}" required>
                </div>
                <div class="form-group">
                    <label>🚪 NÚMERO DE HABITACIONES</label>
                    <input type="number" name="NumeroHabitaciones" value="${data?.NumeroHabitaciones || ''}" required>
                </div>
                <div class="form-group">
                    <label>💰 PRECIO POR NOCHE</label>
                    <input type="number" name="PrecioNoche" value="${data?.PrecioNoche || ''}" required>
                </div>
                <div class="form-group">
                    <label>🖼️ IMAGEN URL</label>
                    <input type="text" name="ImagenCabana" value="${data?.ImagenCabana || ''}">
                </div>`;
            break;
        case 'usuarios':
            fields = `
                <div class="form-group">
                    <label>👤 NOMBRE DE USUARIO</label>
                    <input type="text" name="NombreUsuario" value="${data?.NombreUsuario || ''}" required>
                </div>
                <div class="form-group">
                    <label>👤 APELLIDO</label>
                    <input type="text" name="Apellido" value="${data?.Apellido || ''}">
                </div>
                <div class="form-group">
                    <label>📧 EMAIL</label>
                    <input type="email" name="Email" value="${data?.Email || ''}" required>
                </div>
                <div class="form-group">
                    <label>📞 TELÉFONO</label>
                    <input type="text" name="Telefono" value="${data?.Telefono || ''}">
                </div>
                <div class="form-group">
                    <label>🌍 PAÍS</label>
                    <input type="text" name="Pais" value="${data?.Pais || ''}">
                </div>
                <div class="form-group">
                    <label>🔑 ROL</label>
                    <select name="IDRol">
                        <option value="1" ${data?.IDRol === 1 ? 'selected' : ''}>Cliente</option>
                        <option value="2" ${data?.IDRol === 2 ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
                ${!isEdit ? `
                <div class="form-group">
                    <label>🔒 CONTRASEÑA</label>
                    <input type="password" name="Contrasena" required>
                </div>` : ''}`;
            break;
        case 'paquetes':
            fields = `
                <div class="form-group">
                    <label>📦 NOMBRE PAQUETE</label>
                    <input type="text" name="NombrePaquete" value="${data?.NombrePaquete || ''}" required>
                </div>
                <div class="form-group">
                    <label>🏨 HABITACIÓN</label>
                    <select name="IDHabitacion" required>
                        <option value="">Seleccione una...</option>
                        ${(extra.habitaciones || []).map(h => `
                            <option value="${h.IDHabitacion}" ${h.IDHabitacion === data?.IDHabitacion ? 'selected' : ''}>
                                ${h.NombreHabitacion}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>🛠️ SERVICIO</label>
                    <select name="IDServicio" required>
                        <option value="">Seleccione uno...</option>
                        ${(extra.servicios || []).map(s => `
                            <option value="${s.IDServicio}" ${s.IDServicio === data?.IDServicio ? 'selected' : ''}>
                                ${s.NombreServicio}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>💰 PRECIO</label>
                    <input type="number" name="Precio" value="${data?.Precio || ''}" required>
                </div>`;
            break;
        case 'servicios':
            fields = `
                <div class="form-group">
                    <label>🛠️ NOMBRE SERVICIO</label>
                    <input type="text" name="NombreServicio" value="${data?.NombreServicio || ''}" required>
                </div>
                <div class="form-group">
                    <label>📝 DESCRIPCIÓN</label>
                    <textarea name="Descripcion">${data?.Descripcion || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>⏱️ DURACIÓN</label>
                    <input type="text" name="Duracion" value="${data?.Duracion || ''}" placeholder="Ej: 2 horas">
                </div>
                <div class="form-group">
                    <label>👥 MÁX. PERSONAS</label>
                    <input type="number" name="CantidadMaximaPersonas" value="${data?.CantidadMaximaPersonas || ''}">
                </div>
                <div class="form-group">
                    <label>💰 COSTO</label>
                    <input type="number" name="Costo" value="${data?.Costo || ''}" required>
                </div>`;
            break;
    }

    const itemId = data?.IDHabitacion || data?.IDUsuario || data?.NroDocumento || data?.IDCabana || data?.IDPaquete || data?.IDServicio || null;

    window.guardarItem = async (e, section, id) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const body = Object.fromEntries(formData.entries());
        
        // Conversión de tipos para números
        ['Precio', 'PrecioNoche', 'Costo', 'CapacidadPersonas', 'CantidadMaximaPersonas', 'NumeroHabitaciones', 'IDHabitacion', 'IDServicio', 'IDRol', 'Estado'].forEach(key => {
            if (body[key]) body[key] = Number(body[key]);
        });

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/${section}/${id}` : `/api/${section}`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                cerrarModal();
                cargarSeccion(section);
                mostrarNotificacion(`Registro ${id ? 'actualizado' : 'creado'} correctamente.`, 'success');
            } else {
                const err = await res.json();
                mostrarNotificacion(err.message || 'No se pudo guardar el registro.', 'error', 'Error al guardar');
            }
        } catch (e) {
            mostrarNotificacion('Error de conexión con el servidor.', 'error');
        }
    };

    return `
        <form class="modal-form" onsubmit="guardarItem(event, '${section}', ${itemId ? `'${itemId}'` : 'null'})">
            ${fields}
            <div class="modal-actions">
                <button type="button" onclick="cerrarModal()" class="btn-cancelar">Cancelar</button>
                <button type="submit" class="btn-guardar">${isEdit ? 'Guardar Cambios' : 'Crear Registro'}</button>
            </div>
        </form>`;
}