const VozMotor = {

    recognition: null,
    escuchando: false,
    callback: null,

    iniciar(callback) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        this.recognition = new SpeechRecognition();
        this.recognition.lang = "es-ES";

        // 🔥 estabilidad móvil
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.callback = callback;
        this.escuchando = true;

        // 🟢 CUANDO EMPIEZA A ESCUCHAR
        this.recognition.onstart = () => {
            if (window.actualizarEstadoVoz) {
                window.actualizarEstadoVoz("green");
            }
        };

        // 🎤 RESULTADO
        this.recognition.onresult = (event) => {
            const texto = event.results[0][0].transcript.toLowerCase().trim();

            console.log("🎤:", texto);

            if (!texto || texto.length < 2) return;

            if (this.callback) {
                this.callback(texto);
            }
        };

        // 🔄 REENGANCHE AUTOMÁTICO
        this.recognition.onend = () => {

            // 🔴 se detuvo
            if (window.actualizarEstadoVoz) {
                window.actualizarEstadoVoz("red");
            }

            if (this.escuchando) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.log("Error reiniciando:", e);
                    }
                }, 300);
            }
        };

        this.recognition.start();
    },

    detener() {
        this.escuchando = false;

        if (this.recognition) {
            this.recognition.stop();
        }

        // 🔴 apagado manual
        if (window.actualizarEstadoVoz) {
            window.actualizarEstadoVoz("red");
        }
    }
};