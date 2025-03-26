// Login-Formular: Falls das Element vorhanden ist, wird ein Eventlistener hinzugefügt,
// um das Formular asynchron abzusenden und den Login-Vorgang durchzuführen.
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // Standard-Formular-Absenden verhindern
        // Werte für Benutzername und Passwort aus den Eingabefeldern holen
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            // Sende eine POST-Anfrage an den Token-Endpunkt, um ein Authentifizierungstoken zu erhalten
            const response = await fetch("http://localhost:8000/api/token/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                // Wenn die Anfrage erfolgreich war, wird das Token aus der Antwort extrahiert
                const data = await response.json();
                // Token im localStorage speichern, um es für weitere API-Anfragen zu nutzen
                localStorage.setItem("token", data.access);
                console.log("Token gespeichert:", data.access);
                // Bei erfolgreichem Login wird der Benutzer zur Dashboard-Seite weitergeleitet
                window.location.href = "dashboard.html";
            } else {
                // Bei einem Fehler wird eine Fehlermeldung in der Konsole ausgegeben und eine Fehlermeldung angezeigt
                console.error("Fehler bei der Anmeldung:", response.status, response.statusText);
                document.getElementById("login-error").style.display = "block";
            }
        } catch (error) {
            // Fehlerbehandlung: Falls ein Netzwerkfehler oder ein anderer Fehler auftritt
            console.error("Fehler bei der Anmeldung:", error);
            document.getElementById("login-error").style.display = "block";
        }
    });
}

// Funktion zur Überprüfung der Authentifizierung
// Prüft, ob ein Token vorhanden ist und ob dieses gültig ist, indem eine Anfrage an einen geschützten Endpunkt gesendet wird.
async function checkAuth() {
    const token = localStorage.getItem("token");
    // Falls kein Token vorhanden ist, wird der Benutzer zur Login-Seite umgeleitet
    if (!token) {
        if (window.location.pathname !== "/login.html") {
            window.location.href = "login.html";
        }
        return;
    }

    try {
        // Anfrage an den Finanzdaten-Endpunkt, um die Gültigkeit des Tokens zu überprüfen
        const response = await fetch("http://localhost:8000/api/finance/", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (response.status === 401) {
            // Wenn der Server mit 401 antwortet, ist das Token ungültig oder abgelaufen
            console.log("Das Token ist ungültig oder abgelaufen.");
            logout(); // Benutzer ausloggen
        } else if (response.status === 200) {
            // Bei einer erfolgreichen Antwort wird das Ergebnis geloggt (optional für Debugging)
            const data = await response.json();
            console.log("Authentifizierung erfolgreich:", data);
        } else {
            // Für alle anderen HTTP-Statuscodes wird ein Fehler ausgegeben und der Benutzer ausgeloggt
            console.error("Fehler bei der Anfrage:", response.status);
            logout();
        }
    } catch (error) {
        // Fehler bei der Authentifizierung oder API-Anfrage: Benutzer wird ausgeloggt
        console.error("Fehler bei der Authentifizierung oder API-Anfrage:", error);
        logout();
    }
}

// Logout-Funktion: Entfernt das Token aus dem localStorage und leitet den Benutzer zur Login-Seite weiter.
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// Beim Laden des DOM (Document Object Model) wird geprüft, ob der Benutzer authentifiziert ist,
// sofern die aktuelle Seite nicht bereits die Login-Seite ist.
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname !== "/login.html") {
        checkAuth();
    }
});
