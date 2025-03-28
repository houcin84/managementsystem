from django.contrib import admin
from .models import Employee, Article, Category, ShoppingList  # Importiere die Modelle, die im Admin-Panel verwaltet werden sollen

# Registriere die Modelle für das Django Admin-Panel
admin.site.register(Employee)  # Ermöglicht die Verwaltung von Mitarbeitern
admin.site.register(Article)  # Ermöglicht die Verwaltung von Artikeln
admin.site.register(Category)  # Ermöglicht die Verwaltung von Kategorien
admin.site.register(ShoppingList)  # Ermöglicht die Verwaltung der Einkaufsliste
