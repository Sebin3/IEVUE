import { computed, reactive } from 'vue'

const state = reactive({
  tramites: [
    {
      id: 1,
      dni: '12345678',
      nombre_ciudadano: 'Juan Perez Lopez',
      tipo_tramite: 'Justificación de inasistencia',
      descripcion_asunto:
        'Se solicita justificar la inasistencia del estudiante por motivos de salud.',
      prioridad_ia: 'Alta',
      estado: 'Pendiente',
      resolucion_admin: '',
      salon_seccion: '1A',
      fecha_creacion: '2025-08-20T10:30:00',
    },
    {
      id: 2,
      dni: '87654321',
      nombre_ciudadano: 'Maria Garcia Torres',
      tipo_tramite: 'Solicitud de permiso para faltar',
      descripcion_asunto:
        'Se solicita permiso para que el estudiante se ausente durante un día.',
      prioridad_ia: 'Critica',
      estado: 'En Revision',
      resolucion_admin: '',
      salon_seccion: '2B',
      fecha_creacion: '2025-08-19T14:15:00',
    },
    {
      id: 3,
      dni: '11223344',
      nombre_ciudadano: 'Carlos Rodriguez Silva',
      tipo_tramite: 'Solicitud de reunión con un profesor',
      descripcion_asunto:
        'Se solicita una reunión con un profesor para tratar un asunto académico.',
      prioridad_ia: 'Baja',
      estado: 'Finalizado',
      resolucion_admin: 'Reunión programada con el profesor para la fecha indicada.',
      salon_seccion: '3C',
      fecha_creacion: '2025-08-18T09:00:00',
    },
    {
      id: 4,
      dni: '55667788',
      nombre_ciudadano: 'Ana Martinez Vargas',
      tipo_tramite: 'Justificación de inasistencia',
      descripcion_asunto:
        'Se solicita justificar la inasistencia del estudiante por una cita médica.',
      prioridad_ia: 'Media',
      estado: 'Pendiente',
      resolucion_admin: '',
      salon_seccion: '1B',
      fecha_creacion: '2025-08-21T16:45:00',
    },
  ],
  empleados: [
    {
      id: 1,
      dni: '74638291',
      nombres: 'Romero Garcia',
      email: 'romerogarcia@peruanosuizo.edu.pe',
      cargo: 'Administrador',
      // is_superuser: false,
      is_active: true,
      fecha_registro: '2025-01-15T08:00:00',
    },
    {
      id: 2,
      dni: '70815426',
      nombres: 'Juan Perez Lopez',
      email: 'juanperez@peruanosuizo.edu.pe',
      cargo: 'Profesor',
      // is_superuser: false,
      is_active: true,
      fecha_registro: '2025-03-10T10:30:00',
    },
    {
      id: 3,
      dni: '76549832',
      nombres: 'Maria Garcia Torres',
      email: 'mariagarcia@peruanosuizo.edu.pe',
      cargo: 'Subdirector',
      // is_superuser: false,
      is_active: false,
      fecha_registro: '2025-05-22T14:00:00',
    },
  ],
  cargos: ['Profesor', 'Administrador', 'Subdirector', 'Director', 'Auxiliar'],
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
      (t.salon_seccion && t.salon_seccion.toLowerCase().includes(q))
    )
  })
})

// Equivalente a empSearch() de index.html (5206-5214).
const filteredEmpleados = computed(() => {
  const q = state.empQuery.toLowerCase().trim()
  if (!q) return state.empleados
  return state.empleados.filter(
    (e) =>
      (e.dni && e.dni.toLowerCase().includes(q)) ||
      (e.nombres && e.nombres.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.cargo && e.cargo.toLowerCase().includes(q)),
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
      salon_seccion: data.salon_seccion || '1A',
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
      dni: data.dni || '',
      nombres: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: data.email || '',
      cargo: data.cargo || 'Profesor',
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
      if (data.dni) emp.dni = data.dni
      if (data.first_name || data.last_name) {
        emp.nombres = `${data.first_name || ''} ${data.last_name || ''}`.trim()
      }
      if (data.email) emp.email = data.email
      if (data.cargo !== undefined) emp.cargo = data.cargo
      if (data.is_superuser !== undefined) emp.is_superuser = data.is_superuser
    }
  }

  function deleteEmpleado(id) {
    state.empleados = state.empleados.filter(e => e.id !== id)
  }

  function getCargos() {
    return state.cargos
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
    getCargos,
    setFilter,
    setQuery,
    setEmpQuery,
  }
}
