from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    EmployeeListCreate, EmployeeDetail,
    ArticleListCreate, ArticleDetail,
    CategoryListCreate, CategoryDetail,
    ShoppingListListCreate, ShoppingListDetail,
    OrderListCreate, OrderDetail,
    OrderItemListCreate, OrderItemDetail,
    FinanceOverviewView
)

urlpatterns = [
    # Employee URLs
    path('employees/', EmployeeListCreate.as_view(), name='employee-list-create'),
    path('employees/<int:pk>/', EmployeeDetail.as_view(), name='employee-detail'),

    # Article URLs
    path('articles/', ArticleListCreate.as_view(), name='article-list-create'),
    path('articles/<int:pk>/', ArticleDetail.as_view(), name='article-detail'),

    # Category URLs
    path('categories/', CategoryListCreate.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetail.as_view(), name='category-detail'),

    # Shopping List URLs
    path('shoppinglist/', ShoppingListListCreate.as_view(), name='shopping-list-create'),
    path('shoppinglist/<int:pk>/', ShoppingListDetail.as_view(), name='shopping-list-detail'),

    # Order URLs
    path('orders/', OrderListCreate.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetail.as_view(), name='order-detail'),

    # OrderItem URLs
    path('orderitems/', OrderItemListCreate.as_view(), name='orderitem-list-create'),
    path('orderitems/<int:pk>/', OrderItemDetail.as_view(), name='orderitem-detail'),

    # Finance Overview
    path('finance/', FinanceOverviewView.as_view(), name='finance-overview'),

    # JWT Token Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]