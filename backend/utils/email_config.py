from fastapi_mail import ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME = "kasarkrushna74@gmail.com",
    MAIL_PASSWORD = "psjz hxka kqcf gayi",
    MAIL_FROM = "kasarkrushna74@gmail.com",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True
)
