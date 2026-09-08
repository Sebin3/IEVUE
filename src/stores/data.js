import { computed, reactive } from 'vue'

const state = reactive({
  tramites: [
    {
      id: 1,
      dni: '12345678',
      nombre_ciudadano: 'Juan Perez Lopez',
      tipo_tramite: 'Constancia de residencia',
      descripcion_asunto: 'Solicitud de constancia de residencia para trámite bancario',
      prioridad_ia: 'Alta',
      estado: 'Pendiente',
      resolucion_admin: '',
      municipalidad_nombre: 'Municipalidad de Lima',
      fecha_creacion: '2025-08-20T10:30:00',
    },
    {
      id: 2,
      dni: '87654321',
      nombre_ciudadano: 'Maria Garcia Torres',
      tipo_tramite: 'Licencia de funcionamiento',
      descripcion_asunto: 'Renovación de licencia de funcionamiento comercial',
      prioridad_ia: 'Critica',
      estado: 'En Revision',
      resolucion_admin: '',
      municipalidad_nombre: 'Municipalidad de Miraflores',
      fecha_creacion: '2025-08-19T14:15:00',
    },
    {
      id: 3,
      dni: '11223344',
      nombre_ciudadano: 'Carlos Rodriguez Silva',
      tipo_tramite: 'Certificado de candado',
      descripcion_asunto: 'Emisión de certificado para retiro de vehiculo',
      prioridad_ia: 'Baja',
      estado: 'Finalizado',
      resolucion_admin: 'Retiro autorizado con pago de S/. 150.00',
      municipalidad_nombre: 'Municipalidad de San Isidro',
      fecha_creacion: '2025-08-18T09:00:00',
    },
    {
      id: 4,
      dni: '55667788',
      nombre_ciudadano: 'Ana Martinez Vargas',
      tipo_tramite: 'Permiso de construccion',
      descripcion_asunto: 'Solicitud de permiso para ampliacion de vivienda',
      prioridad_ia: 'Media',
      estado: 'Pendiente',
      resolucion_admin: '',
      municipalidad_nombre: 'Municipalidad de Surco',
      fecha_creacion: '2025-08-21T16:45:00',
    },
  ],
  empleados: [
    {
      id: 1,
      username: 'Romero',
      nombres: 'Romero Garcia',
      email: 'romerogarcia@peruanosuizo.edu.pe',
      municipalidad_id: 1,
      municipalidad_nombre: 'Municipalidad de Lima',
      // is_superuser: false,
      is_active: true,
      fecha_registro: '2025-01-15T08:00:00',
    },
    {
      id: 2,
      username: 'Juan',
      nombres: 'Juan Perez Lopez',
      email: 'juanperez@peruanosuizo.edu.pe',
      municipalidad_id: 1,
      municipalidad_nombre: 'Municipalidad de Lima',
      // is_superuser: false,
      is_active: true,
      fecha_registro: '2025-03-10T10:30:00',
    },
    {
      id: 3,
      username: 'Maria',
      nombres: 'Maria Garcia Torres',
      email: 'mariagarcia@peruanosuizo.edu.pe',
      municipalidad_id: 2,
      municipalidad_nombre: 'Municipalidad de Miraflores',
      // is_superuser: false,
      is_active: false,
      fecha_registro: '2025-05-22T14:00:00',
    },
  ],
  municipalidades: [
    { id: 1, nombre: 'Municipalidad de Lima' },
    { id: 2, nombre: 'Municipalidad de Miraflores' },
    { id: 3, nombre: 'Municipalidad de San Isidro' },
    { id: 4, nombre: 'Municipalidad de Surco' },
    { id: 5, nombre: 'Municipalidad de San Borja' },
  ],
  nextTramiteId: 5,
  nextEmpleadoId: 4,
  // index.html mantiene `currentFilters` global + doSearch()/applyFilters()
  // (3698-3741); aqui viven en el store para que los modales los escriban y las
  // tablas reaccionen.
  filters: { prioridad: '', estado: '', month: '', year: '' },
  query: '',
  empQuery: '',
})

// Equivalente a applyFilters() + doSearch() de index.html.
const filteredTramites = computed(() => {
  const f = state.filters
  const q = state.query.toLowerCase().trim()
  return state.tramites.filter((t) => {
    if (f.prioridad && t.prioridad_ia !== f.prioridad) return false
    if (f.estado && t.estado !== f.estado) return false
    const d = new Date(t.fecha_creacion)
    if (f.month && String(d.getMonth() + 1) !== String(f.month)) return false
    if (f.year && String(d.getFullYear()) !== String(f.year)) return false
    if (!q) return true
    return (
      (t.dni && t.dni.includes(q)) ||
      (t.nombre_ciudadano && t.nombre_ciudadano.toLowerCase().includes(q)) ||
      (t.tipo_tramite && t.tipo_tramite.toLowerCase().includes(q)) ||
      (t.municipalidad_nombre && t.municipalidad_nombre.toLowerCase().includes(q))
    )
  })
})

// Equivalente a empSearch() de index.html (5206-5214).
const filteredEmpleados = computed(() => {
  const q = state.empQuery.toLowerCase().trim()
  if (!q) return state.empleados
  return state.empleados.filter(
    (e) =>
      (e.username && e.username.toLowerCase().includes(q)) ||
      (e.nombres && e.nombres.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)),
  )
})

export function useStore() {
  function addTramite(data) {
    const tramite = {
      id: state.nextTramiteId++,
      dni: data.dni || '00000000',
      nombre_ciudadano: data.nombre_ciudadano || 'Ciudadano',
      tipo_tramite: data.tipo_tramite || 'Trámite',
      descripcion_asunto: data.descripcion_asunto || '',
      prioridad_ia: data.prioridad_ia || 'Media',
      estado: data.estado || 'Pendiente',
      resolucion_admin: data.resolucion_admin || '',
      municipalidad_nombre: data.municipalidad_nombre || 'Sin municipalidad',
      fecha_creacion: new Date().toISOString(),
    }
    state.tramites.unshift(tramite)
    return tramite
  }

  function updateTramite(id, data) {
    const idx = state.tramites.findIndex(t => t.id === id)
    if (idx !== -1) {
      Object.assign(state.tramites[idx], data)
    }
  }

  function deleteTramite(id) {
    state.tramites = state.tramites.filter(t => t.id !== id)
  }

  function addEmpleado(data) {
    const emp = {
      id: state.nextEmpleadoId++,
      username: data.username || '',
      nombres: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: data.email || '',
      municipalidad_id: data.municipalidad_id,
      municipalidad_nombre: state.municipalidades.find(m => m.id === data.municipalidad_id)?.nombre || 'Sin asignar',
      is_superuser: data.is_superuser || false,
      is_active: true,
      fecha_registro: new Date().toISOString(),
    }
    state.empleados.unshift(emp)
    return emp
  }

  function updateEmpleado(id, data) {
    const idx = state.empleados.findIndex(e => e.id === id)
    if (idx !== -1) {
      const emp = state.empleados[idx]
      if (data.username) emp.username = data.username
      if (data.first_name || data.last_name) {
        emp.nombres = `${data.first_name || ''} ${data.last_name || ''}`.trim()
      }
      if (data.email) emp.email = data.email
      if (data.municipalidad_id !== undefined) {
        emp.municipalidad_id = data.municipalidad_id
        emp.municipalidad_nombre = state.municipalidades.find(m => m.id === data.municipalidad_id)?.nombre || 'Sin asignar'
      }
      if (data.is_superuser !== undefined) emp.is_superuser = data.is_superuser
    }
  }

  function deleteEmpleado(id) {
    state.empleados = state.empleados.filter(e => e.id !== id)
  }

  function getMunicipalidades() {
    return state.municipalidades
  }

  function setFilter(key, value) {
    if (key in state.filters) state.filters[key] = value
  }

  function setQuery(value) {
    state.query = value
  }

  function setEmpQuery(value) {
    state.empQuery = value
  }

  return {
    state,
    filteredTramites,
    filteredEmpleados,
    addTramite,
    updateTramite,
    deleteTramite,
    addEmpleado,
    updateEmpleado,
    deleteEmpleado,
    getMunicipalidades,
    setFilter,
    setQuery,
    setEmpQuery,
  }
}
