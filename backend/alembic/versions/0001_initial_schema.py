"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-05-12
"""
from alembic import op
import sqlalchemy as sa


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("password", sa.String(), nullable=True),
        sa.Column("role", sa.String(), nullable=True, server_default="user"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_unique_constraint("uq_users_email", "users", ["email"])

    op.create_table(
        "bikes",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("bike_name", sa.String(), nullable=True),
        sa.Column("brand", sa.String(), nullable=True),
        sa.Column("model", sa.String(), nullable=True),
        sa.Column("price_per_day", sa.Integer(), nullable=True),
        sa.Column("availability", sa.String(), nullable=True),
        sa.Column("bike_image", sa.String(), nullable=True),
    )
    op.create_index(op.f("ix_bikes_id"), "bikes", ["id"], unique=False)

    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("bike_id", sa.Integer(), sa.ForeignKey("bikes.id"), nullable=True),
        sa.Column("booking_date", sa.Date(), nullable=True),
        sa.Column("return_date", sa.Date(), nullable=True),
        sa.Column("total_price", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
    )
    op.create_index(op.f("ix_bookings_id"), "bookings", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_bookings_id"), table_name="bookings")
    op.drop_table("bookings")
    op.drop_index(op.f("ix_bikes_id"), table_name="bikes")
    op.drop_table("bikes")
    op.drop_constraint("uq_users_email", "users", type_="unique")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")
