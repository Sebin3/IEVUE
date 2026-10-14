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
      fecha_creacion: '2026-08-20T10:30:00',
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
      fecha_creacion: '2026-08-19T14:15:00',
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
      fecha_creacion: '2026-08-18T09:00:00',
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
      fecha_creacion: '2026-08-21T16:45:00',
    },
    {
      id: 5,
      dni: '66778899',
      nombre_ciudadano: 'Lucia Fernandez Rojas',
      tipo_tramite: 'Solicitud de reunión con un profesor',
      descripcion_asunto:
        'Se solicita coordinar una reunión para revisar el avance académico del estudiante.',
      prioridad_ia: 'Media',
      estado: 'Pendiente',
      resolucion_admin: '',
      salon_seccion: '1A',
      fecha_creacion: '2026-08-24T08:00:00',
    },
    {
      id: 6,
      dni: '77889900',
      nombre_ciudadano: 'Diego Ramirez Flores',
      tipo_tramite: 'Justificación de inasistencia',
      descripcion_asunto:
        'Se solicita justificar la inasistencia registrada durante la jornada escolar.',
      prioridad_ia: 'Alta',
      estado: 'En Revision',
      resolucion_admin: '',
      salon_seccion: '3A',
      fecha_creacion: '2026-08-24T09:30:00',
    },
    {
      id: 7,
      dni: '88990011',
      nombre_ciudadano: 'Camila Vargas Huaman',
      tipo_tramite: 'Solicitud de permiso para faltar',
      descripcion_asunto:
        'Se solicita autorización para ausentarse de clases durante una fecha determinada.',
      prioridad_ia: 'Baja',
      estado: 'Finalizado',
      resolucion_admin: 'Permiso aprobado por la coordinación académica.',
      salon_seccion: '3B',
      fecha_creacion: '2026-08-24T11:00:00',
    },
    {
      id: 8,
      dni: '99001122',
      nombre_ciudadano: 'Mateo Sanchez Castillo',
      tipo_tramite: 'Solicitud de reunión con un profesor',
      descripcion_asunto:
        'Se solicita una reunión para tratar asuntos relacionados con el rendimiento escolar.',
      prioridad_ia: 'Critica',
      estado: 'Pendiente',
      resolucion_admin: '',
      salon_seccion: '2A',
      fecha_creacion: '2026-08-24T13:00:00',
    },
    {
      id: 9,
      dni: '10112233',
      nombre_ciudadano: 'Valeria Torres Mendoza',
      tipo_tramite: 'Justificación de inasistencia',
      descripcion_asunto:
        'Se presenta la justificación de una inasistencia por motivos familiares.',
      prioridad_ia: 'Media',
      estado: 'Rechazado',
      resolucion_admin: 'La documentación presentada no permite validar la solicitud.',
      salon_seccion: '2B',
      fecha_creacion: '2026-08-25T10:15:00',
    },
    {
      id: 10,
      dni: '11223344',
      nombre_ciudadano: 'Andrea Quispe Salazar',
      tipo_tramite: 'Solicitud de permiso para faltar',
      descripcion_asunto:
        'Se solicita permiso para faltar a clases por una cita previamente programada.',
      prioridad_ia: 'Alta',
      estado: 'En Revision',
      resolucion_admin: '',
      salon_seccion: '4B',
      fecha_creacion: '2026-08-26T14:30:00',
    },
    {
      id: 11,
      dni: '22334455',
      nombre_ciudadano: 'Sebastian Morales Diaz',
      tipo_tramite: 'Justificación de inasistencia',
      descripcion_asunto:
        'Se solicita registrar la justificación correspondiente a una ausencia escolar.',
      prioridad_ia: 'Baja',
      estado: 'Finalizado',
      resolucion_admin: 'Justificación registrada y aprobada.',
      salon_seccion: '4A',
      fecha_creacion: '2026-08-27T08:45:00',
    },
    {
      id: 12,
      dni: '33445566',
      nombre_ciudadano: 'Lucia Fernandez Rojas',
      tipo_tramite: 'Solicitud de permiso para faltar',
      descripcion_asunto:
        'Se solicita autorización para ausentarse durante una actividad familiar.',
      prioridad_ia: 'Media',
      estado: 'Pendiente',
      resolucion_admin: '',
      salon_seccion: '1B',
      fecha_creacion: '2026-08-28T15:15:00',
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
  estudiantes: [
    {
      codigo_alumno: 1,
      dni: '74638291',
      telefono: '987654321',
      nombres: 'Juan Perez Lopez',
      correo_institucional: 'juanperez@peruanosuizo.edu.pe',
      salon_seccion: '1A',
      estado: 'Activo',
    },
    {
      codigo_alumno: 2,
      dni: '70841526',
      telefono: '986543210',
      nombres: 'Lucia Fernandez Rojas',
      correo_institucional: 'luciafernandez@peruanosuizo.edu.pe',
      salon_seccion: '1B',
      estado: 'Activo',
    },
    {
      codigo_alumno: 3,
      dni: '76293014',
      telefono: '985432109',
      nombres: 'Mateo Sanchez Castillo',
      correo_institucional: 'mateosanchez@peruanosuizo.edu.pe',
      salon_seccion: '2A',
      estado: 'Activo',
    },
    {
      codigo_alumno: 4,
      dni: '71964830',
      telefono: '984321098',
      nombres: 'Valeria Torres Mendoza',
      correo_institucional: 'valeriatorres@peruanosuizo.edu.pe',
      salon_seccion: '2B',
      estado: 'Activo',
    },
    {
      codigo_alumno: 5,
      dni: '78421569',
      telefono: '983210987',
      nombres: 'Diego Ramirez Flores',
      correo_institucional: 'diegoramirez@peruanosuizo.edu.pe',
      salon_seccion: '3A',
      estado: 'Inactivo',
    },
    {
      codigo_alumno: 6,
      dni: '73590148',
      telefono: '982109876',
      nombres: 'Camila Vargas Huaman',
      correo_institucional: 'camilavargas@peruanosuizo.edu.pe',
      salon_seccion: '3B',
      estado: 'Activo',
    },
    {
      codigo_alumno: 7,
      dni: '79632410',
      telefono: '981098765',
      nombres: 'Sebastian Morales Diaz',
      correo_institucional: 'sebastianmorales@peruanosuizo.edu.pe',
      salon_seccion: '4A',
      estado: 'Activo',
    },
    {
      codigo_alumno: 8,
      dni: '72158643',
      telefono: '980987654',
      nombres: 'Andrea Quispe Salazar',
      correo_institucional: 'andreaquispe@peruanosuizo.edu.pe',
      salon_seccion: '4B',
      estado: 'Inactivo',
    },
    {
      codigo_alumno: 9,
      dni: '76843025',
      telefono: '979876543',
      nombres: 'Nicolas Paredes Leon',
      correo_institucional: 'nicolasparedes@peruanosuizo.edu.pe',
      salon_seccion: '5A',
      estado: 'Activo',
    },
    {
      codigo_alumno: 10,
      dni: '71420986',
      telefono: '978765432',
      nombres: 'Daniela Castro Medina',
      correo_institucional: 'danielacastro@peruanosuizo.edu.pe',
      salon_seccion: '5B',
      estado: 'Activo',
    },
    {
      codigo_alumno: 11,
      dni: '75381642',
      telefono: '977654321',
      nombres: 'Gabriel Ortiz Campos',
      correo_institucional: 'gabrielortiz@peruanosuizo.edu.pe',
      salon_seccion: '1A',
      estado: 'Activo',
    },
  ],
  cargos: ['Profesor', 'Administrador', 'Subdirector', 'Director', 'Auxiliar'],
  nextTramiteId: 5,
  nextEmpleadoId: 4,
  nextCodigoAlumno: 12,
  filters: { prioridad: '', estado: '', month: '', year: '' },
  studentFilters: { estado: '', salon: '' },
  query: '',
  empQuery: '',
  studentQuery: '',
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

const filteredEstudiantes = computed(() => {
  const f = state.studentFilters
  const q = state.studentQuery.toLowerCase().trim()
  return state.estudiantes.filter((student) => {
    if (f.estado && student.estado !== f.estado) return false
    if (f.salon && student.salon_seccion !== f.salon) return false
    if (!q) return true
    return (
      (student.codigo_alumno && String(student.codigo_alumno).includes(q)) ||
      (student.dni && student.dni.toLowerCase().includes(q)) ||
      (student.nombres && student.nombres.toLowerCase().includes(q)) ||
      (student.correo_institucional && student.correo_institucional.toLowerCase().includes(q)) ||
      (student.salon_seccion && student.salon_seccion.toLowerCase().includes(q))
    )
  })
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

  function addEstudiante(data) {
    const student = {
      codigo_alumno: state.nextCodigoAlumno++,
      dni: data.dni || '',
      telefono: data.telefono || '',
      nombres: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      correo_institucional: data.correo_institucional || '',
      salon_seccion: data.salon_seccion || '1A',
      estado: data.estado || 'Activo',
    }
    state.estudiantes.unshift(student)
    return student
  }

  function updateEstudiante(codigoAlumno, data) {
    const idx = state.estudiantes.findIndex(
      (student) => student.codigo_alumno === codigoAlumno,
    )
    if (idx !== -1) Object.assign(state.estudiantes[idx], data)
  }

  function deleteEstudiante(codigoAlumno) {
    state.estudiantes = state.estudiantes.filter(
      (student) => student.codigo_alumno !== codigoAlumno,
    )
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

  function setStudentQuery(value) {
    state.studentQuery = value
  }

  function setStudentFilter(key, value) {
    if (key in state.studentFilters) state.studentFilters[key] = value
  }

  return {
    state,
    filteredTramites,
    filteredEmpleados,
    filteredEstudiantes,
    addTramite,
    updateTramite,
    deleteTramite,
    addEmpleado,
    updateEmpleado,
    deleteEmpleado,
    addEstudiante,
    updateEstudiante,
    deleteEstudiante,
    getCargos,
    setFilter,
    setQuery,
    setEmpQuery,
    setStudentQuery,
    setStudentFilter,
  }
}
