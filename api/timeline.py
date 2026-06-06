import logging
import sqlite3
from fastapi import APIRouter, Depends
from typing import List
from db.database import get_db_connection, DB_PATH
from db.schemas import MindLogEntryOut
from core.analysis import process_timeline_phases
from core.admin import validate_admin_access

logger = logging.getLogger(__name__)
router = APIRouter(
        prefix="/api/timeline",
        tags=["Timeline Access"],
        dependencies=[Depends(validate_admin_access)]
)

@router.get("", response_model=List[MindLogEntryOut])
def get_timeline():
    """Retrieves full tracking history"""
    if not DB_PATH.exists():
        logger.warning("Database missing from destination path.")
        return []

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT timestamp, mood, energy, journal_text, trigger_tags
            FROM entries 
            ORDER BY timestamp ASC
        """)
        db_rows = cursor.fetchall()
    except sqlite3.OperationalError as e:
        logger.error(f"Failed to extract elements: {e}")
        return []
    finally:
        conn.close()

    return process_timeline_phases(db_rows)
