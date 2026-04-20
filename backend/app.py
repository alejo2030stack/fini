from flask import Flask, render_template, request, jsonify, send_file
import os

from brain.core import procesar_comando

app = Flask(__name__)

# ---------------------
# RUTA PRINCIPAL
# ---------------------
@app.route("/")
def home():
    return render_template("index.html")

# ---------------------
# COMANDOS
# ---------------------
@app.route("/comando", methods=["POST"])
def comando():
    data = request.get_json()
    texto = data.get("texto", "")

    respuesta = procesar_comando(texto)

    return jsonify(respuesta)

# ---------------------
# DESCARGA PDF
# ---------------------
@app.route("/descargar_pdf")
def descargar_pdf():
    ruta = "reporte.pdf"

    # ⚠️ VALIDACIÓN IMPORTANTE
    if not os.path.exists(ruta):
        return jsonify({
            "error": "El archivo PDF no existe aún"
        }), 404

    return send_file(ruta, as_attachment=True)

# ---------------------
# RUN
# ---------------------
if __name__ == "__main__":
    app.run(debug=True)