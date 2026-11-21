/* Galería de la ficha de cada lugar: al tocar una miniatura, esa foto pasa a ser la grande
   y la que estaba grande queda en su lugar como miniatura. */

function conectarGaleria() {
    const fotoPrincipal = document.querySelector(".fotoPrincipal img");
    const miniaturas = document.querySelectorAll(".listaMiniaturas img");

    if (!fotoPrincipal || miniaturas.length === 0) {
        return;
    }

    for (const miniatura of miniaturas) {
        // La miniatura se envuelve en un botón para que también funcione con el teclado
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "botonMiniatura";
        boton.setAttribute("aria-label", `Ver en grande: ${miniatura.alt}`);
        miniatura.replaceWith(boton);
        boton.append(miniatura);

        boton.addEventListener("click", () => {
            const fotoAnterior = { src: fotoPrincipal.src, alt: fotoPrincipal.alt };

            fotoPrincipal.src = miniatura.src;
            fotoPrincipal.alt = miniatura.alt;

            miniatura.src = fotoAnterior.src;
            miniatura.alt = fotoAnterior.alt;
            boton.setAttribute("aria-label", `Ver en grande: ${fotoAnterior.alt}`);
        });
    }
}

document.addEventListener("DOMContentLoaded", conectarGaleria);
