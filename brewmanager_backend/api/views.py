from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Cliente, Producto, Pedido
from .serializers import (
    ClienteSerializer,
    ProductoSerializer,
    PedidoSerializer,
    PedidoCreateSerializer,
)

ESTADOS_PEDIDO = ["pendiente", "en preparación", "entregado", "cancelado"]


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        estado = self.request.query_params.get("estado")
        if estado:
            qs = qs.filter(estado=estado)
        return qs

    @action(detail=True, methods=["patch"], url_path="cambiar-estado")
    def cambiar_estado(self, request, pk=None):
        cliente = self.get_object()
        nuevo = "inactivo" if cliente.estado == "activo" else "activo"
        cliente.estado = nuevo
        cliente.save()
        return Response({"id": cliente.id, "estado": cliente.estado})


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        categoria = self.request.query_params.get("categoria")
        disponible = self.request.query_params.get("disponible")
        if categoria:
            qs = qs.filter(categoria=categoria)
        if disponible is not None:
            qs = qs.filter(disponible=disponible.lower() == "true")
        return qs

    @action(detail=True, methods=["patch"], url_path="cambiar-disponibilidad")
    def cambiar_disponibilidad(self, request, pk=None):
        producto = self.get_object()
        producto.disponible = not producto.disponible
        producto.save()
        return Response({"id": producto.id, "disponible": producto.disponible})


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related("cliente").prefetch_related("detalles__producto")

    def get_serializer_class(self):
        if self.action in ["create"]:
            return PedidoCreateSerializer
        return PedidoSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        estado = self.request.query_params.get("estado")
        if estado:
            qs = qs.filter(estado=estado)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = PedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pedido = serializer.save()
        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="cambiar-estado")
    def cambiar_estado(self, request, pk=None):
        pedido = self.get_object()
        nuevo_estado = request.data.get("estado")
        if nuevo_estado not in ESTADOS_PEDIDO:
            return Response(
                {"error": f"Estado inválido. Opciones: {ESTADOS_PEDIDO}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if pedido.estado in ["entregado", "cancelado"]:
            return Response(
                {"error": f"El pedido ya está '{pedido.estado}' y no puede modificarse."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        pedido.estado = nuevo_estado
        pedido.save()
        return Response({"id": pedido.id, "estado": pedido.estado})
