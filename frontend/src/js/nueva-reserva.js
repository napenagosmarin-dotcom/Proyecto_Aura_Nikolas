// Verificar sesión
const userData = localStorage.getItem('user');
if (!userData) window.location.href = '/src/pages/login.html';
const user = JSON.parse(userData);

// Set user name and logout after components are loaded
document.addEventListener('DOMContentLoaded', () => {
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

// Data global
let habitacionesData = [];
let paquetesData = [];
let serviciosData = [];
let allReservations = [];
let fpStart = null;
let fpEnd = null;

function getDisabledDatesForRoom(roomId) {
    if (!roomId) return [];
    const blockedRanges = getRoomBlockedRanges(roomId);
    const disabledDates = [];
    blockedRanges.forEach(range => {
        const startDate = new Date(range.start);
        const endDate = new Date(range.end);
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            disabledDates.push(formatDateForInput(currentDate.toISOString()));
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });
    return disabledDates;
}

function updateDatePickerRestrictions() {
    const roomId = getSelectedRoomId();
    const disabledDates = getDisabledDatesForRoom(roomId);
    const today = getTodayInputValue();
    if (fpStart) { fpStart.set('disable', disabledDates); fpStart.set('minDate', today); }
    if (fpEnd)   { fpEnd.set('disable', disabledDates);   fpEnd.set('minDate', today); }
}

async function cargarHabitaciones() {
    const response = await fetch('/api/habitaciones');
    habitacionesData = await response.json();
    const select = document.getElementById('IDHabitacion');
    habitacionesData.forEach(h => {
        const option = document.createElement('option');
        option.value = h.IDHabitacion;
        option.textContent = `${h.NombreHabitacion} - $${h.Costo.toLocaleString()}`;
        option.dataset.costo = h.Costo;
        select.appendChild(option);
    });
}

async function cargarPaquetes(selectedRoomId = null) {
    const response = await fetch('/api/paquetes');
    paquetesData = await response.json();
    populatePaquetes(selectedRoomId);
}

function populatePaquetes(selectedRoomId = null, isDisabled = false) {
    const select = document.getElementById('IDPaquete');
    select.innerHTML = '<option value="">Seleccione un paquete</option>';
    const filteredPaquetes = selectedRoomId
        ? paquetesData.filter(p => String(p.IDHabitacion) === String(selectedRoomId))
        : paquetesData;
    filteredPaquetes.forEach(p => {
        const option = document.createElement('option');
        option.value = p.IDPaquete;
        option.textContent = `${p.NombrePaquete} - $${p.Precio.toLocaleString()}`;
        option.dataset.precio = p.Precio;
        option.disabled = isDisabled;
        select.appendChild(option);
    });
    if (selectedRoomId && filteredPaquetes.length === 0) {
        select.innerHTML += '<option value="">No hay paquetes disponibles</option>';
    }
    select.disabled = isDisabled;
}

function updateSelectStates() {
    const habitacionSelect = document.getElementById('IDHabitacion');
    const paqueteSelect = document.getElementById('IDPaquete');
    const habitacionSelected = habitacionSelect.value !== '';
    const paqueteSelected = paqueteSelect.value !== '';
    if (habitacionSelected) {
        populatePaquetes(habitacionSelect.value, true);
    } else if (paqueteSelected) {
        habitacionSelect.disabled = true;
        habitacionSelect.querySelectorAll('option:not([value=""])').forEach(opt => opt.disabled = true);
    } else {
        habitacionSelect.disabled = false;
        habitacionSelect.querySelectorAll('option:not([value=""])').forEach(opt => opt.disabled = false);
        paqueteSelect.disabled = false;
        paqueteSelect.querySelectorAll('option:not([value=""])').forEach(opt => opt.disabled = false);
    }
}

async function cargarServicios() {
    const response = await fetch('/api/servicios');
    const servicios = await response.json();
    serviciosData = servicios;
    const container = document.getElementById('serviciosContainer');
    container.innerHTML = '';
    servicios.forEach(s => {
        const div = document.createElement('div');
        div.className = 'servicio-item';
        div.dataset.servicioId = s.IDServicio;
        div.innerHTML = `
            <label class="servicio-label">
                <div class="servicio-control">
                    <input type="checkbox" class="servicio-check" value="${s.IDServicio}" data-costo="${s.Costo}">
                </div>
                <div class="servicio-main">
                    <div class="servicio-header">
                        <span class="servicio-name">${s.NombreServicio}</span>
                        <span class="servicio-price">$${s.Costo.toLocaleString()}</span>
                    </div>
                </div>
            </label>
            <div class="servicio-tooltip">
                <p class="servicio-desc">${s.Descripcion || 'Servicio premium para mejorar tu experiencia.'}</p>
                <div class="servicio-meta">
                    ${s.MaxPersonas ? `<span>Máx. personas: ${s.MaxPersonas}</span>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function toggleServicioDetails(servicioId, isActive) {
    const item = document.querySelector(`.servicio-item[data-servicio-id="${servicioId}"]`);
    if (!item) return;
    item.classList.toggle('active', isActive);
}

async function cargarMetodosPago() {
    const response = await fetch('/api/metodopago');
    const metodos = await response.json();
    const select = document.getElementById('MetodoPago');
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

async function cargarAllReservations() {
    const response = await fetch('/api/reservations');
    if (!response.ok) { allReservations = []; return; }
    allReservations = await response.json();
}

function getTodayInputValue() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
}

function getTomorrowInputValue() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
}

function formatDateForInput(value) {
    if (!value) return '';
    return value.split('T')[0];
}

function getSelectedRoomId() {
    const habitacionSelect = document.getElementById('IDHabitacion');
    const paqueteSelect = document.getElementById('IDPaquete');
    if (habitacionSelect.value !== '') return habitacionSelect.value;
    if (paqueteSelect.value !== '') {
        const paquete = paquetesData.find(p => String(p.IDPaquete) === String(paqueteSelect.value));
        return paquete ? paquete.IDHabitacion : null;
    }
    return null;
}

function getRoomBlockedRanges(roomId) {
    if (!roomId) return [];
    return allReservations
        .filter(r => String(r.IDHabitacion) === String(roomId) && r.FechaInicio && r.FechaFinalizacion)
        .map(r => ({ start: formatDateForInput(r.FechaInicio), end: formatDateForInput(r.FechaFinalizacion) }));
}

function isRangeOverlapping(start, end, range) {
    return !(end < range.start || start > range.end);
}

function updateDateLimits() {
    const today = getTodayInputValue();
    document.getElementById('FechaInicio').min = today;
    document.getElementById('FechaFinalizacion').min = today;
}

function updateAvailabilityMessage() {
    const roomId = getSelectedRoomId();
    const messageEl = document.getElementById('dateAvailabilityMessage');
    const blockedRanges = getRoomBlockedRanges(roomId);
    if (!roomId) {
        messageEl.textContent = 'Selecciona una habitación o paquete para ver las fechas ocupadas.';
        return;
    }
    if (blockedRanges.length === 0) {
        messageEl.textContent = 'La habitación está libre excepto en fechas anteriores a hoy.';
        return;
    }
    messageEl.innerHTML = `Fechas ocupadas: ${blockedRanges.map(r => `${r.start} a ${r.end}`).join('; ')}`;
}

function validateDateSelection() {
    const roomId = getSelectedRoomId();
    const startInput = document.getElementById('FechaInicio');
    const endInput = document.getElementById('FechaFinalizacion');
    const startValue = startInput.value;
    const endValue = endInput.value;
    const today = getTodayInputValue();
    const blockedRanges = getRoomBlockedRanges(roomId);
    let startError = '';
    let endError = '';
    if (startValue && startValue < today) startError = 'La fecha de inicio no puede ser anterior a hoy.';
    if (endValue && endValue < today) endError = 'La fecha de finalización no puede ser anterior a hoy.';
    if (startValue && endValue && endValue < startValue) endError = 'La fecha de finalización debe ser igual o posterior a la fecha de inicio.';
    if (roomId && startValue && blockedRanges.some(r => isRangeOverlapping(startValue, startValue, r))) startError = 'La fecha de inicio está ocupada para esta habitación.';
    if (roomId && endValue && blockedRanges.some(r => isRangeOverlapping(endValue, endValue, r))) endError = 'La fecha de finalización está ocupada para esta habitación.';
    if (roomId && startValue && endValue && blockedRanges.some(r => isRangeOverlapping(startValue, endValue, r))) {
        startError = 'El rango de fechas no está disponible para esta habitación.';
        endError = 'El rango de fechas no está disponible para esta habitación.';
    }
    startInput.setCustomValidity(startError);
    endInput.setCustomValidity(endError);
    startInput.reportValidity();
    endInput.reportValidity();
    return !startInput.validationMessage && !endInput.validationMessage;
}

function mostrarDetalleHabitacion(id) {
    const card = document.getElementById('detalleHabitacion');
    if (!id) { card.style.display = 'none'; return; }
    const h = habitacionesData.find(h => h.IDHabitacion == id);
    if (!h) return;
    const iconos = {
        'Cabaña Simple':   ['🌲 Vista al bosque', '🛏️ Cama individual', '🪵 Decoración rústica', '👤 Ideal para 1 persona'],
        'Cabaña Doble':    ['🌹 Ambiente romántico', '🛏️ Cama doble', '🪵 Decoración rústica', '👥 Ideal para 2 personas'],
        'Cabaña Familiar': ['🌿 Rodeada de naturaleza', '🛏️ Múltiples camas', '🪵 Amplio espacio', '👨‍👩‍👧‍👦 Hasta 4 personas'],
        'Domo Glamping':   ['⭐ Duerme bajo las estrellas', '🔭 Techo transparente', '🛏️ Cama queen', '💫 Experiencia única'],
        'Tienda de Lujo':  ['🏔️ Vista panorámica', '👑 Cama king size', '✨ Acabados de lujo', '🌄 Amanecer espectacular']
    };
    const detalles = iconos[h.NombreHabitacion] || ['🏠 Alojamiento confortable', '🌿 Contacto con la naturaleza'];
    card.innerHTML = `
        <h4>${h.NombreHabitacion}</h4>
        <p>${h.Descripcion}</p>
        ${detalles.map(d => `<p><span class="icon">✓</span> ${d}</p>`).join('')}
        <span class="precio-tag">$${h.Costo.toLocaleString()} / noche</span>
    `;
    card.style.display = 'block';
}

function mostrarDetallePaquete(id) {
    const card = document.getElementById('detallePaquete');
    if (!id) { card.style.display = 'none'; return; }
    const p = paquetesData.find(p => p.IDPaquete == id);
    if (!p) return;
    const incluidos = {
        'Paquete Romántico':  ['🛁 Jacuzzi privado', '💆 Masaje relajante', '🍾 Decoración especial', '🌹 Detalles románticos'],
        'Paquete Aventura':   ['🐴 Cabalgata guiada', '🥾 Caminata ecológica', '🗺️ Guía experto', '🌿 Tour por la naturaleza'],
        'Paquete Familiar':   ['🍳 Desayuno campestre', '🔥 Fogata nocturna', '🎮 Actividades grupales', '👨‍👩‍👧‍👦 Espacio para todos'],
        'Paquete Estrellas':  ['🔥 Fogata nocturna', '🍳 Desayuno incluido', '⭐ Observación de estrellas', '🌙 Experiencia nocturna'],
        'Paquete Relax':      ['💆 Masaje completo', '🛁 Jacuzzi privado', '🧘 Zona de spa', '🌿 Desconexión total']
    };
    const items = incluidos[p.NombrePaquete] || ['✨ Experiencia glamping', '🌿 Contacto con naturaleza'];
    card.innerHTML = `
        <h4>${p.NombrePaquete}</h4>
        <p>${p.Descripcion}</p>
        ${items.map(i => `<p><span class="icon">✓</span> ${i}</p>`).join('')}
        <p><span class="icon">✓</span> 🏠 ${p.NombreHabitacion}</p>
        <span class="precio-tag">$${p.Precio.toLocaleString()}</span>
    `;
    card.style.display = 'block';
}

function calcularTotal() {
    const precioPaquete = parseFloat(document.getElementById('IDPaquete').selectedOptions[0]?.dataset.precio || 0);
    const costoHabitacion = parseFloat(document.getElementById('IDHabitacion').selectedOptions[0]?.dataset.costo || 0);
    const totalServicios = Array.from(document.querySelectorAll('.servicio-check:checked'))
        .reduce((sum, s) => sum + parseFloat(s.dataset.costo), 0);
    const subtotal = precioPaquete + costoHabitacion + totalServicios;
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    document.getElementById('subtotal').textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById('iva').textContent = `$${iva.toLocaleString()}`;
    document.getElementById('total').textContent = `$${total.toLocaleString()}`;
}

// Eventos
const habitacionInput = document.getElementById('IDHabitacion');
const paqueteInput = document.getElementById('IDPaquete');
const fechaInicioInput = document.getElementById('FechaInicio');
const fechaFinalizacionInput = document.getElementById('FechaFinalizacion');

habitacionInput.addEventListener('change', (e) => {
    if (e.target.value !== '') { paqueteInput.value = ''; mostrarDetallePaquete(''); }
    mostrarDetalleHabitacion(e.target.value);
    populatePaquetes(e.target.value);
    calcularTotal();
    updateAvailabilityMessage();
    validateDateSelection();
    updateSelectStates();
    updateDatePickerRestrictions();
});

paqueteInput.addEventListener('change', (e) => {
    if (e.target.value !== '') { habitacionInput.value = ''; mostrarDetalleHabitacion(''); }
    mostrarDetallePaquete(e.target.value);
    calcularTotal();
    updateAvailabilityMessage();
    validateDateSelection();
    updateSelectStates();
    updateDatePickerRestrictions();
});

fechaInicioInput.addEventListener('change', () => {
    fechaFinalizacionInput.min = fechaInicioInput.value || getTodayInputValue();
    updateAvailabilityMessage();
    validateDateSelection();
});

fechaFinalizacionInput.addEventListener('change', () => { validateDateSelection(); });

document.addEventListener('change', (e) => {
    if (e.target.classList.contains('servicio-check')) {
        toggleServicioDetails(e.target.value, e.target.checked);
        calcularTotal();
    }
});

// Enviar formulario
document.getElementById('reservationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateDateSelection()) return;

    const habitacionVal = document.getElementById('IDHabitacion').value;
    const paqueteVal = document.getElementById('IDPaquete').value;
    const metodoPagoVal = document.getElementById('MetodoPago').value;
    const serviciosSeleccionados = Array.from(document.querySelectorAll('.servicio-check:checked')).map(s => parseInt(s.value));

    const data = {
        IDHabitacion: habitacionVal ? parseInt(habitacionVal) : null,
        IDPaquete: paqueteVal ? parseInt(paqueteVal) : null,
        serviciosAdicionales: serviciosSeleccionados,
        FechaInicio: document.getElementById('FechaInicio').value,
        FechaFinalizacion: document.getElementById('FechaFinalizacion').value,
        MetodoPago: metodoPagoVal ? parseInt(metodoPagoVal) : null,
        UsuarioIdusuario: user.IDUsuario
    };

    try {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert('Reserva creada exitosamente');
            window.location.href = '/src/pages/reservas.html';
        } else {
            const error = await response.json();
            alert(error.message || 'Error al crear la reserva');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});

// Inicializar
(async function initializePage() {
    await Promise.all([cargarHabitaciones(), cargarPaquetes(), cargarServicios(), cargarMetodosPago(), cargarAllReservations()]);
    updateDateLimits();
    updateAvailabilityMessage();
    updateSelectStates();

    const today = getTodayInputValue();
    const tomorrow = getTomorrowInputValue();
    document.getElementById('FechaInicio').value = today;
    document.getElementById('FechaFinalizacion').value = tomorrow;

    fpStart = flatpickr('#FechaInicio', {
        minDate: today,
        disable: [],
        dateFormat: 'Y-m-d',
        defaultDate: today,
        onChange: function(selectedDates) {
            if (selectedDates.length > 0) {
                const startDateStr = formatDateForInput(selectedDates[0].toISOString());
                if (fpEnd) fpEnd.set('minDate', startDateStr);
                validateDateSelection();
            }
        }
    });

    fpEnd = flatpickr('#FechaFinalizacion', {
        minDate: today,
        disable: [],
        dateFormat: 'Y-m-d',
        defaultDate: tomorrow,
        onChange: function() { validateDateSelection(); }
    });

    calcularTotal();
})();