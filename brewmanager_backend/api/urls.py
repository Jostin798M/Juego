from django.urls import path
from . import views

urlpatterns = [
    # Clientes
    path("clientes/", views.lista_clientes, name="lista_clientes"),
    path("clientes/<int:pk>/", views.detalle_cliente, name="detalle_cliente"),

    # Productos
    path("productos/", views.lista_productos, name="lista_productos"),
    path("productos/<int:pk>/", views.detalle_producto, name="detalle_producto"),

    # Pedidos
    path("pedidos/", views.lista_pedidos, name="lista_pedidos"),
    path("pedidos/<int:pk>/", views.detalle_pedido, name="detalle_pedido"),
]
