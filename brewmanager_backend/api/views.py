from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json

from .models import Cliente, Producto, Pedido, DetallePedido


# ===== CLIENTES =====

@csrf_exempt
def lista_clientes(request):
    if request.method == "GET":
        data = list(Cliente.objects.values(
            "id", "nombres", "apellidos", "identificacion",
            "telefono", "celular", "correo", "direccion",
            "estado_civil", "estado", "fecha_registro"
        ))
        return JsonResponse(data, safe=False)

    if request.method == "POST":
        body = json.loads(request.body)
        cliente = Cliente.objects.create(**body)
        return JsonResponse({"id": cliente.id, "mensaje": "Cliente creado."}, status=201)

    return JsonResponse({"error": "Método no permitido."}, status=405)


@csrf_exempt
def detalle_cliente(request, pk):
    cliente = get_object_or_404(Cliente, pk=pk)

    if request.method == "GET":
        data = {
            "id": cliente.id,
            "nombres": cliente.nombres,
            "apellidos": cliente.apellidos,
            "identificacion": cliente.identificacion,
            "telefono": cliente.telefono,
            "celular": cliente.celular,
            "correo": cliente.correo,
            "direccion": cliente.direccion,
            "estado_civil": cliente.estado_civil,
            "estado": cliente.estado,
            "fecha_registro": cliente.fecha_registro,
        }
        return JsonResponse(data)

    if request.method == "PUT":
        body = json.loads(request.body)
        for campo, valor in body.items():
            setattr(cliente, campo, valor)
        cliente.save()
        return JsonResponse({"mensaje": "Cliente actualizado."})

    if request.method == "DELETE":
        cliente.delete()
        return JsonResponse({"mensaje": "Cliente eliminado."})

    return JsonResponse({"error": "Método no permitido."}, status=405)


# ===== PRODUCTOS =====

@csrf_exempt
def lista_productos(request):
    if request.method == "GET":
        data = list(Producto.objects.values(
            "id", "nombre", "descripcion", "categoria", "precio", "disponible"
        ))
        return JsonResponse(data, safe=False)

    if request.method == "POST":
        body = json.loads(request.body)
        producto = Producto.objects.create(**body)
        return JsonResponse({"id": producto.id, "mensaje": "Producto creado."}, status=201)

    return JsonResponse({"error": "Método no permitido."}, status=405)


@csrf_exempt
def detalle_producto(request, pk):
    producto = get_object_or_404(Producto, pk=pk)

    if request.method == "GET":
        data = {
            "id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "categoria": producto.categoria,
            "precio": str(producto.precio),
            "disponible": producto.disponible,
        }
        return JsonResponse(data)

    if request.method == "PUT":
        body = json.loads(request.body)
        for campo, valor in body.items():
            setattr(producto, campo, valor)
        producto.save()
        return JsonResponse({"mensaje": "Producto actualizado."})

    if request.method == "DELETE":
        producto.delete()
        return JsonResponse({"mensaje": "Producto eliminado."})

    return JsonResponse({"error": "Método no permitido."}, status=405)


# ===== PEDIDOS =====

@csrf_exempt
def lista_pedidos(request):
    if request.method == "GET":
        pedidos = []
        for p in Pedido.objects.select_related("cliente").prefetch_related("detalles__producto"):
            pedidos.append({
                "id": p.id,
                "cliente": str(p.cliente) if p.cliente else None,
                "mesa": p.mesa,
                "estado": p.estado,
                "total": str(p.total),
                "fecha": p.fecha,
                "detalles": [
                    {
                        "producto": d.producto.nombre,
                        "cantidad": d.cantidad,
                        "precio_unitario": str(d.precio_unitario),
                        "subtotal": str(d.subtotal()),
                    }
                    for d in p.detalles.all()
                ],
            })
        return JsonResponse(pedidos, safe=False)

    if request.method == "POST":
        body = json.loads(request.body)
        detalles = body.pop("detalles", [])
        pedido = Pedido.objects.create(**body)
        for det in detalles:
            producto = get_object_or_404(Producto, pk=det["producto_id"])
            DetallePedido.objects.create(
                pedido=pedido,
                producto=producto,
                cantidad=det["cantidad"],
                precio_unitario=producto.precio,
            )
        pedido.calcular_total()
        return JsonResponse({"id": pedido.id, "total": str(pedido.total), "mensaje": "Pedido creado."}, status=201)

    return JsonResponse({"error": "Método no permitido."}, status=405)


@csrf_exempt
def detalle_pedido(request, pk):
    pedido = get_object_or_404(Pedido, pk=pk)

    if request.method == "GET":
        data = {
            "id": pedido.id,
            "cliente": str(pedido.cliente) if pedido.cliente else None,
            "mesa": pedido.mesa,
            "estado": pedido.estado,
            "total": str(pedido.total),
            "fecha": pedido.fecha,
            "detalles": [
                {
                    "producto": d.producto.nombre,
                    "cantidad": d.cantidad,
                    "precio_unitario": str(d.precio_unitario),
                    "subtotal": str(d.subtotal()),
                }
                for d in pedido.detalles.select_related("producto")
            ],
        }
        return JsonResponse(data)

    if request.method == "PUT":
        body = json.loads(request.body)
        for campo, valor in body.items():
            setattr(pedido, campo, valor)
        pedido.save()
        return JsonResponse({"mensaje": "Pedido actualizado."})

    if request.method == "DELETE":
        pedido.delete()
        return JsonResponse({"mensaje": "Pedido eliminado."})

    return JsonResponse({"error": "Método no permitido."}, status=405)
