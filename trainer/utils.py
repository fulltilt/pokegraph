import psycopg2
import pandas as pd
from config import DB_CONFIG

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def load_labeled_data():
    conn = get_db_connection()
    df = pd.read_sql("""
        SELECT 
            s.product, 
            spe.title, 
            spe.price, 
            spe.label
        FROM 
            "SealedPriceEntry" spe
        JOIN 
            "Sealed" s ON s.id = spe."sealedId"
        WHERE 
            spe.label IS NOT NULL;
    """, conn)
    conn.close()
    return df

def load_unlabeled_data():
    conn = get_db_connection()
    df = pd.read_sql("""
    SELECT 
        spe.id,
        s.product, 
        spe.title, 
        spe.price
    FROM 
        "SealedPriceEntry" spe
    JOIN 
        "Sealed" s ON s.id = spe."sealedId"
    WHERE 
        spe.label IS NULL;
    """, conn)
    conn.close()
    return df

def update_labels(predictions):
    conn = get_db_connection()
    cursor = conn.cursor()
    for row_id, label in predictions:
        cursor.execute("""
    UPDATE 
        "SealedPriceEntry"
    SET 
        label = %s
    WHERE 
        id = %s;
        """, (label, row_id))
    conn.commit()
    cursor.close()
    conn.close()