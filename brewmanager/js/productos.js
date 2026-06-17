var _productosCache = [];

// ===== RENDER TABLA =====
function renderTablaProductos(lista) {
  var datos = lista || _productosCache;
  var tbody = document.getElementById("tbody-productos");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No hay productos registrados.</td></tr>';
    return;
  }

  datos.forEach(function(p) {
    var badgeClase = p.disponible ? "badge-disponible" : "badge-nodisponible";
    var badgeTexto = p.disponible ? "Disponible" : "No disponible";
    var precio = parseFloat(p.precio);

    tbody.innerHTML += '<tr>' +
      '<td>' + p.id + '</td>' +
      '<td>' + p.nombre + '</td>' +
      '<td>' + p.categoria + '</td>' +
      '<td>$' + precio.toFixed(2) + '</td>' +
      '<td><span class="badge ' + badgeClase + '">' + badgeTexto + '</span></td>' +
      '<td>' +
        '<a href="producto-form.html?id=' + p.id + '" class="btn btn-sm btn-warning me-1">Editar</a>' +
        '<button class="btn btn-sm ' + (p.disponible ? "btn-secondary" : "btn-success") +
          '" onclick="cambiarDisponibilidad(' + p.id + ')">' +
          (p.disponible ? "Deshabilitar" : "Habilitar") +
        '</button>' +
      '</td>' +
    '</tr>';
  });
}

// ===== CARGAR TABLA DESDE API =====
function cargarTablaProductos() {
  apiGet("/productos/").then(function(data) {
    _productosCache = data;
    renderTablaProductos();
  }).catch(function() {
    var tbody = document.getElementById("tbody-productos");
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-3">Error al conectar con el servidor.</td></tr>';
  });
}

// ===== CAMBIAR DISPONIBILIDAD =====
function cambiarDisponibilidad(id) {
  var producto = _productosCache.find(function(p) { return p.id === id; });
  if (!producto) return;

  var nuevoEstado = !producto.disponible;
  if (!confirm('¿Marcar "' + producto.nombre + '" como ' + (nuevoEstado ? "disponible" : "no disponible") + '?')) return;

  apiPatch("/productos/" + id + "/cambiar-disponibilidad/").then(function(resp) {
    producto.disponible = resp.disponible;
    renderTablaProductos();
  }).catch(function() { alert("Error al cambiar disponibilidad."); });
}

// ===== CARGAR FORMULARIO (edición) =====
function cargarFormProducto() {
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  apiGet("/productos/" + id + "/").then(function(p) {
    var titulo = document.getElementById("form-titulo");
    if (titulo) titulo.textContent = "Editar Producto";

    var map = {
      "f-nombre": p.nombre,
      "f-descripcion": p.descripcion,
      "f-categoria": p.categoria,
      "f-precio": parseFloat(p.precio),
      "f-disponible": p.disponible ? "true" : "false"
    };
    for (var k in map) {
      var el = document.getElementById(k);
      if (el) el.value = map[k];
    }
  });
}

// ===== GUARDAR PRODUCTO =====
function guardarProducto(event) {
  event.preventDefault();
  var valido = true;
  var obligatorios = ["f-nombre", "f-categoria", "f-precio", "f-disponible"];

  obligatorios.forEach(function(fid) {
    var campo = document.getElementById(fid);
    var error = document.getElementById(fid + "-error");
    if (!campo || !campo.value.toString().trim()) {
      if (error) error.style.display = "block";
      if (campo) campo.classList.add("is-invalid");
      valido = false;
    } else {
      if (error) error.style.display = "none";
      if (campo) campo.classList.remove("is-invalid");
    }
  });

  var precioEl = document.getElementById("f-precio");
  if (precioEl && precioEl.value && parseFloat(precioEl.value) <= 0) {
    var precioErr = document.getElementById("f-precio-error");
    if (precioErr) { precioErr.textContent = "El precio debe ser mayor a 0."; precioErr.style.display = "block"; }
    precioEl.classList.add("is-invalid");
    valido = false;
  }

  if (!valido) return;

  var datos = {
    nombre: document.getElementById("f-nombre").value.trim(),
    descripcion: document.getElementById("f-descripcion").value.trim(),
    categoria: document.getElementById("f-categoria").value,
    precio: parseFloat(document.getElementById("f-precio").value),
    disponible: document.getElementById("f-disponible").value === "true"
  };

  var id = new URLSearchParams(window.location.search).get("id");
  var promesa = id ? apiPut("/productos/" + id + "/", datos) : apiPost("/productos/", datos);

  promesa.then(function() {
    alert("Producto guardado correctamente.");
    window.location.href = "productos.html";
  }).catch(function(err) {
    alert("Error al guardar: " + JSON.stringify(err));
  });
}
