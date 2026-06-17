from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

doc = Document()

# ── Estilos globales ──────────────────────────────────────────────────────────
style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(11)

def set_col_width(table, col_idx, width_cm):
    for row in table.rows:
        row.cells[col_idx].width = Cm(width_cm)

def shade_cell(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def add_heading(doc, text, level=1, color='1F3864'):
    p = doc.add_heading(text, level=level)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    for run in p.runs:
        run.font.color.rgb = RGBColor.from_string(color)
        run.font.bold = True
    return p

def add_paragraph(doc, text, bold=False, italic=False, size=11):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(size)
    return p

def add_labeled(doc, label, value):
    p = doc.add_paragraph()
    r1 = p.add_run(label + ': ')
    r1.bold = True
    r1.font.size = Pt(11)
    r2 = p.add_run(value)
    r2.font.size = Pt(11)

def add_bullet(doc, text):
    p = doc.add_paragraph(text, style='List Bullet')
    p.runs[0].font.size = Pt(11)

def add_table_header(table, headers, fill='1F3864'):
    hdr = table.rows[0]
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        cell.text = h
        shade_cell(cell, fill)
        for para in cell.paragraphs:
            for run in para.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.size = Pt(10)
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER

def fill_row(table, row_idx, values, center_cols=None):
    row = table.rows[row_idx]
    for i, val in enumerate(values):
        cell = row.cells[i]
        cell.text = val
        for para in cell.paragraphs:
            para.runs[0].font.size = Pt(10)
            if center_cols and i in center_cols:
                para.alignment = WD_ALIGN_PARAGRAPH.CENTER

# ══════════════════════════════════════════════════════════════════════════════
#  PORTADA
# ══════════════════════════════════════════════════════════════════════════════
doc.add_paragraph()
doc.add_paragraph()

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run('BREWMANAGER')
run.bold = True
run.font.size = Pt(28)
run.font.color.rgb = RGBColor(0x1F, 0x38, 0x64)

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run2 = subtitle.add_run('Sistema de Gestión para Bar-Café')
run2.font.size = Pt(16)
run2.font.color.rgb = RGBColor(0x2E, 0x74, 0xB5)

doc.add_paragraph()

curso = doc.add_paragraph()
curso.alignment = WD_ALIGN_PARAGRAPH.CENTER
curso.add_run('SOFG1006 – Desarrollo de Aplicaciones Web y Móviles\n').font.size = Pt(12)
curso.add_run('Escuela Superior Politécnica del Litoral – ESPOL').font.size = Pt(12)

doc.add_paragraph()

etapa_p = doc.add_paragraph()
etapa_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run3 = etapa_p.add_run('Documentación del Proyecto — Etapa 1')
run3.font.size = Pt(13)
run3.bold = True

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  ÍNDICE (manual)
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, 'Contenido', level=1)
items = [
    ('1.', 'Etapa 1: Análisis del sistema y levantamiento de requerimientos'),
    ('1.1', 'Condiciones académicas obligatorias (Prompt 1.0)'),
    ('1.2', 'Comprensión inicial del sistema (Prompt 1.1)'),
    ('1.3', 'Requerimientos funcionales y no funcionales (Prompt 1.6)'),
    ('1.4', 'Clasificación de requerimientos por fase (Prompt 1.7)'),
    ('1.5', 'Validación final de la etapa (Prompt 1.8)'),
    ('2.', 'Etapa 2: Diseño del Frontend antes de Programarlo'),
    ('2.1', 'Identificación de pantallas (Prompt 2.1)'),
    ('2.2', 'Mapa de navegación (Prompt 2.2)'),
    ('2.3', 'Definición de formularios (Prompt 2.3)'),
    ('2.4', 'Tablas, tarjetas y visualización de datos (Prompt 2.4)'),
    ('2.5', 'Datos simulados (Prompt 2.5)'),
    ('2.6', 'Estructura de carpetas (Prompt 2.6)'),
    ('2.7', 'Validación final de la etapa 2 (Prompt 2.10)'),
]
for num, text in items:
    p = doc.add_paragraph()
    r = p.add_run(f'{num}  {text}')
    r.font.size = Pt(11)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 1
# ══════════════════════════════════════════════════════════════════════════════
add_heading(doc, 'Etapa 1: Análisis del Sistema y Levantamiento de Requerimientos', level=1)
add_paragraph(doc,
    'Objetivo: comprender qué sistema web se va a desarrollar, qué problema resuelve, '
    'quién lo usará, qué procesos principales debe manejar y qué información será necesaria '
    'para las siguientes fases del proyecto.',
    italic=True)

doc.add_paragraph()

# ── 1.1 Condiciones obligatorias ─────────────────────────────────────────────
add_heading(doc, '1.1  Condiciones Académicas Obligatorias — Prompt 1.0', level=2)
add_paragraph(doc,
    'El proyecto BrewManager debe incluir obligatoriamente el módulo Clientes con los '
    'siguientes campos y reglas mínimas definidas por la cátedra.')

doc.add_paragraph()
add_paragraph(doc, 'Campos mínimos del módulo Clientes:', bold=True)

campos = [
    ('id', 'Identificador único generado automáticamente'),
    ('nombres', 'Obligatorio'),
    ('apellidos', 'Obligatorio'),
    ('identificacion', 'Obligatorio — debe ser único en el sistema'),
    ('telefono', 'Opcional'),
    ('celular', 'Obligatorio'),
    ('correo', 'Obligatorio — debe tener formato válido (ejemplo@dominio.com)'),
    ('direccion', 'Opcional'),
    ('estadoCivil', 'Obligatorio — valores: soltero, casado, divorciado, separado, unión libre'),
    ('estado', 'Obligatorio — valores: activo, inactivo'),
    ('fecha_registro', 'Se genera automáticamente al registrar el cliente'),
]

tbl = doc.add_table(rows=len(campos)+1, cols=2)
tbl.style = 'Table Grid'
add_table_header(tbl, ['Campo', 'Descripción / Regla'])
for i, (campo, desc) in enumerate(campos):
    fill_row(tbl, i+1, [campo, desc])

doc.add_paragraph()
add_paragraph(doc, 'Operaciones mínimas del módulo Clientes:', bold=True)
ops = [
    'Registrar clientes.',
    'Listar clientes.',
    'Buscar clientes por nombre, apellido o identificación.',
    'Consultar el detalle de un cliente.',
    'Editar la información de un cliente.',
    'Cambiar el estado civil del cliente.',
    'Cambiar el estado del cliente entre activo e inactivo.',
]
for op in ops:
    add_bullet(doc, op)

doc.add_paragraph()
add_paragraph(doc, 'Restricciones del proyecto en esta etapa:', bold=True)
restricciones = [
    'No se generará código en la etapa de análisis.',
    'No se diseñará la base de datos todavía.',
    'No se crearán APIs.',
    'No se desarrollará la aplicación móvil en esta etapa.',
    'No se deben crear funcionalidades no solicitadas.',
]
for r in restricciones:
    add_bullet(doc, r)

doc.add_page_break()

# ── 1.2 Comprensión inicial ──────────────────────────────────────────────────
add_heading(doc, '1.2  Comprensión Inicial del Sistema — Prompt 1.1', level=2)

add_paragraph(doc, 'Problema que resuelve', bold=True)
add_paragraph(doc,
    'Un bar-café generalmente lleva sus pedidos, ventas, inventario y clientes de forma '
    'manual o con herramientas dispersas (papel, cuadernos, hojas de cálculo). Esto genera '
    'errores en los pedidos, pérdida de información de clientes, dificultad para conocer el '
    'stock disponible y falta de control sobre las ventas del día.')
add_paragraph(doc,
    'BrewManager centraliza la gestión del bar-café en un sistema web accesible desde '
    'cualquier dispositivo, eliminando estos problemas.')

doc.add_paragraph()
add_paragraph(doc, 'Usuarios principales del sistema', bold=True)
usuarios = [
    ('Administrador', 'Gestiona todo el sistema: clientes, productos, pedidos, ventas y reportes.'),
    ('Cajero / Mesero', 'Registra pedidos, consulta el menú y atiende a los clientes.'),
]
tbl2 = doc.add_table(rows=len(usuarios)+1, cols=2)
tbl2.style = 'Table Grid'
add_table_header(tbl2, ['Rol', 'Responsabilidades'])
for i, (rol, resp) in enumerate(usuarios):
    fill_row(tbl2, i+1, [rol, resp])

doc.add_paragraph()
add_paragraph(doc, 'Procesos principales del negocio', bold=True)
procesos = [
    'Gestión de clientes — registrar, buscar, consultar, editar y cambiar estado.',
    'Gestión de productos/menú — registrar bebidas, cafés y snacks con precio y categoría.',
    'Gestión de pedidos — crear pedidos asociados a un cliente o mesa.',
    'Control de ventas — registrar y consultar ventas del día.',
    'Gestión de categorías — organizar el menú por tipo (bebidas calientes, frías, snacks, etc.).',
]
for p in procesos:
    add_bullet(doc, p)

doc.add_paragraph()
add_paragraph(doc, 'Fases de desarrollo del proyecto', bold=True)
fases = [
    'Fase 1: Desarrollo del frontend con datos simulados.',
    'Fase 2: Desarrollo del backend con Django y base de datos.',
    'Fase 3: Creación de APIs para conectar frontend con backend.',
    'Fase 4: Desarrollo de aplicación móvil con React Native consumiendo las mismas APIs.',
]
for f in fases:
    add_bullet(doc, f)

doc.add_paragraph()
add_paragraph(doc, 'Decisiones tomadas durante el análisis', bold=True)
decisiones = [
    'El sistema tendrá login con usuario y contraseña; solo usuarios registrados pueden acceder.',
    'Un pedido puede asociarse a un cliente registrado o indicar solo el número de mesa.',
    'Los estados de un pedido son: pendiente, en preparación, entregado, cancelado.',
    'Los productos manejan disponibilidad (disponible / no disponible), sin control de stock por ahora.',
    'Tanto el administrador como el cajero pueden registrar clientes.',
]
for d in decisiones:
    add_bullet(doc, d)

doc.add_page_break()

# ── 1.3 Requerimientos ───────────────────────────────────────────────────────
add_heading(doc, '1.3  Requerimientos Funcionales y No Funcionales — Prompt 1.6', level=2)

add_paragraph(doc, 'Requerimientos Funcionales', bold=True)
rf = [
    ('RF01', 'El sistema debe permitir iniciar sesión con usuario y contraseña.'),
    ('RF02', 'El sistema debe permitir registrar, listar, buscar, editar y consultar clientes.'),
    ('RF03', 'El sistema debe permitir cambiar el estado de un cliente (activo / inactivo).'),
    ('RF04', 'El sistema debe permitir cambiar el estado civil de un cliente.'),
    ('RF05', 'El sistema debe permitir registrar, listar, editar y cambiar la disponibilidad de productos.'),
    ('RF06', 'El sistema debe permitir organizar productos por categorías.'),
    ('RF07', 'El sistema debe permitir registrar un pedido asociado a un cliente o a una mesa.'),
    ('RF08', 'El sistema debe permitir agregar productos a un pedido.'),
    ('RF09', 'El sistema debe permitir cambiar el estado de un pedido (pendiente, en preparación, entregado, cancelado).'),
    ('RF10', 'El sistema debe mostrar el historial de pedidos.'),
    ('RF11', 'El sistema debe calcular el total de un pedido automáticamente.'),
    ('RF12', 'El sistema debe mostrar un resumen de ventas del día.'),
]
tbl3 = doc.add_table(rows=len(rf)+1, cols=2)
tbl3.style = 'Table Grid'
add_table_header(tbl3, ['Código', 'Descripción'])
for i, (cod, desc) in enumerate(rf):
    fill_row(tbl3, i+1, [cod, desc], center_cols=[0])

doc.add_paragraph()
add_paragraph(doc, 'Requerimientos No Funcionales', bold=True)
rnf = [
    ('RNF01', 'La interfaz debe ser responsive y funcionar en escritorio y dispositivos móviles.'),
    ('RNF02', 'El sistema debe validar los campos obligatorios en el navegador antes de enviar el formulario.'),
    ('RNF03', 'Los mensajes de error deben ser claros y comprensibles para el usuario.'),
    ('RNF04', 'La navegación debe ser intuitiva y accesible desde un menú principal visible.'),
    ('RNF05', 'El código debe estar comentado para facilitar su comprensión y revisión en clase.'),
    ('RNF06', 'El sistema debe usar datos simulados durante la fase de frontend.'),
    ('RNF07', 'La fase 1 se desarrollará con HTML, CSS, JavaScript y Bootstrap.'),
]
tbl4 = doc.add_table(rows=len(rnf)+1, cols=2)
tbl4.style = 'Table Grid'
add_table_header(tbl4, ['Código', 'Descripción'])
for i, (cod, desc) in enumerate(rnf):
    fill_row(tbl4, i+1, [cod, desc], center_cols=[0])

doc.add_page_break()

# ── 1.4 Clasificación por fase ───────────────────────────────────────────────
add_heading(doc, '1.4  Clasificación de Requerimientos por Fase — Prompt 1.7', level=2)

fases_data = [
    ('RF01', 'Pantalla de login visual', 'Lógica de autenticación real', 'Endpoint de autenticación', 'Pantalla de login móvil'),
    ('RF02', 'Formularios y tabla de clientes', 'Modelo Cliente + BD', 'GET / POST / PUT clientes', 'Pantallas de clientes móvil'),
    ('RF03', 'Botón cambiar estado (simulado)', 'Lógica de estado backend', 'PATCH estado cliente', 'Acción en app móvil'),
    ('RF04', 'Select estadoCivil en formulario', 'Validación en BD', 'Incluido en PUT cliente', 'Incluido en móvil'),
    ('RF05', 'Formularios y tabla de productos', 'Modelo Producto + BD', 'GET / POST / PUT productos', 'Pantallas de productos móvil'),
    ('RF06', 'Select de categoría en formulario', 'Modelo Categoría + BD', 'GET categorías', 'Incluido en móvil'),
    ('RF07', 'Formulario de pedido (simulado)', 'Modelo Pedido + BD', 'POST pedido', 'Pantalla de pedido móvil'),
    ('RF08', 'Selección visual de productos', 'Relación Pedido-Producto', 'POST detalle pedido', 'Incluido en móvil'),
    ('RF09', 'Botón cambiar estado pedido', 'Lógica de estados backend', 'PATCH estado pedido', 'Acción en app móvil'),
    ('RF10', 'Tabla historial (simulada)', 'Consulta BD historial', 'GET pedidos', 'Lista de pedidos móvil'),
    ('RF11', 'Cálculo de total en JavaScript', 'Calculado en backend', 'Incluido en respuesta GET', 'Incluido en móvil'),
    ('RF12', 'Sección resumen visual (simulada)', 'Consulta agregada BD', 'GET resumen ventas', 'Panel resumen móvil'),
]

tbl5 = doc.add_table(rows=len(fases_data)+1, cols=5)
tbl5.style = 'Table Grid'
add_table_header(tbl5, ['Req.', 'Fase 1\nFrontend', 'Fase 2\nBackend/BD', 'Fase 3\nAPIs', 'Fase 4\nMóvil'])
for i, row_data in enumerate(fases_data):
    fill_row(tbl5, i+1, list(row_data), center_cols=[0])

doc.add_page_break()

# ── 1.5 Validación final ─────────────────────────────────────────────────────
add_heading(doc, '1.5  Validación Final de la Etapa 1 — Prompt 1.8', level=2)

criterios = [
    ('El problema está claramente definido', '✓'),
    ('Los usuarios del sistema están identificados', '✓'),
    ('Los procesos principales están claros', '✓'),
    ('Los datos y campos principales están definidos', '✓'),
    ('Las reglas de negocio están claras', '✓'),
    ('Los requerimientos son verificables y están numerados', '✓'),
    ('Existe información suficiente para diseñar pantallas, formularios y navegación', '✓'),
]
tbl6 = doc.add_table(rows=len(criterios)+1, cols=2)
tbl6.style = 'Table Grid'
add_table_header(tbl6, ['Criterio de validación', 'Estado'])
for i, (crit, est) in enumerate(criterios):
    fill_row(tbl6, i+1, [crit, est], center_cols=[1])

doc.add_paragraph()
resultado = doc.add_paragraph()
resultado.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_r = resultado.add_run('RESULTADO: Aprobado para pasar al diseño del frontend.')
run_r.bold = True
run_r.font.size = Pt(12)
run_r.font.color.rgb = RGBColor(0x1F, 0x85, 0x3C)

# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 2 — DISEÑO DEL FRONTEND
# ══════════════════════════════════════════════════════════════════════════════
doc.add_page_break()
add_heading(doc, 'Etapa 2: Diseño del Frontend antes de Programarlo', level=1)
add_paragraph(doc,
    'Objetivo: diseñar la estructura visual y funcional del sistema web antes de conectarlo '
    'con un backend real, definiendo las pantallas, formularios, menús, componentes, '
    'navegación, datos simulados y validaciones básicas del lado del cliente.',
    italic=True)

doc.add_paragraph()

# ── 2.1 Pantallas ────────────────────────────────────────────────────────────
add_heading(doc, '2.1  Identificación de Pantallas — Prompt 2.1', level=2)
add_paragraph(doc,
    'Con base en los requerimientos aprobados se identificaron las siguientes pantallas '
    'para la primera versión del frontend de BrewManager.')

pantallas = [
    ('P01', 'Dashboard (Inicio)',
     'Pantalla principal con resumen visual del negocio.',
     'Administrador, Cajero',
     'Total ventas del día, pedidos activos, clientes activos, productos disponibles.',
     'Navegar a cualquier módulo desde tarjetas o menú.'),
    ('P02', 'Login',
     'Controlar el acceso al sistema.',
     'Todos los usuarios',
     'Formulario de usuario y contraseña, logo del sistema.',
     'Iniciar sesión.'),
    ('P03', 'Listado de Clientes',
     'Ver y gestionar todos los clientes registrados.',
     'Administrador, Cajero',
     'Tabla con id, nombres, apellidos, identificacion, telefono, celular, correo, estadoCivil, estado.',
     'Buscar, Ver detalle, Editar, Cambiar estado, Nuevo cliente.'),
    ('P04', 'Formulario de Cliente (Registro / Edición)',
     'Registrar un nuevo cliente o editar uno existente.',
     'Administrador, Cajero',
     'Formulario completo con todos los campos del módulo Clientes.',
     'Guardar, Cancelar.'),
    ('P05', 'Detalle de Cliente',
     'Consultar toda la información de un cliente específico.',
     'Administrador, Cajero',
     'Todos los campos del cliente + fecha de registro.',
     'Editar, Cambiar estado, Regresar al listado.'),
    ('P06', 'Listado de Productos',
     'Ver y gestionar el menú del bar-café.',
     'Administrador',
     'Tabla con nombre, categoría, precio, disponibilidad.',
     'Nuevo producto, Editar, Cambiar disponibilidad.'),
    ('P07', 'Formulario de Producto (Registro / Edición)',
     'Registrar o editar un producto del menú.',
     'Administrador',
     'Formulario con nombre, descripción, categoría, precio, disponibilidad.',
     'Guardar, Cancelar.'),
    ('P08', 'Listado de Pedidos',
     'Ver todos los pedidos registrados.',
     'Administrador, Cajero',
     'Tabla con id, cliente/mesa, total, estado, fecha.',
     'Ver detalle, Cambiar estado, Nuevo pedido.'),
    ('P09', 'Formulario de Pedido',
     'Registrar un nuevo pedido.',
     'Cajero, Administrador',
     'Selector de cliente o mesa, lista de productos, total calculado.',
     'Agregar producto, Quitar producto, Confirmar pedido, Cancelar.'),
    ('P10', 'Detalle de Pedido',
     'Ver el detalle completo de un pedido.',
     'Administrador, Cajero',
     'Cliente/mesa, productos con precio, total, estado actual.',
     'Cambiar estado del pedido, Regresar.'),
]

doc.add_paragraph()
for cod, nombre, obj, usuario, info, acciones in pantallas:
    p = doc.add_paragraph()
    r = p.add_run(f'{cod} — {nombre}')
    r.bold = True
    r.font.size = Pt(11)
    r.font.color.rgb = RGBColor(0x1F, 0x38, 0x64)
    add_labeled(doc, 'Objetivo', obj)
    add_labeled(doc, 'Usuario', usuario)
    add_labeled(doc, 'Información que muestra', info)
    add_labeled(doc, 'Acciones', acciones)
    doc.add_paragraph()

doc.add_page_break()

# ── 2.2 Mapa de navegación ───────────────────────────────────────────────────
add_heading(doc, '2.2  Mapa de Navegación — Prompt 2.2', level=2)
add_paragraph(doc, 'Pantalla inicial: P02 Login → redirige automáticamente a P01 Dashboard tras autenticación exitosa.', bold=False)
doc.add_paragraph()
add_paragraph(doc, 'Opciones del menú principal:', bold=True)
menu_items = ['Dashboard (P01)', 'Clientes (P03)', 'Productos (P06)', 'Pedidos (P08)']
for m in menu_items:
    add_bullet(doc, m)

doc.add_paragraph()
add_paragraph(doc, 'Flujo de navegación:', bold=True)
flujo = [
    'Login (P02) → Dashboard (P01)',
    'Dashboard → Listado Clientes (P03) → Formulario Cliente (P04) / Detalle Cliente (P05)',
    'Detalle Cliente (P05) → Formulario Cliente (P04) modo edición',
    'Dashboard → Listado Productos (P06) → Formulario Producto (P07)',
    'Dashboard → Listado Pedidos (P08) → Formulario Pedido (P09) / Detalle Pedido (P10)',
]
for f in flujo:
    add_bullet(doc, f)

doc.add_paragraph()
add_paragraph(doc, 'Pantallas de registro:', bold=True)
for r in ['P04 — Formulario de Cliente', 'P07 — Formulario de Producto', 'P09 — Formulario de Pedido']:
    add_bullet(doc, r)

add_paragraph(doc, 'Pantallas de consulta:', bold=True)
for r in ['P03 — Listado Clientes', 'P05 — Detalle Cliente', 'P06 — Listado Productos', 'P08 — Listado Pedidos', 'P10 — Detalle Pedido']:
    add_bullet(doc, r)

doc.add_page_break()

# ── 2.3 Formularios ──────────────────────────────────────────────────────────
add_heading(doc, '2.3  Definición de Formularios — Prompt 2.3', level=2)

# F01 Login
add_paragraph(doc, 'F01 — Formulario de Login', bold=True)
add_labeled(doc, 'Pantalla', 'P02 — Login')
add_labeled(doc, 'Objetivo', 'Autenticar al usuario antes de acceder al sistema.')
doc.add_paragraph()
f01 = [('usuario', 'Texto', 'Sí'), ('contraseña', 'Password', 'Sí')]
t = doc.add_table(rows=len(f01)+1, cols=3)
t.style = 'Table Grid'
add_table_header(t, ['Campo', 'Tipo', 'Obligatorio'])
for i, row in enumerate(f01):
    fill_row(t, i+1, list(row), center_cols=[1,2])
doc.add_paragraph()
add_labeled(doc, 'Botones', 'Ingresar')
add_labeled(doc, 'Mensajes de error', '"Usuario o contraseña incorrectos" / "Campos obligatorios"')

doc.add_paragraph()

# F02 Cliente
add_paragraph(doc, 'F02 — Formulario de Cliente', bold=True)
add_labeled(doc, 'Pantalla', 'P04 — Formulario de Cliente')
add_labeled(doc, 'Objetivo', 'Registrar un nuevo cliente o editar uno existente.')
doc.add_paragraph()
f02 = [
    ('nombres', 'Texto', 'Sí'),
    ('apellidos', 'Texto', 'Sí'),
    ('identificacion', 'Texto', 'Sí — debe ser única'),
    ('telefono', 'Texto', 'No'),
    ('celular', 'Texto', 'Sí'),
    ('correo', 'Email', 'Sí — formato válido'),
    ('direccion', 'Texto', 'No'),
    ('estadoCivil', 'Select', 'Sí — soltero/casado/divorciado/separado/unión libre'),
    ('estado', 'Select', 'Sí — activo/inactivo'),
]
t2 = doc.add_table(rows=len(f02)+1, cols=3)
t2.style = 'Table Grid'
add_table_header(t2, ['Campo', 'Tipo', 'Obligatorio / Regla'])
for i, row in enumerate(f02):
    fill_row(t2, i+1, list(row), center_cols=[1])
doc.add_paragraph()
add_labeled(doc, 'Botones', 'Guardar, Cancelar')
add_labeled(doc, 'Mensajes de error', '"El campo [X] es obligatorio" / "Correo no válido" / "Identificación ya registrada"')
add_labeled(doc, 'Mensaje de éxito', '"Cliente guardado correctamente"')

doc.add_paragraph()

# F03 Producto
add_paragraph(doc, 'F03 — Formulario de Producto', bold=True)
add_labeled(doc, 'Pantalla', 'P07 — Formulario de Producto')
add_labeled(doc, 'Objetivo', 'Registrar o editar un producto del menú del bar-café.')
doc.add_paragraph()
f03 = [
    ('nombre', 'Texto', 'Sí'),
    ('descripcion', 'Textarea', 'No'),
    ('categoria', 'Select', 'Sí — Bebidas Calientes / Bebidas Frías / Snacks'),
    ('precio', 'Número decimal', 'Sí — mayor a 0'),
    ('disponible', 'Select', 'Sí — Sí / No'),
]
t3 = doc.add_table(rows=len(f03)+1, cols=3)
t3.style = 'Table Grid'
add_table_header(t3, ['Campo', 'Tipo', 'Obligatorio / Regla'])
for i, row in enumerate(f03):
    fill_row(t3, i+1, list(row), center_cols=[1])
doc.add_paragraph()
add_labeled(doc, 'Botones', 'Guardar, Cancelar')
add_labeled(doc, 'Mensajes', '"Producto guardado" / "El precio debe ser mayor a 0"')

doc.add_paragraph()

# F04 Pedido
add_paragraph(doc, 'F04 — Formulario de Pedido', bold=True)
add_labeled(doc, 'Pantalla', 'P09 — Formulario de Pedido')
add_labeled(doc, 'Objetivo', 'Registrar un nuevo pedido asociado a un cliente o mesa.')
doc.add_paragraph()
f04 = [
    ('cliente', 'Select', 'No — puede indicar mesa en su lugar'),
    ('mesa', 'Número', 'No — si no hay cliente registrado'),
    ('productos', 'Selección múltiple', 'Sí — mínimo 1 producto'),
    ('total', 'Calculado automático en JS', '—'),
]
t4 = doc.add_table(rows=len(f04)+1, cols=3)
t4.style = 'Table Grid'
add_table_header(t4, ['Campo', 'Tipo', 'Obligatorio / Regla'])
for i, row in enumerate(f04):
    fill_row(t4, i+1, list(row), center_cols=[1])
doc.add_paragraph()
add_labeled(doc, 'Botones', 'Agregar producto, Quitar producto, Confirmar pedido, Cancelar')
add_labeled(doc, 'Mensajes', '"Debe agregar al menos un producto" / "Pedido registrado correctamente"')

doc.add_page_break()

# ── 2.4 Tablas y tarjetas ────────────────────────────────────────────────────
add_heading(doc, '2.4  Tablas, Tarjetas y Visualización de Datos — Prompt 2.4', level=2)

elementos = [
    ('Tarjetas Dashboard', 'P01 — Dashboard', 'Tarjeta',
     'Total ventas hoy, Pedidos activos, Clientes activos, Productos disponibles',
     'Acceso rápido a cada módulo', '—'),
    ('Tabla de Clientes', 'P03 — Listado Clientes', 'Tabla',
     'id, nombres, apellidos, identificacion, telefono, celular, correo, estadoCivil, estado',
     'Ver detalle, Editar, Cambiar estado', '"No hay clientes registrados"'),
    ('Panel Detalle Cliente', 'P05 — Detalle Cliente', 'Panel',
     'Todos los campos del cliente incluyendo fecha_registro',
     'Editar, Cambiar estado, Regresar', '—'),
    ('Tabla de Productos', 'P06 — Listado Productos', 'Tabla',
     'nombre, categoría, precio, disponible',
     'Editar, Cambiar disponibilidad', '"No hay productos registrados"'),
    ('Tabla de Pedidos', 'P08 — Listado Pedidos', 'Tabla',
     'id, cliente/mesa, total, estado, fecha',
     'Ver detalle, Cambiar estado, Nuevo pedido', '"No hay pedidos registrados"'),
    ('Panel Detalle Pedido', 'P10 — Detalle Pedido', 'Panel + Lista',
     'Cliente/mesa, productos con precios unitarios, total, estado actual',
     'Cambiar estado, Regresar', '—'),
]

t5 = doc.add_table(rows=len(elementos)+1, cols=6)
t5.style = 'Table Grid'
add_table_header(t5, ['Elemento', 'Pantalla', 'Tipo', 'Datos', 'Acciones', 'Msg. vacío'])
for i, row in enumerate(elementos):
    fill_row(t5, i+1, list(row))

doc.add_page_break()

# ── 2.5 Datos simulados ──────────────────────────────────────────────────────
add_heading(doc, '2.5  Datos Simulados — Prompt 2.5', level=2)
add_paragraph(doc,
    'Los siguientes datos se utilizan para probar la interfaz del frontend '
    'antes de conectar el sistema con el backend real.')

doc.add_paragraph()
add_paragraph(doc, 'Clientes simulados:', bold=True)
clientes_sim = [
    ('1','Carlos','Mendoza Rivera','0912345678','042-223344','0991234567','carlos@gmail.com','Av. 9 de Octubre 123','casado','activo','2026-01-15'),
    ('2','María','Torres Loja','0987654321','','0987654321','maria@hotmail.com','','soltero','activo','2026-02-20'),
    ('3','Pedro','Alvarado Gómez','0945678901','042-556677','0956789012','pedro@gmail.com','Cdla. Kennedy Norte','divorciado','inactivo','2026-03-10'),
    ('4','Ana','Paredes Suárez','0934567890','','0934567890','ana@gmail.com','Urdesa Central','casado','activo','2026-04-05'),
    ('5','Luis','Castillo Vera','0923456789','042-778899','0923456789','luis@outlook.com','Los Ceibos','soltero','activo','2026-05-18'),
]
tc = doc.add_table(rows=len(clientes_sim)+1, cols=11)
tc.style = 'Table Grid'
add_table_header(tc, ['id','nombres','apellidos','identificacion','telefono','celular','correo','direccion','estadoCivil','estado','fecha_reg'], fill='2E74B5')
for i, row in enumerate(clientes_sim):
    fill_row(tc, i+1, list(row))

doc.add_paragraph()
add_paragraph(doc, 'Productos simulados:', bold=True)
productos_sim = [
    ('1','Espresso','Café puro e intenso','Bebidas Calientes','$2.50','Sí'),
    ('2','Cappuccino','Doble capa de espuma','Bebidas Calientes','$3.75','Sí'),
    ('3','Caramel Latte','Toque de caramelo artesanal','Bebidas Calientes','$4.50','Sí'),
    ('4','Limonada','Fresca y natural','Bebidas Frías','$2.00','Sí'),
    ('5','Smoothie de Fresa','Batido natural sin azúcar','Bebidas Frías','$3.25','Sí'),
    ('6','Brownie','Chocolate intenso casero','Snacks','$1.75','No'),
]
tp = doc.add_table(rows=len(productos_sim)+1, cols=6)
tp.style = 'Table Grid'
add_table_header(tp, ['id','nombre','descripcion','categoria','precio','disponible'], fill='2E74B5')
for i, row in enumerate(productos_sim):
    fill_row(tp, i+1, list(row))

doc.add_paragraph()
add_paragraph(doc, 'Pedidos simulados:', bold=True)
pedidos_sim = [
    ('1','Carlos Mendoza','—','Espresso, Brownie','$4.25','entregado','2026-06-17'),
    ('2','—','Mesa 3','Cappuccino, Caramel Latte','$8.25','en preparación','2026-06-17'),
    ('3','María Torres','—','Limonada, Smoothie de Fresa','$5.25','pendiente','2026-06-17'),
    ('4','—','Mesa 5','Espresso x2','$5.00','cancelado','2026-06-16'),
]
tped = doc.add_table(rows=len(pedidos_sim)+1, cols=7)
tped.style = 'Table Grid'
add_table_header(tped, ['id','cliente','mesa','productos','total','estado','fecha'], fill='2E74B5')
for i, row in enumerate(pedidos_sim):
    fill_row(tped, i+1, list(row))

doc.add_page_break()

# ── 2.6 Estructura de carpetas ───────────────────────────────────────────────
add_heading(doc, '2.6  Estructura de Carpetas del Frontend — Prompt 2.6', level=2)
add_paragraph(doc,
    'La estructura de carpetas se basa en el modelo proporcionado por el docente '
    'y ha sido adaptada para organizar todos los módulos del sistema BrewManager.')

doc.add_paragraph()
estructura = [
    ('brewmanager/', 'Carpeta raíz del proyecto frontend'),
    ('  pagina.html', 'Página principal — Dashboard del sistema'),
    ('  pages/', 'Contiene todas las páginas secundarias del sistema'),
    ('    login.html', 'Pantalla de inicio de sesión'),
    ('    clientes.html', 'Listado de clientes con búsqueda y acciones'),
    ('    cliente-form.html', 'Formulario para registrar o editar un cliente'),
    ('    cliente-detalle.html', 'Vista de detalle de un cliente específico'),
    ('    productos.html', 'Listado de productos del menú'),
    ('    producto-form.html', 'Formulario para registrar o editar un producto'),
    ('    pedidos.html', 'Listado de pedidos con acciones'),
    ('    pedido-form.html', 'Formulario para registrar un nuevo pedido'),
    ('    pedido-detalle.html', 'Vista de detalle de un pedido específico'),
    ('  css/', 'Estilos personalizados del sistema'),
    ('    estilos.css', 'Variables de color, navbar, tablas, tarjetas y badges'),
    ('  js/', 'Lógica del frontend y datos simulados'),
    ('    datos.js', 'Arrays con datos simulados de clientes, productos y pedidos'),
    ('    clientes.js', 'Funciones del módulo clientes'),
    ('    productos.js', 'Funciones del módulo productos'),
    ('    pedidos.js', 'Funciones del módulo pedidos'),
    ('  img/', 'Imágenes, logos e íconos del sistema'),
    ('  audio/', 'Archivos de audio para notificaciones (si aplica)'),
]
te = doc.add_table(rows=len(estructura)+1, cols=2)
te.style = 'Table Grid'
add_table_header(te, ['Archivo / Carpeta', 'Descripción'])
for i, (arch, desc) in enumerate(estructura):
    row = te.rows[i+1]
    row.cells[0].text = arch
    row.cells[1].text = desc
    for para in row.cells[0].paragraphs:
        para.runs[0].font.name = 'Courier New'
        para.runs[0].font.size = Pt(9)
    for para in row.cells[1].paragraphs:
        para.runs[0].font.size = Pt(10)

doc.add_page_break()

# ── 2.7 Validación Etapa 2 ───────────────────────────────────────────────────
add_heading(doc, '2.7  Validación Final de la Etapa 2 — Prompt 2.10', level=2)

criterios2 = [
    ('Pantallas identificadas y documentadas (P01–P10)', '✓'),
    ('Mapa de navegación definido con flujos claros', '✓'),
    ('Formularios definidos con campos, tipos y validaciones', '✓'),
    ('Tablas y tarjetas definidas con datos y acciones', '✓'),
    ('Datos simulados coherentes con el sistema', '✓'),
    ('Validaciones básicas del lado del cliente definidas', '✓'),
    ('Estructura de carpetas organizada y documentada', '✓'),
    ('Coherencia con los requerimientos aprobados en Etapa 1', '✓'),
]
tv = doc.add_table(rows=len(criterios2)+1, cols=2)
tv.style = 'Table Grid'
add_table_header(tv, ['Criterio de validación', 'Estado'])
for i, (crit, est) in enumerate(criterios2):
    fill_row(tv, i+1, [crit, est], center_cols=[1])

doc.add_paragraph()
res2 = doc.add_paragraph()
res2.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_r2 = res2.add_run('RESULTADO: Aprobado para generar el frontend.')
run_r2.bold = True
run_r2.font.size = Pt(12)
run_r2.font.color.rgb = RGBColor(0x1F, 0x85, 0x3C)

# ══════════════════════════════════════════════════════════════════════════════
#  GUARDAR
# ══════════════════════════════════════════════════════════════════════════════
doc.save('/home/user/Juego/BrewManager_Documentacion.docx')
print('Documento generado correctamente.')
