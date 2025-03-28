// Überprüft, ob der Benutzer authentifiziert ist (Token vorhanden) und leitet andernfalls zur Login-Seite um.
checkAuth();

const API_URL = "http://localhost:8000/api/articles/";
const CATEGORY_URL = "http://localhost:8000/api/categories/";
const token = localStorage.getItem("token"); // Token wird aus dem localStorage geladen

// Funktion, um Artikel von der API abzurufen und in der Tabelle anzuzeigen.
function fetchArticles() {
    fetch(API_URL, { headers: { "Authorization": `Bearer ${token}` } })
        .then(response => response.json())
        .then(articles => {
            let table = document.getElementById("article-table");
            table.innerHTML = ""; // Bestehende Tabelleneinträge löschen
            articles.forEach(article => {
                // Für jeden Artikel wird eine Tabellenzeile erstellt und eingefügt
                table.innerHTML += `
                    <tr>
                        <td>${article.id}</td>
                        <td>${article.name}</td>
                        <td>${article.price} €</td>
                        <td>${article.stock}</td>
                        <td>${article.category.name}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editArticle(${article.id})">Bearbeiten</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteArticle(${article.id})">Löschen</button>
                        </td>
                    </tr>`;
            });
        })
        .catch(error => console.error("Fehler beim Abrufen der Artikel:", error));
}

// Funktion, um Kategorien von der API abzurufen und in den entsprechenden Select-Feldern anzuzeigen.
function loadCategories() {
    fetch(CATEGORY_URL, { headers: { "Authorization": `Bearer ${token}` } })
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById("category");
            const editCategorySelect = document.getElementById("edit-category");
            // Setzt eine Standardoption für die Kategorieauswahl
            categorySelect.innerHTML = '<option value="">Kategorie wählen</option>';
            editCategorySelect.innerHTML = '<option value="">Kategorie wählen</option>';

            // Fügt jede Kategorie als Option zu beiden Select-Feldern hinzu
            categories.forEach(category => {
                categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
                editCategorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        })
        .catch(error => console.error("Fehler beim Laden der Kategorien:", error));
}

// Eventlistener für das Formular zum Hinzufügen eines neuen Artikels.
// Verhindert den Standardformularversand, sammelt Formulardaten und sendet sie per POST-Anfrage an die API.
document.getElementById("add-article-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const newArticle = {
        name: document.getElementById("name").value,
        price: document.getElementById("price").value,
        stock: document.getElementById("stock").value,
        category_id: document.getElementById("category").value,
    };

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newArticle),
    }).then(response => {
        if (response.ok) {
            // Formular zurücksetzen und Artikel neu laden
            document.getElementById("add-article-form").reset();
            fetchArticles();
            // Schließt das Modal zum Hinzufügen eines Artikels
            let modal = bootstrap.Modal.getInstance(document.getElementById("addArticleModal"));
            modal.hide();
        } else {
            alert("Fehler beim Erstellen des Artikels");
        }
    });
});

// Asynchrone Funktion zum Löschen eines Artikels. Zeigt eine Bestätigungsmeldung an und sendet dann eine DELETE-Anfrage an die API.
async function deleteArticle(id) {
    if (confirm("Artikel wirklich löschen?")) {
        await fetch(API_URL + id + "/", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        }).then(response => {
            if (response.ok) {
                // Nach erfolgreichem Löschen die Artikelliste neu laden
                fetchArticles();
            } else {
                alert("Fehler beim Löschen des Artikels");
            }
        });
    }
}

// Funktion zum Bearbeiten eines Artikels. Ruft die Artikel-Daten ab und füllt das Bearbeitungsformular, das in einem Modal angezeigt wird.
function editArticle(id) {
    fetch(API_URL + id + "/", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
    })
        .then(response => response.json())
        .then(article => {
            // Setzt die aktuellen Artikelwerte in die Formularfelder
            document.getElementById("edit-article-id").value = article.id;
            document.getElementById("edit-name").value = article.name;
            document.getElementById("edit-price").value = article.price;
            document.getElementById("edit-stock").value = article.stock;
            document.getElementById("edit-category").value = article.category.id;

            // Zeigt das Bearbeitungs-Modal an
            const modal = new bootstrap.Modal(document.getElementById('editArticleModal'));
            modal.show();
        })
        .catch(error => console.error("Fehler:", error));
}

// Eventlistener für das Formular zum Bearbeiten eines Artikels.
// Sammelt die geänderten Daten und sendet sie per PUT-Anfrage an die API.
document.getElementById("edit-article-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedArticle = {
        name: document.getElementById("edit-name").value,
        price: document.getElementById("edit-price").value,
        stock: document.getElementById("edit-stock").value,
        category_id: document.getElementById("edit-category").value,
    };

    const articleId = document.getElementById("edit-article-id").value;

    fetch(API_URL + articleId + "/", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(updatedArticle),
    }).then(response => {
        if (response.ok) {
            // Nach erfolgreicher Bearbeitung wird die Artikel-Liste neu geladen und das Modal geschlossen.
            fetchArticles();
            let modal = bootstrap.Modal.getInstance(document.getElementById("editArticleModal"));
            modal.hide();
        } else {
            alert("Fehler beim Bearbeiten des Artikels");
        }
    });
});

// Beim Laden des DOM werden zunächst die Artikel und Kategorien geladen, um die Seite zu initialisieren.
document.addEventListener("DOMContentLoaded", () => {
    fetchArticles();
    loadCategories();
});
