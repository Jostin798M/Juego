from django.contrib import admin
from .models import Cliente, Producto, Pedido, DetallePedido


class DetallePedidoInline(admin.TabularInline):
    model = DetallePedido
    extra = 1


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("id", "nombres", "apellidos", "identificacion", "celular", "estado")
    list_filter = ("estado", "estado_civil")
    search_fields = ("nombres", "apellidos", "identificacion")


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "categoria", "precio", "disponible")
    list_filter = ("categoria", "disponible")
    search_fields = ("nombre",)


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ("id", "cliente", "mesa", "estado", "total", "fecha")
    list_filter = ("estado",)
    inlines = [DetallePedidoInline]


@admin.register(DetallePedido)
class DetallePedidoAdmin(admin.ModelAdmin):
    list_display = ("id", "pedido", "producto", "cantidad", "precio_unitario")
