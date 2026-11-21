/* Lugares visitados: se guardan en el navegador (localStorage) con el nombre de la ficha
   de cada lugar, por ejemplo "agua-lago-de-tota". */

const CLAVE_VISITADOS = "sumercLugaresVisitados";

function leerVisitados() {
    try {
        return new Set(JSON.parse(localStorage.getItem(CLAVE_VISITADOS)) || []);
    } catch (error) {
        return new Set();
    }
}

function guardarVisitados(visitados) {
    try {
        localStorage.setItem(CLAVE_VISITADOS, JSON.stringify([...visitados]));
    } catch (error) {
        // Sin localStorage la lista funciona mientras la página esté abierta
    }
}

/* ---- Página Mis lugares: casillas, progreso, contadores y filtros ---- */

function conectarMisLugares() {
    const casillas = document.querySelectorAll(".itemLugar input[data-lugar]");
    if (casillas.length === 0) {
        return;
    }

    const grupos = document.querySelectorAll(".grupoElemento");
    const botonesFiltro = document.querySelectorAll(".chipFiltro[data-filtro]");
    const barra = document.querySelector(".barraProgreso");
    const mensajeVacio = document.querySelector(".mensajeVacio");
    let filtroActual = "todos";

    // Mensaje para lectores de pantalla cuando cambia el filtro
    const aviso = document.createElement("p");
    aviso.className = "soloLectores";
    aviso.setAttribute("aria-live", "polite");
    document.querySelector(".filtros").append(aviso);

    function marcarGuardados() {
        const visitados = leerVisitados();
        for (const casilla of casillas) {
            casilla.checked = visitados.has(casilla.dataset.lugar);
        }
    }

    function actualizarResumen() {
        const marcadas = [...casillas].filter((casilla) => casilla.checked).length;

        // "Has visitado X de 34 lugares" y "Solo visitados (X)"
        for (const conteo of document.querySelectorAll(".conteoVisitados")) {
            conteo.textContent = marcadas;
        }
        barra.max = casillas.length;
        barra.value = marcadas;
        barra.textContent = `${marcadas} de ${casillas.length}`;

        // "X de 10 visitados" en cada grupo
        for (const grupo of grupos) {
            const propias = grupo.querySelectorAll("input[data-lugar]");
            const propiasMarcadas = [...propias].filter((casilla) => casilla.checked).length;
            grupo.querySelector(".grupoConteo").textContent = `${propiasMarcadas} de ${propias.length} visitados`;
        }
    }

    function aplicarFiltro() {
        let visibles = 0;

        for (const grupo of grupos) {
            let visiblesGrupo = 0;

            for (const fila of grupo.querySelectorAll(".itemLugar")) {
                const mostrar = filtroActual !== "visitados" || fila.querySelector("input").checked;
                fila.hidden = !mostrar;
                if (mostrar) {
                    visiblesGrupo += 1;
                }
            }

            const grupoElegido = ["todos", "visitados"].includes(filtroActual) || grupo.dataset.elemento === filtroActual;
            grupo.hidden = !grupoElegido || visiblesGrupo === 0;
            if (!grupo.hidden) {
                visibles += visiblesGrupo;
            }
        }

        mensajeVacio.hidden = !(filtroActual === "visitados" && visibles === 0);
        const lugares = visibles === 1 ? "lugar" : "lugares";
        aviso.textContent = `Mostrando ${visibles} ${lugares}.`;
    }

    for (const boton of botonesFiltro) {
        boton.addEventListener("click", () => {
            filtroActual = boton.dataset.filtro;
            for (const otro of botonesFiltro) {
                otro.setAttribute("aria-pressed", String(otro === boton));
            }
            aplicarFiltro();
        });
    }

    for (const casilla of casillas) {
        casilla.addEventListener("change", () => {
            const visitados = leerVisitados();
            if (casilla.checked) {
                visitados.add(casilla.dataset.lugar);
            } else {
                visitados.delete(casilla.dataset.lugar);
            }
            guardarVisitados(visitados);
            actualizarResumen();
        });
    }

    // Si se marca un lugar en otra pestaña (por ejemplo, desde su ficha), la lista se actualiza sola
    window.addEventListener("storage", (evento) => {
        if (evento.key === CLAVE_VISITADOS) {
            marcarGuardados();
            actualizarResumen();
            aplicarFiltro();
        }
    });

    marcarGuardados();
    actualizarResumen();
}

/* ---- Ficha de cada lugar: "Marcar como visitado" ---- */

function conectarFicha() {
    const casilla = document.querySelector("#marcarVisitado[data-lugar]");
    if (!casilla) {
        return;
    }

    const lugar = casilla.dataset.lugar;
    casilla.checked = leerVisitados().has(lugar);

    casilla.addEventListener("change", () => {
        const visitados = leerVisitados();
        if (casilla.checked) {
            visitados.add(lugar);
        } else {
            visitados.delete(lugar);
        }
        guardarVisitados(visitados);
    });

    // Si cambia en Mis lugares abierta en otra pestaña, la casilla se actualiza
    window.addEventListener("storage", (evento) => {
        if (evento.key === CLAVE_VISITADOS) {
            casilla.checked = leerVisitados().has(lugar);
        }
    });
}

document.addEventListener("DOMContentLoaded", conectarMisLugares);
document.addEventListener("DOMContentLoaded", conectarFicha);
