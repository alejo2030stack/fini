// ---------------------
// 📦 ESTADO INVENTARIO
// ---------------------
let inventario = {};
let submodo = null;

// ---------------------
// 🧠 FUNCIÓN PRINCIPAL
// ---------------------
export function ejecutarInventario(texto) {

    texto = texto.toLowerCase().trim();

    // ---------------------
    // 🔒 CONFIRMACIÓN SALIDA
    // ---------------------
    if (submodo === "confirmar_salida") {

        if (texto === "si" || texto === "sí") {
            reset();
            return {
                mensaje: "Saliendo de inventario",
                accion: "salir_confirmado"
            };
        }

        if (texto === "no") {
            submodo = null;
            return {
                mensaje: "Continuamos en inventario"
            };
        }

        return { mensaje: "Responde sí o no" };
    }

    // ---------------------
    // 📊 CERRAR INVENTARIO (MOSTRAR RESUMEN)
    // ---------------------
    if (texto.includes("cerrar")) {

        if (Object.keys(inventario).length === 0) {
            return {
                mensaje: "No hay productos en el inventario"
            };
        }

        let resumen = "Resumen del inventario: ";

        for (let producto in inventario) {
            resumen += `${inventario[producto]} ${producto}, `;
        }

        return {
            mensaje: resumen
        };
    }

    // ---------------------
    // 🚪 SALIR
    // ---------------------
    if (texto.includes("salir") || texto.includes("volver")) {

        if (Object.keys(inventario).length > 0) {
            submodo = "confirmar_salida";
            return {
                mensaje: "Tienes productos. ¿Seguro que quieres salir?"
            };
        }

        return {
            mensaje: "Saliendo de inventario",
            accion: "salir_confirmado"
        };
    }

    // ---------------------
    // 📦 AGREGAR PRODUCTO (CON PARSER)
    // ---------------------
    if (
        texto.includes("agrega") ||
        texto.includes("agregar") ||
        texto.match(/^\d+/) // 🔥 CLAVE: permite "20 galletas"
    ) {

        const resultado = parsearProducto(texto);

        if (!resultado) {
            return {
                mensaje: "No entendí el producto. Di por ejemplo: agregar 10 galletas"
            };
        }

        const { cantidad, producto } = resultado;

        inventario[producto] = (inventario[producto] || 0) + cantidad;

        return {
            mensaje: `Agregado ${cantidad} ${producto}`
        };
    }

    // ---------------------
    // ❌ DEFAULT
    // ---------------------
    return {
        mensaje: "Comando no válido en inventario"
    };
}

// ---------------------
// 🧠 PARSER MEJORADO
// ---------------------
function parsearProducto(texto) {

    // elimina palabras innecesarias
    texto = texto
        .replace("agrega", "")
        .replace("agregar", "")
        .replace("de", "")
        .trim();

    const match = texto.match(/(\d+)\s+(.*)/);

    if (!match) return null;

    const cantidad = parseInt(match[1]);
    const producto = match[2].trim();

    if (!producto) return null;

    return { cantidad, producto };
}

// ---------------------
// 🔄 RESET
// ---------------------
function reset() {
    inventario = {};
    submodo = null;
}