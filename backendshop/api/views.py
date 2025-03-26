from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Sum, F
from .models import Employee, Article, Category, ShoppingList, Order, OrderItem, FinanceOverview
from .serializers import EmployeeSerializer, ArticleSerializer, CategorySerializer, ShoppingListSerializer, OrderSerializer, OrderItemSerializer

# Employee Views
class EmployeeListCreate(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmployeeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

# Article Views
class ArticleListCreate(generics.ListCreateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

class ArticleDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

# Category Views
class CategoryListCreate(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

# ShoppingList Views
class ShoppingListListCreate(generics.ListCreateAPIView):
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer
    permission_classes = [permissions.IsAuthenticated]

class ShoppingListDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer
    permission_classes = [permissions.IsAuthenticated]

# Order Views
class OrderListCreate(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

# OrderItem Views
class OrderItemListCreate(generics.ListCreateAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrderItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

# Finance Overview View
class FinanceOverviewView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Alle Berechnungen in Decimal
            total_salaries = Employee.objects.aggregate(
                total=Sum('salary')
            )['total'] or 0

            inventory_value = Article.objects.aggregate(
                total=Sum(F('price') * F('stock'))
            )['total'] or 0

            pending_orders = ShoppingList.objects.aggregate(
                total=Sum(F('article__price') * F('quantity'))
            )['total'] or 0

            cashflow = inventory_value - pending_orders - total_salaries

            return Response({
                "monthly_costs": float(total_salaries),
                "inventory_value": float(inventory_value),
                "pending_orders": float(pending_orders),
                "cashflow": float(cashflow)
            }, status=200)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )