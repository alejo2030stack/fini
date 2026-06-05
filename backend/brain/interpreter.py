import re
from brain.corrector import corregir_producto, texto_a_numero

def interpretar(texto):
    texto = texto.lower().strip()

    # ── Limpiar prefijos de voz ──────────────────────────────
    texto_limpio = re.sub(
        r'^(agrega[r]?|añade[r]?|añadir|pon|suma[r]?|mete[r]?|registra[r]?|carga[r]?)\s+',
        '', texto
    )
    texto_limpio = re.sub(r'^(de\s+|el\s+|la\s+|los\s+|las\s+|un\s+|una\s+)', '', texto_limpio)

    # ── AGREGAR PRODUCTO ─────────────────────────────────────
    match = re.match(r'^(\w+)\s+(.+)$', texto_limpio)
    if match:
        posible_num  = match.group(1)
        posible_prod = match.group(2).strip()

        cantidad = texto_a_numero(posible_num)
        if cantidad and cantidad > 0:
            producto = corregir_producto(posible_prod)
            return {
                "accion":   "inventario",
                "tipo":     "agregar",
                "cantidad": cantidad,
                "producto": producto,
                "original": posible_prod
            }

    # ── CERRAR ───────────────────────────────────────────────
    if re.search(r'cerrar|cierra|resumen|reporte|informe|pdf|terminar|finalizar', texto):
        return {"accion": "inventario", "tipo": "cerrar"}

    # ── SALIR ────────────────────────────────────────────────
    if re.search(r'salir|volver|atrás|atras|menu|menú', texto):
        return {"accion": "inventario", "tipo": "salir"}

    # ── LISTAR ───────────────────────────────────────────────
    if re.search(r'cuánto|cuanto|qué hay|que hay|lista|listar|mostrar|inventario', texto):
        return {"accion": "inventario", "tipo": "listar"}

    # ── CONFIRMACIONES ───────────────────────────────────────
    if re.search(r'^(sí|si|yes|claro|correcto|dale|ok|bueno)$', texto):
        return {"accion": "inventario", "tipo": "confirmar_si"}

    if re.search(r'^(no|nope|negativo|nel)$', texto):
        return {"accion": "inventario", "tipo": "confirmar_no"}

    return {"accion": "desconocido", "texto_original": texto}