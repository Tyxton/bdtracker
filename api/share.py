from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status
import sqlite3

from db.database import get_db_connection
from db.schemas import ShareTokenRequest, ShareTokenResponse, MindLogEntryOut
from core.security import generate_secure_token, hash_token, validate_session_token
from core.analysis import process_timeline_phases

router = APIRouter(prefix="/api/share", tags=["Clinical Sharing"])

@router.post("/generate", response_model=ShareTokenResponse)
def generate_share_link(request: ShareTokenRequest):
    """
    Generates a high-entropy, cleartext token for the client, but records 
    only its SHA-256 hash in the database to prevent exposure via leaks.
    """
    raw_token = generate_secure_token()
    token_fingerprint = hash_token(raw_token)
    
    expiration_time = datetime.now() + timedelta(hours=request.duration_hours)
    expires_at_str = expiration_time.strftime("%Y-%m-%d %H:%M:%S")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO share_tokens (token_hash, expires_at, is_revoked)
            VALUES (?, ?, ?)
        """, (token_fingerprint, expires_at_str, 0))
        conn.commit()
    except sqlite3.Error as e:
        conn.rollback()
        print(f"\n[CRITICAL ERROR]: {e}\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Backend token generation failed: {e}"
        )
    finally:
        conn.close()

    share_uri = f"/static/timeline.html?token={raw_token}"
    return ShareTokenResponse(share_url=share_uri, expires_at=expires_at_str)

@router.get("/view", response_model=list[MindLogEntryOut])
def get_shared_timeline(token: str = Depends(validate_session_token)):
    """
    Validates the incoming query token using security.py. If the token is valid,
    unrevoked, and active, it pulls the logs and processes the tracking.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT timestamp, mood, energy, journal_text, trigger_tags 
            FROM entries 
            ORDER BY timestamp DESC
        """)
        rows = cursor.fetchall()
    except sqlite3.Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query database entries."
        )
    finally:
        conn.close()

    return process_timeline_phases(rows)


@router.post("/revoke")
def revoke_share_link(token: str):
    """
    Manually flags an active token's hash as revoked, rendering the capability 
    string useless immediately.
    """
    token_fingerprint = hash_token(token)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE share_tokens 
        SET is_revoked = 1 
        WHERE token_hash = ?
    """, (token_fingerprint,))
    conn.commit()
    conn.close()
    
    return {"status": "success", "detail": "Capability session explicitly revoked."}
