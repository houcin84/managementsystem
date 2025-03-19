// Login-Formular
document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:8000/api/token/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.access); // Token speichern
            console.log("Token gespeichert:", data.access); // Debug-Ausgabe
            window.location.href = "dashboard.html"; // Weiterleitung zum Dashboard
        } else {
            console.error("Fehler bei der Anmeldung:", response.status, response.statusText);
            document.getElementById("login-error").style.display = "block"; // Fehlermeldung anzeigen
        }
    } catch (error) {
        console.error("Fehler bei der Anmeldung:", error);
        document.getElementById("login-error").style.display = "block"; // Fehlermeldung anzeigen
    }
});

// Überprüfung der Authentifizierung
async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        // Wenn kein Token vorhanden ist, zur Login-Seite weiterleiten
        if (window.location.pathname !== "/login.html") {
            window.location.href = "login.html";
        }
        return;
    }

    // Überprüfen, ob das Token gültig ist
    try {
        const response = await fetch("http://localhost:8000/api/finance/", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (response.status === 401) {
            // Token ist ungültig oder abgelaufen
            console.log("Das Token ist ungültig oder abgelaufen.");
            logout();
        } else if (response.status === 200) {
            // Token ist gültig
            const data = await response.json();
            console.log("Authentifizierung erfolgreich:", data);
        } else {
            // Anderer Fehler
            console.error("Fehler bei der Anfrage:", response.status);
            logout();
        }
    } catch (error) {
        console.error("Fehler bei der Authentifizierung oder API-Anfrage:", error);
        logout();
    }
}

// Logout-Funktion
function logout() {
    localStorage.removeItem("token"); // Token entfernen
    window.location.href = "login.html"; // Zur Login-Seite weiterleiten
}

// Überprüfung der Authentifizierung beim Laden der Seite
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname !== "/login.html") {
        checkAuth();
    }
});