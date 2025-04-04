from django.db import models

# Modell für Mitarbeiter
class Employee(models.Model):
    first_name = models.CharField(max_length=100)  # Vorname des Mitarbeiters
    last_name = models.CharField(max_length=100)   # Nachname des Mitarbeiters
    salary = models.DecimalField(max_digits=10, decimal_places=2)  # Gehalt
    employee_id = models.CharField(max_length=50, unique=True)  # Eindeutige Mitarbeiter-ID
    shift_time = models.CharField(max_length=50, null=True)  # Arbeitszeit (optional)
    position = models.CharField(max_length=100)  # Position im Unternehmen

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# Modell für Kategorien (z. B. Warengruppen)
class Category(models.Model):
    name = models.CharField(max_length=255)  # Name der Kategorie

    def __str__(self):
        return self.name

# Modell für Artikel (Produkte, Waren)
class Article(models.Model):
    reorder_level = models.IntegerField(default=10)
    name = models.CharField(max_length=255)  # Name des Artikels
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Preis des Artikels
    stock = models.IntegerField()  # Lagerbestand
    category = models.ForeignKey(Category, on_delete=models.CASCADE)  # Kategorie-Zuordnung

    def __str__(self):
        return self.name

# Modell für die Einkaufsliste
class ShoppingList(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)  # Artikel in der Einkaufsliste
    quantity = models.IntegerField()  # Menge des Artikels

    def article_name(self):
        """Gibt den Namen des Artikels zurück."""
        return self.article.name 

    def total_cost(self):
        """Berechnet die Gesamtkosten für diesen Artikel basierend auf der Menge."""
        return self.article.price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.article.name}"

# Modell für eine Bestellung
class Order(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)  # Zeitpunkt der Bestellung

    def total_price(self):
        """Berechnet den Gesamtpreis der Bestellung aus allen Bestellpositionen."""
        return sum(item.total_price() for item in self.items.all())

# Modell für eine einzelne Bestellposition innerhalb einer Bestellung
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)  # Zugehörige Bestellung
    article = models.ForeignKey(Article, on_delete=models.CASCADE)  # Bestellter Artikel
    quantity = models.IntegerField()  # Anzahl des bestellten Artikels
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Preis des Artikels (zum Zeitpunkt der Bestellung)

    def total_price(self):
        """Berechnet den Gesamtpreis für diese Bestellposition."""
        return self.quantity * self.price

# Modell für die Finanzübersicht
class FinanceOverview(models.Model):
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Gesamtumsatz
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Gesamtkosten
    total_profit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Gesamtgewinn

    def __str__(self):
        return f"Revenue: {self.total_revenue} €, Cost: {self.total_cost} €, Profit: {self.total_profit} €"
