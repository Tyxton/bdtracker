import hashlib
import secrets
from datetime import datetime
from fastapi import HTTPException, Query, Security, status, Query
from db.database import get_db_connection
from core.admin import validate_admin_access, api_key_header

def hash_token(token: str) -> str:
    """
    Hashes token string with SHA-256 before scanning storage structures.
    Prevents information exposure from database scanning and database compromise leaks.
    """
    return hashlib.sha256(token.encode('utf-8')).hexdigest()

def generate_secure_token() -> str:
    """Generates a high-entropy, cryptographically safe capability string asset."""
    return secrets.token_urlsafe(32)

def validate_session_token(token: str = Query(..., description="The time-bound capability token for temporary access")) -> str:
    """
    FastAPI validation dependency. Analyzes existence, manual revocation state flags, 
    and systemic datetime thresholds on incoming data requests.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Security signature token is missing."
        )

    token_fingerprint = hash_token(token)
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT expires_at, is_revoked FROM share_tokens 
            WHERE token_hash = ?
        """, (token_fingerprint,))
        result = cursor.fetchone()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Capability validation engine uninitialized on database target."
        )
    finally:
        conn.close()
        
    if not result:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Provided signature key does not exist."
        )
        
    expires_at, is_revoked = result
    
    if is_revoked == 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: This capability session URL was explicitly revoked."
        )
        
    if current_time > expires_at:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Access expired: The clinical tracking visualization window has closed."
        )
        
    return token

def auth_query(
    token: str = Query(None), 
    admin_key: str = Security(api_key_header, auto_error=False)
):
    if admin_key and admin_key == os.getenv("BD_ADMIN_MASTER_KEY"):
        return {"type": "admin", "data": admin_key}
    
    if token:
        try:
            validate_session_token(token)
            return {"type": "guest", "data": token}
        except HTTPException:
            raise
            
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Unauthorized: Valid Admin Token or Session Token required."
    )
