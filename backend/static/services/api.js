export async function enviarComando(texto) {

    try {
        const res = await fetch("/comando", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ texto })
        });

        // ⚠️ validar respuesta HTTP
        if (!res.ok) {
            throw new Error("Error en el servidor");
        }

        const data = await res.json();

        // ---------------------
        // 📄 DESCARGA PDF
        // ---------------------
        if (data.pdf) {
            // pequeño delay para asegurar que el archivo esté listo
            setTimeout(() => {
                window.open("/descargar_pdf", "_blank");
            }, 300);
        }

        return data;

    } catch (error) {
        console.error("Error:", error);

        return {
            respuesta: "Hubo un error al procesar el comando"
        };
    }
}