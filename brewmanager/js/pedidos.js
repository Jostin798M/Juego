var _pedidosCache = [];
var _clientesSelect = [];
var _productosSelect = [];
var productosEnPedido = [];

// ===== BADGE ESTADO =====
function obtenerBadgeEstadoPedido(estado) {
  var mapa = {
    "pendiente": "badge-pendiente",
    "en preparación": "badge-preparacion",
    "entregado": "badge-entregado",
    "cancelado": "badge-cancelado"
  };
  return mapa[estado] || "badge-pendiente";
}

// ===== RENDER TABLA =====
function renderTablaPedidos(lista) {
  var datos = lista || _pedidosCache;
  var tbody = document.getElementById("tbody-pedidos");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No hay pedidos registrados.</td></tr>';
    return;
  }

  datos.forEach(function(p) {
    var origen = p.cliente_nombre || (p.mesa ? "Mesa " + p.mesa : "—");
    var badgeClase = obtenerBadgeEstadoPedido(p.estado);

    tbody.innerHTML += '<tr>' +
      '<td>#' + p.id + '</td>' +
      '<td>' + origen + '</td>' +
      '<td>$' + parseFloat(p.total).toFixed(2) + '</td>' +
      '<td><span class="badge ' + badgeClase + '">' + p.estado + '</span></td>' +
      '<td>' + (p.fecha ? p.fecha.slice(0, 10) : "—") + '</td>' +
      '<td>' +
        '<a href="pedido-detalle.html?id=' + p.id + '" class="btn btn-sm btn-info me-1">Ver</a>' +
        '<button class="btn btn-sm btn-brew-secondary" onclick="cambiarEstadoPedido(' + p.id + ')">Cambiar Estado</button>' +
      '</td>' +
    '</tr>';
  });
}

// ===== CARGAR TABLA DESDE API =====
function cargarTablaPedidos() {
  apiGet("/pedidos/").then(function(data) {
    _pedidosCache = data;
    renderTablaPedidos();
  }).catch(function() {
    var tbody = document.getElementById("tbody-pedidos");
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-3">Error al conectar con el servidor.</td></tr>';
  });
}

// ===== CAMBIAR ESTADO DESDE TABLA =====
function cambiarEstadoPedido(id) {
  var pedido = _pedidosCache.find(function(p) { return p.id === id; });
  if (!pedido) return;

  if (pedido.estado === "entregado" || pedido.estado === "cancelado") {
    alert('El pedido ya está en estado "' + pedido.estado + '" y no puede modificarse.');
    return;
  }

  var flujo = ["pendiente", "en preparación", "entregado"];
  var idx = flujo.indexOf(pedido.estado);
  var siguiente = idx < flujo.length - 1 ? flujo[idx + 1] : pedido.estado;

  var opcion = prompt(
    'Estado actual: "' + pedido.estado + '"\nNuevo estado:\n1 - ' + siguiente + '\n2 - cancelado\n\nEscriba 1 o 2:'
  );
  if (!opcion) return;

  var nuevoEstado = opcion === "1" ? siguiente : opcion === "2" ? "cancelado" : null;
  if (!nuevoEstado) return;

  apiPatch("/pedidos/" + id + "/cambiar-estado/", { estado: nuevoEstado }).then(function(resp) {
    pedido.estado = resp.estado;
    renderTablaPedidos();
  }).catch(function(e) { alert("Error: " + JSON.stringify(e)); });
}

// ===== CARGAR DETALLE =====
function cargarDetallePedido() {
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  apiGet("/pedidos/" + id + "/").then(function(p) {
    var set = function(elId, val) { var el = document.getElementById(elId); if (el) el.textContent = val; };
    var origen = p.cliente_nombre || (p.mesa ? "Mesa " + p.mesa : "—");
    set("det-origen", origen);
    set("det-fecha", p.fecha ? p.fecha.slice(0, 10) : "—");
    set("det-total", "$" + parseFloat(p.total).toFixed(2));

    var badgeEl = document.getElementById("det-estado");
    if (badgeEl) {
      badgeEl.className = "badge " + obtenerBadgeEstadoPedido(p.estado) + " fs-6";
      badgeEl.textContent = p.estado;
    }

    var listaEl = document.getElementById("det-productos");
    if (listaEl) {
      listaEl.innerHTML = "";
      (p.detalles || []).forEach(function(d) {
        listaEl.innerHTML +=
          '<li class="list-group-item d-flex justify-content-between align-items-center">' +
            '<span>' + d.producto_nombre + ' <span class="text-muted">x' + d.cantidad + '</span></span>' +
            '<span class="fw-bold">$' + parseFloat(d.subtotal).toFixed(2) + '</span>' +
          '</li>';
      });
    }

    var btnEstado = document.getElementById("btn-estado-pedido");
    if (btnEstado) {
      if (p.estado === "entregado" || p.estado === "cancelado") {
        btnEstado.disabled = true;
        btnEstado.textContent = "Sin cambios disponibles";
      } else {
        btnEstado.onclick = function() {
          var flujo = ["pendiente", "en preparación", "entregado"];
          var idx = flujo.indexOf(p.estado);
          var siguiente = idx < flujo.length - 1 ? flujo[idx + 1] : p.estado;
          var opcion = prompt('Estado actual: "' + p.estado + '"\n1 - ' + siguiente + '\n2 - cancelado\n\nEscriba 1 o 2:');
          if (!opcion) return;
          var nuevoEstado = opcion === "1" ? siguiente : opcion === "2" ? "cancelado" : null;
          if (!nuevoEstado) return;
          apiPatch("/pedidos/" + p.id + "/cambiar-estado/", { estado: nuevoEstado }).then(function() {
            cargarDetallePedido();
          });
        };
      }
    }
  }).catch(function() {
    var cont = document.getElementById("contenido-pedido");
    if (cont) cont.innerHTML = '<div class="alert alert-danger">Pedido no encontrado o error de conexión.</div>';
  });
}

// ===== FORMULARIO DE PEDIDO =====
function calcularTotal(lista) {
  var total = lista.reduce(function(acc, i) { return acc + i.precio * i.cantidad; }, 0);
  var el = document.getElementById("total-pedido");
  if (el) el.textContent = "$" + total.toFixed(2);
  return total;
}

function renderListaProductosPedido() {
  var listaEl = document.getElementById("lista-productos-pedido");
  if (!listaEl) return;
  if (productosEnPedido.length === 0) {
    listaEl.innerHTML = '<p class="text-muted small">No ha agregado productos.</p>';
    return;
  }
  listaEl.innerHTML = "";
  productosEnPedido.forEach(function(item, idx) {
    listaEl.innerHTML +=
      '<div class="producto-item d-flex justify-content-between align-items-center">' +
        '<span>' + item.nombre + ' x' + item.cantidad + '</span>' +
        '<span><strong>$' + (item.precio * item.cantidad).toFixed(2) + '</strong> ' +
          '<button class="btn btn-sm btn-danger ms-2" onclick="quitarProducto(' + idx + ')">×</button>' +
        '</span>' +
      '</div>';
  });
}

function quitarProducto(idx) {
  productosEnPedido.splice(idx, 1);
  renderListaProductosPedido();
  calcularTotal(productosEnPedido);
}

function agregarProductoAPedido() {
  var selectEl = document.getElementById("f-producto");
  var cantidadEl = document.getElementById("f-cantidad");
  if (!selectEl || !cantidadEl) return;

  var idProd = parseInt(selectEl.value);
  var cantidad = parseInt(cantidadEl.value);

  if (!idProd) { alert("Seleccione un producto."); return; }
  if (!cantidad || cantidad < 1) { alert("Ingrese una cantidad válida."); return; }

  var producto = _productosSelect.find(function(p) { return p.id === idProd; });
  if (!producto) return;

  var existente = productosEnPedido.find(function(p) { return p.id === idProd; });
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    productosEnPedido.push({ id: producto.id, nombre: producto.nombre, precio: parseFloat(producto.precio), cantidad: cantidad });
  }

  renderListaProductosPedido();
  calcularTotal(productosEnPedido);
  cantidadEl.value = 1;
}

// Llena los selects del formulario de pedido desde la API
function iniciarFormPedido() {
  apiGet("/clientes/?estado=activo").then(function(data) {
    _clientesSelect = data;
    var sel = document.getElementById("f-cliente");
    if (!sel) return;
    data.forEach(function(c) {
      var opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.nombres + " " + c.apellidos;
      sel.appendChild(opt);
    });
  });

  apiGet("/productos/?disponible=true").then(function(data) {
    _productosSelect = data;
    var sel = document.getElementById("f-producto");
    if (!sel) return;
    data.forEach(function(p) {
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nombre + " — $" + parseFloat(p.precio).toFixed(2);
      sel.appendChild(opt);
    });
  });
}

function guardarPedido(event) {
  event.preventDefault();

  var tipo = document.getElementById("f-tipo") ? document.getElementById("f-tipo").value : "";
  if (!tipo) { alert("Seleccione si el pedido es para un cliente o una mesa."); return; }

  var clienteId = null, mesa = null;
  if (tipo === "cliente") {
    clienteId = document.getElementById("f-cliente").value;
    if (!clienteId) { alert("Seleccione un cliente."); return; }
  } else {
    mesa = document.getElementById("f-mesa").value.trim();
    if (!mesa) { alert("Ingrese el número de mesa."); return; }
  }

  if (productosEnPedido.length === 0) { alert("Agregue al menos un producto."); return; }

  var datos = {
    detalles: productosEnPedido.map(function(p) { return { producto: p.id, cantidad: p.cantidad }; })
  };
  if (clienteId) datos.cliente = parseInt(clienteId);
  if (mesa) datos.mesa = parseInt(mesa);

  apiPost("/pedidos/", datos).then(function() {
    alert("Pedido registrado correctamente.");
    window.location.href = "pedidos.html";
  }).catch(function(err) {
    alert("Error al guardar el pedido: " + JSON.stringify(err));
  });
}
