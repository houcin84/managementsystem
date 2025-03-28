from rest_framework import generics, permissions, status  # Importiere notwendige Klassen und Funktionen
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, F  # Importiere Funktionen für Aggregation und Berechnungen
from .models import Employee, Article, Category, ShoppingList, Order, OrderItem, FinanceOverview
from .serializers import EmployeeSerializer, ArticleSerializer, CategorySerializer, ShoppingListSerializer, OrderSerializer, OrderItemSerializer

# Employee Views
class EmployeeListCreate(generics.ListCreateAPIView):
    # Ermöglicht das Auflisten und Erstellen von Mitarbeitern
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]  # Nur authentifizierte Benutzer dürfen auf diese Ansicht zugreifen

class EmployeeDetail(generics.RetrieveUpdateDestroyAPIView):
    # Ermöglicht das Abrufen, Bearbeiten und Löschen von Mitarbeiterdaten
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

# Article Views
class ArticleListCreate(generics.ListCreateAPIView):
    # Ermöglicht das Auflisten und Erstellen von Artikeln
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

class ArticleDetail(generics.RetrieveUpdateDestroyAPIView):
    # Ermöglicht das Abrufen, Bearbeiten und Löschen von Artikeln
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

# Category Views
class CategoryListCreate(generics.ListCreateAPIView):
    # Ermöglicht das Auflisten und Erstellen von Kategorien
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    # Ermöglicht das Abrufen, Bearbeiten und Löschen von Kategorien
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

# ShoppingList Views
class ShoppingListListCreate(generics.ListCreateAPIView):
    # Ermöglicht das Auflisten und Erstellen von Einkaufsliste-Daten mit optimierter Abfrage (select_related für Artikel und Kategorie)
    queryset = ShoppingList.objects.select_related('article__category')  # Optimierung für weniger Datenbankabfragen
    serializer_class = ShoppingListSerializer
    permission_classes = [permissions.IsAuthenticated]

class ShoppingListDetail(generics.RetrieveUpdateDestroyAPIView):
    # Ermöglicht das Abrufen, Bearbeiten und Löschen von Einkaufsliste-Daten
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer
    permission_classes = [permissions.IsAuthenticated]

# Order Views
class OrderListCreate(generics.ListCreateAPIView):
    # Ermöglicht das Auflisten und Erstellen von Bestellungen
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    # Ermöglicht das Abrufen, Bearbeiten und Löschen von Bestellungen
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class PlaceOrderView(APIView):
    # Logik für das Bestellen von Artikeln aus dem Warenkorb
    def post(self, request):
        try:
            # 1. Warenkorb laden
            # 2. Bestellung erstellen
            # 3. Warenkorb leeren
            return Response({"detail": "Bestellung erfolgreich"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# OrderItem Views
class OrderItemListCreate(generics.ListCreateAPIView):
    # Ermöglicht das Auflisten und Erstellen von Bestellpositionen
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrderItemDetail(generics.RetrieveUpdateDestroyAPIView):
    # Ermöglicht das Abrufen, Bearbeiten und Löschen von Bestellpositionen
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

# Finance Overview View
class FinanceOverviewView(generics.GenericAPIView):
    # Ermöglicht das Abrufen von Finanzübersichten
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Berechnungen in Decimal, um Genauigkeit sicherzustellen
            total_salaries = Employee.objects.aggregate(
                total=Sum('salary')  # Gesamtgehalt aller Mitarbeiter
            )['total'] or 0  # Falls kein Gehalt vorhanden ist, 0 als Standardwert

            inventory_value = Article.objects.aggregate(
                total=Sum(F('price') * F('stock'))  # Gesamtwert des Lagerbestands
            )['total'] or 0  # Falls kein Artikel vorhanden ist, 0 als Standardwert

            pending_orders = ShoppingList.objects.aggregate(
                total=Sum(F('article__price') * F('quantity'))  # Gesamtwert der Bestellungen in der Einkaufsliste
            )['total'] or 0  # Falls keine Bestellungen vorhanden sind, 0 als Standardwert

            cashflow = inventory_value - pending_orders - total_salaries  # Berechnung des Cashflows

            return Response({
                "monthly_costs": float(total_salaries),  # Gehälter als monatliche Kosten
                "inventory_value": float(inventory_value),  # Gesamtwert des Lagerbestands
                "pending_orders": float(pending_orders),  # Gesamtwert der offenen Bestellungen
                "cashflow": float(cashflow)  # Cashflow (Einnahmen - Ausgaben)
            }, status=200)

        except Exception as e:
            return Response(
                {"error": str(e)},  # Fehlerbehandlung bei Ausnahmen
                status=500
            )
