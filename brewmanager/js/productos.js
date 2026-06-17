/**
 * productos.js — Módulo de gestión de productos
 * Funciones: renderTabla, cambiarDisponibilidad
 * Depende de: datos.js (array global `productos`)
 */

// ===== RENDER TABLA DE PRODUCTOS =====
/**
 * Renderiza la tabla de productos en el DOM.
 * @param {Array} lista - Array de productos a mostrar (por defecto todos)
 */
function renderTablaProductos(lista) {
  var datos = lista || productos;
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

    var fila = '<tr>' +
      '<td>' + p.id + '</td>' +
      '<td>' + p.nombre + '</td>' +
      '<td>' + p.categoria + '</td>' +
      '<td>$' + p.precio.toFixed(2) + '</td>' +
      '<td><span class="badge ' + badgeClase + '">' + badgeTexto + '</span></td>' +
      '<td>' +
        '<a href="producto-form.html?id=' + p.id + '" class="btn btn-sm btn-warning me-1" title="Editar">Editar</a>' +
        '<button class="btn btn-sm ' + (p.disponible ? "btn-secondary" : "btn-success") + '" onclick="cambiarDisponibilidad(' + p.id + ')" title="Cambiar disponibilidad">' +
          (p.disponible ? "Deshabilitar" : "Habilitar") +
        '</button>' +
      '</td>' +
    '</tr>';

    tbody.innerHTML += fila;
  });
}

// ===== CAMBIAR DISPONIBILIDAD =====
/**
 * Cambia la disponibilidad de un producto por su id.
 * @param {number} id - ID del producto
 */
function cambiarDisponibilidad(id) {
  var producto = productos.find(function(p) { return p.id === id; });

  if (!producto) {
    alert("Producto no encontrado.");
    return;
  }

  var nuevoEstado = !producto.disponible;
  var textoEstado = nuevoEstado ? "disponible" : "no disponible";

  var confirmado = confirm(
    '¿Desea marcar "' + producto.nombre + '" como ' + textoEstado + '?'
  );

  if (confirmado) {
    producto.disponible = nuevoEstado;
    guardarStorage('productos');
    alert('Producto actualizado: ahora está ' + textoEstado + '.');
    renderTablaProductos();
  }
}

// ===== CARGAR FORMULARIO DE PRODUCTO (edición) =====
/**
 * Si hay ?id= en la URL, pre-llena el formulario para edición.
 */
function cargarFormProducto() {
  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get("id"));

  if (!id) return; // Modo creación

  var producto = productos.find(function(p) { return p.id === id; });
  if (!producto) return;

  // Actualizar título
  var titulo = document.getElementById("form-titulo");
  if (titulo) titulo.textContent = "Editar Producto";

  // Llenar campos
  var campos = {
    "f-nombre": producto.nombre,
    "f-descripcion": producto.descripcion,
    "f-categoria": producto.categoria,
    "f-precio": producto.precio,
    "f-disponible": producto.disponible ? "true" : "false"
  };

  for (var campo in campos) {
    var el = document.getElementById(campo);
    if (el) el.value = campos[campo];
  }
}

// ===== GUARDAR PRODUCTO =====
/**
 * Valida y "guarda" (simula) el producto desde el formulario.
 */
function guardarProducto(event) {
  event.preventDefault();
  var valido = true;

  var obligatorios = ["f-nombre", "f-categoria", "f-precio", "f-disponible"];

  obligatorios.forEach(function(id) {
    var campo = document.getElementById(id);
    var error = document.getElementById(id + "-error");
    if (!campo || !campo.value.toString().trim()) {
      if (error) error.style.display = "block";
      if (campo) campo.classList.add("is-invalid");
      valido = false;
    } else {
      if (error) error.style.display = "none";
      if (campo) campo.classList.remove("is-invalid");
    }
  });

  // Validar precio positivo
  var precioEl = document.getElementById("f-precio");
  var precioError = document.getElementById("f-precio-error");
  if (precioEl && precioEl.value) {
    if (parseFloat(precioEl.value) <= 0) {
      if (precioError) { precioError.textContent = "El precio debe ser mayor a 0."; precioError.style.display = "block"; }
      precioEl.classList.add("is-invalid");
      valido = false;
    }
  }

  if (valido) {
    var params = new URLSearchParams(window.location.search);
    var idEdit = parseInt(params.get("id"));
    var nuevo = {
      id: idEdit || (productos.length ? Math.max.apply(null, productos.map(function(p){return p.id;})) + 1 : 1),
      nombre: document.getElementById("f-nombre").value.trim(),
      descripcion: document.getElementById("f-descripcion").value.trim(),
      categoria: document.getElementById("f-categoria").value,
      precio: parseFloat(document.getElementById("f-precio").value),
      disponible: document.getElementById("f-disponible").value === "true"
    };
    if (idEdit) {
      var idx = productos.findIndex(function(p){return p.id===idEdit;});
      if (idx !== -1) productos[idx] = nuevo;
    } else {
      productos.push(nuevo);
    }
    guardarStorage("productos");
    alert("Producto guardado correctamente.");
    window.location.href = "productos.html";
  }
}
