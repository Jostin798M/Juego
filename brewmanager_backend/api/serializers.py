from rest_framework import serializers
from .models import Cliente, Producto, Pedido, DetallePedido


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"


class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = "__all__"


class DetallePedidoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = DetallePedido
        fields = ["id", "producto", "producto_nombre", "cantidad", "precio_unitario", "subtotal"]

    def get_subtotal(self, obj):
        return obj.subtotal()


class DetallePedidoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = ["producto", "cantidad"]


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True, read_only=True)
    cliente_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = ["id", "cliente", "cliente_nombre", "mesa", "estado", "total", "fecha", "detalles"]
        read_only_fields = ["total", "fecha"]

    def get_cliente_nombre(self, obj):
        return str(obj.cliente) if obj.cliente else None


class PedidoCreateSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoCreateSerializer(many=True, write_only=True)

    class Meta:
        model = Pedido
        fields = ["cliente", "mesa", "estado", "detalles"]

    def validate(self, data):
        if not data.get("cliente") and not data.get("mesa"):
            raise serializers.ValidationError("Debe indicar un cliente o número de mesa.")
        if not data.get("detalles"):
            raise serializers.ValidationError("El pedido debe tener al menos un producto.")
        return data

    def create(self, validated_data):
        detalles_data = validated_data.pop("detalles")
        pedido = Pedido.objects.create(**validated_data)
        for det in detalles_data:
            DetallePedido.objects.create(
                pedido=pedido,
                producto=det["producto"],
                cantidad=det["cantidad"],
                precio_unitario=det["producto"].precio,
            )
        pedido.calcular_total()
        return pedido
