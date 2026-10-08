"""add bike image column

Revision ID: 0002_add_bike_image_column
Revises: 0001_initial_schema
Create Date: 2026-05-12
"""
from alembic import op
import sqlalchemy as sa


revision = "0002_add_bike_image_column"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("bikes", sa.Column("bike_image", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("bikes", "bike_image")
