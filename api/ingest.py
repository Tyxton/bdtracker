import json
import logging
import sqlite3
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from db.database import get_db_connection
from db.schemas import MindLogEntryIn
from core.admin import validate_admin_access

logger = logging.getLogger(__name__)
router = APIRouter(
        prefix="/api/entries",
        tags=["Log Entries"],
        dependencies=[Depends(validate_admin_access)]
)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_entry(entry: MindLogEntryIn):
    """
    Handles the log and metric entries
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if entry.timestamp:
        try:
            dt = datetime.strptime(entry.timestamp.strip(), "%Y-%m-%d %H:%M")
            iso_timestamp = dt.strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Timeline must match the 'YYYY-MM-DD HH:MM' format."
            )
    else:
        iso_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    serialized_tags = json.dumps(entry.trigger_tags or [])

    try:
        cursor.execute("""
            INSERT INTO entries (timestamp, mood, energy, journal_text, trigger_tags)
            VALUES (?, ?, ?, ?, ?)
        """, (iso_timestamp, entry.mood, entry.energy, entry.journal_text, serialized_tags))
        conn.commit()
        logger.info(f"Entry sucessfully created for: {iso_timestamp}")
        return {"status": "success", "timestamp": iso_timestamp}
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="An entry was already made for this exact timestamp."
        )
    finally:
        conn.close()
