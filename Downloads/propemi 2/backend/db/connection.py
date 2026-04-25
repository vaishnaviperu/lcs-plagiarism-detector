import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv
import os

load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "RealEstateEMI"),
}

connection_pool = pooling.MySQLConnectionPool(pool_name="propemi_pool", pool_size=5, **db_config)

def get_connection():
    return connection_pool.get_connection()

def query(sql, params=None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(sql, params or ())
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

def execute(sql, params=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params or ())
        conn.commit()
        return cursor.rowcount
    finally:
        cursor.close()
        conn.close()
