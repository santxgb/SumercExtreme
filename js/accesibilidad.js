/* Panel de ajustes de accesibilidad.
   Este archivo se carga en el <head> (sin defer) para aplicar los ajustes guardados
   antes de que se pinte la página; el panel se conecta cuando el HTML ya cargó. */

const CLAVE_AJUSTES = "sumercAjustesAccesibilidad";

const AJUSTES_INICIALES = {
    tamanoTexto: "normal",
    altoContraste: false,
    subrayarEnlaces: false,
    masEspacio: false,
    sinAnimaciones: false
};

// Clase que se pone en <html> por cada ajuste activado
const CLASES = {
    altoContraste: "altoContraste",
    subrayarEnlaces: "subrayarEnlaces",
    masEspacio: "masEspacio",
    sinAnimaciones: "sinAnimaciones"
};

const CLASES_TEXTO = {
    pequeno: "textoPequeno",
    grande: "textoGrande"
};

function leerAjustes() {
    try {
        const guardados = JSON.parse(localStorage.getItem(CLAVE_AJUSTES));
        return { ...AJUSTES_INICIALES, ...guardados };
    } catch (error) {
        // Sin acceso a localStorage (modo privado, por ejemplo): se usan los valores iniciales
        return { ...AJUSTES_INICIALES };
    }
}

function guardarAjustes(ajustes) {
    try {
        localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(ajustes));
    } catch (error) {
        // Si no se puede guardar, los ajustes funcionan igual mientras la página esté abierta
    }
}

function aplicarAjustes(ajustes) {
    const raiz = document.documentElement;

    for (const [nombre, clase] of Object.entries(CLASES)) {
        raiz.classList.toggle(clase, ajustes[nombre]);
    }

    raiz.classList.remove(CLASES_TEXTO.pequeno, CLASES_TEXTO.grande);
    if (CLASES_TEXTO[ajustes.tamanoTexto]) {
        raiz.classList.add(CLASES_TEXTO[ajustes.tamanoTexto]);
    }
}

// Pone los controles del panel en el estado guardado
function mostrarAjustesEnPanel(panel, ajustes) {
    const radio = panel.querySelector(`input[name="tamanoTexto"][value="${ajustes.tamanoTexto}"]`);
    if (radio) {
        radio.checked = true;
    }

    for (const nombre of Object.keys(CLASES)) {
        const interruptor = panel.querySelector(`input[name="${nombre}"]`);
        if (interruptor) {
            interruptor.checked = ajustes[nombre];
        }
    }
}

function conectarPanel() {
    const panel = document.getElementById("panelAccesibilidad");
    const botonAbrir = document.querySelector(".botonAccesibilidad");

    // Si el navegador no soporta <dialog>, el botón sigue llevando a la página de accesibilidad
    if (!panel || !botonAbrir || typeof panel.showModal !== "function") {
        return;
    }

    let ajustes = leerAjustes();
    mostrarAjustesEnPanel(panel, ajustes);

    botonAbrir.addEventListener("click", (evento) => {
        evento.preventDefault();
        panel.showModal();
        botonAbrir.setAttribute("aria-expanded", "true");
    });

    panel.addEventListener("close", () => {
        botonAbrir.setAttribute("aria-expanded", "false");
    });

    panel.querySelector(".panelCerrar").addEventListener("click", () => {
        panel.close();
    });

    // Clic en el fondo oscuro (fuera del recuadro) cierra el panel. Esc lo cierra el propio <dialog>.
    panel.addEventListener("click", (evento) => {
        if (evento.target === panel) {
            panel.close();
        }
    });

    // Cualquier cambio en el panel se aplica y se guarda de inmediato
    panel.addEventListener("change", (evento) => {
        const control = evento.target;

        if (control.name === "tamanoTexto") {
            ajustes.tamanoTexto = control.value;
        } else if (control.name in CLASES) {
            ajustes[control.name] = control.checked;
        } else {
            return;
        }

        aplicarAjustes(ajustes);
        guardarAjustes(ajustes);
    });

    panel.querySelector(".panelRestablecer").addEventListener("click", () => {
        ajustes = { ...AJUSTES_INICIALES };
        aplicarAjustes(ajustes);
        guardarAjustes(ajustes);
        mostrarAjustesEnPanel(panel, ajustes);
    });
}

aplicarAjustes(leerAjustes());
document.addEventListener("DOMContentLoaded", conectarPanel);
