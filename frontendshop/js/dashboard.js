checkAuth();

function fetchUebersicht() {
    fetch("http://localhost:8000/api/finance/", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById("umsatz").innerText = data.total_revenue + " €";
            document.getElementById("betriebskosten").innerText = data.total_cost + " €";
            document.getElementById("gewinn").innerText = data.total_profit + " €";
        })
        .catch(error => {
            console.error("Fehler beim Abrufen der Finanzdaten:", error);
            document.getElementById("umsatz").innerText = "Fehler";
            document.getElementById("betriebskosten").innerText = "Fehler";
            document.getElementById("gewinn").innerText = "Fehler";
        });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchUebersicht();
    
    // Einkaufsliste-Funktionalität
    const addItemForm = document.getElementById('add-item-form');
    const itemSelect = document.getElementById('item-id');
    const quantityInput = document.getElementById('quantity');
    const shoppingListTable = document.getElementById('shopping-list-table');

    const articlesApiUrl = "http://localhost:8000/api/articles/";
    const shoppingListApiUrl = "http://localhost:8000/api/shoppinglist/";

    // Funktion, um Artikel in die Dropdown-Liste zu laden
    function loadArticles() {
        fetch(articlesApiUrl, {
            headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        }) 
            .then(response => response.json())
            .then(data => {
                data.forEach(article => {
                    const option = document.createElement('option');
                    option.value = article.id;
                    option.textContent = `${article.name} - ${article.price} €`;
                    itemSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Fehler beim Laden der Artikel:', error));
    }

    // Funktion, um die Einkaufsliste anzuzeigen
    function loadShoppingList() {
        fetch(shoppingListApiUrl, {
            headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        }) 
            .then(response => response.json())
            .then(data => {
                shoppingListTable.innerHTML = '';
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>${item.price} €</td>
                        <td>${item.quantity}</td>
                        <td>${item.total_cost} €</td>
                    `;
                    shoppingListTable.appendChild(row);
                });
            })
            .catch(error => console.error('Fehler beim Laden der Einkaufsliste:', error));
    }

    // Artikel zur Einkaufsliste hinzufügen
    addItemForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const itemId = itemSelect.value;
        const quantity = quantityInput.value;

        if (!itemId || !quantity) {
            alert('Bitte wählen Sie einen Artikel und eine Menge aus.');
            return;
        }

        fetch(shoppingListApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + localStorage.getItem("token") 
                
            },
            body: JSON.stringify({ article: itemId, quantity: quantity }),
        })
            .then(response => response.json())
            .then(() => {
                loadShoppingList();
                quantityInput.value = ''; // Reset Menge
            })
            .catch(error => console.error('Fehler beim Hinzufügen des Artikels:', error));
    });

    // Bestellung abschicken
    document.getElementById('place-order-btn').addEventListener('click', function() {
        fetch(shoppingListApiUrl + '/place-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: shoppingList }) // shoppingList müsste eine Variable sein, die alle Artikel der Einkaufsliste enthält
        })
        .then(response => response.json())
        .then(data => {
            alert('Bestellung abgeschickt!');
            loadShoppingList(); // Oder leere die Liste nach der Bestellung
        })
        .catch(error => console.error('Fehler beim Bestellen:', error));
    });

    // Initiale Daten laden
    loadArticles();
    loadShoppingList();
});
