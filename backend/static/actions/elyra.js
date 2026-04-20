// static/actions/elyra.js

export async function ejecutarElyra(texto, contexto) {

    texto = texto.toLowerCase();

    // -------------------------
    // 🧭 NAVEGACIÓN
    // -------------------------
    if (texto.includes("inventario")) {
        return {
            tipo: "navegacion",
            destino: "inventario",
            respuesta: "Abriendo inventario"
        };
    }

    if (texto.includes("tareas")) {
        return {
            tipo: "navegacion",
            destino: "tareas",
            respuesta: "Abriendo tareas"
        };
    }

    // -------------------------
    // 💬 RESPUESTAS
    // -------------------------
    if (texto.includes("como funciona fini")) {
        return {
            tipo: "respuesta",
            texto: "FINI es un sistema modular controlado por voz, donde cada módulo procesa acciones específicas como inventario o tareas."
        };
    }

    if (texto.includes("hola")) {
        return {
            tipo: "respuesta",
            texto: "Hola Alejo, dime ¿en qué te ayudo?"
        };
    }

    // -------------------------
    // 🧠 MEMORIA SIMPLE
    // -------------------------
    if (texto.includes("recuerda que")) {
        let dato = texto.replace("recuerda que", "").trim();

        return {
            tipo: "memoria",
            guardar: dato,
            respuesta: "Lo recordaré"
        };
    }

    // -------------------------
    // ❓ DEFAULT
    // -------------------------
    return {
        tipo: "respuesta",
        texto: "No entendí bien, intenta otra vez"
    };
}