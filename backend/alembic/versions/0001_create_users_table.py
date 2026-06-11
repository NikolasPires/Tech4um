"""create users table

Revision ID: 0001_create_users_table
Revises: 
Create Date: 2026-06-10 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = '0001_create_users_table'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('username', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email'),
    )


def downgrade():
    op.drop_table('users')
