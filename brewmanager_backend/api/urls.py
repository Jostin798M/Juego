from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, ProductoViewSet, PedidoViewSet

router = DefaultRouter()
router.register(r"clientes", ClienteViewSet, basename="cliente")
router.register(r"productos", ProductoViewSet, basename="producto")
router.register(r"pedidos", PedidoViewSet, basename="pedido")

urlpatterns = router.urls
