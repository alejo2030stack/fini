import re

# ─────────────────────────────────────────────
# DICCIONARIO FONÉTICO — Supermercado
# Corrige lo que Chrome transcribe mal
# ─────────────────────────────────────────────
CORRECCIONES = {
    # Lácteos
    "leche": ["leche", "lechce", "lechi", "letche"],
    "yogur": ["yogur", "yogurt", "yogourt", "llogur", "jogur"],
    "queso": ["queso", "keso", "quesos", "qeso"],
    "mantequilla": ["mantequilla", "mantekilla", "manteilla", "mantequila"],
    "crema": ["crema", "cremas", "krema"],
    "huevos": ["huevos", "guevos", "huevo", "güevos"],
    "manteca": ["manteca", "manteka"],

    # Panadería
    "pan": ["pan", "pam", "pan de molde", "panes"],
    "marraqueta": ["marraqueta", "maraketa", "maraqueta"],
    "hallulla": ["hallulla", "ayuya", "ayulla", "hallula"],

    # Abarrotes
    "arroz": ["arroz", "aros", "arro", "arros"],
    "azúcar": ["azúcar", "azucar", "asúcar", "asucar", "a sugar", "asuca"],
    "harina": ["harina", "arina", "jarina"],
    "aceite": ["aceite", "aseite", "acite", "aceites"],
    "fideos": ["fideos", "video", "fideo", "fidio"],
    "pasta": ["pasta", "pastas"],
    "lentejas": ["lentejas", "lenteja", "lenteas"],
    "porotos": ["porotos", "poroto", "boroto"],
    "garbanzos": ["garbanzos", "garbanzo", "carbanzos"],
    "sal": ["sal", "sall"],
    "pimienta": ["pimienta", "pimienta negra"],
    "café": ["café", "cafe", "cafee", "kafé"],
    "té": ["té", "te", "tee"],
    "cacao": ["cacao", "kakao"],
    "mermelada": ["mermelada", "mermelata", "mermolada"],
    "miel": ["miel", "miel de abeja"],

    # Conservas y enlatados
    "atún": ["atún", "atun", "hatún", "hatun"],
    "tomate": ["tomate", "tomates", "tómate"],
    "salsa": ["salsa", "salsas"],
    "mayonesa": ["mayonesa", "mayoneza", "maionesa"],
    "ketchup": ["ketchup", "cáchup", "catchup", "kechup"],
    "mostaza": ["mostaza", "mustaza"],

    # Bebidas
    "agua": ["agua", "aguas"],
    "jugo": ["jugo", "jugos", "hugo"],
    "bebida": ["bebida", "bebidas"],
    "gaseosa": ["gaseosa", "gaseosas"],
    "cerveza": ["cerveza", "cerbeza", "cervesa"],
    "vino": ["vino", "bino"],

    # Snacks y dulces
    "galletas": ["galletas", "gayetas", "galleta", "galetas", "galeta"],
    "chips": ["chips", "chis", "chíps"],
    "chocolate": ["chocolate", "chocolaté", "chocalate", "chocolat"],
    "caramelos": ["caramelos", "caramelo", "caramelos duros"],
    "gomitas": ["gomitas", "gomita"],

    # Carnes y fríos
    "pollo": ["pollo", "poyo", "polo"],
    "carne": ["carne", "karnes", "carnes"],
    "jamón": ["jamón", "jamon", "hamón"],
    "salchicha": ["salchicha", "salchica", "salchichas"],
    "vienesa": ["vienesa", "bienesa", "vienesas"],
    "vacuno": ["vacuno", "bakuno"],

    # Frutas y verduras
    "manzana": ["manzana", "mansana", "manzanas"],
    "plátano": ["plátano", "platano", "banana", "banano"],
    "naranja": ["naranja", "naranjas"],
    "pera": ["pera", "peras"],
    "uva": ["uva", "uvas"],
    "tomate": ["tomate", "tomates"],
    "lechuga": ["lechuga", "lechugas", "lechuca"],
    "cebolla": ["cebolla", "sebolla", "cebollas"],
    "papa": ["papa", "papas", "patata", "patatas"],
    "zanahoria": ["zanahoria", "sanaoria", "zanahorias"],
    "pepino": ["pepino", "pepinos"],

    # Limpieza
    "detergente": ["detergente", "deterjente", "detergentes"],
    "cloro": ["cloro", "cloros"],
    "shampoo": ["shampoo", "champú", "champu", "shampu"],
    "jabón": ["jabón", "jabon", "habón"],
    "papel higiénico": ["papel higiénico", "papel", "papel higienico"],
    "servilletas": ["servilletas", "servilleta"],
    "esponja": ["esponja", "esponjas"],

    # Congelados
    "helado": ["helado", "helados", "elado"],
    "pizza": ["pizza", "pisa", "pitsa"],
}

# Invertir diccionario para búsqueda rápida
_MAPA = {}
for correcto, variantes in CORRECCIONES.items():
    for v in variantes:
        _MAPA[v.lower()] = correcto


def corregir_producto(texto):
    """
    Intenta corregir el nombre de un producto transcrito por Chrome.
    Usa 3 estrategias en orden:
    1. Coincidencia exacta en el mapa
    2. Coincidencia parcial (contiene la variante)
    3. Similitud por caracteres (distancia simple)
    """
    texto = texto.lower().strip()

    # 1. Exacta
    if texto in _MAPA:
        return _MAPA[texto]

    # 2. Parcial — buscar si alguna variante está contenida en el texto
    for variante, correcto in _MAPA.items():
        if variante in texto or texto in variante:
            return correcto

    # 3. Similitud simple — si comparte más del 70% de caracteres
    mejor      = None
    mejor_score = 0
    for variante, correcto in _MAPA.items():
        score = _similitud(texto, variante)
        if score > mejor_score and score >= 0.70:
            mejor_score = score
            mejor       = correcto

    return mejor if mejor else texto  # si no encuentra nada, devuelve el original


def _similitud(a, b):
    """Similitud simple por caracteres comunes."""
    if not a or not b:
        return 0
    set_a = set(a)
    set_b = set(b)
    comunes = set_a & set_b
    return len(comunes) / max(len(set_a), len(set_b))


# ─────────────────────────────────────────────
# NÚMEROS EN PALABRAS (extendido)
# ─────────────────────────────────────────────
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
    "mil": 1000,
    # Variantes mal transcritas
    "veinti": 20, "trenta": 30, "cuareta": 40, "sincuenta": 50,
}

def texto_a_numero(texto):
    texto = texto.strip().lower()
    if texto.isdigit():
        return int(texto)
    return NUMEROS.get(texto, None)