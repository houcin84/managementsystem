// Überprüft die Authentifizierung (Token vorhanden, Gültigkeit etc.)
checkAuth();

// Basis-URL für die Mitarbeiter-API
const API_URL = "http://localhost:8000/api/employees/";
// Token aus dem localStorage laden, um autorisierte Anfragen zu ermöglichen
const token = localStorage.getItem("token");

// Asynchrone Funktion, die alle Mitarbeiter von der API abruft und in der Tabelle darstellt
async function fetchEmployees() {
    // API-Anfrage an den Mitarbeiter-Endpunkt mit Authentifizierungsheader
    const response = await fetch(API_URL, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    // Antwort in JSON umwandeln
    const employees = await response.json();
    // Tabelle aus dem DOM holen, in der die Mitarbeiter angezeigt werden
    const table = document.getElementById("employee-table");
    // Vorherige Inhalte der Tabelle löschen
    table.innerHTML = "";
    // Für jeden Mitarbeiter wird eine Tabellenzeile generiert und zur Tabelle hinzugefügt
    employees.forEach(emp => {
        table.innerHTML += `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.first_name}</td>
                <td>${emp.last_name}</td>
                <td>${emp.position}</td>
                <td>${emp.salary} €</td>
                <td>
                    <!-- Button zum Öffnen des Bearbeitungsmodals mit den aktuellen Daten -->
                    <button class="btn btn-primary btn-sm" 
                    onclick="openEditModal(${emp.id}, '${emp.first_name}', '${emp.last_name}', '${emp.position}', ${emp.salary})">Bearbeiten</button>
                    <!-- Button zum Löschen des Mitarbeiters -->
                    <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${emp.id})">Löschen</button>
                </td>
            </tr>`;
    });
}

// Formular zum Hinzufügen eines neuen Mitarbeiters
document.getElementById("add-employee-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Standardformular-Absenden verhindern
    // Funktion, um eine zufällige Mitarbeiter-ID zu generieren (z.B. "EMP123456")
    const generateEmployeeID = () => `EMP${Math.floor(100000 + Math.random() * 900000)}`;
    // Neues Mitarbeiter-Objekt basierend auf den Eingabewerten erstellen
    const newEmployee = {
        first_name: document.getElementById("firstname").value,
        last_name: document.getElementById("lastname").value,
        position: document.getElementById("position").value,
        salary: document.getElementById("salary").value,
        employee_id: generateEmployeeID(),
    };
    // Senden einer POST-Anfrage an die API, um den neuen Mitarbeiter zu erstellen
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newEmployee)
    });
    if (response.ok) {
        // Formular zurücksetzen und Mitarbeiterliste neu laden
        document.getElementById("add-employee-form").reset();
        fetchEmployees();
        // Schließt das Modal, in dem der Mitarbeiter hinzugefügt wurde
        const modalElement = document.getElementById('addEmployeeModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
    } else {
        alert("Fehler beim Erstellen des Mitarbeiters");
    }
});

// Öffnet das Bearbeitungsmodal und füllt es mit den aktuellen Mitarbeiterdaten,
// damit der Benutzer Änderungen vornehmen kann.
function openEditModal(id, first_name, last_name, position, salary) {
    // Setzt die aktuellen Daten in die Eingabefelder des Bearbeitungsmodals
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-firstname").value = first_name;
    document.getElementById("edit-lastname").value = last_name;
    document.getElementById("edit-position").value = position;
    document.getElementById("edit-salary").value = salary;
    // Holt das Bearbeitungsmodal und zeigt es an
    const modalElement = document.getElementById('editEmployeeModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
}

// Formular zum Bearbeiten eines Mitarbeiters: Aktualisiert den Mitarbeiter über eine PUT-Anfrage
document.getElementById("edit-employee-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Standardformular-Absenden verhindern
    // Mitarbeiter-ID aus dem versteckten Feld holen
    const id = document.getElementById("edit-id").value;
    // Neues Mitarbeiter-Objekt mit den aktualisierten Daten erstellen
    const updatedEmployee = {
        employee_id: document.getElementById("edit-id").value,
        first_name: document.getElementById("edit-firstname").value,
        last_name: document.getElementById("edit-lastname").value,
        position: document.getElementById("edit-position").value,
        salary: document.getElementById("edit-salary").value
    };
    // Senden einer PUT-Anfrage an die API, um die Änderungen zu speichern
    const response = await fetch(API_URL + id + "/", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedEmployee)
    });
    if (response.ok) {
        // Nach erfolgreicher Aktualisierung Mitarbeiterliste neu laden und Modal schließen
        fetchEmployees();
        const modalElement = document.getElementById('editEmployeeModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
    } else {
        alert("Fehler beim Bearbeiten des Mitarbeiters");
    }
});

// Funktion zum Löschen eines Mitarbeiters
async function deleteEmployee(id) {
    // Bestätigung vom Benutzer einholen, bevor der Mitarbeiter gelöscht wird
    if (confirm("Mitarbeiter wirklich löschen?")) {
        // Senden einer DELETE-Anfrage an die API für den entsprechenden Mitarbeiter
        const response = await fetch(API_URL + id + "/", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            // Nach erfolgreichem Löschen Mitarbeiterliste neu laden
            fetchEmployees();
        } else {
            alert("Fehler beim Löschen des Mitarbeiters");
        }
    }
}

// Beim Laden des DOM wird die Mitarbeiterliste automatisch abgerufen
document.addEventListener("DOMContentLoaded", () => {
    fetchEmployees();
});
