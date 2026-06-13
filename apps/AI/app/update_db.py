import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("DATABASE_URL not found!")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

MIGRATIONS = [
    ("llm_report_json", "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS llm_report_json JSON;"),
    ("probability",     "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS probability FLOAT;"),
    ("risk_level",      "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50);"),
    ("decision",        "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS decision VARCHAR(10);"),
    ("shap_values_json","ALTER TABLE predictions ADD COLUMN IF NOT EXISTS shap_values_json JSON;"),
    ("pdf_binary",      "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS pdf_binary BYTEA;"),
    ("report_generated_at","ALTER TABLE predictions ADD COLUMN IF NOT EXISTS report_generated_at VARCHAR(50);"),
]

try:
    with engine.connect() as conn:
        for col_name, sql in MIGRATIONS:
            conn.execute(text(sql))
            print(f"Column '{col_name}' ensured in 'patients_predictions'.")
        conn.commit()
    print("\nDatabase migration completed successfully!")
except Exception as e:
    print(f"Error updating database: {e}")
