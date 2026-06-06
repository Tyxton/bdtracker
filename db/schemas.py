from pydantic import BaseModel, Field
from typing import List, Optional

class MindLogEntryIn(BaseModel):
    timestamp: Optional[str] = None  # Expected format: YYYY-MM-DD HH:MM
    mood: Optional[int] = Field(None, ge=1, le=10)
    energy: Optional[int] = Field(None, ge=1, le=10)
    journal_text: Optional[str] = None
    trigger_tags: Optional[List[str]] = []

class MindLogEntryOut(BaseModel):
    timestamp: str
    date_formatted: str
    mood: Optional[int] = None
    energy: Optional[int] = None
    has_journal: bool = False
    journal_snippet: Optional[str] = None
    trigger_tags: List[str] = []
    is_mixed_state: bool = False
    is_depressive_state: bool = False  
    is_hypomanic_state: bool = False   

class ShareTokenRequest(BaseModel):
    duration_hours: int = Field(2, ge=1, le=168)  # Clamp bounds cleanly between 1 hour and 1 week

class ShareTokenResponse(BaseModel):
    share_url: str
    expires_at: str
