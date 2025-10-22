from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./caprino.db"
    APP_ENV: str = "dev"

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache
def get_settings() -> Settings:
    return Settings()
