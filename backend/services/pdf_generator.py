from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime

def generar_pdf(inventario):

    doc = SimpleDocTemplate("reporte.pdf")
    styles = getSampleStyleSheet()

    elementos = []

    # ---------------------
    # 📄 INFORMACIÓN GENERAL
    # ---------------------
    titulo = "REPORTE DE INVENTARIO - FINI"
    sistema = "FINI System"
    programador = "Elyra Assistant"  # puedes cambiarlo por tu nombre real
    fecha = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    elementos.append(Paragraph(titulo, styles["Title"]))
    elementos.append(Spacer(1, 10))

    elementos.append(Paragraph(f"Sistema: {sistema}", styles["Normal"]))
    elementos.append(Paragraph(f"Programador: {programador}", styles["Normal"]))
    elementos.append(Paragraph(f"Fecha: {fecha}", styles["Normal"]))
    elementos.append(Spacer(1, 20))

    # ---------------------
    # 📊 TABLA INVENTARIO
    # ---------------------
    data = [["Producto", "Cantidad"]]

    total = 0
    for producto, cantidad in inventario.items():
        data.append([producto, str(cantidad)])
        total += cantidad

    data.append(["TOTAL", str(total)])

    tabla = Table(data)

    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BACKGROUND", (0, -1), (-1, -1), colors.lightgrey),
    ]))

    elementos.append(tabla)

    doc.build(elementos)

    return "reporte.pdf"