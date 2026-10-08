"""add user ownership to bookings

Revision ID: 0005_add_booking_user_id
Revises: 0004_convert_is_verified_to_boolean
Create Date: 2026-10-07
"""
from alembic import op
import sqlalchemy as sa


revision = "0005_add_booking_user_id"
down_revision = "0004_convert_is_verified_to_boolean"
branch_labels = None
depends_on = None


def _has_column(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def _has_index(table_name: str, index_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return index_name in {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    if not _has_column("bookings", "user_id"):
        op.add_column(
            "bookings",
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        )

    if not _has_index("bookings", "ix_bookings_user_id"):
        op.create_index("ix_bookings_user_id", "bookings", ["user_id"], unique=False)

    op.execute(
        """
        UPDATE bookings
        SET user_id = users.id
        FROM users
        WHERE bookings.user_id IS NULL
          AND LOWER(bookings.user_email) = LOWER(users.email)
        """
    )


def downgrade() -> None:
    # Keep ownership data intact when downgrading.
    pass
