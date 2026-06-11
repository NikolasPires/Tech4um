from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.routes import auth as auth_routes, users as user_routes, chat as chat_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tech4um API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(chat_routes.router)
