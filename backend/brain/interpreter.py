import re

# Números en palabras → dígitos
NUMEROS = {
    "un": 1, "uno": 1, "una": 1,
    "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5,
    "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10,
    "once": 11, "doce": 12, "trece": 13, "catorce": 14, "quince": 15,
    "dieciséis": 16, "dieciseis": 16, "diecisiete": 17,
    "dieciocho": 18, "diecinueve": 19, "veinte": 20,
    "veintiuno": 21, "veintidós": 22, "veintidos": 22,
    "veintitrés": 23, "veintitres": 23, "veinticuatro": 24,
    "veinticinco": 25, "veintiséis": 26, "veintiseis": 26,
    "veintisiete": 27, "veintiocho": 28, "veintinueve": 29,
    "treinta": 30, "cuarenta": 40, "cincuenta": 50,
    "sesenta": 60, "setenta": 70, "ochenta": 80, "noventa": 90,
    "cien": 100, "ciento": 100, "doscientos": 200, "trescientos": 300,
    "cuatrocientos": 400, "quinientos": 500, "seiscientos": 600,
    "setecientos": 700, "ochocientos": 800, "novecientos": 900,
    "mil": 1000
}

def texto_a_numero(texto):
    """Convierte texto a número. Retorna None si no encuentra."""
    texto = texto.strip().lower()
    # Primero intentar número directo
    if texto.isdigit():
        return int(texto)
    # Luego intentar palabra
    return NUMEROS.get(texto, None)

def interpretar(texto):
    texto = texto.lower().strip()

    # ── Limpiar prefijos comunes de voz ──────────────────────
    # "agrega", "agregar", "añade", "añadir", "pon", "suma"
    texto_limpio = re.sub(
        r'^(agrega[r]?|añade[r]?|añadir|pon|suma[r]?|mete[r]?|registra[r]?)\s+',
        '', texto
    )

    # ── AGREGAR PRODUCTO ─────────────────────────────────────
    # Patrón: "20 galletas" o "veinte galletas oreo"
    match = re.match(r'^(\w+)\s+(.+)$', texto_limpio)
    if match:
        posible_num = match.group(1)
        posible_prod = match.group(2).strip()

        cantidad = texto_a_numero(posible_num)
        if cantidad is not None and cantidad > 0:
            # Limpiar producto — quitar artículos al inicio
            producto = re.sub(r'^(de\s+|el\s+|la\s+|los\s+|las\s+|un\s+|una\s+)', '', posible_prod)
            return {
                "accion": "inventario",
                "tipo": "agregar",
                "cantidad": cantidad,
                "producto": producto.strip()
            }

    # ── CERRAR / RESUMEN ─────────────────────────────────────
    if re.search(r'cerrar|cierra|resumen|reporte|informe|pdf|terminar|finalizar', texto):
        return {"accion": "inventario", "tipo": "cerrar"}

    # ── SALIR ────────────────────────────────────────────────
    if re.search(r'salir|volver|atrás|atras|menu|menú', texto):
        return {"accion": "inventario", "tipo": "salir"}

    # ── CONFIRMACIONES ───────────────────────────────────────
    if re.search(r'^(sí|si|yes|claro|correcto|dale|ok)$', texto):
        return {"accion": "inventario", "tipo": "confirmar_si"}

    if re.search(r'^(no|nope|negativo)$', texto):
        return {"accion": "inventario", "tipo": "confirmar_no"}

    # ── CUÁNTO HAY ───────────────────────────────────────────
    if re.search(r'cuánto|cuanto|qué hay|que hay|lista|listar|mostrar', texto):
        return {"accion": "inventario", "tipo": "listar"}

    # ── ENTRAR A INVENTARIO ──────────────────────────────────
    if "inventario" in texto:
        return {"accion": "inventario", "tipo": "entrar"}

    return {"accion": "desconocido", "texto_original": texto}