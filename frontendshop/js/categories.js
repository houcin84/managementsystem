// Basis-URL für die Kategorien-API
const CATEGORY_API_URL = "http://localhost:8000/api/categories/";
// Token aus dem localStorage laden, um autorisierte Anfragen zu ermöglichen
const token = localStorage.getItem("token");

// Asynchrone Funktion, um alle Kategorien von der API abzurufen und in einer Tabelle darzustellen
async function fetchCategories() {
    // API-Anfrage mit Authentifizierungsheader
    const response = await fetch(CATEGORY_API_URL, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    // Antwort in JSON umwandeln
    const categories = await response.json();
    // Tabelle, in der die Kategorien angezeigt werden, aus dem DOM holen
    const table = document.getElementById("category-table");
    // Vorherige Inhalte löschen
    table.innerHTML = "";
    
    // Für jede Kategorie wird eine Tabellenzeile generiert und hinzugefügt
    categories.forEach(category => {
        table.innerHTML += `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>
                    <!-- Button, der die deleteCategory-Funktion mit der entsprechenden ID aufruft -->
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">Löschen</button>
                </td>
            </tr>`;
    });
}

// Asynchrone Funktion, um eine neue Kategorie zu erstellen
async function addCategory() {
    // Den Namen der Kategorie aus dem Input-Feld holen
    const name = document.getElementById("category-name").value;
    
    // API-Anfrage, um eine neue Kategorie per POST zu erstellen
    const response = await fetch(CATEGORY_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
    });

    // Wenn die Anfrage erfolgreich war...
    if (response.ok) {
        // Die Kategorienliste aktualisieren
        fetchCategories();
        // Das Modal, in dem die Kategorie erstellt wurde, schließen
        const modalElement = document.getElementById('categoryModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
    } else {
        // Bei einem Fehler wird eine Fehlermeldung angezeigt
        alert("Fehler beim Erstellen der Kategorie");
    }
}

// Asynchrone Funktion, um eine Kategorie zu löschen
async function deleteCategory(id) {
    // Bestätigung vom Benutzer einholen, bevor die Kategorie gelöscht wird
    if (confirm("Kategorie wirklich löschen?")) {
        // DELETE-Anfrage an den API-Endpunkt für die spezifische Kategorie
        const response = await fetch(CATEGORY_API_URL + id + "/", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Wenn die Anfrage erfolgreich war, Kategorienliste neu laden
        if (response.ok) {
            fetchCategories();
        } else {
            // Bei einem Fehler wird eine Fehlermeldung angezeigt
            alert("Fehler beim Löschen der Kategorie");
        }
    }
}

// Funktion, um das Modal zum Hinzufügen einer Kategorie zu öffnen
function openCategoryModal() {
    const modalElement = document.getElementById('categoryModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
}

// Sobald das DOM vollständig geladen ist, werden die Kategorien geladen und Eventlistener gesetzt
document.addEventListener("DOMContentLoaded", () => {
    fetchCategories();

    // Eventlistener für den Button, der das Kategorie-Modal öffnet
    const addCategoryBtn = document.getElementById("add-category-btn");
    addCategoryBtn.addEventListener("click", openCategoryModal);
});
