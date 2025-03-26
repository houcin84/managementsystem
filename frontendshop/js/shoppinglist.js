// Wartet, bis das DOM vollständig geladen wurde, bevor alle weiteren Aktionen ausgeführt werden.
document.addEventListener("DOMContentLoaded", () => {
    // Holen der Formularelemente und relevanter DOM-Knoten
    const addItemForm = document.getElementById("add-item-form");
    const itemSelect = document.getElementById("item-id");
    const quantityInput = document.getElementById("quantity");
    const shoppingListTable = document.getElementById("shopping-list-table").getElementsByTagName('tbody')[0];

    // API-Endpunkte für Artikel und Einkaufsliste
    const articlesApiUrl = "http://localhost:8000/api/articles/";
    const shoppingListApiUrl = "http://localhost:8000/api/shoppinglist/";

    // Hilfsfunktion, um die erforderlichen Authentifizierungs-Header zurückzugeben
    function getAuthHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        };
    }

    // Lädt alle verfügbaren Artikel und füllt das Dropdown-Auswahlfeld
    function loadArticles() {
        fetch(articlesApiUrl + `?cache=${Date.now()}`, {
            headers: getAuthHeaders(),
            cache: 'no-cache'
        })
        .then(response => {
            if (!response.ok) throw new Error("Artikel fehlgeschlagen");
            return response.json();
        })
        .then(data => {
            // Setzt eine Standardoption und fügt alle Artikel als Optionen hinzu
            itemSelect.innerHTML = '<option value="">Bitte wählen...</option>';
            data.forEach(article => {
                const option = document.createElement("option");
                option.value = article.id;
                option.textContent = `${article.name} - ${article.price.toFixed(2)} €`;
                itemSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Artikel konnten nicht geladen werden");
        });
    }

    // Lädt die aktuelle Einkaufsliste und zeigt sie in der Tabelle an
    function loadShoppingList() {
        const url = shoppingListApiUrl + `?cache=${Date.now()}`;
        
        fetch(url, {
            headers: getAuthHeaders(),
            cache: 'reload'
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Tabelle leeren, bevor neue Einträge eingefügt werden
            shoppingListTable.innerHTML = "";
            data.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item.article?.id ?? 'N/A'}</td>
                    <td>${item.article?.name ?? 'N/A'}</td>
                    <td>${item.article?.price?.toFixed(2) ?? 'N/A'} €</td>
                    <td>${item.quantity ?? 'N/A'}</td>
                    <td>${(item.article?.price * item.quantity)?.toFixed(2) ?? 'N/A'} €</td>
                    <td><button class="delete-btn" data-id="${item.id}">Löschen</button></td>
                `;
                // Zeile zur Tabelle hinzufügen
                shoppingListTable.appendChild(row);
            });

            // Fügt jedem "Löschen"-Button einen Klick-Eventlistener hinzu, um den entsprechenden Eintrag zu entfernen
            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", () => deleteShoppingListItem(btn.dataset.id));
            });
        })
        .catch(error => {
            console.error("Fehler:", error);
            shoppingListTable.innerHTML = '<tr><td colspan="6">Fehler beim Laden</td></tr>';
        });
    }

    // Löscht einen Artikel aus der Einkaufsliste
    function deleteShoppingListItem(itemId) {
        // Bestätigung durch den Benutzer
        if (!confirm("Artikel wirklich löschen?")) return;
        
        fetch(`${shoppingListApiUrl}${itemId}/`, {
            method: "DELETE",
            headers: getAuthHeaders()
        })
        .then(response => {
            if (!response.ok) throw new Error("Löschen fehlgeschlagen");
            // Nach erfolgreichem Löschen wird die Liste neu geladen
            loadShoppingList();
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Fehler: " + error.message);
        });
    }

    // Eventlistener für das Formular zum Hinzufügen eines neuen Artikels zur Einkaufsliste
    addItemForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Verhindert das Standardformularverhalten
        const itemId = itemSelect.value;
        const quantity = quantityInput.value;

        // Validierung: Überprüft, ob Artikel und Menge ausgewählt bzw. eingegeben wurden
        if (!itemId || !quantity) {
            alert("Bitte Artikel und Menge wählen");
            return;
        }

        // POST-Anfrage zum Hinzufügen eines neuen Eintrags in die Einkaufsliste
        fetch(shoppingListApiUrl, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                article_id: itemId,
                quantity: quantity
            }),
        })
        .then(response => {
            // Bei Fehlern wird die Fehlermeldung als JSON zurückgegeben und weitergeworfen
            if (!response.ok) return response.json().then(err => { throw err; });
            return response.json();
        })
        .then(data => {
            console.log("Neuer Eintrag:", data);
            // Nach erfolgreichem Hinzufügen wird die Einkaufsliste neu geladen und das Mengeneingabefeld geleert
            loadShoppingList();
            quantityInput.value = "";
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Fehler: " + (error.detail || error.message));
        });
    });

    // Eventlistener für den Button, der die Bestellung abschickt
    document.getElementById("place-order-btn").addEventListener("click", function() {
        // Bestätigung durch den Benutzer, ob die Bestellung wirklich abgeschickt werden soll
        if (!confirm("Bestellung wirklich abschicken?")) return;
        
        fetch(`${shoppingListApiUrl}place-order/`, {
            method: "POST",
            headers: getAuthHeaders()
        })
        .then(response => {
            if (!response.ok) throw new Error("Bestellung fehlgeschlagen");
            alert("Bestellung erfolgreich!");
            // Nach erfolgreicher Bestellung wird die Einkaufsliste geleert/neugeladen
            loadShoppingList();
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Fehler: " + error.message);
        });
    });

    // Initiale Ladefunktionen: Artikel und Einkaufsliste werden beim Laden der Seite abgerufen
    loadArticles();
    loadShoppingList();
});
