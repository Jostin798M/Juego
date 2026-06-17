/**
 * pedidos.js — Módulo de gestión de pedidos
 * Funciones: renderTabla, cambiarEstado, calcularTotal
 * Depende de: datos.js (arrays globales `pedidos`, `clientes`, `productos`)
 */

// ===== RENDER TABLA DE PEDIDOS =====
/**
 * Renderiza la tabla de pedidos en el DOM.
 * @param {Array} lista - Array de pedidos a mostrar (por defecto todos)
 */
function renderTablaPedidos(lista) {
  var datos = lista || pedidos;
  var tbody = document.getElementById("tbody-pedidos");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No hay pedidos registrados.</td></tr>';
    return;
  }

  datos.forEach(function(p) {
    // Determinar quién hizo el pedido (cliente o mesa)
    var origen = p.cliente ? p.cliente : "Mesa " + p.mesa;

    // Clase del badge según estado
    var badgeClase = obtenerBadgeEstadoPedido(p.estado);

    var fila = '<tr>' +
      '<td>#' + p.id + '</td>' +
      '<td>' + origen + '</td>' +
      '<td>$' + p.total.toFixed(2) + '</td>' +
      '<td><span class="badge ' + badgeClase + '">' + p.estado + '</span></td>' +
      '<td>' + p.fecha + '</td>' +
      '<td>' +
        '<a href="pedido-detalle.html?id=' + p.id + '" class="btn btn-sm btn-info me-1">Ver</a>' +
        '<button class="btn btn-sm btn-brew-secondary" onclick="cambiarEstadoPedido(' + p.id + ')">Cambiar Estado</button>' +
      '</td>' +
    '</tr>';

    tbody.innerHTML += fila;
  });
}

// ===== OBTENER CLASE BADGE SEGÚN ESTADO =====
/**
 * Retorna la clase CSS del badge según el estado del pedido.
 * @param {string} estado
 * @returns {string} clase CSS
 */
function obtenerBadgeEstadoPedido(estado) {
  var mapa = {
    "pendiente": "badge-pendiente",
    "en preparación": "badge-preparacion",
    "entregado": "badge-entregado",
    "cancelado": "badge-cancelado"
  };
  return mapa[estado] || "badge-pendiente";
}

// ===== CAMBIAR ESTADO DE PEDIDO =====
/**
 * Cambia el estado de un pedido por su id.
 * Ciclo de estados: pendiente → en preparación → entregado
 * También permite cancelar.
 * @param {number} id - ID del pedido
 */
function cambiarEstadoPedido(id) {
  var pedido = pedidos.find(function(p) { return p.id === id; });

  if (!pedido) {
    alert("Pedido no encontrado.");
    return;
  }

  // Definir estados posibles y el siguiente
  var flujo = ["pendiente", "en preparación", "entregado"];
  var indexActual = flujo.indexOf(pedido.estado);
  var siguienteEstado = indexActual < flujo.length - 1 ? flujo[indexActual + 1] : pedido.estado;

  // Si ya está entregado o cancelado, no cambiar
  if (pedido.estado === "entregado" || pedido.estado === "cancelado") {
    alert('El pedido ya está en estado "' + pedido.estado + '" y no puede modificarse.');
    return;
  }

  var opcion = prompt(
    'Estado actual: "' + pedido.estado + '"\n' +
    'Ingrese el nuevo estado:\n' +
    '1 - ' + (siguienteEstado) + '\n' +
    '2 - cancelado\n\n' +
    'Escriba 1 o 2:'
  );

  if (opcion === "1") {
    pedido.estado = siguienteEstado;
    guardarStorage('pedidos');
    alert('Estado cambiado a "' + siguienteEstado + '".');
    renderTablaPedidos();
  } else if (opcion === "2") {
    pedido.estado = "cancelado";
    guardarStorage("pedidos");
    alert('Pedido cancelado.');
    renderTablaPedidos();
  }
  // Si cancela el prompt, no hacer nada
}

// ===== CALCULAR TOTAL DEL PEDIDO =====
/**
 * Calcula el total de un pedido sumando precio * cantidad de cada producto.
 * Actualiza el elemento con id "total-pedido" en el DOM.
 * @param {Array} productosSeleccionados - Array de {precio, cantidad}
 * @returns {number} total calculado
 */
function calcularTotal(productosSeleccionados) {
  var total = 0;
  productosSeleccionados.forEach(function(item) {
    total += item.precio * item.cantidad;
  });

  // Actualizar en el DOM si existe el elemento
  var totalEl = document.getElementById("total-pedido");
  if (totalEl) totalEl.textContent = "$" + total.toFixed(2);

  return total;
}

// ===== CARGAR DETALLE DE PEDIDO =====
/**
 * Carga el detalle de un pedido en la vista cliente-detalle según ?id= en la URL.
 */
function cargarDetallePedido() {
  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get("id"));

  var pedido = pedidos.find(function(p) { return p.id === id; });

  if (!pedido) {
    document.getElementById("contenido-pedido").innerHTML =
      '<div class="alert alert-danger">Pedido no encontrado.</div>';
    return;
  }

  // Llenar datos generales
  var setTexto = function(elId, valor) {
    var el = document.getElementById(elId);
    if (el) el.textContent = valor;
  };

  var origen = pedido.cliente ? pedido.cliente : "Mesa " + pedido.mesa;
  setTexto("det-origen", origen);
  setTexto("det-fecha", pedido.fecha);
  setTexto("det-total", "$" + pedido.total.toFixed(2));

  // Badge de estado
  var badgeEl = document.getElementById("det-estado");
  if (badgeEl) {
    badgeEl.className = "badge " + obtenerBadgeEstadoPedido(pedido.estado) + " fs-6";
    badgeEl.textContent = pedido.estado;
  }

  // Lista de productos
  var listaEl = document.getElementById("det-productos");
  if (listaEl) {
    listaEl.innerHTML = "";
    pedido.productos.forEach(function(prod) {
      var subtotal = prod.precio * prod.cantidad;
      listaEl.innerHTML +=
        '<li class="list-group-item d-flex justify-content-between align-items-center">' +
          '<span>' + prod.nombre + ' <span class="text-muted">x' + prod.cantidad + '</span></span>' +
          '<span class="fw-bold">$' + subtotal.toFixed(2) + '</span>' +
        '</li>';
    });
  }

  // Botón cambiar estado
  var btnEstado = document.getElementById("btn-estado-pedido");
  if (btnEstado) {
    if (pedido.estado === "entregado" || pedido.estado === "cancelado") {
      btnEstado.disabled = true;
      btnEstado.textContent = "Sin cambios disponibles";
    } else {
      btnEstado.onclick = function() {
        cambiarEstadoPedido(pedido.id);
        cargarDetallePedido();
      };
    }
  }
}

// ===== MÓDULO FORMULARIO DE PEDIDO =====
// Array temporal de productos seleccionados en el formulario
var productosEnPedido = [];

/**
 * Agrega un producto al pedido actual desde el formulario.
 */
function agregarProductoAPedido() {
  var selectEl = document.getElementById("f-producto");
  var cantidadEl = document.getElementById("f-cantidad");

  if (!selectEl || !cantidadEl) return;

  var idProd = parseInt(selectEl.value);
  var cantidad = parseInt(cantidadEl.value);

  if (!idProd) {
    alert("Seleccione un producto.");
    return;
  }
  if (!cantidad || cantidad < 1) {
    alert("Ingrese una cantidad válida.");
    return;
  }

  // Buscar el producto en los datos globales
  var producto = productos.find(function(p) { return p.id === idProd; });
  if (!producto) return;

  // Si ya está en la lista, aumentar cantidad
  var existente = productosEnPedido.find(function(p) { return p.id === idProd; });
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    productosEnPedido.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cantidad
    });
  }

  // Re-render lista y total
  renderListaProductosPedido();
  calcularTotal(productosEnPedido);
  cantidadEl.value = 1;
}

/**
 * Renderiza la lista de productos agregados al pedido en el formulario.
 */
function renderListaProductosPedido() {
  var listaEl = document.getElementById("lista-productos-pedido");
  if (!listaEl) return;

  listaEl.innerHTML = "";

  if (productosEnPedido.length === 0) {
    listaEl.innerHTML = '<p class="text-muted small">No ha agregado productos.</p>';
    return;
  }

  productosEnPedido.forEach(function(item, idx) {
    listaEl.innerHTML +=
      '<div class="producto-item d-flex justify-content-between align-items-center">' +
        '<span>' + item.nombre + ' x' + item.cantidad + '</span>' +
        '<span>' +
          '<strong>$' + (item.precio * item.cantidad).toFixed(2) + '</strong> ' +
          '<button class="btn btn-sm btn-danger ms-2" onclick="quitarProducto(' + idx + ')">×</button>' +
        '</span>' +
      '</div>';
  });
}

/**
 * Quita un producto de la lista del pedido por índice.
 * @param {number} idx - índice en el array productosEnPedido
 */
function quitarProducto(idx) {
  productosEnPedido.splice(idx, 1);
  renderListaProductosPedido();
  calcularTotal(productosEnPedido);
}

/**
 * Valida y "guarda" (simula) el pedido.
 */
function guardarPedido(event) {
  event.preventDefault();

  var tipoEl = document.getElementById("f-tipo");
  var clienteEl = document.getElementById("f-cliente");
  var mesaEl = document.getElementById("f-mesa");

  // Validar que se seleccionó cliente o mesa
  var tipo = tipoEl ? tipoEl.value : "";
  if (!tipo) {
    alert("Seleccione si el pedido es para un cliente o una mesa.");
    return;
  }

  if (tipo === "cliente" && clienteEl && !clienteEl.value) {
    alert("Seleccione un cliente.");
    return;
  }
  if (tipo === "mesa" && mesaEl && !mesaEl.value.trim()) {
    alert("Ingrese el número de mesa.");
    return;
  }

  if (productosEnPedido.length === 0) {
    alert("Agregue al menos un producto al pedido.");
    return;
  }

  var totalNuevo = calcularTotal(productosEnPedido);
  var tipo = document.getElementById("f-tipo").value;
  var clienteEl = document.getElementById("f-cliente");
  var mesaEl = document.getElementById("f-mesa");
  var nombreCliente = null;
  if (tipo === "cliente" && clienteEl.value) {
    nombreCliente = clienteEl.options[clienteEl.selectedIndex].text;
  }
  var nuevoPedido = {
    id: pedidos.length ? Math.max.apply(null, pedidos.map(function(p){return p.id;})) + 1 : 1,
    cliente: nombreCliente,
    mesa: tipo === "mesa" ? parseInt(mesaEl.value) : null,
    productos: productosEnPedido.slice(),
    total: totalNuevo,
    estado: "pendiente",
    fecha: new Date().toLocaleString("es-EC")
  };
  pedidos.push(nuevoPedido);
  guardarStorage("pedidos");
  alert("Pedido registrado correctamente. Total: $" + totalNuevo.toFixed(2));
  window.location.href = "pedidos.html";
}
