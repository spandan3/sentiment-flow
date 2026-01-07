"""add analysis fields to calls

Revision ID: af_add_analysis_fields_to_calls
Revises: b5ce912bc209
Create Date: 2026-01-07
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "af_add_analysis_fields_to_calls"
down_revision: Union[str, None] = "b5ce912bc209"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("calls", sa.Column("transcript", sa.Text(), nullable=True))
    op.add_column("calls", sa.Column("sentiment_score", sa.Float(), nullable=True))
    op.add_column("calls", sa.Column("summary", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("calls", "summary")
    op.drop_column("calls", "sentiment_score")
    op.drop_column("calls", "transcript")



