// URL de la API. La levanta json-server cuando corres `npm run api`.
const API_URL = 'http://localhost:3000/tickets';

// Estado de la aplicación: la lista de tickets tal como la conoce el navegador.
// La pantalla siempre se dibuja a partir de este arreglo.
let tickets = [];

// Tu código empieza aquí.

const ESTADOS = {
  abierto: {
    etiqueta: 'Abierto',
    clases: 'bg-sky-100 text-sky-800',
    siguiente: 'en_progreso'
  },
  en_progreso: {
    etiqueta: 'En progreso',
    clases: 'bg-amber-100 text-amber-800',
    siguiente: 'resuelto'
  },
  resuelto: {
    etiqueta: 'Resuelto',
    clases: 'bg-emerald-100 text-emerald-800',
    siguiente: null
  }
};

const PRIORIDADES = {
  baja: {
    etiqueta: 'Baja',
    clases: 'bg-slate-100 text-slate-800'
  },
  media: {
    etiqueta: 'Media',
    clases: 'bg-amber-100 text-amber-800'
  },
  alta: {
    etiqueta: 'Alta',
    clases: 'bg-red-100 text-red-800'
  }
};


let idEditando = null;

const formulario = document.getElementById('form-ticket');
const tituloFormulario = document.getElementById('titulo-formulario');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');

const titulo = document.getElementById('titulo');
const descripcion = document.getElementById('descripcion');
const solicitante = document.getElementById('solicitante');
const categoria = document.getElementById('categoria');
const prioridad = document.getElementById('prioridad');

const errorTitulo = document.getElementById('error-titulo');
const errorSolicitante = document.getElementById('error-solicitante');

const listaTickets = document.getElementById('lista-tickets');
const mensaje = document.getElementById('mensaje');
const resumen = document.getElementById('resumen');

const filtroEstado = document.getElementById('filtro-estado');
const busqueda = document.getElementById('busqueda');


async function cargarTickets() {
  mensaje.textContent = 'Cargando tickets...';

  try {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
      throw new Error('No se pudieron cargar los tickets.');
    }

    tickets = await respuesta.json();

    pintarTickets();
  } catch (error) {
    listaTickets.innerHTML = '';
    mensaje.textContent =
      'No se pudieron cargar los tickets. Comprueba que la API esté funcionando e inténtalo de nuevo.';
  }
}


function pintarTickets() {
  listaTickets.innerHTML = '';

  actualizarResumen();

  const estadoElegido = filtroEstado.value;
  const textoBusqueda = busqueda.value.toLowerCase();

  const ticketsFiltrados = tickets.filter(ticket => {
    const coincideEstado =
      estadoElegido === 'todos' || ticket.estado === estadoElegido;

    const coincideBusqueda =
      ticket.titulo.toLowerCase().includes(textoBusqueda);

    return coincideEstado && coincideBusqueda;
  });

  if (ticketsFiltrados.length === 0) {
    if (tickets.length === 0) {
      mensaje.textContent =
        'No hay tickets todavía. ¡Crea el primero!';
    } else {
      mensaje.textContent =
        'No hay tickets que coincidan con los filtros.';
    }

    return;
  }

  mensaje.textContent = '';

  ticketsFiltrados.forEach(ticket => {
    mostrarTicket(ticket);
  });
}


function mostrarTicket(ticket) {
  const estado = ESTADOS[ticket.estado];
  const prioridadTicket = PRIORIDADES[ticket.prioridad];

  const tarjeta = document.createElement('article');

  if (ticket.estado === 'resuelto') {
    tarjeta.className =
      'rounded-lg border border-slate-200 bg-slate-100 p-4 opacity-70';
  } else {
    tarjeta.className =
      'rounded-lg border border-slate-200 bg-white p-4 shadow-sm';
  }

  const tituloTicket = document.createElement('h3');
  tituloTicket.className = 'text-lg font-semibold';
  tituloTicket.textContent =
    `#${ticket.id} - ${ticket.titulo}`;

  const descripcionTicket = document.createElement('p');
  descripcionTicket.className = 'mt-2 text-sm text-slate-600';
  descripcionTicket.textContent = ticket.descripcion;

  const solicitanteTicket = document.createElement('p');
  solicitanteTicket.className = 'mt-3 text-sm';
  solicitanteTicket.textContent =
    `Solicitante: ${ticket.solicitante}`;

  const categoriaTicket = document.createElement('p');
  categoriaTicket.className = 'text-sm';
  categoriaTicket.textContent =
    `Categoría: ${ticket.categoria}`;

  const prioridadTicketTexto = document.createElement('p');
  prioridadTicketTexto.className = 'mt-2 text-sm';

  const prioridadSpan = document.createElement('span');
  prioridadSpan.className =
    `rounded px-2 py-1 ${prioridadTicket.clases}`;
  prioridadSpan.textContent =
    `Prioridad: ${prioridadTicket.etiqueta}`;

  prioridadTicketTexto.appendChild(prioridadSpan);

  const estadoTicketTexto = document.createElement('p');
  estadoTicketTexto.className = 'mt-2 text-sm';

  const estadoSpan = document.createElement('span');
  estadoSpan.className =
    `rounded px-2 py-1 ${estado.clases}`;
  estadoSpan.textContent =
    `Estado: ${estado.etiqueta}`;

  estadoTicketTexto.appendChild(estadoSpan);

  tarjeta.appendChild(tituloTicket);
  tarjeta.appendChild(descripcionTicket);
  tarjeta.appendChild(solicitanteTicket);
  tarjeta.appendChild(categoriaTicket);
  tarjeta.appendChild(prioridadTicketTexto);
  tarjeta.appendChild(estadoTicketTexto);


  // Botón para cambiar el estado
  if (ticket.estado !== 'resuelto') {
    const btnEstado = document.createElement('button');

    if (ticket.estado === 'abierto') {
      btnEstado.textContent = 'Empezar';
    } else {
      btnEstado.textContent = 'Marcar resuelto';
    }

    btnEstado.className =
      'mt-4 mr-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700';

    btnEstado.addEventListener('click', () => {
      cambiarEstado(ticket);
    });

    tarjeta.appendChild(btnEstado);
  }


  // Botón Editar
  const btnEditar = document.createElement('button');

  btnEditar.textContent = 'Editar';

  btnEditar.className =
    'mt-4 mr-2 rounded bg-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-700';

  btnEditar.addEventListener('click', () => {
    editarTicket(ticket);
  });

  tarjeta.appendChild(btnEditar);


  // Botón Eliminar
  const btnEliminar = document.createElement('button');

  btnEliminar.textContent = 'Eliminar';

  btnEliminar.className =
    'mt-4 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700';

  btnEliminar.addEventListener('click', () => {
    eliminarTicket(ticket);
  });

  tarjeta.appendChild(btnEliminar);


  listaTickets.appendChild(tarjeta);
}


async function cambiarEstado(ticket) {
  const nuevoEstado = ESTADOS[ticket.estado].siguiente;

  try {
    const respuesta = await fetch(`${API_URL}/${ticket.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estado: nuevoEstado
      })
    });

    if (!respuesta.ok) {
      throw new Error('No se pudo cambiar el estado.');
    }

    const ticketActualizado = await respuesta.json();

    const posicion = tickets.findIndex(
      ticket => ticket.id === ticketActualizado.id
    );

    tickets[posicion] = ticketActualizado;

    pintarTickets();
  } catch (error) {
    mensaje.textContent =
      'No se pudo cambiar el estado del ticket.';
  }
}


function editarTicket(ticket) {
  idEditando = ticket.id;

  titulo.value = ticket.titulo;
  descripcion.value = ticket.descripcion;
  solicitante.value = ticket.solicitante;
  categoria.value = ticket.categoria;
  prioridad.value = ticket.prioridad;

  tituloFormulario.textContent =
    `Editar ticket #${ticket.id}`;

  btnGuardar.textContent = 'Guardar cambios';

  btnCancelar.hidden = false;

  errorTitulo.textContent = '';
  errorSolicitante.textContent = '';

  titulo.focus();
}


function cancelarEdicion() {
  idEditando = null;

  formulario.reset();

  tituloFormulario.textContent = 'Nuevo ticket';

  btnGuardar.textContent = 'Crear ticket';

  btnCancelar.hidden = true;

  errorTitulo.textContent = '';
  errorSolicitante.textContent = '';
}


async function guardarTicket(event) {
  event.preventDefault();

  errorTitulo.textContent = '';
  errorSolicitante.textContent = '';

  let formularioValido = true;

  if (titulo.value.trim().length < 5) {
    errorTitulo.textContent =
      'El título debe tener al menos 5 caracteres.';
    formularioValido = false;
  }

  if (solicitante.value.trim() === '') {
    errorSolicitante.textContent =
      'El solicitante es obligatorio.';
    formularioValido = false;
  }

  if (!formularioValido) {
    return;
  }


  // Crear ticket
  if (idEditando === null) {
    const nuevoTicket = {
      titulo: titulo.value.trim(),
      descripcion: descripcion.value.trim(),
      solicitante: solicitante.value.trim(),
      categoria: categoria.value,
      prioridad: prioridad.value,
      estado: 'abierto'
    };

    try {
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoTicket)
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo crear el ticket.');
      }

      const ticketCreado = await respuesta.json();

      tickets.push(ticketCreado);

      formulario.reset();

      pintarTickets();
    } catch (error) {
      mensaje.textContent =
        'No se pudo crear el ticket. Inténtalo de nuevo.';
    }

    return;
  }


  // Editar ticket
  const ticketActual = tickets.find(
    ticket => ticket.id === idEditando
  );

  const ticketEditado = {
    id: ticketActual.id,
    titulo: titulo.value.trim(),
    descripcion: descripcion.value.trim(),
    solicitante: solicitante.value.trim(),
    categoria: categoria.value,
    prioridad: prioridad.value,
    estado: ticketActual.estado
  };

  try {
    const respuesta = await fetch(
      `${API_URL}/${idEditando}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketEditado)
      }
    );

    if (!respuesta.ok) {
      throw new Error('No se pudo editar el ticket.');
    }

    const ticketActualizado = await respuesta.json();

    const posicion = tickets.findIndex(
      ticket => ticket.id === ticketActualizado.id
    );

    tickets[posicion] = ticketActualizado;

    cancelarEdicion();

    pintarTickets();
  } catch (error) {
    mensaje.textContent =
      'No se pudo editar el ticket. Inténtalo de nuevo.';
  }
}


async function eliminarTicket(ticket) {
  const confirmar = confirm(
    `¿Seguro que quieres eliminar el ticket #${ticket.id}?`
  );

  if (!confirmar) {
    return;
  }

  try {
    const respuesta = await fetch(
      `${API_URL}/${ticket.id}`,
      {
        method: 'DELETE'
      }
    );

    if (!respuesta.ok) {
      throw new Error('No se pudo eliminar el ticket.');
    }

    tickets = tickets.filter(
      ticketActual => ticketActual.id !== ticket.id
    );

    if (idEditando === ticket.id) {
      cancelarEdicion();
    }

    pintarTickets();
  } catch (error) {
    mensaje.textContent =
      'No se pudo eliminar el ticket. Inténtalo de nuevo.';
  }
}


function actualizarResumen() {
  const cantidades = tickets.reduce((contador, ticket) => {
    contador[ticket.estado]++;
    return contador;
  }, {
    abierto: 0,
    en_progreso: 0,
    resuelto: 0
  });

  const altasSinResolver = tickets.filter(ticket => {
    return ticket.prioridad === 'alta' &&
      ticket.estado !== 'resuelto';
  }).length;

  resumen.textContent =
    `Abiertos: ${cantidades.abierto} | ` +
    `En progreso: ${cantidades.en_progreso} | ` +
    `Resueltos: ${cantidades.resuelto} | ` +
    `Prioridad alta sin resolver: ${altasSinResolver}`;
}


filtroEstado.addEventListener('change', pintarTickets);

busqueda.addEventListener('input', pintarTickets);

formulario.addEventListener('submit', guardarTicket);

btnCancelar.addEventListener('click', cancelarEdicion);

cargarTickets();
