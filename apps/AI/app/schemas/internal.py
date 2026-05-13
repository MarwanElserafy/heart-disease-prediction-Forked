"""Request bodies for internal (gateway-only) AI endpoints."""

from pydantic import BaseModel, Field


class InternalTargetRequest(BaseModel):
    """target_id is the lab_tests.id (cuid). Optional user_id links ownership for the gateway."""

    target_id: str = Field(..., min_length=1, description="Lab test id (lab_tests.id)")
    user_id: str | None = Field(None, description="Authenticated user id from Node gateway")
