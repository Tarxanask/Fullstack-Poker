from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from database import init_db
from routers import game_router, hand_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown

app = FastAPI(
    title="Poker Game API",
    description="Texas Hold'em Poker Game API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(game_router.router, prefix="/api/game", tags=["game"])
app.include_router(hand_router.router, prefix="/api/hands", tags=["hands"])

@app.get("/")
async def root():
    return {"message": "Poker Game API is running"}
