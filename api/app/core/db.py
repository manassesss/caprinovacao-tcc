from sqlmodel import SQLModel, create_engine, Session, text, select
from .config import get_settings
from functools import lru_cache
from typing import Optional

settings = get_settings()

# Importa models para cache
from app.models.property import Property

# Otimizações de engine para melhor performance
engine_args = {
    "echo": (settings.APP_ENV == "dev"),
    "pool_pre_ping": True,  # Verifica conexões antes de usar
    "connect_args": {"check_same_thread": False}  # SQLite thread safety
}

# Para SQLite, adiciona otimizações específicas
if "sqlite" in settings.DATABASE_URL:
    engine_args["connect_args"] = {
        "check_same_thread": False,
        "timeout": 30,  # Timeout de 30 segundos
    }

engine = create_engine(settings.DATABASE_URL, **engine_args)

def init_db() -> None:
    from app.models import (  # noqa: F401 (import side-effects)
        base,
        user,
        property,
        animal,
        batch,
        taxonomy,
        farm,
        medicine,
        events,
    )
    SQLModel.metadata.create_all(engine)
    
    # Criar índices para otimização
    create_performance_indexes()

# Cache global para propriedades do usuário (evita queries repetidas)
_user_properties_cache = {}

def get_user_properties_cache_key(user_id: str) -> str:
    """Gera chave de cache para propriedades do usuário"""
    return f"user_properties:{user_id}"

def get_user_properties_cached_internal(user_id: str, session: Session) -> list:
    """Cache de propriedades do usuário para evitar queries repetidas"""
    import time
    
    cache_key = get_user_properties_cache_key(user_id)
    
    # Verifica cache e expiração (5 minutos)
    if cache_key in _user_properties_cache:
        cached_time, result = _user_properties_cache[cache_key]
        if time.time() - cached_time < 300:  # 5 minutos
            return list(result)
        else:
            del _user_properties_cache[cache_key]
    
    result = session.exec(
        select(Property.id).where(Property.producer_id == user_id)
    ).all()
    
    # Atualiza cache
    _user_properties_cache[cache_key] = (time.time(), list(result))
    
    return list(result)

def clear_user_properties_cache(user_id: Optional[str] = None):
    """Limpa cache de propriedades"""
    if user_id:
        cache_key = get_user_properties_cache_key(user_id)
        if cache_key in _user_properties_cache:
            del _user_properties_cache[cache_key]
    else:
        _user_properties_cache.clear()

def create_performance_indexes():
    """Cria índices adicionais para melhorar performance de queries"""
    with Session(engine) as session:
        try:
            # Índices para tabelas principais
            indexes = [
                # Animals
                "CREATE INDEX IF NOT EXISTS idx_animals_property_status ON animals(property_id, status)",
                "CREATE INDEX IF NOT EXISTS idx_animals_herd ON animals(herd_id) WHERE herd_id IS NOT NULL",
                "CREATE INDEX IF NOT EXISTS idx_animals_identification ON animals(earring_identification)",
                "CREATE INDEX IF NOT EXISTS idx_animals_birth_date ON animals(birth_date)",
                "CREATE INDEX IF NOT EXISTS idx_animals_gender ON animals(gender)",
                
                # Weight records
                "CREATE INDEX IF NOT EXISTS idx_weight_records_animal_date ON weight_records(animal_id, measurement_date)",
                
                # Parasite records
                "CREATE INDEX IF NOT EXISTS idx_parasite_records_animal_date ON parasite_records(animal_id, record_date)",
                
                # Body measurements
                "CREATE INDEX IF NOT EXISTS idx_body_measurements_animal_date ON body_measurements(animal_id, measurement_date)",
                
                # Carcass measurements
                "CREATE INDEX IF NOT EXISTS idx_carcass_measurements_animal_date ON carcass_measurements(animal_id, measurement_date)",
                
                # Animal movements
                "CREATE INDEX IF NOT EXISTS idx_animal_movements_property ON animal_movements(property_id, movement_date)",
                "CREATE INDEX IF NOT EXISTS idx_animal_movements_animal ON animal_movements(animal_id)",
                
                # Clinical occurrences
                "CREATE INDEX IF NOT EXISTS idx_clinical_occurrences_animal ON clinical_occurrences(animal_id, occurrence_date)",
                "CREATE INDEX IF NOT EXISTS idx_clinical_occurrences_property ON clinical_occurrences(property_id)",
                
                # Parasite controls
                "CREATE INDEX IF NOT EXISTS idx_parasite_controls_animal ON parasite_controls(animal_id, application_date)",
                "CREATE INDEX IF NOT EXISTS idx_parasite_controls_property ON parasite_controls(property_id)",
                
                # Vaccinations
                "CREATE INDEX IF NOT EXISTS idx_vaccinations_property ON vaccinations(property_id, vaccination_date)",
                "CREATE INDEX IF NOT EXISTS idx_vaccinations_herd ON vaccinations(herd_id) WHERE herd_id IS NOT NULL",
                
                # Vaccination animals
                "CREATE INDEX IF NOT EXISTS idx_vaccination_animals_vaccination ON vaccination_animals(vaccination_id)",
                "CREATE INDEX IF NOT EXISTS idx_vaccination_animals_animal ON vaccination_animals(animal_id)",
            ]
            
            for index_sql in indexes:
                session.exec(text(index_sql))
            
            session.commit()
            
        except Exception as e:
            # Se os índices já existem, ignora o erro
            if "already exists" not in str(e):
                print(f"Error creating indexes: {e}")
            pass

def get_session():
    with Session(engine) as session:
        # Configurações SQLite para melhor performance
        if "sqlite" in settings.DATABASE_URL:
            session.exec(text("PRAGMA journal_mode=WAL"))
            session.exec(text("PRAGMA synchronous=NORMAL"))
            session.exec(text("PRAGMA cache_size=-64000"))  # 64MB cache
            session.exec(text("PRAGMA temp_store=MEMORY"))
        yield session
