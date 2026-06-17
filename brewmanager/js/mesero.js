// ===== MÓDULO MESERO =====

// ===== MESAS =====
function renderMesas() {
  var contenedor = document.getElementById("grid-mesas");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  mesas.forEach(function(m) {
    var libre = m.estado === "libre";
    var pedidosMesa = pedidos.filter(function(p) {
      return p.mesa === m.numero && (p.estado === "pendiente" || p.estado === "en preparación");
    });
    var tienePedido = pedidosMesa.length > 0;

    contenedor.innerHTML +=
      '<div class="col-6 col-sm-4 col-md-3">' +
        '<div class="card mesa-card ' + (libre ? "mesa-libre" : "mesa-ocupada") + ' h-100 text-center p-3">' +
          '<div class="mesa-numero">Mesa ' + m.numero + '</div>' +
          '<div class="small mb-1"><i class="bi bi-people me-1"></i>' + m.capacidad + ' personas</div>' +
          '<span class="badge ' + (libre ? "badge-activo" : "badge-pendiente") + ' mb-2">' +
            (libre ? "Libre" : "Ocupada") +
          '</span>' +
          (tienePedido
            ? '<div class="small text-warning mb-2"><i class="bi bi-clock me-1"></i>' + pedidosMesa.length + ' pedido(s) activo(s)</div>'
            : '') +
          '<div class="d-grid gap-1 mt-auto">' +
            '<a href="mesero-pedido-form.html?mesa=' + m.numero + '" class="btn btn-brew-primary btn-sm">' +
              '<i class="bi bi-plus-circle me-1"></i>Tomar Pedido' +
            '</a>' +
            (tienePedido
              ? '<a href="mesero-mis-pedidos.html?mesa=' + m.numero + '" class="btn btn-brew-secondary btn-sm">' +
                  '<i class="bi bi-receipt me-1"></i>Ver Pedidos' +
                '</a>'
              : '') +
            '<button class="btn btn-outline-secondary btn-sm" onclick="toggleMesa(' + m.id + ')">' +
              (libre ? '<i class="bi bi-lock me-1"></i>Marcar Ocupada' : '<i class="bi bi-unlock me-1"></i>Liberar') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  });
}

function toggleMesa(id) {
  var mesa = mesas.find(function(m) { return m.id === id; });
  if (!mesa) return;
  mesa.estado = mesa.estado === "libre" ? "ocupada" : "libre";
  guardarStorage("mesas");
  renderMesas();
}

// ===== MIS PEDIDOS =====
function renderMisPedidos() {
  var tbody = document.getElementById("tbody-mis-pedidos");
  if (!tbody) return;

  var mesaFiltro = new URLSearchParams(window.location.search).get("mesa");
  var datos = pedidos.filter(function(p) {
    return p.estado === "pendiente" || p.estado === "en preparación";
  });
  if (mesaFiltro) datos = datos.filter(function(p) { return p.mesa == mesaFiltro; });

  tbody.innerHTML = "";

  if (datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay pedidos activos.</td></tr>';
    return;
  }

  datos.forEach(function(p) {
    var origen = p.cliente ? p.cliente : "Mesa " + p.mesa;
    var badge = obtenerBadgeEstadoPedidoMesero(p.estado);
    tbody.innerHTML += '<tr>' +
      '<td>#' + p.id + '</td>' +
      '<td>' + origen + '</td>' +
      '<td>$' + p.total.toFixed(2) + '</td>' +
      '<td><span class="badge ' + badge + '">' + p.estado + '</span></td>' +
      '<td>' +
        '<button class="btn btn-sm btn-brew-secondary" onclick="avanzarEstadoPedido(' + p.id + ')">' +
          '<i class="bi bi-arrow-right me-1"></i>Avanzar Estado' +
        '</button>' +
      '</td>' +
    '</tr>';
  });
}

function obtenerBadgeEstadoPedidoMesero(estado) {
  return { "pendiente": "badge-pendiente", "en preparación": "badge-preparacion" }[estado] || "badge-pendiente";
}

function avanzarEstadoPedido(id) {
  var pedido = pedidos.find(function(p) { return p.id === id; });
  if (!pedido) return;
  var flujo = ["pendiente", "en preparación", "entregado"];
  var idx = flujo.indexOf(pedido.estado);
  if (idx < flujo.length - 1) {
    pedido.estado = flujo[idx + 1];
    if (pedido.estado === "entregado" && pedido.mesa) {
      var mesa = mesas.find(function(m) { return m.numero === pedido.mesa; });
      var otrosPedidos = pedidos.filter(function(p) {
        return p.id !== pedido.id && p.mesa === pedido.mesa && (p.estado === "pendiente" || p.estado === "en preparación");
      });
      if (mesa && otrosPedidos.length === 0) mesa.estado = "libre";
    }
    guardarStorage("pedidos");
    guardarStorage("mesas");
    alert('Pedido #' + id + ' avanzado a "' + pedido.estado + '".');
    renderMisPedidos();
  }
}

// ===== FORMULARIO DE PEDIDO (mesero) =====
var productosEnPedidoMesero = [];

function iniciarFormPedidoMesero() {
  var mesa = new URLSearchParams(window.location.search).get("mesa");
  if (mesa) {
    var el = document.getElementById("m-mesa");
    if (el) { el.value = mesa; el.readOnly = true; }
    var tipo = document.getElementById("m-tipo");
    if (tipo) { tipo.value = "mesa"; toggleTipoPedidoMesero(); }
  }

  var sel = document.getElementById("m-producto");
  if (!sel) return;
  productos.filter(function(p) { return p.disponible; }).forEach(function(p) {
    var opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.nombre + " — $" + p.precio.toFixed(2);
    sel.appendChild(opt);
  });

  var selCli = document.getElementById("m-cliente");
  if (!selCli) return;
  clientes.filter(function(c) { return c.estado === "activo"; }).forEach(function(c) {
    var opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nombres + " " + c.apellidos;
    selCli.appendChild(opt);
  });
}

function toggleTipoPedidoMesero() {
  var tipo = document.getElementById("m-tipo").value;
  document.getElementById("bloque-cliente-m").style.display = tipo === "cliente" ? "block" : "none";
  document.getElementById("bloque-mesa-m").style.display = tipo === "mesa" ? "block" : "none";
}

function agregarProductoMesero() {
  var sel = document.getElementById("m-producto");
  var cantEl = document.getElementById("m-cantidad");
  var idProd = parseInt(sel.value);
  var cantidad = parseInt(cantEl.value);
  if (!idProd) { alert("Seleccione un producto."); return; }
  if (!cantidad || cantidad < 1) { alert("Ingrese una cantidad válida."); return; }
  var producto = productos.find(function(p) { return p.id === idProd; });
  if (!producto) return;
  var existente = productosEnPedidoMesero.find(function(p) { return p.id === idProd; });
  if (existente) { existente.cantidad += cantidad; }
  else { productosEnPedidoMesero.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: cantidad }); }
  renderListaMesero();
  cantEl.value = 1;
}

function renderListaMesero() {
  var el = document.getElementById("lista-productos-mesero");
  if (!el) return;
  if (productosEnPedidoMesero.length === 0) {
    el.innerHTML = '<p class="text-muted small">No ha agregado productos.</p>';
    document.getElementById("total-mesero").textContent = "$0.00";
    return;
  }
  var total = 0;
  el.innerHTML = "";
  productosEnPedidoMesero.forEach(function(item, idx) {
    var sub = item.precio * item.cantidad;
    total += sub;
    el.innerHTML += '<div class="producto-item d-flex justify-content-between align-items-center">' +
      '<span>' + item.nombre + ' x' + item.cantidad + '</span>' +
      '<span><strong>$' + sub.toFixed(2) + '</strong> ' +
        '<button class="btn btn-sm btn-danger ms-2" onclick="quitarProductoMesero(' + idx + ')">×</button>' +
      '</span></div>';
  });
  document.getElementById("total-mesero").textContent = "$" + total.toFixed(2);
}

function quitarProductoMesero(idx) {
  productosEnPedidoMesero.splice(idx, 1);
  renderListaMesero();
}

function guardarPedidoMesero(event) {
  event.preventDefault();
  var tipo = document.getElementById("m-tipo").value;
  if (!tipo) { alert("Seleccione tipo de pedido."); return; }
  if (tipo === "cliente" && !document.getElementById("m-cliente").value) { alert("Seleccione un cliente."); return; }
  if (tipo === "mesa" && !document.getElementById("m-mesa").value.trim()) { alert("Ingrese el número de mesa."); return; }
  if (productosEnPedidoMesero.length === 0) { alert("Agregue al menos un producto."); return; }

  var total = productosEnPedidoMesero.reduce(function(acc, i) { return acc + i.precio * i.cantidad; }, 0);
  var nuevo = {
    id: pedidos.length + 1,
    cliente: tipo === "cliente" ? document.getElementById("m-cliente").options[document.getElementById("m-cliente").selectedIndex].text : null,
    mesa: tipo === "mesa" ? parseInt(document.getElementById("m-mesa").value) : null,
    productos: productosEnPedidoMesero.slice(),
    total: total,
    estado: "pendiente",
    fecha: new Date().toLocaleString("es-EC")
  };
  pedidos.push(nuevo);
  guardarStorage("pedidos");

  if (nuevo.mesa) {
    var mesa = mesas.find(function(m) { return m.numero === nuevo.mesa; });
    if (mesa) { mesa.estado = "ocupada"; guardarStorage("mesas"); }
  }

  alert("Pedido #" + nuevo.id + " registrado. Total: $" + total.toFixed(2));
  window.location.href = "mesero-mesas.html";
}
