"""
Fish Identification Backend - YOLO Model Inference Server

Uses YOLOv8 models to identify Philippine fish species from images.
Models:
  - best.pt: Primary segmentation model (best checkpoint)
  - last.pt: Fallback segmentation model (last checkpoint)
"""

import os
# Fix for PyTorch 2.6+ which defaults weights_only=True in torch.load,
# blocking ultralytics YOLO model loading.
os.environ["TORCH_FORCE_WEIGHTS_ONLY"] = "0"

# Patch torch.load at module level BEFORE ultralytics imports it
import torch
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    kwargs.setdefault("weights_only", False)
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_torch_load

import io
import time
import uuid
import logging
import hashlib
import secrets
import json
from urllib.parse import quote_plus
from urllib.parse import urlparse
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import asyncpg
from dotenv import load_dotenv
from PIL import Image
import numpy as np
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# --- Paths and environment configuration ---
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", str(PROJECT_ROOT / "uploads")))
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


ENABLE_FALLBACK_MODEL = _env_bool("ENABLE_FALLBACK_MODEL", True)


def _resolve_model_path(filename: str) -> Path:
    model_dir_env = os.getenv("MODEL_DIR")
    candidates = [
        Path(model_dir_env) / filename if model_dir_env else None,
        BACKEND_DIR / "models" / filename,
        PROJECT_ROOT / "dist" / "models" / filename,
        PROJECT_ROOT / "frontend" / "dist" / "models" / filename,
    ]
    for candidate in candidates:
        if candidate and candidate.exists():
            return candidate
    # Keep a deterministic fallback path for useful error logs.
    return BACKEND_DIR / "models" / filename


PRIMARY_MODEL_PATH = _resolve_model_path("best.pt")
FALLBACK_MODEL_PATH = _resolve_model_path("last.pt")

def _build_database_url() -> str:
    # Prefer explicit DB_* env vars for local development.
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = quote_plus(os.getenv("DB_PASSWORD", "admin"))
    db_name = os.getenv("DB_NAME", "fish_db")
    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


def _resolve_database_url() -> str:
    # Render users often paste env values with quotes/spaces; normalize first.
    raw = (os.getenv("DATABASE_URL") or "").strip().strip('"').strip("'")
    candidate = raw or _build_database_url()
    parsed = urlparse(candidate)
    if parsed.scheme not in ("postgresql", "postgres"):
        raise RuntimeError(
            "Invalid DATABASE_URL. Expected scheme 'postgresql://' or 'postgres://'. "
            "Example: postgresql://user:password@host:5432/dbname"
        )
    return candidate


DATABASE_URL = _resolve_database_url()
database_pool: Optional[asyncpg.Pool] = None


def _parse_allowed_origins() -> list[str]:
    default_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    raw = os.getenv("CORS_ORIGINS", "")
    if not raw.strip():
        return default_origins
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def _to_public_upload_url(image_url: str) -> str:
    if not image_url:
        return ""
    if image_url.startswith("http://") or image_url.startswith("https://"):
        return image_url
    if image_url.startswith("/uploads/") and PUBLIC_BASE_URL:
        return f"{PUBLIC_BASE_URL}{image_url}"
    return image_url


class RegisterPayload(BaseModel):
    email: str
    password: str
    fullName: str


class LoginPayload(BaseModel):
    email: str
    password: str


class UpdateUserPayload(BaseModel):
    fullName: Optional[str] = None
    avatarUrl: Optional[str] = None


class PasswordPayload(BaseModel):
    newPassword: str


class ProfilePayload(BaseModel):
    user_id: str = Field(alias="userId")
    name: str
    avatar_url: Optional[str] = Field(default=None, alias="avatarUrl")
    is_default: bool = Field(default=False, alias="isDefault")
    conditions: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)
    dietary_preferences: list[str] = Field(default_factory=list, alias="dietaryPreferences")
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    pregnancy_status: str = Field(default="none", alias="pregnancyStatus")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class ProfileUpdatePayload(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = Field(default=None, alias="avatarUrl")
    is_default: Optional[bool] = Field(default=None, alias="isDefault")
    conditions: Optional[list[str]] = None
    allergies: Optional[list[str]] = None
    medications: Optional[list[str]] = None
    dietary_preferences: Optional[list[str]] = Field(default=None, alias="dietaryPreferences")
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    pregnancy_status: Optional[str] = Field(default=None, alias="pregnancyStatus")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class RecommendationItemPayload(BaseModel):
    species_id: str = Field(alias="speciesId")
    safety_category: str = Field(alias="safetyCategory")
    serving_size: str = Field(alias="servingSize")
    frequency_per_week: int = Field(alias="frequencyPerWeek")
    frequency_per_month: int = Field(alias="frequencyPerMonth")
    preparation_tips: list[str] = Field(default_factory=list, alias="preparationTips")
    warnings: list[str] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)
    reasoning: str = ""

    class Config:
        populate_by_name = True


class RecommendationBulkPayload(BaseModel):
    user_id: str = Field(alias="userId")
    profile_id: str = Field(alias="profileId")
    recommendations: list[RecommendationItemPayload] = Field(default_factory=list)

    class Config:
        populate_by_name = True


def _profile_row_to_payload(row: asyncpg.Record, conditions: list[str]):
    return {
        "id": str(row["id"]),
        "userId": str(row["user_id"]),
        "name": row["name"],
        "avatarUrl": row["avatar_url"] or "",
        "isDefault": row["is_default"],
        "conditions": conditions,
        "allergies": row["allergies"] or [],
        "medications": row["medications"] or [],
        "dietaryPreferences": row["dietary_preferences"] or [],
        "age": row["age"],
        "weight": float(row["weight"]) if row["weight"] is not None else None,
        "height": float(row["height"]) if row["height"] is not None else None,
        "pregnancyStatus": row["pregnancy_status"] or "none",
        "notes": row["notes"] or "",
        "createdAt": row["created_at"].isoformat(),
        "updatedAt": row["updated_at"].isoformat(),
    }

# --- Fish species mapping (matches database seed data) ---
# The YOLO model class indices map to these species.
# We'll dynamically read the class names from the model, but also keep
# a fallback mapping that ties model class names -> database fish IDs.
FISH_DB_MAP = {
    "milkfish":     {"id": "10000000-0000-0000-0000-000000000001", "commonName": "Milkfish"},
    "bangus":       {"id": "10000000-0000-0000-0000-000000000001", "commonName": "Milkfish"},
    "tilapia":      {"id": "10000000-0000-0000-0000-000000000002", "commonName": "Tilapia"},
    "sardines":     {"id": "10000000-0000-0000-0000-000000000003", "commonName": "Sardines"},
    "sardine":      {"id": "10000000-0000-0000-0000-000000000003", "commonName": "Sardines"},
    "mackerel":     {"id": "10000000-0000-0000-0000-000000000004", "commonName": "Mackerel"},
    "alumahan":     {"id": "10000000-0000-0000-0000-000000000004", "commonName": "Mackerel"},
    "bullet tuna":  {"id": "10000000-0000-0000-0000-000000000005", "commonName": "Tulingan (Bullet Tuna)"},
    "tulingan":     {"id": "10000000-0000-0000-0000-000000000005", "commonName": "Tulingan (Bullet Tuna)"},
    "bullet_tuna":  {"id": "10000000-0000-0000-0000-000000000005", "commonName": "Tulingan (Bullet Tuna)"},
}

# Global model references
primary_model = None
fallback_model = None


def load_models():
    """Load YOLO models into memory."""
    global primary_model, fallback_model

    try:
        from ultralytics import YOLO
    except ImportError:
        logger.error("ultralytics package not installed. Run: pip install ultralytics")
        raise RuntimeError("ultralytics not installed")

    # Load primary model (best checkpoint)
    if PRIMARY_MODEL_PATH.exists():
        logger.info(f"Loading primary model from {PRIMARY_MODEL_PATH}")
        primary_model = YOLO(str(PRIMARY_MODEL_PATH))
        logger.info(f"Primary model loaded. Task: {primary_model.task}, Classes: {primary_model.names}")
    else:
        logger.warning(f"Primary model not found at {PRIMARY_MODEL_PATH}")

    # Load fallback model (last checkpoint) only when enabled.
    if ENABLE_FALLBACK_MODEL:
        if FALLBACK_MODEL_PATH.exists():
            logger.info(f"Loading fallback model from {FALLBACK_MODEL_PATH}")
            fallback_model = YOLO(str(FALLBACK_MODEL_PATH))
            logger.info(f"Fallback model loaded. Task: {fallback_model.task}, Classes: {fallback_model.names}")
        else:
            logger.warning(f"Fallback model not found at {FALLBACK_MODEL_PATH}")
    else:
        logger.info("Fallback model loading is disabled via ENABLE_FALLBACK_MODEL.")

    if primary_model is None and fallback_model is None:
        raise RuntimeError(
            f"No models found. Expected at least one of:\n"
            f"  {PRIMARY_MODEL_PATH}\n"
            f"  {FALLBACK_MODEL_PATH}"
        )


def resolve_species(class_name: str):
    """Map a YOLO class name to the database fish species."""
    key = class_name.strip().lower()
    if key in FISH_DB_MAP:
        return FISH_DB_MAP[key]

    # Fuzzy fallback: check if any DB key is contained in the class name or vice versa
    for db_key, info in FISH_DB_MAP.items():
        if db_key in key or key in db_key:
            return info

    # Unknown species - return as-is
    return {"id": "", "commonName": class_name.title()}


def _map_mercury_to_safety(mercury_level: str) -> str:
    if mercury_level in ("very-low", "low"):
        return "safe"
    if mercury_level == "moderate":
        return "moderate"
    return "avoid"


def _to_fish_payload(row: asyncpg.Record, nutrition: Optional[asyncpg.Record]):
    return {
        "id": str(row["id"]),
        "commonName": row["common_name"],
        "scientificName": row["scientific_name"],
        "imageUrl": row["image_url"] or "/placeholder-fish.jpg",
        "description": row["description"],
        "nutrition": {
            "calories": float(nutrition["energy_kcal_100g"]) if nutrition else 0,
            "protein": float(nutrition["protein_g_100g"]) if nutrition else 0,
            "totalFat": float(nutrition["fat_g_100g"]) if nutrition else 0,
            "omega3": float(nutrition["omega3_g_100g"]) * 1000 if nutrition else 0,
            "omega6": 0,
            "cholesterol": 0,
            "sodium": float(nutrition["sodium_mg_100g"]) if nutrition else 0,
            "potassium": float(nutrition["potassium_mg_100g"]) if nutrition else 0,
            "iron": 0,
            "calcium": float(nutrition["calcium_mg_100g"]) if nutrition else 0,
            "vitaminD": float(nutrition["vitamin_d_mcg_100g"]) if nutrition else 0,
            "vitaminB12": float(nutrition["vitamin_b12_mcg_100g"]) if nutrition else 0,
            "selenium": 0,
            "mercury": 0,
        },
        "mercuryLevel": row["mercury_level"],
        "safetyCategory": _map_mercury_to_safety(row["mercury_level"]),
        "habitat": row["habitat"] or "",
        "season": row["season"] or [],
        "preparationMethods": row["preparation_methods"] or [],
    }


def _build_fish_map(rows: list[asyncpg.Record], nutrition_rows: list[asyncpg.Record]):
    nutrition_map = {str(r["fish_id"]): r for r in nutrition_rows}
    return {
        str(row["id"]): _to_fish_payload(row, nutrition_map.get(str(row["id"])))
        for row in rows
    }


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()
    return f"{salt}${digest}"


def _verify_password(password: str, stored_value: str) -> bool:
    parts = stored_value.split("$", 1)
    if len(parts) != 2:
        return False
    salt, digest = parts
    candidate = hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()
    return secrets.compare_digest(candidate, digest)


def _guess_image_extension(upload: UploadFile) -> str:
    if upload.filename:
        ext = Path(upload.filename).suffix.lower()
        if ext in (".jpg", ".jpeg", ".png", ".webp"):
            return ".jpg" if ext == ".jpeg" else ext
    if upload.content_type:
        if upload.content_type.endswith("png"):
            return ".png"
        if upload.content_type.endswith("webp"):
            return ".webp"
    return ".jpg"


async def _ensure_local_auth_schema(conn: asyncpg.Connection):
    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS public.app_users (
            id UUID PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
    )


# your main prediction function.
def run_inference(image: Image.Image):
    """
    Run the primary model (best.pt) on the image.
    If no detections, fall back to last.pt.
    Returns a list of prediction dicts sorted by confidence.
    """
    predictions = _run_model(primary_model, image, "best")

    # If primary model found nothing, try fallback
    if not predictions and fallback_model is not None:
        logger.info("Primary model found no detections, trying fallback model...")
        predictions = _run_model(fallback_model, image, "last")

    # Sort by confidence descending
    predictions.sort(key=lambda p: p["confidence"], reverse=True)
    return predictions


def _run_model(model, image: Image.Image, source_label: str):
    """Run a single YOLO model on an image and return predictions."""
    if model is None:
        return []

    predictions = []
    results = model.predict(source=image, conf=0.25, verbose=False)

    for r in results:
        # Handle detection/segmentation boxes
        if hasattr(r, 'boxes') and r.boxes is not None and len(r.boxes) > 0:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                class_name = model.names.get(cls_id, f"class_{cls_id}")
                species = resolve_species(class_name)

                xyxy = box.xyxy[0].cpu().numpy()
                bbox = {
                    "x": float(xyxy[0]),
                    "y": float(xyxy[1]),
                    "width": float(xyxy[2] - xyxy[0]),
                    "height": float(xyxy[3] - xyxy[1]),
                }

                pred = {
                    "speciesId": species["id"],
                    "speciesName": species["commonName"],
                    "confidence": round(conf, 4),
                    "boundingBox": bbox,
                    "modelSource": source_label,
                }

                # Include segmentation mask info if available
                if hasattr(r, 'masks') and r.masks is not None:
                    pred["hasSegmentation"] = True

                predictions.append(pred)

        # Handle classification-only results (no boxes)
        if hasattr(r, 'probs') and r.probs is not None:
            top5 = r.probs.top5
            top5conf = r.probs.top5conf.cpu().numpy()
            for idx, c in zip(top5, top5conf):
                class_name = model.names.get(idx, f"class_{idx}")
                species = resolve_species(class_name)
                predictions.append({
                    "speciesId": species["id"],
                    "speciesName": species["commonName"],
                    "confidence": round(float(c), 4),
                    "boundingBox": None,
                    "modelSource": source_label,
                })

    return predictions


# --- FastAPI app ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models and initialize DB pool on startup."""
    global database_pool
    load_models()
    database_pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    async with database_pool.acquire() as conn:
        await _ensure_local_auth_schema(conn)
    logger.info("Models loaded and ready for inference.")
    yield
    if database_pool is not None:
        await database_pool.close()
    logger.info("Shutting down inference server.")


app = FastAPI(
    title="Fish Identification API",
    description="YOLO-powered fish species identification for the Fish Diet Recommendation app",
    version="1.0.0",
    lifespan=lifespan,
)

# Serve uploaded images
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# CORS - allow local frontend apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "database": database_pool is not None,
        "primaryModel": primary_model is not None,
        "fallbackModel": fallback_model is not None,
        "fallbackEnabled": ENABLE_FALLBACK_MODEL,
        "classes": list(primary_model.names.values()) if primary_model else [],
    }


@app.post("/api/auth/register")
async def register(payload: RegisterPayload):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    async with database_pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM public.app_users WHERE lower(email) = lower($1)",
            payload.email,
        )
        if existing:
            raise HTTPException(status_code=409, detail="Email is already registered")

        user_id = str(uuid.uuid4())
        password_hash = _hash_password(payload.password)
        row = await conn.fetchrow(
            """
            INSERT INTO public.app_users (id, email, full_name, password_hash)
            VALUES ($1::uuid, $2, $3, $4)
            RETURNING id, email, full_name, avatar_url, created_at, updated_at
            """,
            user_id,
            payload.email.lower(),
            payload.fullName,
            password_hash,
        )

    return {
        "user": {
            "id": str(row["id"]),
            "email": row["email"],
            "fullName": row["full_name"],
            "avatarUrl": row["avatar_url"] or "",
            "createdAt": row["created_at"].isoformat(),
            "updatedAt": row["updated_at"].isoformat(),
        }
    }


@app.post("/api/auth/login")
async def login(payload: LoginPayload):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, email, full_name, avatar_url, password_hash, created_at, updated_at
            FROM public.app_users
            WHERE lower(email) = lower($1)
            """,
            payload.email,
        )

    if not row or not _verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user": {
            "id": str(row["id"]),
            "email": row["email"],
            "fullName": row["full_name"],
            "avatarUrl": row["avatar_url"] or "",
            "createdAt": row["created_at"].isoformat(),
            "updatedAt": row["updated_at"].isoformat(),
        }
    }


@app.patch("/api/auth/users/{user_id}")
async def update_user(user_id: str, payload: UpdateUserPayload):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id, email, full_name, avatar_url, created_at, updated_at FROM public.app_users WHERE id = $1::uuid",
            user_id,
        )
        if not existing:
            raise HTTPException(status_code=404, detail="User not found")

        full_name = payload.fullName if payload.fullName is not None else existing["full_name"]
        avatar_url = payload.avatarUrl if payload.avatarUrl is not None else existing["avatar_url"]
        updated = await conn.fetchrow(
            """
            UPDATE public.app_users
            SET full_name = $1, avatar_url = $2, updated_at = NOW()
            WHERE id = $3::uuid
            RETURNING id, email, full_name, avatar_url, created_at, updated_at
            """,
            full_name,
            avatar_url,
            user_id,
        )

    return {
        "user": {
            "id": str(updated["id"]),
            "email": updated["email"],
            "fullName": updated["full_name"],
            "avatarUrl": updated["avatar_url"] or "",
            "createdAt": updated["created_at"].isoformat(),
            "updatedAt": updated["updated_at"].isoformat(),
        }
    }


@app.post("/api/auth/users/{user_id}/change-password")
async def change_password(user_id: str, payload: PasswordPayload):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")
    if len(payload.newPassword) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    async with database_pool.acquire() as conn:
        result = await conn.execute(
            """
            UPDATE public.app_users
            SET password_hash = $1, updated_at = NOW()
            WHERE id = $2::uuid
            """,
            _hash_password(payload.newPassword),
            user_id,
        )
    if result.endswith("0"):
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


@app.delete("/api/auth/users/{user_id}")
async def delete_user(user_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")
    async with database_pool.acquire() as conn:
        result = await conn.execute("DELETE FROM public.app_users WHERE id = $1::uuid", user_id)
    if result.endswith("0"):
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


@app.get("/api/auth/users/{user_id}/export")
async def export_user(user_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")
    async with database_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, email, full_name, avatar_url, created_at, updated_at FROM public.app_users WHERE id = $1::uuid",
            user_id,
        )
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user": {
            "id": str(row["id"]),
            "email": row["email"],
            "fullName": row["full_name"],
            "avatarUrl": row["avatar_url"] or "",
            "createdAt": row["created_at"].isoformat(),
            "updatedAt": row["updated_at"].isoformat(),
        },
        "exportedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.get("/api/health-conditions")
async def get_health_conditions():
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    query = """
        SELECT id, name, category, description, icon
        FROM public.health_conditions
        ORDER BY name
    """
    async with database_pool.acquire() as conn:
        rows = await conn.fetch(query)

    return [
        {
            "id": str(row["id"]),
            "name": row["name"],
            "category": row["category"],
            "description": row["description"],
            "icon": row["icon"],
        }
        for row in rows
    ]


@app.get("/api/profiles")
async def get_profiles(user_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, user_id, name, avatar_url, is_default, allergies, medications, dietary_preferences,
                   age, weight, height, pregnancy_status, notes, created_at, updated_at
            FROM public.health_profiles
            WHERE user_id = $1::uuid
            ORDER BY is_default DESC, name ASC
            """,
            user_id,
        )
        profile_ids = [row["id"] for row in rows]
        conditions_rows = await conn.fetch(
            """
            SELECT profile_id, condition_id
            FROM public.profile_conditions
            WHERE profile_id = ANY($1::uuid[])
            """,
            profile_ids,
        ) if profile_ids else []

    conditions_map: dict[str, list[str]] = {}
    for r in conditions_rows:
        pid = str(r["profile_id"])
        conditions_map.setdefault(pid, []).append(str(r["condition_id"]))

    return [
        _profile_row_to_payload(row, conditions_map.get(str(row["id"]), []))
        for row in rows
    ]


@app.get("/api/profiles/{profile_id}")
async def get_profile(profile_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, user_id, name, avatar_url, is_default, allergies, medications, dietary_preferences,
                   age, weight, height, pregnancy_status, notes, created_at, updated_at
            FROM public.health_profiles
            WHERE id = $1::uuid
            """,
            profile_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Profile not found")
        cond_rows = await conn.fetch(
            "SELECT condition_id FROM public.profile_conditions WHERE profile_id = $1::uuid",
            profile_id,
        )

    conditions = [str(r["condition_id"]) for r in cond_rows]
    return _profile_row_to_payload(row, conditions)


@app.post("/api/profiles")
async def create_profile(payload: ProfilePayload):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        async with conn.transaction():
            existing_count = await conn.fetchval(
                "SELECT COUNT(*) FROM public.health_profiles WHERE user_id = $1::uuid",
                payload.user_id,
            )
            is_default = payload.is_default or existing_count == 0
            if is_default:
                await conn.execute(
                    "UPDATE public.health_profiles SET is_default = FALSE WHERE user_id = $1::uuid",
                    payload.user_id,
                )

            row = await conn.fetchrow(
                """
                INSERT INTO public.health_profiles (
                    user_id, name, avatar_url, is_default, allergies, medications, dietary_preferences,
                    age, weight, height, pregnancy_status, notes
                )
                VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING id, user_id, name, avatar_url, is_default, allergies, medications, dietary_preferences,
                          age, weight, height, pregnancy_status, notes, created_at, updated_at
                """,
                payload.user_id,
                payload.name,
                payload.avatar_url,
                is_default,
                payload.allergies,
                payload.medications,
                payload.dietary_preferences,
                payload.age,
                payload.weight,
                payload.height,
                payload.pregnancy_status,
                payload.notes,
            )

            if payload.conditions:
                await conn.executemany(
                    """
                    INSERT INTO public.profile_conditions (profile_id, condition_id)
                    VALUES ($1::uuid, $2::uuid)
                    ON CONFLICT (profile_id, condition_id) DO NOTHING
                    """,
                    [(row["id"], cid) for cid in payload.conditions],
                )

    return _profile_row_to_payload(row, payload.conditions or [])


@app.patch("/api/profiles/{profile_id}")
async def update_profile(profile_id: str, payload: ProfileUpdatePayload):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        async with conn.transaction():
            existing = await conn.fetchrow(
                """
                SELECT id, user_id, name, avatar_url, is_default, allergies, medications, dietary_preferences,
                       age, weight, height, pregnancy_status, notes, created_at, updated_at
                FROM public.health_profiles
                WHERE id = $1::uuid
                """,
                profile_id,
            )
            if not existing:
                raise HTTPException(status_code=404, detail="Profile not found")

            if payload.is_default:
                await conn.execute(
                    "UPDATE public.health_profiles SET is_default = FALSE WHERE user_id = $1::uuid",
                    existing["user_id"],
                )

            updated = await conn.fetchrow(
                """
                UPDATE public.health_profiles
                SET name = COALESCE($1, name),
                    avatar_url = COALESCE($2, avatar_url),
                    is_default = COALESCE($3, is_default),
                    allergies = COALESCE($4, allergies),
                    medications = COALESCE($5, medications),
                    dietary_preferences = COALESCE($6, dietary_preferences),
                    age = COALESCE($7, age),
                    weight = COALESCE($8, weight),
                    height = COALESCE($9, height),
                    pregnancy_status = COALESCE($10, pregnancy_status),
                    notes = COALESCE($11, notes),
                    updated_at = NOW()
                WHERE id = $12::uuid
                RETURNING id, user_id, name, avatar_url, is_default, allergies, medications, dietary_preferences,
                          age, weight, height, pregnancy_status, notes, created_at, updated_at
                """,
                payload.name,
                payload.avatar_url,
                payload.is_default,
                payload.allergies,
                payload.medications,
                payload.dietary_preferences,
                payload.age,
                payload.weight,
                payload.height,
                payload.pregnancy_status,
                payload.notes,
                profile_id,
            )

            if payload.conditions is not None:
                await conn.execute(
                    "DELETE FROM public.profile_conditions WHERE profile_id = $1::uuid",
                    profile_id,
                )
                if payload.conditions:
                    await conn.executemany(
                        """
                        INSERT INTO public.profile_conditions (profile_id, condition_id)
                        VALUES ($1::uuid, $2::uuid)
                        ON CONFLICT (profile_id, condition_id) DO NOTHING
                        """,
                        [(profile_id, cid) for cid in payload.conditions],
                    )

            cond_rows = await conn.fetch(
                "SELECT condition_id FROM public.profile_conditions WHERE profile_id = $1::uuid",
                profile_id,
            )

    conditions = [str(r["condition_id"]) for r in cond_rows]
    return _profile_row_to_payload(updated, conditions)


@app.delete("/api/profiles/{profile_id}")
async def delete_profile(profile_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM public.health_profiles WHERE id = $1::uuid",
            profile_id,
        )
    if result.endswith("0"):
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"ok": True}


@app.get("/api/recommendations")
async def get_recommendations(user_id: str, profile_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        rec_rows = await conn.fetch(
            """
            SELECT id, user_id, profile_id, fish_id, safety_category, serving_size, frequency_per_week,
                   frequency_per_month, preparation_tips, warnings, alternatives, reasoning, created_at
            FROM public.fish_recommendations
            WHERE user_id = $1::uuid AND profile_id = $2::uuid
            ORDER BY created_at DESC
            """,
            user_id,
            profile_id,
        )
        fish_ids = [row["fish_id"] for row in rec_rows]
        fish_rows = await conn.fetch(
            """
            SELECT id, common_name, scientific_name, image_url, description, mercury_level, habitat, season, preparation_methods
            FROM public.fish_species
            WHERE id = ANY($1::uuid[])
            """,
            fish_ids,
        ) if fish_ids else []
        nutrition_rows = await conn.fetch(
            """
            SELECT fish_id, energy_kcal_100g, protein_g_100g, fat_g_100g, omega3_g_100g,
                   sodium_mg_100g, potassium_mg_100g, calcium_mg_100g, vitamin_d_mcg_100g, vitamin_b12_mcg_100g
            FROM public.fish_nutrition
            WHERE fish_id = ANY($1::uuid[])
            """,
            fish_ids,
        ) if fish_ids else []

    fish_map = _build_fish_map(fish_rows, nutrition_rows)
    return [
        {
            "id": str(row["id"]),
            "userId": str(row["user_id"]),
            "speciesId": str(row["fish_id"]),
            "species": fish_map.get(str(row["fish_id"])),
            "safetyCategory": row["safety_category"],
            "servingSize": row["serving_size"] or "",
            "frequencyPerWeek": row["frequency_per_week"] or 0,
            "frequencyPerMonth": row["frequency_per_month"] or 0,
            "preparationTips": row["preparation_tips"] or [],
            "warnings": row["warnings"] or [],
            "alternatives": row["alternatives"] or [],
            "reasoning": row["reasoning"] or "",
            "createdAt": row["created_at"].isoformat(),
        }
        for row in rec_rows
    ]


@app.get("/api/recommendations/{recommendation_id}")
async def get_recommendation_by_id(recommendation_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, user_id, profile_id, fish_id, safety_category, serving_size, frequency_per_week,
                   frequency_per_month, preparation_tips, warnings, alternatives, reasoning, created_at
            FROM public.fish_recommendations
            WHERE id = $1::uuid
            """,
            recommendation_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        fish_rows = await conn.fetch(
            """
            SELECT id, common_name, scientific_name, image_url, description, mercury_level, habitat, season, preparation_methods
            FROM public.fish_species
            WHERE id = $1::uuid
            """,
            row["fish_id"],
        )
        nutrition_rows = await conn.fetch(
            """
            SELECT fish_id, energy_kcal_100g, protein_g_100g, fat_g_100g, omega3_g_100g,
                   sodium_mg_100g, potassium_mg_100g, calcium_mg_100g, vitamin_d_mcg_100g, vitamin_b12_mcg_100g
            FROM public.fish_nutrition
            WHERE fish_id = $1::uuid
            """,
            row["fish_id"],
        )

    fish_map = _build_fish_map(fish_rows, nutrition_rows)
    fish = fish_map.get(str(row["fish_id"]))
    return {
        "id": str(row["id"]),
        "userId": str(row["user_id"]),
        "speciesId": str(row["fish_id"]),
        "species": fish,
        "safetyCategory": row["safety_category"],
        "servingSize": row["serving_size"] or "",
        "frequencyPerWeek": row["frequency_per_week"] or 0,
        "frequencyPerMonth": row["frequency_per_month"] or 0,
        "preparationTips": row["preparation_tips"] or [],
        "warnings": row["warnings"] or [],
        "alternatives": row["alternatives"] or [],
        "reasoning": row["reasoning"] or "",
        "createdAt": row["created_at"].isoformat(),
    }


@app.get("/api/recommendations/by-species")
async def get_recommendation_by_species(user_id: str, profile_id: str, fish_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, user_id, profile_id, fish_id, safety_category, serving_size, frequency_per_week,
                   frequency_per_month, preparation_tips, warnings, alternatives, reasoning, created_at
            FROM public.fish_recommendations
            WHERE user_id = $1::uuid AND profile_id = $2::uuid AND fish_id = $3::uuid
            """,
            user_id,
            profile_id,
            fish_id,
        )
        if not row:
            return JSONResponse(content=None, status_code=200)
        fish_rows = await conn.fetch(
            """
            SELECT id, common_name, scientific_name, image_url, description, mercury_level, habitat, season, preparation_methods
            FROM public.fish_species
            WHERE id = $1::uuid
            """,
            row["fish_id"],
        )
        nutrition_rows = await conn.fetch(
            """
            SELECT fish_id, energy_kcal_100g, protein_g_100g, fat_g_100g, omega3_g_100g,
                   sodium_mg_100g, potassium_mg_100g, calcium_mg_100g, vitamin_d_mcg_100g, vitamin_b12_mcg_100g
            FROM public.fish_nutrition
            WHERE fish_id = $1::uuid
            """,
            row["fish_id"],
        )

    fish_map = _build_fish_map(fish_rows, nutrition_rows)
    fish = fish_map.get(str(row["fish_id"]))
    return {
        "id": str(row["id"]),
        "userId": str(row["user_id"]),
        "speciesId": str(row["fish_id"]),
        "species": fish,
        "safetyCategory": row["safety_category"],
        "servingSize": row["serving_size"] or "",
        "frequencyPerWeek": row["frequency_per_week"] or 0,
        "frequencyPerMonth": row["frequency_per_month"] or 0,
        "preparationTips": row["preparation_tips"] or [],
        "warnings": row["warnings"] or [],
        "alternatives": row["alternatives"] or [],
        "reasoning": row["reasoning"] or "",
        "createdAt": row["created_at"].isoformat(),
    }


@app.get("/api/recommendations/summary")
async def get_recommendations_summary(user_id: str, profile_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT safety_category, COUNT(*) AS count
            FROM public.fish_recommendations
            WHERE user_id = $1::uuid AND profile_id = $2::uuid
            GROUP BY safety_category
            """,
            user_id,
            profile_id,
        )

    counts = {row["safety_category"]: row["count"] for row in rows}
    return {
        "safe": counts.get("safe", 0),
        "moderate": counts.get("moderate", 0),
        "avoid": counts.get("avoid", 0),
        "totalAnalyzed": sum(counts.values()),
        "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.post("/api/recommendations")
async def save_recommendations(payload: RecommendationBulkPayload):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                "DELETE FROM public.fish_recommendations WHERE user_id = $1::uuid AND profile_id = $2::uuid",
                payload.user_id,
                payload.profile_id,
            )

            if payload.recommendations:
                await conn.executemany(
                    """
                    INSERT INTO public.fish_recommendations (
                        user_id, profile_id, fish_id, safety_category, serving_size, frequency_per_week,
                        frequency_per_month, preparation_tips, warnings, alternatives, reasoning
                    )
                    VALUES ($1::uuid, $2::uuid, $3::uuid, $4::safety_category, $5, $6, $7, $8, $9, $10, $11)
                    """,
                    [
                        (
                            payload.user_id,
                            payload.profile_id,
                            item.species_id,
                            item.safety_category,
                            item.serving_size,
                            item.frequency_per_week,
                            item.frequency_per_month,
                            item.preparation_tips,
                            item.warnings,
                            item.alternatives,
                            item.reasoning,
                        )
                        for item in payload.recommendations
                    ],
                )

    return {"ok": True}


@app.get("/api/fish")
async def get_fish(q: Optional[str] = None, mercury_level: Optional[str] = None):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    where_clauses = []
    params = []
    param_index = 1

    if q:
        where_clauses.append(
            f"(common_name ILIKE ${param_index} OR scientific_name ILIKE ${param_index} OR local_name ILIKE ${param_index})"
        )
        params.append(f"%{q}%")
        param_index += 1

    if mercury_level:
        where_clauses.append(f"mercury_level = ${param_index}")
        params.append(mercury_level)

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    fish_query = f"""
        SELECT id, common_name, scientific_name, image_url, description, mercury_level, habitat, season, preparation_methods
        FROM public.fish_species
        {where_sql}
        ORDER BY common_name
    """

    async with database_pool.acquire() as conn:
        fish_rows = await conn.fetch(fish_query, *params)
        fish_ids = [row["id"] for row in fish_rows]
        nutrition_rows = await conn.fetch(
            """
            SELECT fish_id, energy_kcal_100g, protein_g_100g, fat_g_100g, omega3_g_100g,
                   sodium_mg_100g, potassium_mg_100g, calcium_mg_100g, vitamin_d_mcg_100g, vitamin_b12_mcg_100g
            FROM public.fish_nutrition
            WHERE fish_id = ANY($1::uuid[])
            """,
            fish_ids,
        ) if fish_ids else []

    nutrition_map = {str(row["fish_id"]): row for row in nutrition_rows}
    return [_to_fish_payload(row, nutrition_map.get(str(row["id"]))) for row in fish_rows]


@app.get("/api/fish/{fish_id}/suitability")
async def get_fish_suitability(fish_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    query = """
        SELECT fish_id, condition_id, suitability, portion_recommendation, clinical_rationale, alternatives
        FROM public.fish_disease_suitability
        WHERE fish_id = $1
    """
    async with database_pool.acquire() as conn:
        rows = await conn.fetch(query, fish_id)

    return [
        {
            "fishId": str(row["fish_id"]),
            "conditionId": str(row["condition_id"]),
            "suitability": "recommended" if row["suitability"] == "suitable" else row["suitability"],
            "portionRecommendation": row["portion_recommendation"] or "",
            "clinicalRationale": row["clinical_rationale"] or "",
            "alternatives": row["alternatives"] or [],
        }
        for row in rows
    ]


@app.get("/api/fish/multimorbidity")
async def get_multimorbidity_recommendations(combination: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives
            FROM public.fish_multimorbidity
            WHERE lower(disease_combination) = lower($1)
            """,
            combination,
        )

    return [
        {
            "fishId": str(row["fish_id"]),
            "combination": row["disease_combination"],
            "suitability": "recommended" if row["suitability"] == "suitable" else row["suitability"],
            "portionRecommendation": row["portion_recommendation"] or "",
            "clinicalRationale": row["clinical_rationale"] or "",
            "alternatives": row["alternatives"] or [],
        }
        for row in rows
    ]


@app.post("/api/identify")
async def identify_fish(file: UploadFile = File(...), user_id: str = Form(...)):
    """
    Accept an uploaded fish image, run YOLO inference, save to DB, and return predictions.
    """
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    # Validate file type
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG, WebP)")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read image: {str(e)}")

    image_id = str(uuid.uuid4())
    ext = _guess_image_extension(file)
    filename = f"{image_id}{ext}"
    storage_path = UPLOADS_DIR / filename
    image_url = f"/uploads/{filename}"
    public_image_url = _to_public_upload_url(image_url)

    try:
        storage_path.write_bytes(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")

    start_time = time.time()
    predictions = run_inference(image)
    processing_time_ms = round((time.time() - start_time) * 1000)

    result_id = str(uuid.uuid4())

    async with database_pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """
                INSERT INTO public.image_uploads (id, user_id, image_url, storage_path, status)
                VALUES ($1::uuid, $2::uuid, $3, $4, 'processing')
                """,
                image_id,
                user_id,
                public_image_url,
                str(storage_path),
            )

            await conn.execute(
                """
                INSERT INTO public.identification_results (id, image_id, user_id, processing_time_ms)
                VALUES ($1::uuid, $2::uuid, $3::uuid, $4)
                """,
                result_id,
                image_id,
                user_id,
                processing_time_ms,
            )

            if predictions:
                await conn.executemany(
                    """
                    INSERT INTO public.fish_predictions (result_id, fish_id, species_name, confidence, bounding_box)
                    VALUES ($1::uuid, $2::uuid, $3, $4, $5::jsonb)
                    """,
                    [
                        (
                            result_id,
                            p.get("speciesId") or None,
                            p.get("speciesName") or "",
                            p.get("confidence") or 0,
                            json.dumps(p.get("boundingBox")) if p.get("boundingBox") else None,
                        )
                        for p in predictions
                    ],
                )

            await conn.execute(
                "UPDATE public.image_uploads SET status = 'complete' WHERE id = $1::uuid",
                image_id,
            )

    if not predictions:
        return JSONResponse(content={
            "id": result_id,
            "imageId": image_id,
            "imageUrl": public_image_url,
            "predictions": [],
            "processingTime": processing_time_ms,
            "message": "No fish detected in the image. Please try with a clearer photo.",
        })

    return JSONResponse(content={
        "id": result_id,
        "imageId": image_id,
        "imageUrl": public_image_url,
        "predictions": predictions,
        "processingTime": processing_time_ms,
    })


@app.get("/api/uploads")
async def get_uploads(user_id: str, limit: int = 20):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        uploads = await conn.fetch(
            """
            SELECT id, user_id, image_url, storage_path, status, created_at
            FROM public.image_uploads
            WHERE user_id = $1::uuid
            ORDER BY created_at DESC
            LIMIT $2
            """,
            user_id,
            limit,
        )
        upload_ids = [u["id"] for u in uploads]
        results = await conn.fetch(
            """
            SELECT id, image_id, user_id, processing_time_ms, created_at
            FROM public.identification_results
            WHERE image_id = ANY($1::uuid[])
            """,
            upload_ids,
        ) if upload_ids else []
        result_ids = [r["id"] for r in results]
        preds = await conn.fetch(
            """
            SELECT result_id, fish_id, species_name, confidence, bounding_box
            FROM public.fish_predictions
            WHERE result_id = ANY($1::uuid[])
            """,
            result_ids,
        ) if result_ids else []

    result_map: dict[str, dict] = {}
    result_to_image: dict[str, str] = {}
    for r in results:
        image_id = str(r["image_id"])
        result_id = str(r["id"])
        result_to_image[result_id] = image_id
        result_map[image_id] = {
            "id": result_id,
            "imageId": image_id,
            "predictions": [],
            "processingTime": r["processing_time_ms"] or 0,
            "createdAt": r["created_at"].isoformat(),
        }

    for p in preds:
        image_id = result_to_image.get(str(p["result_id"]))
        if not image_id:
            continue
        result_map[image_id]["predictions"].append({
            "speciesId": str(p["fish_id"]) if p["fish_id"] else "",
            "speciesName": p["species_name"],
            "confidence": float(p["confidence"]),
            "boundingBox": p["bounding_box"],
        })

    payload = []
    for u in uploads:
        uid = str(u["id"])
        result = result_map.get(uid)
        payload.append({
            "id": uid,
            "previewUrl": _to_public_upload_url(u["image_url"] or ""),
            "status": u["status"],
            "progress": 100 if u["status"] == "complete" else 50,
            "result": result,
            "createdAt": u["created_at"].isoformat(),
        })

    return payload


@app.delete("/api/uploads/{upload_id}")
async def delete_upload(upload_id: str):
    if database_pool is None:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    async with database_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT storage_path FROM public.image_uploads WHERE id = $1::uuid",
            upload_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Upload not found")
        await conn.execute(
            "DELETE FROM public.image_uploads WHERE id = $1::uuid",
            upload_id,
        )

    try:
        path = Path(row["storage_path"])
        if path.exists():
            path.unlink()
    except Exception:
        logger.warning("Failed to delete image file for upload %s", upload_id)

    return {"ok": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
