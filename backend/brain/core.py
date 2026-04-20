from brain.interpreter import interpretar
from modules.inventory import ejecutar_inventario

# ---------------------
# ESTADO GLOBAL BACKEND
# ---------------------
estado = {
    "inventario": {}
}

# ---------------------
# PROCESADOR PRINCIPAL
# ---------------------
def procesar_comando(texto):
    comando = interpretar(texto)

    # Validación básica
    if not comando or "accion" not in comando:
        return {"respuesta": "No entendí el comando"}

    # ---------------------
    # INVENTARIO
    # ---------------------
    if comando["accion"] == "inventario":
        return ejecutar_inventario(estado, comando)

    # ---------------------
    # FALLBACK
    # ---------------------
    return {"respuesta": "No entendí el comando"}