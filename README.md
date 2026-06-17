# BrewManager — Sistema de Gestión de Bar-Café

Sistema web de gestión para bar-café desarrollado como proyecto académico (SOFG1006 — ESPOL).  
100% frontend: HTML + CSS + JavaScript + Bootstrap 5. No requiere servidor ni instalación.

---

## Cómo abrir el sistema

1. Descarga o clona el repositorio.
2. Abre el archivo **`brewmanager/index.html`** directamente en tu navegador (doble clic).
3. Eso es todo — no necesitas instalar nada.

> Los datos se guardan automáticamente en `localStorage` del navegador. Persisten entre sesiones mientras no borres el historial del navegador.

---

## Credenciales de acceso

| Rol           | Usuario   | Contraseña | Destino                    |
|---------------|-----------|------------|----------------------------|
| Administrador | `admin`   | `1234`     | Dashboard de administración |
| Mesero        | `mesero1` | `1234`     | Módulo de mesas            |
| Mesero        | `mesero2` | `1234`     | Módulo de mesas            |
| Cliente       | *(ninguna)* | *(ninguna)* | Carta interactiva        |

---

## Estructura del proyecto

```
brewmanager/
├── index.html              ← Pantalla de inicio / selección de rol
├── pagina.html             ← Dashboard del administrador
├── css/
│   └── estilos.css         ← Estilos personalizados (tema café)
├── js/
│   ├── datos.js            ← Datos globales + localStorage
│   ├── clientes.js         ← Lógica del módulo Clientes
│   ├── productos.js        ← Lógica del módulo Productos
│   ├── pedidos.js          ← Lógica del módulo Pedidos
│   ├── mesero.js           ← Lógica del módulo Mesero
│   └── cliente-publico.js  ← Lógica del módulo Cliente
├── pages/
│   ├── clientes.html       ← Lista de clientes (admin)
│   ├── cliente-form.html   ← Formulario alta/edición cliente
│   ├── productos.html      ← Lista de productos (admin)
│   ├── producto-form.html  ← Formulario alta/edición producto
│   ├── pedidos.html        ← Lista de pedidos (admin)
│   ├── pedido-form.html    ← Formulario nuevo pedido (admin)
│   ├── mesero-mesas.html   ← Estado de mesas (mesero)
│   ├── mesero-mis-pedidos.html ← Pedidos activos (mesero)
│   ├── mesero-pedido-form.html ← Tomar pedido (mesero)
│   ├── mesero-menu.html    ← Carta de referencia (mesero)
│   ├── cliente-carta.html  ← Carta interactiva (cliente)
│   └── cliente-estado.html ← Estado del pedido (cliente)
└── img/                    ← Recursos de imagen
```

---

## Módulos del sistema

### Administrador (`pagina.html`)
- **Dashboard**: estadísticas en tiempo real (ventas, pedidos activos, clientes, productos).
- **Clientes**: listar, crear, editar, cambiar estado (activo/inactivo).
- **Productos**: listar, crear, editar, marcar disponible/no disponible.
- **Pedidos**: listar todos los pedidos, crear nuevos, cambiar estado.

### Mesero (`pages/mesero-*.html`)
- **Mesas**: vista de cuadrícula con estado libre/ocupada. Clic para ocupar/liberar.
- **Mis Pedidos**: tabla de pedidos pendientes y en preparación con botón para avanzar estado.
- **Tomar Pedido**: formulario para asignar productos a una mesa o cliente registrado.
- **Ver Carta**: vista de solo lectura del menú disponible.

### Cliente (`pages/cliente-*.html`)
- **Carta interactiva**: explorar el menú por categoría, agregar productos con +/−, ingresar número de mesa y confirmar pedido.
- **Estado del pedido**: seguimiento del estado del pedido recién realizado (pendiente → en preparación → entregado).

---

## Persistencia de datos

Los datos se almacenan en `localStorage` bajo las siguientes claves:

| Clave             | Contenido              |
|-------------------|------------------------|
| `brew_clientes`   | Array de clientes      |
| `brew_productos`  | Array de productos     |
| `brew_pedidos`    | Array de pedidos       |
| `brew_mesas`      | Array de mesas (1–8)   |

Al abrir el sistema por primera vez se cargan datos de ejemplo predefinidos. Cualquier cambio (crear, editar, cambiar estado) se guarda inmediatamente.

---

## Tecnologías utilizadas

- HTML5 + CSS3
- JavaScript (ES5/ES6, vanilla)
- [Bootstrap 5.3.3](https://getbootstrap.com/)
- [Bootstrap Icons 1.11.3](https://icons.getbootstrap.com/)
- `localStorage` para persistencia de datos

---

## Flujo de estados de un pedido

```
pendiente → en preparación → entregado
                ↓
           cancelado (en cualquier punto)
```

Cuando un pedido pasa a **entregado**, la mesa asociada se libera automáticamente si no tiene otros pedidos activos.

---

## Autor

Proyecto académico — SOFG1006, ESPOL  
2024
