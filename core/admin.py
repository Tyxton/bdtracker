import os
from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader

api_key_header = APIKeyHeader(name="X-Admin-Token", auto_error=False)

def validate_admin_access(api_key: str = Security(api_key_header)):
    """
    Validates that the incoming request contains the correct administrative master token.
    Fails closed with a 500 error if the environment variable hasn't been set.
    """
    MASTER_KEY = os.getenv("BD_ADMIN_MASTER_KEY")
    
    if not MASTER_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Security Configuration Error: Admin master token is unassigned on host environment."
        )
        
    if api_key != MASTER_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Denied: Invalid administrative credential token signature."
        )
    return api_key
