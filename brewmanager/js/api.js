// URL base del backend Django
var API_BASE = "http://127.0.0.1:8000/api";

function apiGet(ruta) {
  return fetch(API_BASE + ruta).then(function(r) {
    if (!r.ok) throw new Error("Error " + r.status);
    return r.json();
  });
}

function apiPost(ruta, datos) {
  return fetch(API_BASE + ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  }).then(function(r) {
    if (!r.ok) return r.json().then(function(e) { throw e; });
    return r.json();
  });
}

function apiPut(ruta, datos) {
  return fetch(API_BASE + ruta, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  }).then(function(r) {
    if (!r.ok) return r.json().then(function(e) { throw e; });
    return r.json();
  });
}

function apiPatch(ruta, datos) {
  return fetch(API_BASE + ruta, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos || {})
  }).then(function(r) {
    if (!r.ok) return r.json().then(function(e) { throw e; });
    return r.json();
  });
}

function apiDelete(ruta) {
  return fetch(API_BASE + ruta, { method: "DELETE" }).then(function(r) {
    if (!r.ok) throw new Error("Error " + r.status);
    return r.status === 204 ? {} : r.json();
  });
}
