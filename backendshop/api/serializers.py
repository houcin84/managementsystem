from rest_framework import serializers
from .models import Employee, Article, Category, ShoppingList, Order, OrderItem, FinanceOverview

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class ArticleSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Article
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ShoppingListSerializer(serializers.ModelSerializer):
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = ShoppingList
        fields = '__all__'

    def get_total_cost(self, obj):
        return obj.total_cost()
    
    def get_article_name(self, obj):
        return obj.article_name()

class OrderSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_total_price(self, obj):
        return obj.total_price()

class OrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = '__all__'

    def get_total_price(self, obj):
        return obj.total_price()

class FinanceOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceOverview
        fields = '__all__'