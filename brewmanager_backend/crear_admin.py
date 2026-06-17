import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "brewmanager_backend.settings")
django.setup()

from django.contrib.auth.models import User

if User.objects.filter(username="admin").exists():
    print("El usuario admin ya existe.")
else:
    User.objects.create_superuser("admin", "admin@brewmanager.com", "1234")
    print("Superusuario admin creado correctamente.")
