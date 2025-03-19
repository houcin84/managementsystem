checkAuth();

const API_URL = "http://localhost:8000/api/articles/";
const CATEGORY_URL = "http://localhost:8000/api/categories/";
const token = localStorage.getItem("token");

function fetchArticles() {
    fetch(API_URL, { headers: { "Authorization": `Bearer ${token}` } })
        .then(response => response.json())
        .then(articles => {
            let table = document.getElementById("article-table");
            table.innerHTML = "";
            articles.forEach(article => {
                table.innerHTML += `
                    <tr>
                        <td>${article.id}</td>
                        <td>${article.name}</td>
                        <td>${article.price} €</td>
                        <td>${article.stock}</td>
                        <td>${article.category}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editArticle(${article.id})">Bearbeiten</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteArticle(${article.id})">Löschen</button>
                        </td>
                    </tr>`;
            });
        })
        .catch(error => console.error("Fehler beim Abrufen der Artikel:", error));
}

function loadCategories() {
    fetch(CATEGORY_URL, { headers: { "Authorization": `Bearer ${token}` } })
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById("category");
            const editCategorySelect = document.getElementById("edit-category");
            categorySelect.innerHTML = '<option value="">Kategorie wählen</option>';
            editCategorySelect.innerHTML = '<option value="">Kategorie wählen</option>';

            categories.forEach(category => {
                categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
                editCategorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        })
        .catch(error => console.error("Fehler beim Laden der Kategorien:", error));
}

document.getElementById("add-article-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const newArticle = {
        name: document.getElementById("name").value,
        price: document.getElementById("price").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
    };

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newArticle),
    }).then(response => {
        if (response.ok) {
            document.getElementById("add-article-form").reset();
            fetchArticles();
            let modal = bootstrap.Modal.getInstance(document.getElementById("addArticleModal"));
            modal.hide();
        } else {
            alert("Fehler beim Erstellen des Artikels");
        }
    });
});

async function deleteArticle(id) {
    if (confirm("Artikel wirklich löschen?")) {
        await fetch(API_URL + id + "/", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        }).then(response => {
            if (response.ok) {
                fetchArticles();
            } else alert("Fehler beim Löschen des Artikels");
        });
    }
}

function editArticle(id) {
    fetch(API_URL + id + "/", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
    })
        .then(response => response.json())
        .then(article => {
            document.getElementById("edit-article-id").value = article.id;
            document.getElementById("edit-name").value = article.name;
            document.getElementById("edit-price").value = article.price;
            document.getElementById("edit-stock").value = article.stock;
            document.getElementById("edit-category").value = article.category;

            const modal = new bootstrap.Modal(document.getElementById('editArticleModal'));
            modal.show();
        })
        .catch(error => console.error("Fehler:", error));
}

document.getElementById("edit-article-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedArticle = {
        name: document.getElementById("edit-name").value,
        price: document.getElementById("edit-price").value,
        stock: document.getElementById("edit-stock").value,
        category: document.getElementById("edit-category").value,
    };

    const articleId = document.getElementById("edit-article-id").value;

    fetch(API_URL + articleId + "/", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(updatedArticle),
    }).then(response => {
        if (response.ok) {
            fetchArticles();
            let modal = bootstrap.Modal.getInstance(document.getElementById("editArticleModal"));
            modal.hide();
        } else {
            alert("Fehler beim Bearbeiten des Artikels");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    fetchArticles();
    loadCategories();
});