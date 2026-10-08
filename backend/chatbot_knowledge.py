BIKEBOT_KNOWLEDGE = """
Verified Bike Rental platform information:

RENTAL RULES AND TERMS
- Renters must be at least 18 years old and have a valid driver's license where required for the vehicle.
- Bookings depend on bike availability. The renter must provide accurate registration information.
- Published terms say full payment is due at booking or pickup. The current website checkout takes payment through Razorpay before creating the booking.
- Return the bike in its original condition, allowing for normal wear and tear. The renter is responsible for damage during the rental.
- Late returns may incur additional fees, but the app does not publish a fee amount. Do not estimate it.
- Riders should wear helmets and follow local traffic laws.

PRICING
- Use live bike tools for the listed per-day and per-hour rates.
- Daily checkout pricing is the daily rate multiplied by the number of rental days, with a minimum of one day.
- Hourly checkout pricing rounds the duration up to whole hours, with a minimum of one hour. If a bike has no hourly rate, the app uses the daily rate divided by 24 and rounded up.
- Rental estimates do not include unspecified fees or taxes. Never claim an estimate is the final total unless the checkout shows it.

CANCELLATION
- Users can cancel a reservation from My Bookings. The system marks it Cancelled and may return the bike to Available when no other active booking exists.
- The app does not define a refund or cancellation-fee policy. Do not promise a refund or invent a fee; refer the user to support.

KYC AND BOOKING ELIGIBILITY
- The user must verify their email with the OTP flow before booking.
- Booking checkout requires a 12-digit Aadhaar number, phone number, address, profile photo, Aadhaar document, and PAN card document.
- Never request or repeat a user's OTP, full Aadhaar number, password, or payment credentials in chat.

PAYMENTS
- The active website checkout uses Razorpay and verifies the payment signature before it creates the booking.
- The booking confirmation records payment status and total. Do not claim a payment succeeded unless the user's booking data confirms it.
- Do not request card numbers, UPI PINs, OTPs, or other payment credentials.

PICKUP, DROP-OFF, AND HOURS
- The app mentions a pickup desk but does not provide its street address, a drop-off location, or rental operating hours.
- A booking receipt lists support@bikerental.com and says support is available 24/7; this does not establish rental desk operating hours.
- Do not make up locations or rental desk hours. Direct users to support@bikerental.com for confirmation.

FAQ GUIDANCE
- For bike names, specifications, live rates, and availability, call the relevant bike tools.
- For reservation dates, status, and payment status, use the authenticated user's booking tool only.
- For location, working-hour, refund, or other unpublished policy questions, say the information is not listed in the app and direct the user to support@bikerental.com.
""".strip()
