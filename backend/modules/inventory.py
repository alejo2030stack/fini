import re
from services.pdf_generator import generar_pdf

def ejecutar_inventario(estado, comando):
    inventario = estado["inventario"]

    # ---------------------
    # INICIALIZAR SUBMODO
    # ---------------------
    if "submodo" not in estado:
        estado["submodo"] = None

    # ---------------------
    # 🔒 CONFIRMACIÓN SALIDA
    # ---------------------
    if estado["submodo"] == "confirmar_salida":

        if comando.get("tipo") == "confirmar_si":
            estado["inventario"] = {}
            estado["submodo"] = None

            return {
                "respuesta": "Saliendo de inventario",
                "accion": "salir_confirmado"
            }

        if comando.get("tipo") == "confirmar_no":
            estado["submodo"] = None
            return {
                "respuesta": "Continuamos en inventario"
            }

        return {
            "respuesta": "Responde sí o no"
        }

    # ---------------------
    # 📊 CERRAR INVENTARIO (PDF + RESUMEN)
    # ---------------------
    if comando.get("tipo") == "cerrar":

        if len(inventario) == 0:
            return {
                "respuesta": "No hay productos en el inventario"
            }

        # 🔥 GENERAR PDF
        ruta_pdf = generar_pdf(inventario)

        # 🧠 RESUMEN MÁS LIMPIO
        lista = [f"{cantidad} {producto}" for producto, cantidad in inventario.items()]
        resumen = "Resumen del inventario: " + ", ".join(lista)

        # 🔄 RESET INVENTARIO
        estado["inventario"] = {}

        return {
            "respuesta": resumen,
            "pdf": True,
            "archivo": ruta_pdf  # opcional (por si luego quieres usarlo)
        }

    # ---------------------
    # 🚪 SALIR
    # ---------------------
    if comando.get("tipo") == "salir":

        if len(inventario) > 0:
            estado["submodo"] = "confirmar_salida"
            return {
                "respuesta": "Tienes productos. ¿Seguro que quieres salir?"
            }

        return {
            "respuesta": "Saliendo de inventario",
            "accion": "salir_confirmado"
        }

    # ---------------------
    # 📦 AGREGAR PRODUCTO
    # ---------------------
    if comando.get("tipo") == "agregar":

        producto = comando["producto"]
        cantidad = comando["cantidad"]

        inventario[producto] = inventario.get(producto, 0) + cantidad

        return {
            "respuesta": f"Agregado {cantidad} {producto}"
        }

    # ---------------------
    # ❌ DEFAULT
    # ---------------------
    return {
        "respuesta": "Comando no válido en inventario"
    }