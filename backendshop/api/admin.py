from django.contrib import admin
from .models import Employee, Article, Category, ShoppingList  # Stelle sicher, dass auch ShoppingList importiert ist, wenn du es registrieren möchtest

admin.site.register(Employee)
admin.site.register(Article)
admin.site.register(Category)
admin.site.register(ShoppingList)  # Wenn du das Modell ShoppingList registrieren möchtest
