"""
Script para criar as tabelas do módulo de acasalamento.
Execute este script após implementar os novos modelos.
"""

from app.core.db import engine
from sqlmodel import SQLModel
from app.models import (
    MatingSimulationParameters,
    MatingRecommendation,
    AnimalGeneticEvaluation
)

def create_mating_tables():
    """Cria as tabelas do módulo de acasalamento"""
    
    print("Criando tabelas do módulo de acasalamento...")
    
    # Isso criará apenas as tabelas que ainda não existem
    SQLModel.metadata.create_all(engine)
    
    print("✅ Tabelas criadas com sucesso!")
    print("\nTabelas do módulo de acasalamento:")
    print("- mating_simulation_parameters")
    print("- mating_recommendations")
    print("- animal_genetic_evaluation")

if __name__ == "__main__":
    create_mating_tables()


