from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import ALLOWED_ORIGINS
from app.routes import auth as auth_routes, users as user_routes, chat as chat_routes
from app.repositories.websocket_repository import ws_repository

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await ws_repository.redis.delete("online_users")
        async for key in ws_repository.redis.scan_iter("user_online_count:*"):
            await ws_repository.redis.delete(key)
        print("[Lifespan] Reset online users and counters in Redis successfully.", flush=True)
    except Exception as e:
        print(f"[Lifespan] Error resetting Redis online keys: {e}", flush=True)
    yield

app = FastAPI(title="Tech4um API", lifespan=lifespan)

@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(chat_routes.router)
