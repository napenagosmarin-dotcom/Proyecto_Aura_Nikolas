// URL base del backend
const API_URL = 'http://localhost:3001';

// ===== HABITACIONES =====
const habitacionesAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/habitaciones`);
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/api/habitaciones/${id}`);
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_URL}/api/habitaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/habitaciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/habitaciones/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

// ===== PAQUETES =====
const paquetesAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/paquetes`);
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/api/paquetes/${id}`);
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_URL}/api/paquetes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/paquetes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/paquetes/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

// ===== SERVICIOS =====
const serviciosAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/servicios`);
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_URL}/api/servicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/servicios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/servicios/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

// ===== CLIENTES =====
const clientesAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/clientes`);
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/api/clientes/${id}`);
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_URL}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateEstado: async (id, data) => {
    const res = await fetch(`${API_URL}/api/clientes/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/clientes/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

// ===== CABAÑAS =====
const cabanasAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/cabanas`);
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/api/cabanas/${id}`);
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_URL}/api/cabanas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/cabanas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateEstado: async (id, data) => {
    const res = await fetch(`${API_URL}/api/cabanas/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/cabanas/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

// ===== RESERVAS =====
const reservasAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/reservas`);
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/api/reservas/${id}`);
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_URL}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/reservas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/reservas/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};