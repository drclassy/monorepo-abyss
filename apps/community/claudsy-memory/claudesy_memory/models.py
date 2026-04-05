from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator


def local_now() -> datetime:
    return datetime.now()


class FactRecord(BaseModel):
    id: str = Field(..., min_length=1, max_length=64)
    fact: str = Field(..., min_length=1, max_length=500)
    importance: float = Field(..., ge=0.0, le=1.0)
    category: str = Field(..., min_length=1, max_length=32)
    operation: str = Field(..., pattern=r'^(ADD|UPDATE|DELETE|NOOP)$')
    tags: list[str] = Field(default_factory=list, max_items=6)
    related_to: Optional[str] = None
    summary: Optional[str] = None
    session: Optional[str] = None
    name: Optional[str] = None
    steps: Optional[list[str]] = None
    source: str = Field(..., min_length=1)
    created: str = Field(..., min_length=1)
    last_accessed: str = Field(..., min_length=1)
    access_count: int = Field(..., ge=0)
    status: str = Field(..., pattern=r'^(active|stale|deleted|superseded)$')

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if not isinstance(v, list):
            raise ValueError('Tags must be a list')
        for tag in v:
            if len(tag) > 32:
                raise ValueError('Tag too long')
        return v


@dataclass(slots=True)
class SessionEvent:
    title: str
    description: str
    decision: str | None = None
    tags: list[str] = field(default_factory=list)
    timestamp: str = field(default_factory=lambda: local_now().strftime("%H:%M"))

    def __post_init__(self):
        # Validation
        if not self.title or len(self.title) > 200:
            raise ValueError("Invalid title")
        if not self.description or len(self.description) > 5000:
            raise ValueError("Invalid description")
        if self.decision and len(self.decision) > 1000:
            raise ValueError("Decision too long")
        if len(self.tags) > 10:
            raise ValueError("Too many tags")
        for tag in self.tags:
            if len(tag) > 50:
                raise ValueError("Tag too long")

    def render(self) -> str:
        parts = [f"### {self.timestamp} - {self.title}", self.description.strip()]
        if self.decision:
            parts.append(f"Decision: {self.decision.strip()}")
        if self.tags:
            parts.append(f"Tags: {', '.join(self.tags)}")
        return "\n".join(parts).strip() + "\n"
