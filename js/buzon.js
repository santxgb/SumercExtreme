/* Validación del buzón de sugerencias.
   Muestra los errores debajo de cada campo (en vez de los globos del navegador) y,
   si todo está bien, lleva a la página de confirmación. El sitio no tiene servidor,
   así que la sugerencia no se envía a ningún lado. */

const MINIMO_MENSAJE = 10;

// Cada regla revisa un campo y devuelve el texto del error, o "" si está bien
const REGLAS = [
    {
        campo: (formulario) => formulario.querySelector('input[name="tipo"]'),
        revisar: (formulario) =>
            formulario.querySelector('input[name="tipo"]:checked') ? "" : "Elige el tipo de sugerencia."
    },
    {
        campo: (formulario) => formulario.elements.mensaje,
        revisar: (formulario) => {
            const texto = formulario.elements.mensaje.value.trim();
            if (texto === "") {
                return "Escribe tu mensaje.";
            }
            if (texto.length < MINIMO_MENSAJE) {
                return `Tu mensaje debe tener al menos ${MINIMO_MENSAJE} caracteres (llevas ${texto.length}).`;
            }
            return "";
        }
    },
    {
        campo: (formulario) => formulario.elements.correo,
        revisar: (formulario) => {
            const correo = formulario.elements.correo;
            return correo.value.trim() !== "" && correo.validity.typeMismatch
                ? "Revisa el correo: debe tener la forma nombre@correo.com."
                : "";
        }
    }
];

function mostrarError(campo, texto) {
    const contenedor = campo.closest(".campo");
    let error = contenedor.querySelector(".mensajeError");

    if (!texto) {
        if (error) {
            error.remove();
        }
        campo.removeAttribute("aria-invalid");
        return;
    }

    if (!error) {
        error = document.createElement("p");
        error.className = "mensajeError";
        error.id = `error-${campo.name}`;
        contenedor.append(error);
        // El lector de pantalla lee el error junto con el campo
        campo.setAttribute("aria-describedby", `${campo.getAttribute("aria-describedby") || ""} ${error.id}`.trim());
    }

    error.textContent = texto;
    campo.setAttribute("aria-invalid", "true");
}

function validar(formulario) {
    let primerError = null;

    for (const regla of REGLAS) {
        const campo = regla.campo(formulario);
        const texto = regla.revisar(formulario);
        mostrarError(campo, texto);
        if (texto && !primerError) {
            primerError = campo;
        }
    }

    return primerError;
}

function conectarBuzon() {
    const formulario = document.querySelector(".formulario");
    if (!formulario) {
        return;
    }

    // Con JS activo usamos nuestros mensajes; sin JS el navegador sigue validando solo
    formulario.noValidate = true;
    let yaIntento = false;

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        yaIntento = true;

        const primerError = validar(formulario);
        if (primerError) {
            primerError.focus();
            return;
        }

        // Se va a la confirmación sin poner los datos en la dirección (el correo no queda en la URL)
        window.location.href = formulario.getAttribute("action");
    });

    // Después del primer intento, los errores se quitan apenas se corrigen
    formulario.addEventListener("input", () => {
        if (yaIntento) {
            validar(formulario);
        }
    });

    formulario.addEventListener("reset", () => {
        yaIntento = false;
        for (const regla of REGLAS) {
            mostrarError(regla.campo(formulario), "");
        }
    });
}

document.addEventListener("DOMContentLoaded", conectarBuzon);
