// ===== MÓDULO CLIENTE PÚBLICO =====

// ===== CARTA / MENÚ =====
function renderCartaCliente() {
  var contenedor = document.getElementById("carta-contenido");
  if (!contenedor) return;

  var categorias = [];
  productos.forEach(function(p) {
    if (categorias.indexOf(p.categoria) === -1) categorias.push(p.categoria);
  });

  contenedor.innerHTML = "";
  categorias.forEach(function(cat) {
    var items = productos.filter(function(p) { return p.categoria === cat && p.disponible; });
    if (items.length === 0) return;

    var cards = items.map(function(p) {
      return '<div class="col-12 col-sm-6">' +
        '<div class="card h-100 p-3 carta-item" onclick="seleccionarProducto(' + p.id + ', this)">' +
          '<div class="d-flex justify-content-between align-items-start">' +
            '<div>' +
              '<h6 class="mb-1" style="color:var(--cafe-oscuro)">' + p.nombre + '</h6>' +
              '<p class="text-muted small mb-0">' + (p.descripcion || '') + '</p>' +
            '</div>' +
            '<div class="text-end ms-3">' +
              '<div class="fw-bold text-success fs-5">$' + p.precio.toFixed(2) + '</div>' +
              '<div class="mt-1">' +
                '<button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation();cambiarCantidadCarta(' + p.id + ',-1)">−</button>' +
                '<span class="mx-2 fw-bold" id="cant-' + p.id + '">0</span>' +
                '<button class="btn btn-sm btn-brew-primary" onclick="event.stopPropagation();cambiarCantidadCarta(' + p.id + ',1)">+</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    contenedor.innerHTML +=
      '<h5 class="section-title mt-4"><i class="bi bi-tag me-2"></i>' + cat + '</h5>' +
      '<div class="row g-3">' + cards + '</div>';
  });
}

var pedidoCliente = {};

function cambiarCantidadCarta(idProd, delta) {
  var actual = pedidoCliente[idProd] || 0;
  var nuevo = Math.max(0, actual + delta);
  pedidoCliente[idProd] = nuevo;
  var el = document.getElementById("cant-" + idProd);
  if (el) el.textContent = nuevo;
  actualizarResumenCliente();
}

function actualizarResumenCliente() {
  var total = 0;
  var items = 0;
  Object.keys(pedidoCliente).forEach(function(id) {
    var cant = pedidoCliente[id];
    if (cant > 0) {
      var prod = productos.find(function(p) { return p.id === parseInt(id); });
      if (prod) { total += prod.precio * cant; items += cant; }
    }
  });
  var elTotal = document.getElementById("cliente-total");
  var elItems = document.getElementById("cliente-items");
  var btnConfirmar = document.getElementById("btn-confirmar-pedido");
  if (elTotal) elTotal.textContent = "$" + total.toFixed(2);
  if (elItems) elItems.textContent = items + " producto(s)";
  if (btnConfirmar) btnConfirmar.disabled = items === 0;
}

function confirmarPedidoCliente() {
  var mesaEl = document.getElementById("c-mesa");
  if (!mesaEl || !mesaEl.value.trim()) {
    alert("Ingrese el número de su mesa.");
    mesaEl.focus();
    return;
  }
  var mesa = parseInt(mesaEl.value);

  var productosSeleccionados = [];
  Object.keys(pedidoCliente).forEach(function(id) {
    var cant = pedidoCliente[id];
    if (cant > 0) {
      var prod = productos.find(function(p) { return p.id === parseInt(id); });
      if (prod) productosSeleccionados.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: cant });
    }
  });

  if (productosSeleccionados.length === 0) { alert("Seleccione al menos un producto."); return; }

  var total = productosSeleccionados.reduce(function(acc, i) { return acc + i.precio * i.cantidad; }, 0);
  var nuevo = {
    id: pedidos.length + 1,
    cliente: null,
    mesa: mesa,
    productos: productosSeleccionados,
    total: total,
    estado: "pendiente",
    fecha: new Date().toLocaleString("es-EC")
  };
  pedidos.push(nuevo);
  guardarStorage("pedidos");

  var mesaObj = mesas.find(function(m) { return m.numero === mesa; });
  if (mesaObj) { mesaObj.estado = "ocupada"; guardarStorage("mesas"); }

  window.location.href = "cliente-estado.html?id=" + nuevo.id;
}

// ===== ESTADO DEL PEDIDO =====
function cargarEstadoPedidoCliente() {
  var id = parseInt(new URLSearchParams(window.location.search).get("id"));
  var pedido = pedidos.find(function(p) { return p.id === id; });

  if (!pedido) {
    document.getElementById("estado-contenido").innerHTML =
      '<div class="alert alert-danger">Pedido no encontrado.</div>';
    return;
  }

  var iconos = {
    "pendiente": "bi-hourglass-split text-warning",
    "en preparación": "bi-fire text-danger",
    "entregado": "bi-check-circle-fill text-success",
    "cancelado": "bi-x-circle-fill text-secondary"
  };
  var icono = iconos[pedido.estado] || "bi-hourglass-split text-warning";
  var badge = { "pendiente": "badge-pendiente", "en preparación": "badge-preparacion", "entregado": "badge-entregado", "cancelado": "badge-cancelado" }[pedido.estado] || "badge-pendiente";

  var productosHtml = pedido.productos.map(function(p) {
    return '<li class="list-group-item d-flex justify-content-between">' +
      '<span>' + p.nombre + ' <span class="text-muted">x' + p.cantidad + '</span></span>' +
      '<span class="fw-bold">$' + (p.precio * p.cantidad).toFixed(2) + '</span>' +
    '</li>';
  }).join('');

  document.getElementById("estado-contenido").innerHTML =
    '<div class="card shadow-sm">' +
      '<div class="card-body p-4 text-center">' +
        '<i class="bi ' + icono + ' display-3 mb-3"></i>' +
        '<h4 class="mb-2">Pedido #' + pedido.id + '</h4>' +
        '<span class="badge ' + badge + ' fs-6 mb-3">' + pedido.estado + '</span>' +
        '<p class="text-muted">Mesa ' + pedido.mesa + ' · ' + pedido.fecha + '</p>' +
        '<ul class="list-group mb-3 text-start">' + productosHtml + '</ul>' +
        '<div class="total-pedido-box mb-3">Total: $' + pedido.total.toFixed(2) + '</div>' +
        (pedido.estado === "pendiente" || pedido.estado === "en preparación"
          ? '<div class="alert alert-info mb-3"><i class="bi bi-info-circle me-2"></i>Tu pedido está siendo atendido. Puedes refrescar esta página para ver el estado actualizado.</div>'
          : '') +
        '<a href="cliente-carta.html" class="btn btn-brew-primary mt-2">' +
          '<i class="bi bi-arrow-left me-1"></i>Hacer otro pedido' +
        '</a>' +
      '</div>' +
    '</div>';
}
