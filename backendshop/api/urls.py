from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView  # JWT Token Views importieren
from .views import (
    EmployeeListCreate, EmployeeDetail,
    ArticleListCreate, ArticleDetail,
    CategoryListCreate, CategoryDetail,
    ShoppingListListCreate, ShoppingListDetail,
    OrderListCreate, OrderDetail,
    OrderItemListCreate, OrderItemDetail,
    FinanceOverviewView, PlaceOrderView
)

urlpatterns = [
    # Employee URLs - URLs für Mitarbeiter
    path('employees/', EmployeeListCreate.as_view(), name='employee-list-create'),  # Liste und Erstellung von Mitarbeitern
    path('employees/<int:pk>/', EmployeeDetail.as_view(), name='employee-detail'),  # Detailansicht eines Mitarbeiters

    # Article URLs - URLs für Artikel
    path('articles/', ArticleListCreate.as_view(), name='article-list-create'),  # Liste und Erstellung von Artikeln
    path('articles/<int:pk>/', ArticleDetail.as_view(), name='article-detail'),  # Detailansicht eines Artikels

    # Category URLs - URLs für Kategorien
    path('categories/', CategoryListCreate.as_view(), name='category-list-create'),  # Liste und Erstellung von Kategorien
    path('categories/<int:pk>/', CategoryDetail.as_view(), name='category-detail'),  # Detailansicht einer Kategorie

    # Shopping List URLs - URLs für die Einkaufsliste
    path('shoppinglist/', ShoppingListListCreate.as_view(), name='shopping-list-create'),  # Liste und Erstellung der Einkaufsliste
    path('shoppinglist/<int:pk>/', ShoppingListDetail.as_view(), name='shopping-list-detail'),  # Detailansicht der Einkaufsliste
    
    path('shoppinglist/place-order/', PlaceOrderView.as_view(), name='place-order'),  # Bestellung aus der Einkaufsliste aufgeben

    # Order URLs - URLs für Bestellungen
    path('orders/', OrderListCreate.as_view(), name='order-list-create'),  # Liste und Erstellung von Bestellungen
    path('orders/<int:pk>/', OrderDetail.as_view(), name='order-detail'),  # Detailansicht einer Bestellung

    # OrderItem URLs - URLs für Bestellpositionen
    path('orderitems/', OrderItemListCreate.as_view(), name='orderitem-list-create'),  # Liste und Erstellung von Bestellpositionen
    path('orderitems/<int:pk>/', OrderItemDetail.as_view(), name='orderitem-detail'),  # Detailansicht einer Bestellposition

    # Finance Overview - URL für die Finanzübersicht
    path('finance/', FinanceOverviewView.as_view(), name='finance-overview'),  # Übersicht über Finanzdaten

    # JWT Token Authentication - URLs für die Authentifizierung mit JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT Token anfordern
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT Token erneuern
]
