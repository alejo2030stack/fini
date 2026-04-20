import { enviarComando } from "./services/api.js";
import { ejecutarElyra } from "./actions/elyra.js";
// import { ejecutarTareas } from "./actions/tasks.js";

// ---------------------
// 🌍 ESTADO GLOBAL
// ---------------------
let estado = {
    modo: "inicio", // inicio | nombre | menu | modulo | elyra
    nombre: null,
    modulo: null // inventario | tareas
};

// 🧠 memoria Elyra
let memoriaElyra = {
    recuerdos: []
};

// ---------------------
// 🔊 VOZ
// ---------------------
function hablar(texto) {
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = "es-ES";
    speechSynthesis.cancel();
    speechSynthesis.speak(msg);

    document.getElementById("respuesta").innerText = texto;
}

// ---------------------
// 🧠 CONTEXTO GLOBAL
// ---------------------
function responderContexto() {

    if (estado.modo === "menu") {
        return "Estás en el menú principal. Puedes ir a inventario o tareas usando tu voz";
    }

    if (estado.modulo === "inventario") {
        return "Estás en el módulo de inventario. Puedes agregar productos diciendo por ejemplo 20 galletas, también puedes decir cerrar para ver el resumen o salir para volver al menú";
    }

    if (estado.modulo === "tareas") {
        return "Estás en el módulo de tareas. Puedes agregar tareas o salir para volver al menú";
    }

    return "Estás iniciando el sistema";
}

// ---------------------
// 🧠 PROCESADOR CENTRAL
// ---------------------
async function procesar(texto) {

    texto = texto.toLowerCase().trim();
    console.log("🎤", texto);

    // ---------------------
    // 🧠 ACTIVAR ELYRA
    // ---------------------
    if (texto.includes("elyra")) {
        estado.modo = "elyra";
        hablar(`Hola ${estado.nombre || "usuario"}, dime`);
        return;
    }

    // ---------------------
    // 🧠 MODO ELYRA
    // ---------------------
    if (estado.modo === "elyra") {

        const res = await ejecutarElyra(texto, memoriaElyra);

        if (res.tipo === "navegacion") {
            estado.modulo = res.destino;
            estado.modo = "modulo";
            hablar(res.respuesta);
            return;
        }

        if (res.tipo === "memoria") {
            memoriaElyra.recuerdos.push(res.guardar);
            hablar(res.respuesta);
            return;
        }

        hablar(res.texto);
        return;
    }

    // ---------------------
    // 🧠 COMANDO GLOBAL CONTEXTO
    // ---------------------
    if (
        texto.includes("donde estoy") ||
        texto.includes("ubicacion") ||
        texto.includes("qué puedo hacer") ||
        texto.includes("que puedo hacer") ||
        texto.includes("informacion") ||
        texto.includes("información") ||
        texto.includes("ayuda")
    ) {
        hablar(responderContexto());
        return;
    }

    // ---------------------
    // 🚀 INICIO → NOMBRE
    // ---------------------
    if (estado.modo === "inicio") {
        estado.modo = "nombre";
        hablar("Hola, ¿cuál es tu nombre?");
        return;
    }

    if (estado.modo === "nombre") {
        estado.nombre = texto
            .replace("mi nombre es", "")
            .replace("soy", "")
            .trim();

        estado.modo = "menu";

        hablar(`Bienvenido ${estado.nombre}. Puedes decir inventario o tareas`);
        return;
    }

    // ---------------------
    // 🧭 MENÚ PRINCIPAL
    // ---------------------
    if (estado.modo === "menu") {

        if (texto.includes("inventario")) {
            estado.modulo = "inventario";
            estado.modo = "modulo";

            hablar("Entrando a inventario");
            return;
        }

        if (texto.includes("tarea")) {
            estado.modulo = "tareas";
            estado.modo = "modulo";

            hablar("Entrando a tareas");
            return;
        }

        hablar("Puedes decir: ir a inventario o ir a tareas");
        return;
    }

    // ---------------------
    // 🧩 MODO MÓDULO
    // ---------------------
    if (estado.modo === "modulo") {

        // 🔥 INVENTARIO (AHORA CON BACKEND)
        if (estado.modulo === "inventario") {

            const res = await enviarComando(texto);

            hablar(res.respuesta);

            if (res.accion === "salir_confirmado") {
                estado.modulo = null;
                estado.modo = "menu";
                hablar("Volviendo al menú principal");
            }

            return;
        }

        // 🔥 TAREAS (BASE)
        if (estado.modulo === "tareas") {

            hablar("Módulo tareas aún no implementado");
            return;
        }
    }
}

// ---------------------
// 🎤 INICIAR VOZ
// ---------------------
function iniciarVoz() {
    VozMotor.iniciar(procesar);
    hablar("Sistema iniciado");
}

window.iniciarVoz = iniciarVoz;