/**
 * VozMotor — Motor de reconocimiento de voz optimizado
 * - Reinicio automático tras respuesta de audio
 * - Sin solapamiento mic/speaker
 * - Delay mínimo
 */
const VozMotor = {

    recognition: null,
    escuchando:  false,
    callback:    null,
    pausado:     false,   // pausa mientras el sistema habla

    iniciar(callback) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            console.error("SpeechRecognition no disponible");
            if (window.actualizarEstadoVoz) window.actualizarEstadoVoz("red");
            return;
        }

        this.callback   = callback;
        this.escuchando = true;

        this._crear(SR);
        this._start();
    },

    _crear(SR) {
        this.recognition = new SR();
        this.recognition.lang           = "es-ES";
        this.recognition.continuous     = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        // 🟢 Inicio
        this.recognition.onstart = () => {
            if (!this.pausado && window.actualizarEstadoVoz) {
                window.actualizarEstadoVoz("green");
            }
        };

        // 🎤 Resultado
        this.recognition.onresult = (event) => {
            const texto = event.results[0][0].transcript.toLowerCase().trim();
            if (!texto || texto.length < 2) return;
            console.log("🎤:", texto);
            if (this.callback) this.callback(texto);
        };

        // 🔄 Reenganche automático
        this.recognition.onend = () => {
            if (!this.escuchando) return;
            if (this.pausado) return;   // esperar a que termine el TTS

            setTimeout(() => {
                if (this.escuchando && !this.pausado) {
                    this._start();
                }
            }, 250);
        };

        this.recognition.onerror = (e) => {
            if (e.error === 'no-speech')    return;   // normal, reiniciar
            if (e.error === 'aborted')      return;   // pausado manualmente
            if (e.error === 'not-allowed') {
                console.error("Permiso de micrófono denegado");
                this.escuchando = false;
                if (window.actualizarEstadoVoz) window.actualizarEstadoVoz("red");
                return;
            }
            console.warn("VozMotor error:", e.error);
        };
    },

    _start() {
        try {
            this.recognition.start();
        } catch(e) {
            // Ignorar errores de estado (ya iniciado)
            setTimeout(() => {
                if (this.escuchando && !this.pausado) {
                    try { this.recognition.start(); } catch(_) {}
                }
            }, 400);
        }
    },

    // ── Pausar mientras el sistema habla ────────────────────
    pausar() {
        this.pausado = true;
        try { this.recognition && this.recognition.stop(); } catch(_) {}
        if (window.actualizarEstadoVoz) window.actualizarEstadoVoz("red");
    },

    // ── Reanudar después de hablar ───────────────────────────
    reanudar() {
        if (!this.escuchando) return;
        this.pausado = false;
        setTimeout(() => {
            if (!this.pausado) this._start();
        }, 300);
    },

    detener() {
        this.escuchando = false;
        this.pausado    = false;
        try { this.recognition && this.recognition.stop(); } catch(_) {}
        if (window.actualizarEstadoVoz) window.actualizarEstadoVoz("red");
    }
};
