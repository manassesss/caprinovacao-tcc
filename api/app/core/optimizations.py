"""Otimizações de performance para queries frequentes"""

from typing import List, Optional
from sqlmodel import Session, select, text
from functools import lru_cache
from app.models.property import Property
from app.models.user import User


def get_user_properties_cached(session: Session, user_id: str) -> List[str]:
    """
    Busca propriedades do usuário com cache na sessão.
    Otimiza queries repetidas de verificação de permissão.
    """
    from app.core.db import get_user_properties_cached_internal
    return get_user_properties_cached_internal(user_id, session)


def check_permission_optimized(
    session: Session,
    current_user: User,
    property_id: Optional[str] = None
) -> tuple[bool, Optional[List[str]]]:
    """
    Verifica permissão do usuário de forma otimizada.
    Retorna (is_authorized, property_ids_available)
    """
    if current_user.is_admin:
        return True, None  # Admin tem acesso total
    
    if not current_user.is_producer:
        return False, []
    
    # Cache das propriedades do produtor
    property_ids = get_user_properties_cached(session, current_user.id)
    
    if not property_ids:
        return False, []
    
    # Se foi especificada uma property_id, verifica se está na lista
    if property_id:
        if property_id not in property_ids:
            return False, property_ids
        return True, property_ids
    
    return True, property_ids


# Nota: A função build_property_filter foi removida pois causava erros
# O filtro deve ser aplicado diretamente nas rotas usando o modelo específico
# Exemplo: statement.where(Model.property_id.in_(property_ids))

