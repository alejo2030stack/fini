import { enviarComando } from "./services/api.js";
import { ejecutarElyra } from "./actions/elyra.js";

// ── Estado global ────────────────────────────────────────────
let estado = {
    modo:    "inicio",   // inicio | nombre | menu | modulo | elyra
    nombre:  null,
    modulo:  null,       // inventario | tareas
};

let memoriaElyra = { recuerdos: [] };
let vozActiva    = false;

// ── TTS optimizado ───────────────────────────────────────────
function hablar(texto) {
    if (!texto) return;

    // Mostrar respuesta en UI
    const el = document.getElementById("respuesta");
    if (el) el.innerText = texto;

    // Pausar micrófono para evitar que se escuche a sí mismo
    VozMotor.pausar();
    if (window.setHablando) window.setHablando(true);

    speechSynthesis.cancel();

    const msg  = new SpeechSynthesisUtterance(texto);
    msg.lang   = "es-ES";
    msg.rate   = 1.1;    // ligeramente más rápido
    msg.pitch  = 1.0;
    msg.volume = 1.0;

    msg.onend = () => {
        if (window.setHablando) window.setHablando(false);
        // Reanudar micrófono después de hablar
        if (vozActiva) VozMotor.reanudar();
    };

    msg.onerror = () => {
        if (window.setHablando) window.setHablando(false);
        if (vozActiva) VozMotor.reanudar();
    };

    speechSynthesis.speak(msg);
}

// ── Contexto de ayuda por modo ───────────────────────────────
function responderContexto() {
    if (estado.modo === "menu")
        return `Estás en el menú principal, ${estado.nombre}. Di inventario o tareas.`;
    if (estado.modulo === "inventario")
        return "Estás en inventario. Di por ejemplo: veinte galletas. Di cerrar para el resumen o salir para volver.";
    if (estado.modulo === "tareas")
        return "Estás en tareas. Puedes agregar tareas o decir salir para volver.";
    return "Sistema iniciado. Di hola para comenzar.";
}

// ── Procesador central ───────────────────────────────────────
async function procesar(texto) {
    texto = texto.toLowerCase().trim();
    if (!texto || texto.length < 2) return;

    console.log("🎤", texto);

    // UI — mostrar entrada
    const entradaEl = document.getElementById("entrada");
    if (entradaEl) entradaEl.innerText = texto;

    // ── Activar Elyra ────────────────────────────────────────
    if (texto.includes("elyra")) {
        estado.modo = "elyra";
        hablar(`Dime, ${estado.nombre || "usuario"}`);
        if (window.setModoLabel) window.setModoLabel("ELYRA", true);
        return;
    }

    // ── Modo Elyra ───────────────────────────────────────────
    if (estado.modo === "elyra") {
        const res = await ejecutarElyra(texto, memoriaElyra);

        if (res.tipo === "navegacion") {
            estado.modulo = res.destino;
            estado.modo   = "modulo";
            if (window.setModoLabel) window.setModoLabel(res.destino.toUpperCase(), true);
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

    // ── Comandos globales ────────────────────────────────────
    if (/donde estoy|ubicacion|qué puedo|que puedo|ayuda|información|informacion/.test(texto)) {
        hablar(responderContexto());
        return;
    }

    // ── INICIO ───────────────────────────────────────────────
    if (estado.modo === "inicio") {
        estado.modo = "nombre";
        if (window.setModoLabel) window.setModoLabel("NOMBRE", false);
        hablar("Hola, ¿cuál es tu nombre?");
        return;
    }

    // ── NOMBRE ───────────────────────────────────────────────
    if (estado.modo === "nombre") {
        let nombre = texto
            .replace(/mi nombre es|me llamo|soy/g, "")
            .trim();
        nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);

        if (nombre.length < 2) {
            hablar("No escuché tu nombre. ¿Puedes repetirlo?");
            return;
        }

        estado.nombre = nombre;
        estado.modo   = "menu";
        if (window.setModoLabel) window.setModoLabel("MENÚ", true);
        hablar(`Bienvenido ${nombre}. Di inventario o tareas.`);
        return;
    }

    // ── MENÚ ─────────────────────────────────────────────────
    if (estado.modo === "menu") {
        if (/inventario|invent/.test(texto)) {
            estado.modulo = "inventario";
            estado.modo   = "modulo";
            if (window.setModoLabel) window.setModoLabel("INVENTARIO", true);
            hablar("Inventario abierto. Di por ejemplo: veinte galletas.");
            return;
        }
        if (/tarea|tareas/.test(texto)) {
            estado.modulo = "tareas";
            estado.modo   = "modulo";
            if (window.setModoLabel) window.setModoLabel("TAREAS", true);
            hablar("Tareas abiertas.");
            return;
        }
        hablar("Di inventario o tareas.");
        return;
    }

    // ── MÓDULO ───────────────────────────────────────────────
    if (estado.modo === "modulo") {

        if (estado.modulo === "inventario") {
            if (window.setApiCall) window.setApiCall(true);
            const res = await enviarComando(texto);
            if (window.setApiCall) window.setApiCall(false);

            hablar(res.respuesta);

            if (res.accion === "salir_confirmado") {
                estado.modulo = null;
                estado.modo   = "menu";
                if (window.setModoLabel) window.setModoLabel("MENÚ", true);
            }
            return;
        }

        if (estado.modulo === "tareas") {
            hablar("Módulo tareas en construcción.");
            return;
        }
    }
}

// ── Toggle voz ───────────────────────────────────────────────
function iniciarVoz() {
    const btn = document.getElementById("btnMain");

    if (!vozActiva) {
        VozMotor.iniciar(procesar);
        vozActiva = true;
        hablar("Sistema activado");
        if (btn) { btn.textContent = "Detener sistema"; btn.classList.add("activo"); }
        if (window.setModoLabel) window.setModoLabel("Activo — di algo", true);
    } else {
        VozMotor.detener();
        vozActiva = false;
        speechSynthesis.cancel();
        if (btn) { btn.textContent = "Activar sistema"; btn.classList.remove("activo"); }
        if (window.setModoLabel) window.setModoLabel("Sistema detenido", false);
        if (window.setOrb) window.setOrb('');
        if (window.setWaves) window.setWaves(false);
    }
}

window.iniciarVoz = iniciarVoz;
