function checkAuth() {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

function fetchUebersicht() {
    const formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    });

    fetch("http://localhost:8000/api/finance/", {
        headers: { 
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Netzwerkfehler");
        return response.json();
    })
    .then(data => {
        document.getElementById("monthly-costs").textContent = formatter.format(data.monthly_costs);
        document.getElementById("inventory-value").textContent = formatter.format(data.inventory_value);
        document.getElementById("pending-orders").textContent = formatter.format(data.pending_orders);
        
        const cashflowElement = document.getElementById("cashflow");
        cashflowElement.textContent = formatter.format(data.cashflow);
        cashflowElement.classList.toggle('cashflow-positive', data.cashflow >= 0);
        cashflowElement.classList.toggle('cashflow-negative', data.cashflow < 0);
    })
    .catch(error => {
        console.error("Fehler:", error);
        document.querySelectorAll('.card h2').forEach(el => {
            el.textContent = "Fehler";
            el.classList.add('text-danger');
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();

    const addItemForm = document.getElementById('add-item-form');
    const itemSelect = document.getElementById('item-id');
    const quantityInput = document.getElementById('quantity');
    const shoppingListTable = document.getElementById('shopping-list-table').getElementsByTagName('tbody')[0];

    const articlesApiUrl = "http://localhost:8000/api/articles/";
    const shoppingListApiUrl = "http://localhost:8000/api/shoppinglist/";

    function getAuthHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        };
    }

    function loadArticles() {
        fetch(articlesApiUrl + `?cache=${Date.now()}`, {
            headers: getAuthHeaders(),
            cache: 'no-cache'
        })
        .then(response => {
            if (!response.ok) throw new Error("Artikel laden fehlgeschlagen");
            return response.json();
        })
        .then(data => {
            itemSelect.innerHTML = '<option value="">Artikel wählen...</option>';
            data.forEach(article => {
                const option = document.createElement('option');
                option.value = article.id;
                const price = Number(article.price) || 0;
                option.textContent = `${article.name} - ${price.toFixed(2)} €`;
                itemSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Artikel konnten nicht geladen werden");
        });
    }

    function loadShoppingList() {
        fetch(shoppingListApiUrl + `?cache=${Date.now()}`, {
            headers: getAuthHeaders(),
            cache: 'reload'
        })
        .then(response => {
            if (!response.ok) throw new Error("Einkaufsliste laden fehlgeschlagen");
            return response.json();
        })
        .then(data => {
            shoppingListTable.innerHTML = '';
            data.forEach(item => {
                const price = Number(item.article?.price) || 0;
                const totalPrice = price * item.quantity;
                const row = `
                    <tr data-id="${item.id}">
                        <td>${item.article?.id || '–'}</td>
                        <td>${item.article?.name || 'Unbekannt'}</td>
                        <td>${item.article?.category?.name || '–'}</td>
                        <td>${price.toFixed(2)} €</td>
                        <td class="quantity-cell">
                            <span class="quantity-value">${item.quantity}</span>
                            <div class="edit-quantity d-none">
                                <input type="number" value="${item.quantity}" min="1" class="form-control form-control-sm">
                                <button class="btn btn-success btn-sm save-btn">Speichern</button>
                                <button class="btn btn-secondary btn-sm cancel-btn">Abbrechen</button>
                            </div>
                        </td>
                        <td>${totalPrice.toFixed(2)} €</td>
                        <td>
                            <button class="btn btn-primary btn-sm edit-btn me-1">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-btn">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>`;
                shoppingListTable.insertAdjacentHTML('beforeend', row);
            });

            addEventListeners();
        })
        .catch(error => {
            console.error("Fehler:", error);
            shoppingListTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        Fehler beim Laden der Daten
                    </td>
                </tr>`;
        });
    }

    function addEventListeners() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.closest('tr').dataset.id;
                if (confirm("Artikel wirklich löschen?")) {
                    deleteShoppingListItem(itemId);
                }
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                row.querySelector('.quantity-value').classList.add('d-none');
                row.querySelector('.edit-quantity').classList.remove('d-none');
            });
        });

        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const itemId = row.dataset.id;
                const newQuantity = parseInt(row.querySelector('input').value);
                
                if (newQuantity < 1) {
                    alert("Menge muss mindestens 1 sein");
                    return;
                }

                updateShoppingListItem(itemId, newQuantity);
            });
        });

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                row.querySelector('.quantity-value').classList.remove('d-none');
                row.querySelector('.edit-quantity').classList.add('d-none');
            });
        });
    }

    function deleteShoppingListItem(itemId) {
        fetch(`${shoppingListApiUrl}${itemId}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        .then(response => {
            if (!response.ok) throw new Error("Löschen fehlgeschlagen");
            loadShoppingList();
            fetchUebersicht();
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Fehler beim Löschen: " + error.message);
        });
    }

    function updateShoppingListItem(itemId, newQuantity) {
        // Loading-State aktivieren
        const row = document.querySelector(`tr[data-id="${itemId}"]`);
        if (row) row.classList.add('updating');

        fetch(`${shoppingListApiUrl}${itemId}/`, {
            method: 'PATCH',  // Wichtig: PATCH statt PUT verwenden
            headers: getAuthHeaders(),
            body: JSON.stringify({ quantity: newQuantity })
        })
        .then(response => {
            if (!response.ok) return response.json().then(err => { throw err; });
            loadShoppingList();
            fetchUebersicht();
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Fehler beim Aktualisieren: " + (error.detail || error.message));
            if (row) {
                row.classList.remove('updating');
                row.querySelector('.quantity-value').classList.remove('d-none');
                row.querySelector('.edit-quantity').classList.add('d-none');
            }
        });
    }

    addItemForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const itemId = itemSelect.value;
        const quantity = parseInt(quantityInput.value);

        if (!itemId || !quantity || quantity < 1) {
            alert("Bitte gültige Werte eingeben");
            return;
        }

        fetch(shoppingListApiUrl, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                article_id: itemId,
                quantity: quantity 
            }),
        })
        .then(response => {
            if (!response.ok) return response.json().then(err => { throw err; });
            return response.json();
        })
        .then(() => {
            quantityInput.value = '';
            loadShoppingList();
            fetchUebersicht();
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Fehler: " + (error.detail || error.message));
        });
    });

    document.getElementById('place-order-btn').addEventListener('click', async function() {
        if (!confirm("Alle Artikel bestellen?")) return;
        
        try {
            const response = await fetch(`${shoppingListApiUrl}place-order/`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Bestellung fehlgeschlagen");
            }
        
            alert("Bestellung erfolgreich!");
            loadShoppingList();
            fetchUebersicht();
        } catch (error) {
            console.error("Fehler:", error);
            alert("Fehler: " + error.message);
        }
    });

    loadArticles();
    loadShoppingList();
    fetchUebersicht();
});