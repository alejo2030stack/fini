const VozMotor = {

    recognition: null,

    iniciar(callback) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        this.recognition = new SpeechRecognition();
        this.recognition.lang = "es-ES";
        this.recognition.continuous = true;

        this.recognition.onresult = (event) => {
            const texto = event.results[event.results.length - 1][0].transcript;
            callback(texto.toLowerCase().trim());
        };

        this.recognition.start();
    }
};