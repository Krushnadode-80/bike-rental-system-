import qrcode

# Dynamic UPI QR Example
amount = 500
upi_link = f"upi://pay?pa=yourupi@oksbi&pn=BikeRental&am={amount}"

img = qrcode.make(upi_link)
img.save("payment_qr.png")
print("QR Code generated: payment_qr.png")
