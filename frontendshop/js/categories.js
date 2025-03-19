const CATEGORY_API_URL = "http://localhost:8000/api/categories/";
const token = localStorage.getItem("token");

async function fetchCategories() {
    const response = await fetch(CATEGORY_API_URL, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const categories = await response.json();
    const table = document.getElementById("category-table");
    table.innerHTML = "";
    
    categories.forEach(category => {
        table.innerHTML += `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">Löschen</button>
                </td>
            </tr>`;
    });
}

async function addCategory() {
    const name = document.getElementById("category-name").value;
    
    const response = await fetch(CATEGORY_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
    });

    if (response.ok) {
        fetchCategories();
        const modalElement = document.getElementById('categoryModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
    } else {
        alert("Fehler beim Erstellen der Kategorie");
    }
}

async function deleteCategory(id) {
    if (confirm("Kategorie wirklich löschen?")) {
        const response = await fetch(CATEGORY_API_URL + id + "/", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            fetchCategories();
        } else {
            alert("Fehler beim Löschen der Kategorie");
        }
    }
}

function openCategoryModal() {
    const modalElement = document.getElementById('categoryModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
}

document.addEventListener("DOMContentLoaded", () => {
    fetchCategories();

    // Event Listener für den Button
    const addCategoryBtn = document.getElementById("add-category-btn");
    addCategoryBtn.addEventListener("click", openCategoryModal);
});
