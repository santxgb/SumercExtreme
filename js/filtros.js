/* Filtros por región en las páginas de Agua, Tierra y Viento.
   Cada botón dice "Región (n)" y cada tarjeta tiene su región en .etiquetaRegion. */

function nombreRegion(boton) {
    // "Ricaurte (4)" -> "Ricaurte"
    return boton.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
}

function conectarFiltros() {
    const lista = document.querySelector(".listaLugares");
    const botones = document.querySelectorAll(".filtros .chipFiltro");

    if (!lista || botones.length === 0) {
        return;
    }

    const tarjetas = lista.querySelectorAll(":scope > li");

    // Mensaje para lectores de pantalla con el resultado del filtro
    const aviso = document.createElement("p");
    aviso.className = "soloLectores";
    aviso.setAttribute("aria-live", "polite");
    lista.before(aviso);

    function filtrar(botonElegido) {
        const region = nombreRegion(botonElegido);
        const todas = botonElegido === botones[0];
        let visibles = 0;

        for (const boton of botones) {
            boton.setAttribute("aria-pressed", String(boton === botonElegido));
        }

        for (const tarjeta of tarjetas) {
            const etiqueta = tarjeta.querySelector(".etiquetaRegion");
            const coincide = todas || (etiqueta && etiqueta.textContent.trim() === region);
            tarjeta.hidden = !coincide;
            if (coincide) {
                visibles += 1;
            }
        }

        const lugares = visibles === 1 ? "lugar" : "lugares";
        aviso.textContent = todas
            ? `Mostrando los ${visibles} ${lugares}.`
            : `Mostrando ${visibles} ${lugares} de la región ${region}.`;
    }

    for (const boton of botones) {
        boton.addEventListener("click", () => filtrar(boton));
    }
}

document.addEventListener("DOMContentLoaded", conectarFiltros);
