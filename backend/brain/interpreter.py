import re

def interpretar(texto):
    texto = texto.lower().strip()

    # ---------------------
    # AGREGAR PRODUCTO
    # ---------------------
    match = re.match(r"(\d+)\s+(.+)", texto)
    if match:
        return {
            "accion": "inventario",
            "tipo": "agregar",
            "cantidad": int(match.group(1)),
            "producto": match.group(2)
        }

    # ---------------------
    # CERRAR
    # ---------------------
    if "cerrar" in texto:
        return {"accion": "inventario", "tipo": "cerrar"}

    # ---------------------
    # SALIR
    # ---------------------
    if "salir" in texto or "volver" in texto:
        return {"accion": "inventario", "tipo": "salir"}

    # ---------------------
    # CONFIRMACIONES
    # ---------------------
    if texto in ["si", "sí"]:
        return {"accion": "inventario", "tipo": "confirmar_si"}

    if texto == "no":
        return {"accion": "inventario", "tipo": "confirmar_no"}

    # ---------------------
    # ENTRAR
    # ---------------------
    if "inventario" in texto:
        return {"accion": "inventario", "tipo": "entrar"}

    return {"accion": "desconocido"}