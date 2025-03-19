checkAuth();

const API_URL = "http://localhost:8000/api/employees/";
const token = localStorage.getItem("token");

// Holt alle Mitarbeiter und zeigt sie in der Tabelle an
async function fetchEmployees() {
    const response = await fetch(API_URL, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const employees = await response.json();
    const table = document.getElementById("employee-table");
    table.innerHTML = "";
    employees.forEach(emp => {
        table.innerHTML += `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.first_name}</td>
                <td>${emp.last_name}</td>
                <td>${emp.position}</td>
                <td>${emp.salary} €</td>
                <td>
                    <button class="btn btn-primary btn-sm" 
                    onclick="openEditModal(${emp.id}, '${emp.first_name}', '${emp.last_name}', '${emp.position}', ${emp.salary})">Bearbeiten</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${emp.id})">Löschen</button>
                </td>
            </tr>`;
    });
}

// Formular zum Hinzufügen eines Mitarbeiters
document.getElementById("add-employee-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const generateEmployeeID = () => `EMP${Math.floor(100000 + Math.random() * 900000)}`;
    const newEmployee = {
        first_name: document.getElementById("firstname").value,
        last_name: document.getElementById("lastname").value,
        position: document.getElementById("position").value,
        salary: document.getElementById("salary").value,
        employee_id: generateEmployeeID(),
    };
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newEmployee)
    });
    if (response.ok) {
        document.getElementById("add-employee-form").reset();
        fetchEmployees();
        const modalElement = document.getElementById('addEmployeeModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
    } else {
        alert("Fehler beim Erstellen des Mitarbeiters");
    }
});

// Öffnet das Bearbeitungsmodal und füllt es mit den aktuellen Mitarbeiterdaten
function openEditModal(id, first_name, last_name, position, salary) {
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-firstname").value = first_name;
    document.getElementById("edit-lastname").value = last_name;
    document.getElementById("edit-position").value = position;
    document.getElementById("edit-salary").value = salary;
    const modalElement = document.getElementById('editEmployeeModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
}

// Bearbeitet einen Mitarbeiter
document.getElementById("edit-employee-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById("edit-id").value;
    const updatedEmployee = {
        first_name: document.getElementById("edit-firstname").value,
        last_name: document.getElementById("edit-lastname").value,
        position: document.getElementById("edit-position").value,
        salary: document.getElementById("edit-salary").value
    };
    const response = await fetch(API_URL + id + "/", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedEmployee)
    });
    if (response.ok) {
        fetchEmployees();
        const modalElement = document.getElementById('editEmployeeModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
    } else {
        alert("Fehler beim Bearbeiten des Mitarbeiters");
    }
});

// Löscht einen Mitarbeiter
async function deleteEmployee(id) {
    if (confirm("Mitarbeiter wirklich löschen?")) {
        const response = await fetch(API_URL + id + "/", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            fetchEmployees();
        } else {
            alert("Fehler beim Löschen des Mitarbeiters");
        }
    }
}

// Lädt alle Mitarbeiter beim Laden der Seite
document.addEventListener("DOMContentLoaded", () => {
    fetchEmployees();
});
