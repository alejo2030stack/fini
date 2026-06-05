/**
 * VozMotor — Optimizado para Android Chrome en terreno
 * Estrategia: continuous=false + reinicio ultrarrápido + WakeLock
 */
const VozMotor = {

    recognition:  null,
    escuchando:   false,
    callback:     null,
    pausado:      false,
    ultimoTexto:  "",
    wakeLock:     null,
    SR:           null,

    iniciar(callback) {
        this.SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!this.SR) {
            if (window.actualizarEstadoVoz) window.actualizarEstadoVoz("red");
            return;
        }
        this.callback   = callback;
        this.escuchando = true;

        this._pedirWakeLock();   // 🔒 pantalla activa
        this._crear();
        this._start();
    },

    // 🔒 CAPA 1 — Mantener pantalla activa (Android no mata el mic)
    async _pedirWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log("🔒 WakeLock activo");

                // Reactivar si el usuario vuelve a la app
                document.addEventListener('visibilitychange', async () => {
                    if (document.visibilityState === 'visible' && this.escuchando) {
                        try {
                            this.wakeLock = await navigator.wakeLock.request('screen');
                        } catch(_) {}
                    }
                });
            }
        } catch(e) {
            console.log("WakeLock no disponible:", e.message);
        }
    },

    // 🎤 CAPA 2 — Reinicio ultrarrápido entre comandos
    _crear() {
        this.recognition = new this.SR();
        this.recognition.lang            = "es-ES";
        this.recognition.continuous      = false;  // más estable en Android
        this.recognition.interimResults  = true;   // feedback visual inmediato
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            if (!this.pausado && window.actualizarEstadoVoz)
                window.actualizarEstadoVoz("green");
        };

        this.recognition.onresult = (event) => {
            if (this.pausado) return;

            const resultado = event.results[event.results.length - 1];
            const texto     = resultado[0].transcript.toLowerCase().trim();
            const esFinal   = resultado.isFinal;

            // Feedback visual mientras habla
            const el = document.getElementById("entrada");
            if (el) el.innerText = texto;

            if (esFinal && texto.length > 1) {
                if (texto === this.ultimoTexto) return; // evitar duplicado
                this.ultimoTexto = texto;
                console.log("🎤:", texto);
                if (this.callback) this.callback(texto);
                setTimeout(() => { this.ultimoTexto = ""; }, 1500);
            }
        };

        // Reinicio instantáneo al terminar
        this.recognition.onend = () => {
            if (!this.escuchando || this.pausado) return;
            this._start(); // sin setTimeout — inmediato
        };

        this.recognition.onerror = (e) => {
            if (e.error === 'no-speech') {
                // Android corta por silencio — reiniciar inmediatamente
                if (this.escuchando && !this.pausado) this._start();
                return;
            }
            if (e.error === 'aborted') return;
            if (e.error === 'not-allowed') {
                this.escuchando = false;
                if (window.actualizarEstadoVoz) window.actualizarEstadoVoz("red");
                const el = document.getElementById("respuesta");
                if (el) el.innerText = "Permiso de micrófono denegado. Recarga la página.";
                return;
            }
            // Cualquier otro error — recrear el objeto y reiniciar
            console.warn("VozMotor error:", e.error, "— recreando...");
            setTimeout(() => {
                if (this.escuchando && !this.pausado) {
                    this._crear();
                    this._start();
                }
            }, 300);
        };
    },

    // 🔄 CAPA 3 — Watchdog: si el mic muere, lo resucita
    _iniciarWatchdog() {
        this._watchdog = setInterval(() => {
            if (!this.escuchando || this.pausado) return;
            // Si no está corriendo, reiniciar
            try {
                // Intentar start — si ya está corriendo lanza error (ignorar)
                this.recognition.start();
            } catch(_) {}
        }, 8000); // revisar cada 8 segundos
    },

    _start() {
        try {
            this.recognition.start();
        } catch(e) {
            // Ya estaba corriendo — está bien
        }
    },

    pausar() {
        this.pausado = true;
        try { this.recognition && this.recognition.stop(); } catch(_) {}
        if (window.actualizarEstadoVoz) window.actualizarEstadoVoz("red");
    },

    reanudar() {
        if (!this.escuchando) return;
        this.pausado     = false;
        this.ultimoTexto = "";
        // Recrear objeto para evitar estado sucio tras TTS
        this._crear();
        setTimeout(() => {
            if (!this.pausado) this._start();
        }, 200);
    },

    detener() {
        this.escuchando = false;
        this.pausado    = false;
        clearInterval(this._watchdog);
        try { this.recognition && this.recognition.stop(); } catch(_) {}
        if (this.wakeLock) { this.wakeLock.release(); this.wakeLock = null; }
        if (window.actualizarEstadoVoz) window.actualizarEstadoVoz("red");
    }
};