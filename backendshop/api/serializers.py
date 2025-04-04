from rest_framework import serializers
from .models import Employee, Article, Category, ShoppingList, Order, OrderItem, FinanceOverview

# Serialisierer für die Anzeige des Kategorienamens (nur für GET-Anfragen)
class CategoryNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']

# Serialisierer für Artikel
class ArticleSerializer(serializers.ModelSerializer):
    category = CategoryNameSerializer(read_only=True)  # Gibt den Kategorienamen für GET-Anfragen zurück
    category_id = serializers.PrimaryKeyRelatedField(   # Ermöglicht das Setzen der Kategorie-ID für POST/PUT-Anfragen
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Article
        fields = ['id', 'name', 'price', 'category', 'category_id', 'stock', 'reorder_level']

# Serialisierer für Mitarbeiter (keine speziellen Anpassungen notwendig)
class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

# Standard-Serialisierer für Kategorien
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# Serialisierer für die Einkaufsliste
class ShoppingListSerializer(serializers.ModelSerializer):
    article = ArticleSerializer(read_only=True)  # Zeigt die vollständigen Artikeldetails an
    article_id = serializers.PrimaryKeyRelatedField(  # Ermöglicht die Zuordnung eines Artikels über die ID
        queryset=Article.objects.all(),
        source='article',
        write_only=True
    )
    total_cost = serializers.SerializerMethodField()  # Berechnet die Gesamtkosten für den Artikel

    class Meta:
        model = ShoppingList
        fields = ['id', 'article', 'article_id', 'quantity', 'total_cost']

    def get_total_cost(self, obj):
        """Berechnet die Gesamtkosten eines Artikels in der Einkaufsliste."""
        return obj.article.price * obj.quantity

# Serialisierer für Bestellungen
class OrderSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()  # Berechnet den Gesamtpreis der Bestellung

    class Meta:
        model = Order
        fields = '__all__'

    def get_total_price(self, obj):
        """Gibt den Gesamtpreis der Bestellung zurück (Methode aus dem Modell aufgerufen)."""
        return obj.total_price()

# Serialisierer für Bestellpositionen innerhalb einer Bestellung
class OrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()  # Berechnet den Gesamtpreis des Artikels in der Bestellung

    class Meta:
        model = OrderItem
        fields = '__all__'

    def get_total_price(self, obj):
        """Berechnet den Gesamtpreis eines einzelnen Artikels in der Bestellung."""
        return obj.total_price()

# Serialisierer für die Finanzübersicht
class FinanceOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceOverview
        fields = '__all__'
