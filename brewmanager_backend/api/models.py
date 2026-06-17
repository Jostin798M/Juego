from django.db import models


class Cliente(models.Model):
    ESTADO_CIVIL_CHOICES = [
        ("soltero", "Soltero/a"),
        ("casado", "Casado/a"),
        ("divorciado", "Divorciado/a"),
        ("viudo", "Viudo/a"),
    ]
    ESTADO_CHOICES = [
        ("activo", "Activo"),
        ("inactivo", "Inactivo"),
    ]

    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    identificacion = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    celular = models.CharField(max_length=20, blank=True)
    correo = models.EmailField(blank=True)
    direccion = models.TextField(blank=True)
    estado_civil = models.CharField(max_length=20, choices=ESTADO_CIVIL_CHOICES, default="soltero")
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default="activo")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"

    class Meta:
        ordering = ["apellidos", "nombres"]
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"


class Producto(models.Model):
    CATEGORIA_CHOICES = [
        ("Bebidas Calientes", "Bebidas Calientes"),
        ("Bebidas Frías", "Bebidas Frías"),
        ("Snacks", "Snacks"),
    ]

    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    disponible = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

    class Meta:
        ordering = ["categoria", "nombre"]
        verbose_name = "Producto"
        verbose_name_plural = "Productos"


class Pedido(models.Model):
    ESTADO_CHOICES = [
        ("pendiente", "Pendiente"),
        ("en preparación", "En preparación"),
        ("entregado", "Entregado"),
        ("cancelado", "Cancelado"),
    ]

    cliente = models.ForeignKey(
        Cliente, on_delete=models.SET_NULL, null=True, blank=True, related_name="pedidos"
    )
    mesa = models.PositiveIntegerField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="pendiente")
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fecha = models.DateTimeField(auto_now_add=True)

    def calcular_total(self):
        self.total = sum(d.subtotal() for d in self.detalles.all())
        self.save(update_fields=["total"])

    def __str__(self):
        origen = str(self.cliente) if self.cliente else f"Mesa {self.mesa}"
        return f"Pedido #{self.id} — {origen}"

    class Meta:
        ordering = ["-fecha"]
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"


class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name="detalles")
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=8, decimal_places=2)

    def subtotal(self):
        return self.cantidad * self.precio_unitario

    def save(self, *args, **kwargs):
        if not self.precio_unitario:
            self.precio_unitario = self.producto.precio
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.producto.nombre} x{self.cantidad}"

    class Meta:
        verbose_name = "Detalle de Pedido"
        verbose_name_plural = "Detalles de Pedido"
