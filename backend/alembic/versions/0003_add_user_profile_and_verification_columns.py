"""add user profile and verification columns

Revision ID: 0003_add_user_profile_and_verification_columns
Revises: 0002_add_bike_image_column
Create Date: 2026-05-17
"""
from alembic import op
import sqlalchemy as sa


revision = "0003_add_user_profile_and_verification_columns"
down_revision = "0002_add_bike_image_column"
branch_labels = None
depends_on = None


def _has_column(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column_name in {col["name"] for col in inspector.get_columns(table_name)}


def upgrade() -> None:
    columns = [
        ("aadhaar_number", sa.String(), True),
        ("address", sa.String(), True),
        ("profile_photo", sa.String(), True),
        ("passport_photo", sa.String(), True),
        ("aadhaar_doc", sa.String(), True),
        ("phone", sa.String(), True),
        ("is_verified", sa.Boolean(), False),
        ("admin_verified", sa.Boolean(), False),
    ]

    for name, column_type, nullable in columns:
        if not _has_column("users", name):
            server_default = "FALSE" if name in {"is_verified", "admin_verified"} else None
            op.add_column(
                "users",
                sa.Column(
                    name,
                    column_type,
                    nullable=nullable,
                    server_default=server_default,
                ),
            )


def downgrade() -> None:
    for column_name in [
        "is_verified",
        "admin_verified",
        "phone",
        "aadhaar_doc",
        "passport_photo",
        "profile_photo",
        "address",
        "aadhaar_number",
    ]:
        if _has_column("users", column_name):
            op.drop_column("users", column_name)
