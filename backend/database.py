import sqlite3
from datetime import datetime

DB_NAME = "app.db"


def get_connection():
    return sqlite3.connect(DB_NAME)


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            created_at TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS diagnoses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            crop TEXT,
            region TEXT,
            disease TEXT,
            confidence REAL,
            explanation TEXT,
            created_at TEXT
        )
    """)

    conn.commit()
    conn.close()


def create_user_if_not_exists(user_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE user_id = ?", (user_id,))
    if cursor.fetchone() is None:
        cursor.execute(
            "INSERT INTO users (user_id, created_at) VALUES (?, ?)",
            (user_id, datetime.utcnow().isoformat())
        )
        conn.commit()

    conn.close()


def save_diagnosis(
    user_id: str,
    crop: str,
    region: str,
    disease: str,
    confidence: float,
    explanation: str
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO diagnoses
        (user_id, crop, region, disease, confidence, explanation, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        crop,
        region,
        disease,
        confidence,
        explanation,
        datetime.utcnow().isoformat()
    ))

    conn.commit()
    conn.close()


def get_user_history(user_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT crop, region, disease, confidence, explanation, created_at
        FROM diagnoses
        WHERE user_id = ?
        ORDER BY created_at DESC
    """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "crop": r[0],
            "region": r[1],
            "disease": r[2],
            "confidence": r[3],
            "explanation": r[4],
            "created_at": r[5],
        }
        for r in rows
    ]
