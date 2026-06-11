"""create chat schema

Revision ID: 0002_create_chat_schema
Revises: 0001_create_users_table
Create Date: 2026-06-11 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = '0002_create_chat_schema'
down_revision = '0001_create_users_table'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'rooms',
        sa.Column('id', sa.BigInteger(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'participants',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('room_id', sa.BigInteger(), sa.ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False),
        sa.PrimaryKeyConstraint('user_id', 'room_id', name='pk_participants'),
    )

    op.create_table(
        'room_messages',
        sa.Column('id', sa.BigInteger(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('room_id', sa.BigInteger(), sa.ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recipient_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('image_url', sa.String(length=1024), nullable=True),
        sa.Column('message_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_index('ix_room_messages_room_recipient', 'room_messages', ['room_id', 'recipient_id'])
    op.create_index('ix_room_messages_room_created_desc', 'room_messages', ['room_id', 'created_at'], postgresql_using='btree')


def downgrade():
    op.drop_index('ix_room_messages_room_created_desc', table_name='room_messages')
    op.drop_index('ix_room_messages_room_recipient', table_name='room_messages')
    op.drop_table('room_messages')
    op.drop_table('participants')
    op.drop_table('rooms')
