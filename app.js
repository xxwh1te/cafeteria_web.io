// app.js

// --- 0. Toast Notification Function ---
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error('Toast container not found!');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast');
    if (type) {
        toast.classList.add(type); // 'success', 'error', 'info'
    }
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Usa una Promise para esperar la animación de entrada antes de aplicar la de salida
    // y luego remover el toast. Esto es más controlable que solo animationend.
    setTimeout(() => {
        // Asegúrate de que el toast aún existe antes de intentar removerlo
        if (toast.parentNode) {
            toast.style.animation = 'fadeOut 0.5s forwards'; // Aplicar animación de salida
            // Para móviles, aplicar la animación específica
            if (window.innerWidth <= 768) {
                toast.style.animation = 'fadeOutMobile 0.5s forwards';
            }
            // Remover después de que la animación de salida termine
            toast.addEventListener('animationend', (event) => {
                if (event.animationName === 'fadeOut' || event.animationName === 'fadeOutMobile') {
                    toast.remove();
                }
            }, { once: true }); // Usar { once: true } para que el listener se dispare una sola vez
        }
    }, duration); // Duración que el toast se mantiene visible antes de empezar a desaparecer
}


// --- Variables y referencias DOM ---
let carrito = JSON.parse(localStorage.getItem('carrito')) || []; // Cargar carrito del localStorage o inicializar vacío

const pedidoSidebar = document.getElementById("pedidoSidebar");
const showPedidoBtn = document.getElementById("showPedido");
const closePedidoBtn = document.getElementById("closePedido");
const overlay = document.getElementById("overlay");
const cantidadItemsSpan = document.getElementById("cantidadItems");
const listaPedidoUL = document.getElementById("listaPedido");
const totalPedidoP = document.getElementById("total");
const finalizarPedidoBtn = document.getElementById("finalizarPedidoBtn");
const vaciarPedidoBtn = document.getElementById("vaciarPedidoBtn");

// Nuevas referencias para el menú de hamburguesa
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navLinks = document.getElementById('navLinks');


// --- Funciones del Carrito ---

function actualizarCarritoUI() {
    listaPedidoUL.innerHTML = ""; // Limpiar la lista actual

    let totalCalculado = 0;
    
    if (carrito.length === 0) {
        listaPedidoUL.innerHTML = '<li style="text-align: center; color: var(--light-brown-text);">Tu carrito está vacío.</li>';
        finalizarPedidoBtn.disabled = true;
        vaciarPedidoBtn.disabled = true;
    } else {
        finalizarPedidoBtn.disabled = false;
        vaciarPedidoBtn.disabled = false;

        carrito.forEach((item, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.nombre}</span>
                    <span class="item-qty-price">${item.cantidad} x S/.${item.precioUnitario.toFixed(2)}</span>
                </div>
                <span>S/.${(item.cantidad * item.precioUnitario).toFixed(2)}</span>
                <button class="eliminar-item-btn" data-index="${index}" title="Eliminar ${item.nombre}">✕</button>
            `;
            listaPedidoUL.appendChild(li);

            totalCalculado += item.cantidad * item.precioUnitario;
        });
    }

    totalPedidoP.textContent = `Total: S/. ${totalCalculado.toFixed(2)}`;
    cantidadItemsSpan.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0); // Suma todas las cantidades
    
    // Guardar el carrito en localStorage después de cada actualización
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarProductoAlCarrito(nombre, precio) {
    const itemExistente = carrito.find(item => item.nombre === nombre);

    if (itemExistente) {
        itemExistente.cantidad++;
        itemExistente.precioTotal = itemExistente.cantidad * itemExistente.precioUnitario; // Actualiza precio total del item
    } else {
        carrito.push({
            nombre: nombre,
            precioUnitario: precio,
            cantidad: 1,
            precioTotal: precio
        });
    }
    actualizarCarritoUI();
    showToast(`"${nombre}" añadido al carrito.`, 'success');
}

function eliminarProductoDelCarrito(index) {
    if (index >= 0 && index < carrito.length) {
        const nombreProductoEliminado = carrito[index].nombre;
        carrito.splice(index, 1); // Elimina el elemento del array
        actualizarCarritoUI();
        showToast(`"${nombreProductoEliminado}" eliminado del carrito.`, 'error');
    }
}

function finalizarPedido() {
    if (carrito.length === 0) {
        showToast("No has agregado ningún producto para finalizar el pedido.", 'error');
        return;
    }

    showToast(`¡Pedido finalizado con éxito! Total: ${totalPedidoP.textContent}. ¡Gracias por tu compra!`, 'success', 4000);

    carrito = [];
    actualizarCarritoUI();

    setTimeout(() => {
        pedidoSidebar.classList.remove("show");
        overlay.classList.remove("show");
        document.body.style.overflow = '';
    }, 500);
}

function vaciarTodoElCarrito() {
    if (carrito.length === 0) {
        showToast("Tu carrito ya está vacío.", 'info');
        return;
    }

    if (confirm("¿Estás seguro que deseas vaciar todo el pedido?")) {
        carrito = [];
        actualizarCarritoUI();
        showToast("Tu carrito ha sido vaciado.", 'info');
    }
}


// --- Manejo de Eventos UI ---

document.addEventListener("DOMContentLoaded", () => {
    // Restaurar el estado del scroll del body si el overlay o sidebar estaban abiertos antes de recargar
    if (pedidoSidebar.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
    }

    // Event listener para el botón de Cerrar Sesión
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => { 
            localStorage.removeItem('loggedIn');
            showToast("Sesión cerrada. ¡Vuelve pronto!", 'info');
            setTimeout(() => {
                window.location.href = "index.html"; 
            }, 500);
        });
    }

    // Event listeners para los botones de "Agregar" producto
    const agregarBtns = document.querySelectorAll(".agregar-btn");
    agregarBtns.forEach(button => {
        button.addEventListener("click", (event) => {
            const nombre = event.target.dataset.nombre;
            const precio = parseFloat(event.target.dataset.precio);
            agregarProductoAlCarrito(nombre, precio);
        });
    });

    // Event listener para mostrar el sidebar del pedido
    if (showPedidoBtn) {
        showPedidoBtn.addEventListener("click", (e) => {
            e.preventDefault(); 
            pedidoSidebar.classList.add("show");
            overlay.classList.add("show");
            document.body.style.overflow = 'hidden';
            // Cierra el menú de hamburguesa si está abierto al abrir el carrito
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburgerMenu.classList.remove('active');
            }
        });
    }

    // Event listener para cerrar el sidebar (botón '✕')
    if (closePedidoBtn) {
        closePedidoBtn.addEventListener("click", () => {
            pedidoSidebar.classList.remove("show");
            overlay.classList.remove("show");
            document.body.style.overflow = '';
        });
    }

    // Event listener para cerrar el sidebar (clic en el overlay)
    if (overlay) {
        overlay.addEventListener("click", () => {
            // Cierra el sidebar del carrito si está abierto
            if (pedidoSidebar.classList.contains('show')) {
                pedidoSidebar.classList.remove("show");
                overlay.classList.remove("show");
                document.body.style.overflow = '';
            }
            // Cierra el menú de hamburguesa si está abierto
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburgerMenu.classList.remove('active');
                document.body.style.overflow = ''; // También restaura el scroll si cierra el menú
            }
        });
    }

    // Event listener para el botón "Finalizar Pedido"
    if (finalizarPedidoBtn) {
        finalizarPedidoBtn.addEventListener("click", finalizarPedido);
    }

    // Event listener para el botón "Vaciar Pedido"
    if (vaciarPedidoBtn) {
        vaciarPedidoBtn.addEventListener("click", vaciarTodoElCarrito);
    }

    // Delegación de eventos para los botones de eliminar dentro de la lista del carrito
    if (listaPedidoUL) {
        listaPedidoUL.addEventListener('click', (event) => {
            if (event.target.classList.contains('eliminar-item-btn')) {
                const index = parseInt(event.target.dataset.index);
                eliminarProductoDelCarrito(index);
            }
        });
    }

    // --- Lógica del Menú de Hamburguesa ---
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            // Controla el scroll del body cuando el menú está abierto/cerrado
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Opcional: Cerrar el menú de hamburguesa al hacer clic en un enlace de navegación
        const navLinksA = navLinks.querySelectorAll('a');
        navLinksA.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = ''; // Restaura el scroll
            });
        });
    }

    // Inicializa la lista del pedido al cargar la página (para cargar desde localStorage)
    actualizarCarritoUI();
});