from services.pdf_generator import generar_pdf

def ejecutar_inventario(estado, comando):
    inventario = estado["inventario"]

    if "submodo" not in estado:
        estado["submodo"] = None

    # ── CONFIRMACIÓN SALIDA ──────────────────────────────────
    if estado["submodo"] == "confirmar_salida":

        if comando.get("tipo") == "confirmar_si":
            estado["inventario"] = {}
            estado["submodo"]    = None
            return {
                "respuesta": "Listo, saliendo.",
                "accion": "salir_confirmado"
            }

        if comando.get("tipo") == "confirmar_no":
            estado["submodo"] = None
            return {"respuesta": "Continuamos."}

        return {"respuesta": "Di sí o no."}

    # ── CERRAR → PDF + RESUMEN ───────────────────────────────
    if comando.get("tipo") == "cerrar":

        if len(inventario) == 0:
            return {"respuesta": "El inventario está vacío."}

        ruta_pdf = generar_pdf(inventario)

        total_productos = len(inventario)
        total_unidades  = sum(inventario.values())

        # Resumen corto para audio
        lista = [f"{c} {p}" for p, c in list(inventario.items())[:5]]
        resumen_audio = ", ".join(lista)
        if total_productos > 5:
            resumen_audio += f" y {total_productos - 5} productos más"

        estado["inventario"] = {}

        return {
            "respuesta": f"{total_productos} productos, {total_unidades} unidades en total. {resumen_audio}. PDF listo.",
            "pdf": True,
            "archivo": ruta_pdf
        }

    # ── SALIR ────────────────────────────────────────────────
    if comando.get("tipo") == "salir":

        if len(inventario) > 0:
            n = len(inventario)
            estado["submodo"] = "confirmar_salida"
            return {
                "respuesta": f"Tienes {n} productos. ¿Salir sin guardar?"
            }

        return {
            "respuesta": "Saliendo.",
            "accion": "salir_confirmado"
        }

    # ── LISTAR ───────────────────────────────────────────────
    if comando.get("tipo") == "listar":

        if len(inventario) == 0:
            return {"respuesta": "Inventario vacío. Empieza agregando productos."}

        lista = [f"{c} {p}" for p, c in inventario.items()]
        return {"respuesta": "Tienes: " + ", ".join(lista)}

    # ── AGREGAR PRODUCTO ─────────────────────────────────────
    if comando.get("tipo") == "agregar":

        producto = comando["producto"]
        cantidad = comando["cantidad"]

        anterior = inventario.get(producto, 0)
        inventario[producto] = anterior + cantidad
        nuevo_total = inventario[producto]

        # Si ya existía el producto, confirmar acumulado
        if anterior > 0:
            return {
                "respuesta": f"{cantidad} {producto}. Total {nuevo_total}."
            }

        return {
            "respuesta": f"{cantidad} {producto}, listo."
        }

    # ── FALLBACK AMIGABLE ────────────────────────────────────
    texto_original = comando.get("texto_original", "")
    if texto_original:
        return {
            "respuesta": f"No entendí. Di el número y el producto, por ejemplo: veinte galletas."
        }

    return {"respuesta": "Di el número y el producto."}