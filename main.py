import os
import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from api import ingest, timeline, share

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

ROOT_PATH = os.getenv("BD_ROOT_PATH", "")

app = FastAPI(
    title="BDTracker - Core",
    description="Secure Bipolar Tracking",
    version="1.0.0",
    root_path=ROOT_PATH
)

RAW_HOSTS = os.getenv("BD_ALLOWED_HOSTS", "localhost,127.0.0.1")
RAW_ORIGINS = os.getenv("BD_ALLOWED_ORIGINS", "http://localhost")

ALLOWED_HOSTS = [host.strip() for host in RAW_HOSTS.split(",") if host.strip()]
ALLOWED_ORIGINS = [origin.strip() for origin in RAW_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(ingest.router)
app.include_router(timeline.router)
app.include_router(share.router)

@app.get("/")
def root_redirect():
    return RedirectResponse(url="/static/index.html")
