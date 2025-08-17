import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import asynccontextmanager
import asyncio
from typing import Optional

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://poker_user:poker_password@localhost:5432/poker_db")

def get_db_connection():
    """Get a database connection"""
    return psycopg2.connect(DATABASE_URL)

async def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create hands table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hands (
            id SERIAL PRIMARY KEY,
            hand_id VARCHAR(50) UNIQUE NOT NULL,
            players JSONB NOT NULL,
            community_cards JSONB NOT NULL,
            pot_amount INTEGER NOT NULL,
            winner JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create actions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS actions (
            id SERIAL PRIMARY KEY,
            hand_id VARCHAR(50) NOT NULL,
            player_name VARCHAR(100) NOT NULL,
            action_type VARCHAR(20) NOT NULL,
            amount INTEGER,
            street VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (hand_id) REFERENCES hands(hand_id)
        )
    """)
    
    conn.commit()
    cursor.close()
    conn.close()

@asynccontextmanager
async def get_db():
    """Database context manager"""
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()
