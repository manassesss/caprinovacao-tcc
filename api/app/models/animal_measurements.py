from __future__ import annotations
from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampedModel

class WeightRecord(TimestampedModel, table=True):
    """Desenvolvimento Ponderal - Registro de Peso"""
    __tablename__ = "weight_records"
    id: int = Field(primary_key=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    
    # Desenvolvimento Ponderal
    measurement_period: str  # ao_nascer, desmame, outros
    measurement_date: date
    weight: float  # Peso em kg
    
    # Avaliação fenotípica (CPM)
    body_condition_score: Optional[int] = None  # ECC - Escore de Condição Corporal (1-5)
    conformation: Optional[int] = None  # C - Conformação (1-5)
    precocity: Optional[int] = None  # P - Precocidade (1-5)
    musculature: Optional[int] = None  # M - Musculatura (1-5)
    cpm_average: Optional[float] = None  # Média automática de C+P+M
    
    # Relationships
    # animal: "Animal" = Relationship(back_populates="weight_records")


class ParasiteRecord(TimestampedModel, table=True):
    """Registro de Verminose"""
    __tablename__ = "parasite_records"
    id: int = Field(primary_key=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    
    record_date: date
    opg: Optional[int] = None  # OPG - Ovos Por Grama de fezes
    famacha: Optional[int] = None  # FAMACHA - Classificação 1-5
    
    # Relationships
    # animal: "Animal" = Relationship(back_populates="parasite_records")


class BodyMeasurement(TimestampedModel, table=True):
    """Medidas de Tamanho Corporal"""
    __tablename__ = "body_measurements"
    id: int = Field(primary_key=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    
    measurement_date: date
    
    # Medidas corporais (todas em cm)
    ag: Optional[float] = None  # Altura de Garupa
    ac: Optional[float] = None  # Altura de Cernelha
    ap: Optional[float] = None  # Altura de Peito
    cc: Optional[float] = None  # Comprimento Corporal
    pc: Optional[float] = None  # Perímetro de Canela
    perpe: Optional[float] = None  # Perímetro da Perna
    cpern: Optional[float] = None  # Comprimento da Perna
    co: Optional[float] = None  # Comprimento de Orelha
    ct: Optional[float] = None  # Comprimento de Tronco
    lr: Optional[float] = None  # Largura de Rump
    ccab: Optional[float] = None  # Comprimento de Cabeça
    lil: Optional[float] = None  # Largura de Ilíaco Longitudinal
    lis: Optional[float] = None  # Largura de Ilíaco Superior
    ccau: Optional[float] = None  # Comprimento de Cauda
    cga: Optional[float] = None  # Comprimento de Garupa
    pcau: Optional[float] = None  # Perímetro de Cauda
    
    # Relationships
    # animal: "Animal" = Relationship(back_populates="body_measurements")


class CarcassMeasurement(TimestampedModel, table=True):
    """Medidas de Carcaça (in vivo)"""
    __tablename__ = "carcass_measurements"
    id: int = Field(primary_key=True)
    animal_id: int = Field(foreign_key="animals.id", index=True)
    
    measurement_date: date
    
    # Medidas de carcaça
    aol: Optional[float] = None  # Área de Olho de Lombo
    col: Optional[float] = None  # Comprimento de Olho de Lombo
    pol: Optional[float] = None  # Profundidade de Olho de Lombo
    mol: Optional[float] = None  # Medida de Olho de Lombo
    egs: Optional[float] = None  # Espessura de Gordura Subcutânea
    egbf: Optional[float] = None  # Espessura de Gordura de Braço de Fêmur
    ege: Optional[float] = None  # Espessura de Gordura Esternal
    
    # Relationships
    # animal: "Animal" = Relationship(back_populates="carcass_measurements")


