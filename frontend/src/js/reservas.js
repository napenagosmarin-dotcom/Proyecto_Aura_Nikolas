// Verificar sesión
const userData = localStorage.getItem('user');
if (!userData) window.location.href = '/src/pages/login.html';
const user = JSON.parse(userData || '{}');
if (!user.IDUsuario) {
  localStorage.removeItem('user');
  window.location.href = '/src/pages/login.html';
}

// Set user name and logout after components are loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for components to load
  setTimeout(() => {
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = `Hola, ${user.NombreUsuario}`;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '/src/pages/login.html';
      });
    }
  }, 100);
});

let habitacionesData = [];
let paquetesData = [];
let serviciosData = [];

async function cargarHabitaciones() {
    const response = await fetch('/api/habitaciones');
    habitacionesData = await response.json();
    const select = document.getElementById('editIDHabitacion');
    select.innerHTML = '<option value="">Seleccione una habitación</option>';
    habitacionesData.forEach(h => {
        const option = document.createElement('option');
        option.value = h.IDHabitacion;
        option.textContent = `${h.NombreHabitacion} - $${h.Costo.toLocaleString()}`;
        option.dataset.costo = h.Costo;
        select.appendChild(option);
    });
}

async function cargarPaquetes() {
    const response = await fetch('/api/paquetes');
    paquetesData = await response.json();
    const select = document.getElementById('editIDPaquete');
    select.innerHTML = '<option value="">Seleccione un paquete</option>';
    paquetesData.forEach(p => {
        const option = document.createElement('option');
        option.value = p.IDPaquete;
        option.textContent = `${p.NombrePaquete} - $${p.Precio.toLocaleString()}`;
        option.dataset.precio = p.Precio;
        select.appendChild(option);
    });
}

async function cargarServicios() {
    const response = await fetch('/api/servicios');
    serviciosData = await response.json();
}

async function cargarMetodosPagoModal() {
    const response = await fetch('/api/metodopago');
    const metodos = await response.json();
    const select = document.getElementById('editMetodoPago');
    select.innerHTML = '<option value="">Seleccione método de pago</option>';
    const metodosPermitidos = metodos.filter(m => {
        const nombre = (m.NomMetodoPago || '').toLowerCase();
        return nombre.includes('efectivo') || nombre.includes('transferencia');
    });
    metodosPermitidos.forEach(m => {
        const option = document.createElement('option');
        option.value = m.IdMetodoPago;
        option.textContent = m.NomMetodoPago;
        select.appendChild(option);
    });
}

function formatCurrency(value) {
    return `$${Number(value).toLocaleString('es-CO')}`;
}

async function loadReservations() {
    try {
        const response = await fetch(`/api/reservations/user/${user.IDUsuario}`);
        const list = document.getElementById('reservationsList');
        if (!response.ok) {
            list.innerHTML = '<p style="color:var(--gris)">No se pudo cargar las reservas.</p>';
            return;
        }

        const reservations = await response.json();
        if (reservations.length === 0) {
            list.innerHTML = '<p style="color:var(--gris)">No tienes reservas aún. ¡Crea tu primera reserva!</p>';
            return;
        }

        list.innerHTML = reservations.map(r => `
            <div class="reservation-card">
                <div class="reservation-info">
                    <h3>Reserva #${r.IdReserva}</h3>
                    <p><strong>Habitación:</strong> ${r.NombreHabitacion || 'Sin asignar'}</p>
                    <p><strong>Paquete:</strong> ${r.NombrePaquete || 'Sin paquete'}</p>
                    <p><strong>Fechas:</strong> ${r.FechaInicio ? new Date(r.FechaInicio).toLocaleDateString() : '-'} - ${r.FechaFinalizacion ? new Date(r.FechaFinalizacion).toLocaleDateString() : '-'}</p>
                    <p><strong>Total:</strong> ${formatCurrency(r.MontoTotal || 0)}</p>
                    <p><strong>Estado:</strong> ${r.NombreEstadoReserva}</p>
                </div>
                <div class="reservation-actions">
                    <button class="btn btn-outline-primario" onclick="loadReservationDetails(${r.IdReserva})">Ver detalles</button>
                    <button class="btn btn-outline-azul" onclick="abrirEdicion(${r.IdReserva})">Editar</button>
                    <button class="btn btn-outline-peligro" onclick="deleteReservation(${r.IdReserva})">Eliminar</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error cargando reservas', error);
    }
}

async function loadReservationDetails(id) {
    try {
        const response = await fetch(`/api/reservations/${id}`);
        if (!response.ok) return;
        const reservation = await response.json();
        const detailsOverlay = document.getElementById('reservationDetails');
        detailsOverlay.style.display = 'flex';
        const detailsContent = document.getElementById('reservationDetailsContent');
        detailsContent.innerHTML = buildReservationDetails(reservation);
    } catch (error) {
        console.error('Error cargando detalles de la reserva', error);
    }
}

function buildReservationDetails(r) {
    const serviciosHtml = (r.servicios || []).length > 0
        ? `<div class="details-services-grid">${r.servicios.map(s => `
            <div class="detail-service-item">
                <span class="service-name">${s.NombreServicio}</span>
                <span class="service-price">${formatCurrency(s.Costo)}</span>
            </div>
          `).join('')}</div>`
        : '<p style="color: rgba(255,255,255,0.4); margin: 0;">No hay servicios adicionales.</p>';

    return `
        <div class="reservation-details-premium">
            <div class="modal-header">
                <div>
                    <h2 style="margin:0;">Detalles de la Reserva <span style="color:rgba(255,255,255,0.3); font-size: 1rem; font-weight: 400;">#${r.IdReserva}</span></h2>
                    <div class="status-badge status-${r.NombreEstadoReserva.toLowerCase()}">${r.NombreEstadoReserva}</div>
                </div>
                <button class="btn-close" onclick="ocultarDetalles()">×</button>
            </div>

            <div class="nr-layout" style="margin-top: 1.5rem;">
                <!-- Lado Izquierdo: Información -->
                <div class="nr-form">
                    <div class="nr-grid-2">
                        <div class="detail-info-group">
                            <label>Información del Cliente</label>
                            <p><strong>${r.NombreUsuario}</strong></p>
                            <p>Documento: ${r.NroDocumentoCliente || '-'}</p>
                        </div>
                        <div class="detail-info-group">
                            <label>Estadía</label>
                            <p>Inicio: ${r.FechaInicio ? new Date(r.FechaInicio).toLocaleDateString() : '-'}</p>
                            <p>Fin: ${r.FechaFinalizacion ? new Date(r.FechaFinalizacion).toLocaleDateString() : '-'}</p>
                        </div>
                    </div>

                    <div class="nr-card" style="padding: 1.25rem;">
                        <div class="nr-card__titulo">Habitación y Paquete</div>
                        <div class="nr-grid-2">
                            <div>
                                <p style="font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 0.2rem;">Habitación</p>
                                <p style="font-weight: 600;">${r.NombreHabitacion || '-'}</p>
                            </div>
                            <div>
                                <p style="font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 0.2rem;">Paquete</p>
                                <p style="font-weight: 600;">${r.NombrePaquete || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div class="nr-card" style="padding: 1.25rem;">
                        <div class="nr-card__titulo">Servicios Adicionales</div>
                        ${serviciosHtml}
                    </div>
                </div>

                <!-- Lado Derecho: Resumen Financiero -->
                <div class="nr-resumen">
                    <div class="nr-resumen__titulo">Resumen de Pago</div>
                    <div class="nr-resumen__fila">
                        <span>Método de Pago</span>
                        <span>${r.NomMetodoPago}</span>
                    </div>
                    <div class="nr-resumen__fila">
                        <span>Subtotal</span>
                        <span>${formatCurrency(r.SubTotal || 0)}</span>
                    </div>
                    <div class="nr-resumen__fila">
                        <span>Descuento</span>
                        <span>${formatCurrency(r.Descuento || 0)}</span>
                    </div>
                    <div class="nr-resumen__fila">
                        <span>IVA (19%)</span>
                        <span>${formatCurrency(r.IVA || 0)}</span>
                    </div>
                    <div class="nr-resumen__total">
                        <span>Total Pagado</span>
                        <span>${formatCurrency(r.MontoTotal || 0)}</span>
                    </div>
                    
                    <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem;">
                        <button class="btn btn-primario" onclick="abrirEdicion(${r.IdReserva})">Editar Reserva</button>
                        <button class="btn btn-outline" onclick="ocultarDetalles()">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function ocultarDetalles() {
    const details = document.getElementById('reservationDetails');
    details.style.display = 'none';
    document.getElementById('reservationDetailsContent').innerHTML = '';
}

async function abrirEdicion(id) {
    try {
        const response = await fetch(`/api/reservations/${id}`);
        if (!response.ok) return;
        const reservation = await response.json();
        await Promise.all([cargarHabitaciones(), cargarPaquetes(), cargarServicios(), cargarMetodosPagoModal()]);
        populateEditForm(reservation);
        document.getElementById('editModal').style.display = 'flex';
    } catch (error) {
        console.error('Error cargando reserva para editar', error);
    }
}

function populateEditForm(reservation) {
    document.getElementById('editIdReserva').value = reservation.IdReserva;
    document.getElementById('editIDPaquete').value = reservation.IDPaquete || '';
    document.getElementById('editIDHabitacion').value = reservation.IDPaquete ? '' : (reservation.IDHabitacion || '');
    document.getElementById('editFechaInicio').value = reservation.FechaInicio ? reservation.FechaInicio.split('T')[0] : '';
    document.getElementById('editFechaFinalizacion').value = reservation.FechaFinalizacion ? reservation.FechaFinalizacion.split('T')[0] : '';
    document.getElementById('editMetodoPago').value = reservation.MetodoPago || '';
    renderServiciosCheckboxes(reservation.servicios || []);
    updateEditSelectStates();
    calcularTotalEdicion();
}

function updateEditSelectStates() {
    const habitacionSelect = document.getElementById('editIDHabitacion');
    const paqueteSelect = document.getElementById('editIDPaquete');
    const habitacionSelected = habitacionSelect.value !== '';
    const paqueteSelected = paqueteSelect.value !== '';

    if (habitacionSelected) {
        paqueteSelect.disabled = true;
    } else if (paqueteSelected) {
        habitacionSelect.disabled = true;
    } else {
        habitacionSelect.disabled = false;
        paqueteSelect.disabled = false;
    }
}

function renderServiciosCheckboxes(selectedServices = []) {
    const container = document.getElementById('editServiciosContainer');
    container.innerHTML = '';
    const selectedIds = selectedServices.map(s => s.IDServicio);

    serviciosData.forEach(servicio => {
        const div = document.createElement('div');
        div.className = 'servicio-item';
        div.innerHTML = `
            <label class="servicio-label" style="padding: 1rem; gap: 0.75rem;">
                <input type="checkbox" class="edit-servicio-check" value="${servicio.IDServicio}" data-costo="${servicio.Costo}" ${selectedIds.includes(servicio.IDServicio) ? 'checked' : ''} style="width: 18px; height: 18px; margin-top: 2px;">
                <div class="servicio-main">
                    <div class="servicio-header" style="flex-direction: column; align-items: flex-start; gap: 0.1rem;">
                        <span class="servicio-name" style="font-size: 0.9rem; font-weight: 600;">${servicio.NombreServicio}</span>
                        <span class="servicio-price" style="font-size: 0.8rem; color: #00d4ff;">$${servicio.Costo.toLocaleString()}</span>
                    </div>
                </div>
            </label>
        `;
        container.appendChild(div);
    });
}

function calcularTotalEdicion() {
    const habitacionSelect = document.getElementById('editIDHabitacion');
    const paqueteSelect = document.getElementById('editIDPaquete');
    const habitacionCost = parseFloat(habitacionSelect.selectedOptions[0]?.dataset.costo || 0);
    const paquetePrice = parseFloat(paqueteSelect.selectedOptions[0]?.dataset.precio || 0);
    const serviciosSeleccionados = Array.from(document.querySelectorAll('.edit-servicio-check:checked'));
    const totalServicios = serviciosSeleccionados.reduce((sum, s) => sum + parseFloat(s.dataset.costo), 0);
    const subtotal = paquetePrice + habitacionCost + totalServicios;
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    document.getElementById('editSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('editIva').textContent = formatCurrency(iva);
    document.getElementById('editTotal').textContent = formatCurrency(total);
}

async function guardarEdicion() {
    const id = document.getElementById('editIdReserva').value;
    const servicioIds = Array.from(document.querySelectorAll('.edit-servicio-check:checked')).map(el => parseInt(el.value));
    const data = {
        IDHabitacion: parseInt(document.getElementById('editIDHabitacion').value),
        IDPaquete: parseInt(document.getElementById('editIDPaquete').value),
        serviciosAdicionales: servicioIds,
        FechaInicio: document.getElementById('editFechaInicio').value,
        FechaFinalizacion: document.getElementById('editFechaFinalizacion').value,
        MetodoPago: parseInt(document.getElementById('editMetodoPago').value)
    };

    try {
        const response = await fetch(`/api/reservations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            cerrarModal();
            await loadReservations();
            await loadReservationDetails(id);
        } else {
            const error = await response.json();
            alert(error.message || 'Error al actualizar la reserva');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

async function deleteReservation(id) {
    if (!confirm('¿Estás seguro de eliminar esta reserva?')) return;
    try {
        const response = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
        if (response.ok) {
            await loadReservations();
            ocultarDetalles();
        } else {
            alert('Error al eliminar la reserva');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

function cerrarModal() {
    document.getElementById('editModal').style.display = 'none';
}

function handleFormChange(event) {
    if (event.target.matches('#editIDHabitacion')) {
        if (event.target.value !== '') {
            document.getElementById('editIDPaquete').value = '';
        }
        updateEditSelectStates();
        calcularTotalEdicion();
    }
    
    if (event.target.matches('#editIDPaquete')) {
        if (event.target.value !== '') {
            document.getElementById('editIDHabitacion').value = '';
        }
        updateEditSelectStates();
        calcularTotalEdicion();
    }

    if (event.target.matches('.edit-servicio-check')) {
        calcularTotalEdicion();
    }
}

document.getElementById('editReservationForm').addEventListener('change', handleFormChange);

(async function initializePage() {
    await Promise.all([cargarHabitaciones(), cargarPaquetes(), cargarServicios(), cargarMetodosPagoModal()]);
    await loadReservations();
})();