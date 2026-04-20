export function interpretar(texto) {

    texto = texto.toLowerCase().trim();

    if (texto.includes("inventario")) {
        return { accion: "inventario" };
    }

    return { accion: "desconocido" };
}