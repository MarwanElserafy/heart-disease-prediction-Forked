import os
from pathlib import Path

from dotenv import load_dotenv

# apps/AI/.env — cwd may be apps/AI/app when running uvicorn, so avoid bare load_dotenv()
_ai_root = Path(__file__).resolve().parent.parent.parent
# utf-8-sig strips BOM so the first key is DATABASE_URL, not \ufeffDATABASE_URL
load_dotenv(_ai_root / ".env", encoding="utf-8-sig")


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    if not DATABASE_URL:
        raise ValueError(
            "DATABASE_URL not found in environment. "
            f"Set it in {_ai_root / '.env'} or export it before starting the app."
        )


settings = Settings()
