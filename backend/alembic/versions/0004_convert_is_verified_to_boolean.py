"""convert is_verified to boolean

Revision ID: 0004_convert_is_verified_to_boolean
Revises: 0003_add_user_profile_and_verification_columns
Create Date: 2026-05-17
"""
from alembic import op
import sqlalchemy as sa


revision = "0004_convert_is_verified_to_boolean"
down_revision = "0003_add_user_profile_and_verification_columns"
branch_labels = None
depends_on = None


def _has_column(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column_name in {col["name"] for col in inspector.get_columns(table_name)}


def upgrade() -> None:
    if _has_column("users", "is_verified"):
        op.execute(
            """
            ALTER TABLE users
            ALTER COLUMN is_verified TYPE BOOLEAN
            USING CASE
                WHEN is_verified IS NULL THEN FALSE
                WHEN is_verified::TEXT IN ('1', 'true', 't', 'yes') THEN TRUE
                ELSE FALSE
            END
            """
        )
        op.execute(
            "UPDATE users SET is_verified = FALSE WHERE is_verified IS NULL"
        )
        op.execute(
            "ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT FALSE"
        )
        op.execute(
            "ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL"
        )


def downgrade() -> None:
    pass
