// Cache local para búsqueda sin re-fetch
var _clientesCache = [];

// ===== RENDER TABLA =====
function renderTablaClientes(lista) {
  var datos = lista || _clientesCache;
  var tbody = document.getElementById("tbody-clientes");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-3">No se encontraron clientes.</td></tr>';
    return;
  }

  datos.forEach(function(c) {
    var badgeClase = c.estado === "activo" ? "badge-activo" : "badge-inactivo";
    var estadoTexto = c.estado.charAt(0).toUpperCase() + c.estado.slice(1);

    tbody.innerHTML += '<tr>' +
      '<td>' + c.id + '</td>' +
      '<td>' + c.nombres + '</td>' +
      '<td>' + c.apellidos + '</td>' +
      '<td>' + c.identificacion + '</td>' +
      '<td>' + (c.telefono || '—') + '</td>' +
      '<td>' + (c.celular || '—') + '</td>' +
      '<td>' + (c.correo || '—') + '</td>' +
      '<td>' + (c.estado_civil || '—') + '</td>' +
      '<td><span class="badge ' + badgeClase + '">' + estadoTexto + '</span></td>' +
      '<td>' +
        '<a href="cliente-detalle.html?id=' + c.id + '" class="btn btn-sm btn-info me-1">Ver</a>' +
        '<a href="cliente-form.html?id=' + c.id + '" class="btn btn-sm btn-warning me-1">Editar</a>' +
        '<button class="btn btn-sm ' + (c.estado === "activo" ? "btn-danger" : "btn-success") +
          '" onclick="cambiarEstadoCliente(' + c.id + ')">' +
          (c.estado === "activo" ? "Desactivar" : "Activar") +
        '</button>' +
      '</td>' +
    '</tr>';
  });
}

// ===== CARGAR TABLA DESDE API =====
function cargarTablaClientes() {
  apiGet("/clientes/").then(function(data) {
    _clientesCache = data;
    renderTablaClientes();
  }).catch(function() {
    var tbody = document.getElementById("tbody-clientes");
    if (tbody) tbody.innerHTML = '<tr><td colspan="10" class="text-center text-danger py-3">Error al conectar con el servidor.</td></tr>';
  });
}

// ===== BUSCAR CLIENTE (filtro local) =====
function buscarCliente() {
  var texto = document.getElementById("buscador-cliente").value.toLowerCase().trim();
  var resultados = _clientesCache.filter(function(c) {
    return (
      c.nombres.toLowerCase().includes(texto) ||
      c.apellidos.toLowerCase().includes(texto) ||
      c.identificacion.toLowerCase().includes(texto)
    );
  });
  renderTablaClientes(resultados);
}

// ===== CAMBIAR ESTADO =====
function cambiarEstadoCliente(id) {
  var cliente = _clientesCache.find(function(c) { return c.id === id; });
  if (!cliente) return;

  var nuevoEstado = cliente.estado === "activo" ? "inactivo" : "activo";
  if (!confirm('¿Cambiar estado de "' + cliente.nombres + ' ' + cliente.apellidos + '" a ' + nuevoEstado + '?')) return;

  apiPatch("/clientes/" + id + "/cambiar-estado/").then(function(resp) {
    cliente.estado = resp.estado;
    renderTablaClientes();
  }).catch(function() { alert("Error al cambiar el estado."); });
}

// ===== CARGAR DETALLE =====
function cargarDetalleCliente() {
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  apiGet("/clientes/" + id + "/").then(function(c) {
    var set = function(elId, val) { var el = document.getElementById(elId); if (el) el.textContent = val || "—"; };
    set("det-nombres", c.nombres);
    set("det-apellidos", c.apellidos);
    set("det-identificacion", c.identificacion);
    set("det-telefono", c.telefono);
    set("det-celular", c.celular);
    set("det-correo", c.correo);
    set("det-direccion", c.direccion);
    set("det-estadoCivil", c.estado_civil);
    set("det-fecha", c.fecha_registro ? c.fecha_registro.slice(0, 10) : "—");

    var badgeEl = document.getElementById("det-estado");
    if (badgeEl) {
      badgeEl.className = "badge " + (c.estado === "activo" ? "badge-activo" : "badge-inactivo") + " fs-6";
      badgeEl.textContent = c.estado.charAt(0).toUpperCase() + c.estado.slice(1);
    }

    var btnEditar = document.getElementById("btn-editar-cliente");
    if (btnEditar) btnEditar.href = "cliente-form.html?id=" + c.id;

    var btnEstado = document.getElementById("btn-estado-cliente");
    if (btnEstado) {
      btnEstado.textContent = c.estado === "activo" ? "Desactivar" : "Activar";
      btnEstado.className = "btn " + (c.estado === "activo" ? "btn-danger" : "btn-success");
      btnEstado.onclick = function() {
        apiPatch("/clientes/" + c.id + "/cambiar-estado/").then(function() {
          cargarDetalleCliente();
        });
      };
    }
  }).catch(function() {
    var cont = document.getElementById("contenido-detalle");
    if (cont) cont.innerHTML = '<div class="alert alert-danger">Cliente no encontrado o error de conexión.</div>';
  });
}

// ===== CARGAR FORMULARIO (edición) =====
function cargarFormCliente() {
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  apiGet("/clientes/" + id + "/").then(function(c) {
    var titulo = document.getElementById("form-titulo");
    if (titulo) titulo.textContent = "Editar Cliente";

    var map = {
      "f-nombres": c.nombres,
      "f-apellidos": c.apellidos,
      "f-identificacion": c.identificacion,
      "f-telefono": c.telefono,
      "f-celular": c.celular,
      "f-correo": c.correo,
      "f-direccion": c.direccion,
      "f-estadoCivil": c.estado_civil,
      "f-estado": c.estado
    };
    for (var k in map) {
      var el = document.getElementById(k);
      if (el) el.value = map[k] || "";
    }
  });
}

// ===== GUARDAR CLIENTE =====
function guardarCliente(event) {
  event.preventDefault();
  var valido = true;
  var obligatorios = ["f-nombres", "f-apellidos", "f-identificacion", "f-celular", "f-correo", "f-estadoCivil", "f-estado"];

  obligatorios.forEach(function(fid) {
    var campo = document.getElementById(fid);
    var error = document.getElementById(fid + "-error");
    if (!campo || !campo.value.trim()) {
      if (error) error.style.display = "block";
      if (campo) campo.classList.add("is-invalid");
      valido = false;
    } else {
      if (error) error.style.display = "none";
      if (campo) campo.classList.remove("is-invalid");
    }
  });

  var correoEl = document.getElementById("f-correo");
  if (correoEl && correoEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoEl.value.trim())) {
    var correoErr = document.getElementById("f-correo-error");
    if (correoErr) { correoErr.textContent = "Correo inválido."; correoErr.style.display = "block"; }
    correoEl.classList.add("is-invalid");
    valido = false;
  }

  if (!valido) return;

  var datos = {
    nombres: document.getElementById("f-nombres").value.trim(),
    apellidos: document.getElementById("f-apellidos").value.trim(),
    identificacion: document.getElementById("f-identificacion").value.trim(),
    telefono: document.getElementById("f-telefono").value.trim(),
    celular: document.getElementById("f-celular").value.trim(),
    correo: document.getElementById("f-correo").value.trim(),
    direccion: document.getElementById("f-direccion").value.trim(),
    estado_civil: document.getElementById("f-estadoCivil").value,
    estado: document.getElementById("f-estado").value
  };

  var id = new URLSearchParams(window.location.search).get("id");
  var promesa = id ? apiPut("/clientes/" + id + "/", datos) : apiPost("/clientes/", datos);

  promesa.then(function() {
    alert("Cliente guardado correctamente.");
    window.location.href = "clientes.html";
  }).catch(function(err) {
    alert("Error al guardar: " + JSON.stringify(err));
  });
}
