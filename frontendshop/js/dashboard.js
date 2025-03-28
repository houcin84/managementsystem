// Prüft, ob ein Token im localStorage vorhanden ist, um unautorisierte Zugriffe zu verhindern
function checkAuth() {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html"; // Umleitung zur Login-Seite
    }
}

// Logout-Funktion: Entfernt das Token und leitet zur Login-Seite weiter
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// Holt Finanzdaten vom Server und aktualisiert die Anzeige
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
        // Aktualisiert die Finanzwerte mit formatierten Beträgen
        document.getElementById("monthly-costs").textContent = formatter.format(data.monthly_costs);
        document.getElementById("inventory-value").textContent = formatter.format(data.inventory_value);
        document.getElementById("pending-orders").textContent = formatter.format(data.pending_orders);
        
        // Setzt den Cashflow-Wert und passt das Design an (positiv oder negativ)
        const cashflowElement = document.getElementById("cashflow");
        cashflowElement.textContent = formatter.format(data.cashflow);
        cashflowElement.classList.toggle('cashflow-positive', data.cashflow >= 0);
        cashflowElement.classList.toggle('cashflow-negative', data.cashflow < 0);
    })
    .catch(error => {
        console.error("Fehler:", error);
        // Falls ein Fehler auftritt, wird eine Fehlermeldung angezeigt
        document.querySelectorAll('.card h2').forEach(el => {
            el.textContent = "Fehler";
            el.classList.add('text-danger');
        });
    });
}

// Führt Funktionen nach dem Laden der Seite aus
document.addEventListener("DOMContentLoaded", () => {
    checkAuth(); // Prüft Authentifizierung

    // Referenzen zu den relevanten Elementen
    const addItemForm = document.getElementById('add-item-form');
    const itemSelect = document.getElementById('item-id');
    const quantityInput = document.getElementById('quantity');
    const shoppingListTable = document.getElementById('shopping-list-table').getElementsByTagName('tbody')[0];

    // API-Endpunkte
    const articlesApiUrl = "http://localhost:8000/api/articles/";
    const shoppingListApiUrl = "http://localhost:8000/api/shoppinglist/";

    // Erzeugt das Header-Objekt für authentifizierte API-Anfragen
    function getAuthHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        };
    }

    // Lädt verfügbare Artikel in das Dropdown-Menü
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
                const price = Number(article.price) || 0; // Preis sicher als Zahl behandeln
                option.textContent = `${article.name} - ${price.toFixed(2)} €`;
                itemSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Artikel konnten nicht geladen werden");
        });
    }

    // Lädt die Einkaufsliste und zeigt sie in der Tabelle an
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
            shoppingListTable.innerHTML = ''; // Leert die aktuelle Tabelle
            data.forEach(item => {
                const price = Number(item.article?.price) || 0; // Preis sicherstellen
                const totalPrice = price * item.quantity; // Gesamtpreis berechnen
                const row = `
                    <tr>
                        <td>${item.article?.id || '–'}</td>
                        <td>${item.article?.name || 'Unbekannt'}</td>
                        <td>${item.article?.category?.name || '–'}</td> <!-- Kategorie -->
                        <td>${price.toFixed(2)} €</td>
                        <td>${item.quantity}</td>
                        <td>${totalPrice.toFixed(2)} €</td>
                        <td>
                            <button class="btn btn-danger btn-sm delete-btn" 
                                    data-id="${item.id}"
                                    title="Löschen">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>`;
                shoppingListTable.insertAdjacentHTML('beforeend', row);
            });

            // Event-Listener für die Lösch-Buttons hinzufügen
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm("Artikel wirklich löschen?")) {
                        deleteShoppingListItem(btn.dataset.id);
                    }
                });
            });
        })
        .catch(error => {
            console.error("Fehler:", error);
            shoppingListTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        Fehler beim Laden der Daten
                    </td>
                </tr>`;
        });
    }

    // Löscht einen Artikel aus der Einkaufsliste
    function deleteShoppingListItem(itemId) {
        fetch(`${shoppingListApiUrl}${itemId}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        .then(response => {
            if (!response.ok) throw new Error("Löschen fehlgeschlagen");
            loadShoppingList(); // Liste nach dem Löschen neu laden
            fetchUebersicht(); // Finanzdaten aktualisieren
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Fehler beim Löschen: " + error.message);
        });
    }

    // Fügt einen neuen Artikel zur Einkaufsliste hinzu
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
            loadShoppingList(); // Einkaufsliste neu laden
            fetchUebersicht(); // Finanzdaten aktualisieren
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Fehler: " + (error.detail || error.message));
        });
    });

    // Bestellt alle Artikel in der Einkaufsliste
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
            loadShoppingList(); // Einkaufsliste leeren
            fetchUebersicht(); // Finanzdaten aktualisieren
        } catch (error) {
            console.error("Fehler:", error);
            alert("Fehler: " + error.message);
        }
    });

    // Initiale Daten laden
    loadArticles();
    loadShoppingList();
    fetchUebersicht();
});
