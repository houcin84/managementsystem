from django.db import models

class Employee(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    employee_id = models.CharField(max_length=50, unique=True)
    shift_time = models.CharField(max_length=50, null=True)
    position = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Article(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class ShoppingList(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    
    def article_name(self):
        return self.article.name 

    def total_cost(self):
        return self.article.price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.article.name}"

class Order(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    def total_price(self):
        return sum(item.total_price() for item in self.items.all())

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def total_price(self):
        return self.quantity * self.price

class FinanceOverview(models.Model):
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_profit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Revenue: {self.total_revenue} €, Cost: {self.total_cost} €, Profit: {self.total_profit} €"