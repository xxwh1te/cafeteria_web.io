document.addEventListener('DOMContentLoaded', function() {

    // --- 2. Lógica para mostrar/ocultar el formulario de Login (Modal) ---
    const btnShow = document.getElementById("showLogin");
    const loginBox = document.getElementById("loginBox");
    const closeBtn = document.getElementById("closeLogin");
    
    // Si tienes el overlayLogin en tu HTML (que es lo más recomendado), obtenlo por su ID:
    const overlayLogin = document.getElementById("overlayLogin"); 
   

    if (btnShow && loginBox && overlayLogin) {
        btnShow.addEventListener("click", () => {
            loginBox.classList.add("show");
            overlayLogin.classList.add("show");
            document.body.style.overflow = "hidden"; // Evita el scroll de la página de fondo
        });
    }

    if (closeBtn && loginBox && overlayLogin) {
        closeBtn.addEventListener("click", () => {
            loginBox.classList.remove("show");
            overlayLogin.classList.remove("show");
            document.body.style.overflow = ""; // Restaura el scroll
        });
    }

    if (overlayLogin && loginBox) {
        overlayLogin.addEventListener("click", () => {
            loginBox.classList.remove("show");
            overlayLogin.classList.remove("show");
            document.body.style.overflow = ""; // Restaura el scroll
        });
    }

    // --- 3. Lógica de Envío del Formulario de Login ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Evita que la página se recargue
            
            const email = document.getElementById("emailInput").value;
            const password = document.getElementById("passwordInput").value;

            // Lógica de autenticación:
            if (email === "ruben@gmail.com" && password === "1234") { 
                localStorage.setItem('loggedIn', 'true'); 
                window.location.href = "cafeteria.html"; 
            } else {
                alert("Email o contraseña incorrectos."); 
            }
        });
    }

});