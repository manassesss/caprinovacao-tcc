from __future__ import annotations
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class MatingSimulationParameters(TimestampedModel, table=True):
    """Parâmetros para simulação de acasalamento"""
    __tablename__ = "mating_simulation_parameters"
    
    id: int = Field(primary_key=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    herd_id: str = Field(foreign_key="herd.id", index=True)
    
    # Parâmetros de seleção
    heritability: float  # Herdabilidade (h²)
    selection_method: str  # individual_massal, selection_index
    min_age_male_months: int  # Idade mínima para machos (meses)
    min_age_female_months: int  # Idade mínima para fêmeas (meses)
    weight_adjustment_days: int  # Dias para ajuste de peso (60, 120 ou 180)
    
    # Restrições
    max_female_percentage_per_male: float = 50.0  # Máximo % de fêmeas por macho
    
    # Observações
    observations: Optional[str] = None
    

class MatingRecommendation(TimestampedModel, table=True):
    """Recomendações de acasalamento geradas pela simulação"""
    __tablename__ = "mating_recommendations"
    
    id: int = Field(primary_key=True)
    simulation_id: int = Field(foreign_key="mating_simulation_parameters.id", index=True)
    property_id: str = Field(foreign_key="properties.id", index=True)
    herd_id: str = Field(foreign_key="herd.id", index=True)
    
    # Par de acasalamento
    sire_id: int = Field(foreign_key="animals.id", index=True)  # Reprodutor (macho)
    dam_id: int = Field(foreign_key="animals.id", index=True)  # Matriz (fêmea)
    
    # Predições
    predicted_offspring_index: float  # Índice da progênie predito
    predicted_inbreeding: float  # Endogamia da progênie (%)
    predicted_genetic_gain: Optional[float] = None  # Ganho genético
    predicted_dep: Optional[float] = None  # DEP esperada
    
    # Status
    status: str = "pending"  # pending, adopted, ignored
    adopted_date: Optional[date] = None
    
    # Observações
    observations: Optional[str] = None
    

class AnimalGeneticEvaluation(TimestampedModel, table=True):
    """Avaliação genética calculada para animais"""
    __tablename__ = "animal_genetic_evaluation"
    
    id: int = Field(primary_key=True)
    animal_id: int = Field(foreign_key="animals.id", index=True, unique=True)
    herd_id: str = Field(foreign_key="herd.id", index=True)
    
    # Valores genéticos
    dep: Optional[float] = None  # Diferença Esperada na Progênie
    inbreeding_coefficient: float = 0.0  # Coeficiente de endogamia (%)
    selection_index: Optional[float] = None  # Índice de seleção calculado
    adjusted_weight_60d: Optional[float] = None  # Peso ajustado 60 dias
    adjusted_weight_120d: Optional[float] = None  # Peso ajustado 120 dias
    adjusted_weight_180d: Optional[float] = None  # Peso ajustado 180 dias
    
    # Métricas reprodutivas
    scrotal_perimeter: Optional[float] = None  # Perímetro escrotal (para machos)
    number_of_offspring: int = 0  # Número de crias
    
    # Data da última avaliação
    last_evaluation_date: date
    
    # Observações
    observations: Optional[str] = None


