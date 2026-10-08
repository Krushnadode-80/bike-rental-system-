from reportlab.pdfgen import canvas

def generate_invoice(username, bike, amount):
    pdf = canvas.Canvas(f"{username}_invoice.pdf")
    pdf.drawString(100, 750, "Bike Rental Invoice")
    pdf.drawString(100, 700, f"Customer: {username}")
    pdf.drawString(100, 680, f"Bike: {bike}")
    pdf.drawString(100, 660, f"Amount: ₹{amount}")
    pdf.save()
    print(f"Invoice generated: {username}_invoice.pdf")
