/**
 * datos.js — Datos simulados para BrewManager
 * Contiene arrays de clientes, productos y pedidos
 * usados en toda la aplicación (sin base de datos ni localStorage)
 */

// ===== CLIENTES =====
var clientes = [
  {
    id: 1,
    nombres: "Carlos Andrés",
    apellidos: "Pérez Ramírez",
    identificacion: "1712345678",
    telefono: "022345678",
    celular: "0991234567",
    correo: "carlos.perez@email.com",
    direccion: "Av. Amazonas N22-45",
    estadoCivil: "casado",
    estado: "activo",
    fecha_registro: "2024-01-15"
  },
  {
    id: 2,
    nombres: "María Fernanda",
    apellidos: "López Torres",
    identificacion: "1798765432",
    telefono: "",
    celular: "0987654321",
    correo: "mflopez@email.com",
    direccion: "Calle Quito 123",
    estadoCivil: "soltera",
    estado: "activo",
    fecha_registro: "2024-02-20"
  },
  {
    id: 3,
    nombres: "Roberto",
    apellidos: "Gutiérrez Salazar",
    identificacion: "1756789012",
    telefono: "023456789",
    celular: "0976543210",
    correo: "roberto.g@email.com",
    direccion: "",
    estadoCivil: "divorciado",
    estado: "inactivo",
    fecha_registro: "2024-03-05"
  },
  {
    id: 4,
    nombres: "Lucía Paola",
    apellidos: "Mendoza Vega",
    identificacion: "1734567890",
    telefono: "",
    celular: "0965432109",
    correo: "lucia.mendoza@email.com",
    direccion: "Urb. Los Álamos, Casa 5",
    estadoCivil: "unión libre",
    estado: "activo",
    fecha_registro: "2024-04-10"
  },
  {
    id: 5,
    nombres: "Diego Sebastián",
    apellidos: "Castro Morales",
    identificacion: "1723456789",
    telefono: "024567890",
    celular: "0954321098",
    correo: "diego.castro@email.com",
    direccion: "Av. 6 de Diciembre 789",
    estadoCivil: "soltero",
    estado: "activo",
    fecha_registro: "2024-05-22"
  }
];

// ===== PRODUCTOS =====
var productos = [
  {
    id: 1,
    nombre: "Café Americano",
    descripcion: "Café negro intenso preparado con agua caliente",
    categoria: "Bebidas Calientes",
    precio: 1.50,
    disponible: true
  },
  {
    id: 2,
    nombre: "Cappuccino",
    descripcion: "Espresso con leche vaporizada y espuma",
    categoria: "Bebidas Calientes",
    precio: 2.25,
    disponible: true
  },
  {
    id: 3,
    nombre: "Frappé de Caramelo",
    descripcion: "Bebida fría con café, caramelo y crema batida",
    categoria: "Bebidas Frías",
    precio: 3.00,
    disponible: true
  },
  {
    id: 4,
    nombre: "Limonada Helada",
    descripcion: "Limonada natural con hielo y menta",
    categoria: "Bebidas Frías",
    precio: 2.00,
    disponible: false
  },
  {
    id: 5,
    nombre: "Croissant de Mantequilla",
    descripcion: "Croissant recién horneado con mantequilla francesa",
    categoria: "Snacks",
    precio: 1.75,
    disponible: true
  },
  {
    id: 6,
    nombre: "Brownie de Chocolate",
    descripcion: "Brownie húmedo con chispas de chocolate",
    categoria: "Snacks",
    precio: 2.50,
    disponible: true
  }
];

// ===== PEDIDOS =====
var pedidos = [
  {
    id: 1,
    cliente: "Carlos Andrés Pérez",
    mesa: null,
    productos: [
      { id: 1, nombre: "Café Americano", precio: 1.50, cantidad: 2 },
      { id: 5, nombre: "Croissant de Mantequilla", precio: 1.75, cantidad: 1 }
    ],
    total: 4.75,
    estado: "entregado",
    fecha: "2024-06-01 09:15"
  },
  {
    id: 2,
    cliente: null,
    mesa: 3,
    productos: [
      { id: 2, nombre: "Cappuccino", precio: 2.25, cantidad: 2 },
      { id: 6, nombre: "Brownie de Chocolate", precio: 2.50, cantidad: 2 }
    ],
    total: 9.50,
    estado: "en preparación",
    fecha: "2024-06-01 10:30"
  },
  {
    id: 3,
    cliente: "María Fernanda López",
    mesa: null,
    productos: [
      { id: 3, nombre: "Frappé de Caramelo", precio: 3.00, cantidad: 1 }
    ],
    total: 3.00,
    estado: "pendiente",
    fecha: "2024-06-01 11:00"
  },
  {
    id: 4,
    cliente: null,
    mesa: 7,
    productos: [
      { id: 1, nombre: "Café Americano", precio: 1.50, cantidad: 3 },
      { id: 5, nombre: "Croissant de Mantequilla", precio: 1.75, cantidad: 2 }
    ],
    total: 8.00,
    estado: "cancelado",
    fecha: "2024-06-01 08:45"
  }
];
