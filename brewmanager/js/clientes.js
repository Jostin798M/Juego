/**
 * clientes.js — Módulo de gestión de clientes
 * Funciones: renderTabla, buscarCliente, cambiarEstado, cargarDetalle
 * Depende de: datos.js (array global `clientes`)
 */

// ===== RENDER TABLA DE CLIENTES =====
/**
 * Renderiza la tabla de clientes en el DOM.
 * @param {Array} lista - Array de clientes a mostrar (por defecto todos)
 */
function renderTablaClientes(lista) {
  // Si no se pasa lista, usar todos los clientes
  var datos = lista || clientes;
  var tbody = document.getElementById("tbody-clientes");

  if (!tbody) return; // Seguridad: si no existe el elemento, salir

  // Limpiar contenido anterior
  tbody.innerHTML = "";

  // Si no hay datos, mostrar mensaje
  if (datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-3">No se encontraron clientes.</td></tr>';
    return;
  }

  // Construir filas de la tabla
  datos.forEach(function(c) {
    var badgeClase = c.estado === "activo" ? "badge-activo" : "badge-inactivo";
    var estadoTexto = c.estado.charAt(0).toUpperCase() + c.estado.slice(1);

    var fila = '<tr>' +
      '<td>' + c.id + '</td>' +
      '<td>' + c.nombres + '</td>' +
      '<td>' + c.apellidos + '</td>' +
      '<td>' + c.identificacion + '</td>' +
      '<td>' + (c.telefono || '—') + '</td>' +
      '<td>' + c.celular + '</td>' +
      '<td>' + c.correo + '</td>' +
      '<td>' + c.estadoCivil + '</td>' +
      '<td><span class="badge ' + badgeClase + '">' + estadoTexto + '</span></td>' +
      '<td>' +
        '<a href="cliente-detalle.html?id=' + c.id + '" class="btn btn-sm btn-info me-1" title="Ver detalle">Ver</a>' +
        '<a href="cliente-form.html?id=' + c.id + '" class="btn btn-sm btn-warning me-1" title="Editar">Editar</a>' +
        '<button class="btn btn-sm ' + (c.estado === "activo" ? "btn-danger" : "btn-success") + '" onclick="cambiarEstadoCliente(' + c.id + ')" title="Cambiar estado">' +
          (c.estado === "activo" ? "Desactivar" : "Activar") +
        '</button>' +
      '</td>' +
    '</tr>';

    tbody.innerHTML += fila;
  });
}

// ===== BUSCAR CLIENTE =====
/**
 * Filtra la tabla de clientes según el texto del buscador.
 * Busca en: nombres, apellidos, identificacion
 */
function buscarCliente() {
  var texto = document.getElementById("buscador-cliente").value.toLowerCase().trim();

  // Filtrar el array global de clientes
  var resultados = clientes.filter(function(c) {
    return (
      c.nombres.toLowerCase().includes(texto) ||
      c.apellidos.toLowerCase().includes(texto) ||
      c.identificacion.toLowerCase().includes(texto)
    );
  });

  // Re-renderizar la tabla con los resultados
  renderTablaClientes(resultados);
}

// ===== CAMBIAR ESTADO DE CLIENTE =====
/**
 * Cambia el estado (activo/inactivo) de un cliente por su id.
 * @param {number} id - ID del cliente
 */
function cambiarEstadoCliente(id) {
  // Buscar el cliente en el array
  var cliente = clientes.find(function(c) { return c.id === id; });

  if (!cliente) {
    alert("Cliente no encontrado.");
    return;
  }

  // Confirmar la acción con el usuario
  var nuevoEstado = cliente.estado === "activo" ? "inactivo" : "activo";
  var confirmado = confirm(
    '¿Desea cambiar el estado de "' + cliente.nombres + ' ' + cliente.apellidos +
    '" a ' + nuevoEstado + '?'
  );

  if (confirmado) {
    // Actualizar en el array (en memoria)
    cliente.estado = nuevoEstado;
    guardarStorage('clientes');
    alert('Estado actualizado a "' + nuevoEstado + '" correctamente.');
    // Re-renderizar la tabla
    renderTablaClientes();
  }
}

// ===== CARGAR DETALLE DE CLIENTE =====
/**
 * Carga los datos de un cliente (por query param ?id=) en la vista de detalle.
 */
function cargarDetalleCliente() {
  // Obtener id desde la URL
  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get("id"));

  var cliente = clientes.find(function(c) { return c.id === id; });

  if (!cliente) {
    document.getElementById("contenido-detalle").innerHTML =
      '<div class="alert alert-danger">Cliente no encontrado.</div>';
    return;
  }

  // Llenar los campos del detalle
  var campos = {
    "det-nombres": cliente.nombres,
    "det-apellidos": cliente.apellidos,
    "det-identificacion": cliente.identificacion,
    "det-telefono": cliente.telefono || "—",
    "det-celular": cliente.celular,
    "det-correo": cliente.correo,
    "det-direccion": cliente.direccion || "—",
    "det-estadoCivil": cliente.estadoCivil,
    "det-fecha": cliente.fecha_registro
  };

  for (var campo in campos) {
    var el = document.getElementById(campo);
    if (el) el.textContent = campos[campo];
  }

  // Badge de estado
  var badgeEl = document.getElementById("det-estado");
  if (badgeEl) {
    var badgeClase = cliente.estado === "activo" ? "badge-activo" : "badge-inactivo";
    badgeEl.className = "badge " + badgeClase + " fs-6";
    badgeEl.textContent = cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1);
  }

  // Botón editar
  var btnEditar = document.getElementById("btn-editar-cliente");
  if (btnEditar) btnEditar.href = "cliente-form.html?id=" + cliente.id;

  // Botón cambiar estado
  var btnEstado = document.getElementById("btn-estado-cliente");
  if (btnEstado) {
    btnEstado.textContent = cliente.estado === "activo" ? "Desactivar" : "Activar";
    btnEstado.className = "btn " + (cliente.estado === "activo" ? "btn-danger" : "btn-success");
    btnEstado.onclick = function() { cambiarEstadoCliente(cliente.id); cargarDetalleCliente(); };
  }
}

// ===== CARGAR FORMULARIO DE CLIENTE (edición) =====
/**
 * Si hay ?id= en la URL, carga los datos del cliente en el formulario (modo edición).
 */
function cargarFormCliente() {
  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get("id"));

  if (!id) return; // Modo creación, no cargar datos

  var cliente = clientes.find(function(c) { return c.id === id; });
  if (!cliente) return;

  // Cambiar título
  var titulo = document.getElementById("form-titulo");
  if (titulo) titulo.textContent = "Editar Cliente";

  // Llenar campos del formulario
  var mapCampos = {
    "f-nombres": cliente.nombres,
    "f-apellidos": cliente.apellidos,
    "f-identificacion": cliente.identificacion,
    "f-telefono": cliente.telefono,
    "f-celular": cliente.celular,
    "f-correo": cliente.correo,
    "f-direccion": cliente.direccion,
    "f-estadoCivil": cliente.estadoCivil,
    "f-estado": cliente.estado
  };

  for (var campo in mapCampos) {
    var el = document.getElementById(campo);
    if (el) el.value = mapCampos[campo];
  }
}

// ===== GUARDAR CLIENTE (validación y simulación) =====
/**
 * Valida el formulario y "guarda" (simula) el cliente.
 */
function guardarCliente(event) {
  event.preventDefault();
  var valido = true;

  // Campos obligatorios y sus mensajes de error
  var obligatorios = ["f-nombres", "f-apellidos", "f-identificacion", "f-celular", "f-correo", "f-estadoCivil", "f-estado"];

  obligatorios.forEach(function(id) {
    var campo = document.getElementById(id);
    var error = document.getElementById(id + "-error");
    if (!campo.value.trim()) {
      if (error) { error.style.display = "block"; }
      campo.classList.add("is-invalid");
      valido = false;
    } else {
      if (error) { error.style.display = "none"; }
      campo.classList.remove("is-invalid");
    }
  });

  // Validar formato de correo
  var correoEl = document.getElementById("f-correo");
  var correoError = document.getElementById("f-correo-error");
  if (correoEl && correoEl.value.trim()) {
    var regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correoEl.value.trim())) {
      correoError.textContent = "Ingrese un correo electrónico válido.";
      correoError.style.display = "block";
      correoEl.classList.add("is-invalid");
      valido = false;
    }
  }

  if (valido) {
    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get("id"));

    var datos = {
      nombres:      document.getElementById("f-nombres").value.trim(),
      apellidos:    document.getElementById("f-apellidos").value.trim(),
      identificacion: document.getElementById("f-identificacion").value.trim(),
      telefono:     document.getElementById("f-telefono").value.trim(),
      celular:      document.getElementById("f-celular").value.trim(),
      correo:       document.getElementById("f-correo").value.trim(),
      direccion:    document.getElementById("f-direccion") ? document.getElementById("f-direccion").value.trim() : "",
      estadoCivil:  document.getElementById("f-estadoCivil").value,
      estado:       document.getElementById("f-estado").value,
      fecha_registro: new Date().toISOString().slice(0, 10)
    };

    if (id) {
      // Edición: actualizar el objeto existente
      var idx = clientes.findIndex(function(c) { return c.id === id; });
      if (idx !== -1) {
        datos.id = id;
        datos.fecha_registro = clientes[idx].fecha_registro;
        clientes[idx] = datos;
      }
    } else {
      // Creación: asignar nuevo ID
      var maxId = clientes.reduce(function(m, c) { return c.id > m ? c.id : m; }, 0);
      datos.id = maxId + 1;
      clientes.push(datos);
    }

    guardarStorage("clientes");
    alert("Cliente guardado correctamente.");
    window.location.href = "clientes.html";
  }
}
