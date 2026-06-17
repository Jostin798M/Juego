from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
import os

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("", lambda req: __import__('django.http', fromlist=['HttpResponseRedirect']).HttpResponseRedirect('/static/pagina.html')),
    re_path(r"^static/(?P<path>.*)$", serve, {"document_root": os.path.join(settings.BASE_DIR, "..", "brewmanager")}),
]
