from typing import List, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func
from pydantic import BaseModel
import math
from app.core.db import get_session
from app.core.auth import get_current_active_user
from app.models.mating import (
    MatingSimulationParameters, 
    MatingRecommendation,
    AnimalGeneticEvaluation
)
from app.models.animal import Animal
from app.models.user import User
from app.models.property import Property
from app.models.reproductive_management import ReproductiveManagement
from app.models.animal_measurements import WeightRecord, BodyMeasurement

router = APIRouter(prefix="/mating", tags=["mating"])

# ============ SCHEMAS ============

class SimulationParametersCreate(BaseModel):
    property_id: str
    herd_id: str
    heritability: float
    selection_method: str  # individual_massal, selection_index
    min_age_male_months: int
    min_age_female_months: int
    weight_adjustment_days: int  # 60, 120, 180
    max_female_percentage_per_male: Optional[float] = 50.0
    observations: Optional[str] = None

class AnimalSelectionInfo(BaseModel):
    id: int
    name: Optional[str]
    earring_identification: str
    gender: str
    birth_date: date
    age_months: int
    dep: Optional[float] = None
    inbreeding_coefficient: float = 0.0
    selection_index: Optional[float] = None
    adjusted_weight: Optional[float] = None
    scrotal_perimeter: Optional[float] = None
    number_of_offspring: int = 0

class MatingRecommendationResponse(BaseModel):
    id: int
    sire_id: int
    sire_name: Optional[str]
    dam_id: int
    dam_name: Optional[str]
    predicted_offspring_index: float
    predicted_inbreeding: float
    predicted_genetic_gain: Optional[float]
    predicted_dep: Optional[float]
    status: str

class BirthPrediction(BaseModel):
    reproductive_management_id: int
    dam_id: int
    dam_name: Optional[str]
    sire_id: int
    sire_name: Optional[str]
    coverage_date: date
    predicted_birth_date: date
    days_until_birth: int

class CoverageByReproducer(BaseModel):
    sire_id: int
    sire_name: Optional[str]
    total_coverages: int
    total_births: int
    total_ongoing: int
    birth_rate: float

# ============ HELPER FUNCTIONS ============

def calculate_animal_age_months(birth_date: date) -> int:
    """Calcula a idade do animal em meses"""
    today = date.today()
    months = (today.year - birth_date.year) * 12 + today.month - birth_date.month
    if today.day < birth_date.day:
        months -= 1
    return max(0, months)

def calculate_inbreeding_coefficient(animal: Animal, session: Session) -> float:
    """
    Calcula o coeficiente de endogamia de um animal baseado na genealogia.
    Implementação simplificada - em produção, usar algoritmo de Meuwissen & Luo (1992)
    """
    if not animal.father_id or not animal.mother_id:
        return 0.0
    
    # Busca os pais
    father = session.get(Animal, animal.father_id)
    mother = session.get(Animal, animal.mother_id)
    
    if not father or not mother:
        return 0.0
    
    # Verificação simples: se os pais têm algum ancestral comum
    # Em produção, implementar cálculo completo via matriz de parentesco
    common_ancestors = 0
    
    # Verifica se avós paternos e maternos são os mesmos
    if father.father_id and mother.father_id and father.father_id == mother.father_id:
        common_ancestors += 1
    if father.father_id and mother.mother_id and father.father_id == mother.mother_id:
        common_ancestors += 1
    if father.mother_id and mother.father_id and father.mother_id == mother.father_id:
        common_ancestors += 1
    if father.mother_id and mother.mother_id and father.mother_id == mother.mother_id:
        common_ancestors += 1
    
    # Coeficiente simplificado baseado em ancestrais comuns
    # Fórmula: F = (1/2)^n onde n é o número de gerações
    if common_ancestors > 0:
        return (common_ancestors / 4.0) * 100  # Retorna em percentual
    
    return 0.0

def calculate_predicted_inbreeding(sire: Animal, dam: Animal, session: Session) -> float:
    """
    Calcula a endogamia prevista da progênie dados pai e mãe.
    Implementação simplificada.
    """
    # Verifica se pai e mãe têm ancestrais comuns
    common_ancestors = 0
    
    if sire.father_id and dam.father_id and sire.father_id == dam.father_id:
        common_ancestors += 1
    if sire.father_id and dam.mother_id and sire.father_id == dam.mother_id:
        common_ancestors += 1
    if sire.mother_id and dam.father_id and sire.mother_id == dam.father_id:
        common_ancestors += 1
    if sire.mother_id and dam.mother_id and sire.mother_id == dam.mother_id:
        common_ancestors += 1
    
    # Se são meio-irmãos (compartilham um dos pais)
    if common_ancestors > 0:
        return (common_ancestors / 4.0) * 100
    
    return 0.0

def calculate_dep(animal: Animal, session: Session, weight_adjustment_days: int) -> float:
    """
    Calcula a DEP (Diferença Esperada na Progênie) do animal.
    Implementação simplificada baseada em peso ajustado.
    """
    # Buscar pesagens do animal
    measurements = session.exec(
        select(WeightRecord)
        .where(WeightRecord.animal_id == animal.id)
        .order_by(WeightRecord.measurement_date)
    ).all()
    
    if not measurements:
        return 0.0
    
    # Encontrar peso mais próximo do período de ajuste
    target_age_days = weight_adjustment_days
    best_measurement = None
    min_diff = float('inf')
    
    for measurement in measurements:
        age_at_measurement = (measurement.measurement_date - animal.birth_date).days
        diff = abs(age_at_measurement - target_age_days)
        if diff < min_diff:
            min_diff = diff
            best_measurement = measurement
    
    if not best_measurement:
        return 0.0
    
    # DEP simplificado: (peso_ajustado - média_rebanho) / desvio_padrão
    # Para simplicidade, usando valor bruto normalizado
    adjusted_weight = best_measurement.weight
    
    # Buscar média do rebanho (simplificado)
    avg_weight = session.exec(
        select(func.avg(WeightRecord.weight))
        .where(WeightRecord.animal_id.in_(
            select(Animal.id).where(Animal.herd_id == animal.herd_id)
        ))
    ).first() or 0.0
    
    if avg_weight == 0:
        return 0.0
    
    # DEP normalizado
    dep = (adjusted_weight - avg_weight) / avg_weight
    return round(dep, 3)

def calculate_selection_index(
    animal: Animal, 
    session: Session, 
    heritability: float,
    weight_adjustment_days: int
) -> float:
    """
    Calcula índice de seleção do animal.
    Implementação simplificada que combina DEP e endogamia.
    """
    dep = calculate_dep(animal, session, weight_adjustment_days)
    inbreeding = calculate_inbreeding_coefficient(animal, session)
    
    # Índice = DEP ajustado pela herdabilidade - penalização por endogamia
    # Fórmula simplificada: I = (DEP * h²) - (F * 0.1)
    index = (dep * heritability) - (inbreeding * 0.01)
    
    return round(index, 3)

def run_mating_simulation(
    males: List[Animal],
    females: List[Animal],
    session: Session,
    heritability: float,
    weight_adjustment_days: int,
    max_female_percentage_per_male: float
) -> List[dict]:
    """
    Executa simulação de acasalamentos usando otimização multiobjetivo simplificada.
    Em produção, implementar NSGA-II completo.
    """
    recommendations = []
    
    # Calcular quantas fêmeas cada macho pode cobrir
    max_females_per_male = math.ceil(len(females) * (max_female_percentage_per_male / 100))
    male_coverage_count = {male.id: 0 for male in males}
    
    # Criar todas as combinações possíveis e ranquear
    combinations = []
    for sire in males:
        for dam in females:
            # Calcular métricas da combinação
            sire_dep = calculate_dep(sire, session, weight_adjustment_days)
            dam_dep = calculate_dep(dam, session, weight_adjustment_days)
            predicted_dep = (sire_dep + dam_dep) / 2
            
            sire_index = calculate_selection_index(sire, session, heritability, weight_adjustment_days)
            dam_index = calculate_selection_index(dam, session, heritability, weight_adjustment_days)
            predicted_index = (sire_index + dam_index) / 2
            
            predicted_inbreeding = calculate_predicted_inbreeding(sire, dam, session)
            
            # Função objetivo: maximizar índice e minimizar endogamia
            # Score = índice - (endogamia * peso_penalizacao)
            objective_score = predicted_index - (predicted_inbreeding * 0.5)
            
            combinations.append({
                'sire': sire,
                'dam': dam,
                'sire_dep': sire_dep,
                'dam_dep': dam_dep,
                'predicted_dep': predicted_dep,
                'predicted_index': predicted_index,
                'predicted_inbreeding': predicted_inbreeding,
                'objective_score': objective_score
            })
    
    # Ordenar por score objetivo (maior = melhor)
    combinations.sort(key=lambda x: x['objective_score'], reverse=True)
    
    # Selecionar melhores combinações respeitando restrições
    assigned_females = set()
    
    for combo in combinations:
        sire_id = combo['sire'].id
        dam_id = combo['dam'].id
        
        # Verificar se fêmea já foi atribuída
        if dam_id in assigned_females:
            continue
        
        # Verificar se macho não excedeu limite
        if male_coverage_count[sire_id] >= max_females_per_male:
            continue
        
        # Adicionar recomendação
        recommendations.append(combo)
        assigned_females.add(dam_id)
        male_coverage_count[sire_id] += 1
        
        # Parar se todas as fêmeas foram atribuídas
        if len(assigned_females) == len(females):
            break
    
    return recommendations

# ============ ENDPOINTS ============

@router.get("/eligible-animals/{herd_id}", response_model=dict)
def get_eligible_animals(
    herd_id: str,
    min_age_male_months: int = 6,
    min_age_female_months: int = 8,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista animais elegíveis para acasalamento por rebanho"""
    
    # Buscar animais do rebanho
    animals = session.exec(
        select(Animal)
        .where(Animal.herd_id == herd_id)
        .where(Animal.status == "ativo")
    ).all()
    
    males = []
    females = []
    
    for animal in animals:
        age_months = calculate_animal_age_months(animal.birth_date)
        
        # Filtrar por idade mínima e gênero
        if animal.gender == "M" and age_months >= min_age_male_months:
            # Buscar avaliação genética se existir
            evaluation = session.exec(
                select(AnimalGeneticEvaluation)
                .where(AnimalGeneticEvaluation.animal_id == animal.id)
            ).first()
            
            males.append(AnimalSelectionInfo(
                id=animal.id,
                name=animal.name,
                earring_identification=animal.earring_identification,
                gender=animal.gender,
                birth_date=animal.birth_date,
                age_months=age_months,
                dep=evaluation.dep if evaluation else None,
                inbreeding_coefficient=evaluation.inbreeding_coefficient if evaluation else 0.0,
                selection_index=evaluation.selection_index if evaluation else None,
                adjusted_weight=None,
                scrotal_perimeter=evaluation.scrotal_perimeter if evaluation else None,
                number_of_offspring=evaluation.number_of_offspring if evaluation else 0
            ))
        
        elif animal.gender == "F" and age_months >= min_age_female_months:
            evaluation = session.exec(
                select(AnimalGeneticEvaluation)
                .where(AnimalGeneticEvaluation.animal_id == animal.id)
            ).first()
            
            females.append(AnimalSelectionInfo(
                id=animal.id,
                name=animal.name,
                earring_identification=animal.earring_identification,
                gender=animal.gender,
                birth_date=animal.birth_date,
                age_months=age_months,
                dep=evaluation.dep if evaluation else None,
                inbreeding_coefficient=evaluation.inbreeding_coefficient if evaluation else 0.0,
                selection_index=evaluation.selection_index if evaluation else None,
                adjusted_weight=None,
                number_of_offspring=evaluation.number_of_offspring if evaluation else 0
            ))
    
    return {
        "herd_id": herd_id,
        "males": males,
        "females": females
    }

@router.post("/calculate-genetic-evaluation/{herd_id}")
def calculate_genetic_evaluation_for_herd(
    herd_id: str,
    heritability: float = 0.3,
    weight_adjustment_days: int = 60,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Calcula avaliação genética para todos os animais do rebanho"""
    
    animals = session.exec(
        select(Animal)
        .where(Animal.herd_id == herd_id)
        .where(Animal.status == "ativo")
    ).all()
    
    evaluated_count = 0
    
    for animal in animals:
        # Calcular métricas genéticas
        inbreeding = calculate_inbreeding_coefficient(animal, session)
        dep = calculate_dep(animal, session, weight_adjustment_days)
        selection_index = calculate_selection_index(animal, session, heritability, weight_adjustment_days)
        
        # Buscar número de crias
        offspring_count = 0
        if animal.gender == "M":
            offspring_count = session.exec(
                select(func.count(ReproductiveManagement.id))
                .where(ReproductiveManagement.sire_id == animal.id)
                .where(ReproductiveManagement.parturition_status == "sim")
            ).first() or 0
        else:
            offspring_count = session.exec(
                select(func.count(ReproductiveManagement.id))
                .where(ReproductiveManagement.dam_id == animal.id)
                .where(ReproductiveManagement.parturition_status == "sim")
            ).first() or 0
        
        # Verificar se já existe avaliação
        existing_eval = session.exec(
            select(AnimalGeneticEvaluation)
            .where(AnimalGeneticEvaluation.animal_id == animal.id)
        ).first()
        
        if existing_eval:
            # Atualizar
            existing_eval.dep = dep
            existing_eval.inbreeding_coefficient = inbreeding
            existing_eval.selection_index = selection_index
            existing_eval.number_of_offspring = offspring_count
            existing_eval.last_evaluation_date = date.today()
            session.add(existing_eval)
        else:
            # Criar nova
            new_eval = AnimalGeneticEvaluation(
                animal_id=animal.id,
                herd_id=herd_id,
                dep=dep,
                inbreeding_coefficient=inbreeding,
                selection_index=selection_index,
                number_of_offspring=offspring_count,
                last_evaluation_date=date.today()
            )
            session.add(new_eval)
        
        evaluated_count += 1
    
    session.commit()
    
    return {
        "message": f"Avaliação genética calculada para {evaluated_count} animais",
        "herd_id": herd_id
    }

@router.post("/simulate", response_model=dict)
def simulate_mating(
    params: SimulationParametersCreate,
    selected_male_ids: List[int] = Query(...),
    selected_female_ids: List[int] = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Executa simulação de acasalamentos"""
    
    # Verificar permissão
    prop = session.get(Property, params.property_id)
    if not prop or (prop.producer_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Buscar animais selecionados
    males = session.exec(
        select(Animal)
        .where(Animal.id.in_(selected_male_ids))
        .where(Animal.gender == "M")
    ).all()
    
    females = session.exec(
        select(Animal)
        .where(Animal.id.in_(selected_female_ids))
        .where(Animal.gender == "F")
    ).all()
    
    if not males or not females:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="É necessário selecionar pelo menos um macho e uma fêmea"
        )
    
    # Salvar parâmetros da simulação
    simulation = MatingSimulationParameters(**params.dict())
    session.add(simulation)
    session.commit()
    session.refresh(simulation)
    
    # Executar simulação
    recommendations_data = run_mating_simulation(
        males=males,
        females=females,
        session=session,
        heritability=params.heritability,
        weight_adjustment_days=params.weight_adjustment_days,
        max_female_percentage_per_male=params.max_female_percentage_per_male
    )
    
    # Salvar recomendações
    saved_recommendations = []
    for rec_data in recommendations_data:
        recommendation = MatingRecommendation(
            simulation_id=simulation.id,
            property_id=params.property_id,
            herd_id=params.herd_id,
            sire_id=rec_data['sire'].id,
            dam_id=rec_data['dam'].id,
            predicted_offspring_index=rec_data['predicted_index'],
            predicted_inbreeding=rec_data['predicted_inbreeding'],
            predicted_dep=rec_data['predicted_dep'],
            predicted_genetic_gain=rec_data['objective_score']
        )
        session.add(recommendation)
        saved_recommendations.append(recommendation)
    
    session.commit()
    
    return {
        "simulation_id": simulation.id,
        "total_recommendations": len(saved_recommendations),
        "message": "Simulação executada com sucesso"
    }

@router.get("/recommendations/{simulation_id}", response_model=List[MatingRecommendationResponse])
def get_mating_recommendations(
    simulation_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Lista recomendações de uma simulação"""
    
    recommendations = session.exec(
        select(MatingRecommendation)
        .where(MatingRecommendation.simulation_id == simulation_id)
        .order_by(MatingRecommendation.predicted_genetic_gain.desc())
    ).all()
    
    result = []
    for rec in recommendations:
        sire = session.get(Animal, rec.sire_id)
        dam = session.get(Animal, rec.dam_id)
        
        result.append(MatingRecommendationResponse(
            id=rec.id,
            sire_id=rec.sire_id,
            sire_name=sire.name if sire else None,
            dam_id=rec.dam_id,
            dam_name=dam.name if dam else None,
            predicted_offspring_index=rec.predicted_offspring_index,
            predicted_inbreeding=rec.predicted_inbreeding,
            predicted_genetic_gain=rec.predicted_genetic_gain,
            predicted_dep=rec.predicted_dep,
            status=rec.status
        ))
    
    return result

@router.post("/recommendations/{recommendation_id}/adopt")
def adopt_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Adota uma recomendação de acasalamento"""
    
    recommendation = session.get(MatingRecommendation, recommendation_id)
    if not recommendation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recomendação não encontrada")
    
    recommendation.status = "adopted"
    recommendation.adopted_date = date.today()
    session.add(recommendation)
    session.commit()
    
    return {"message": "Recomendação adotada com sucesso"}

@router.post("/recommendations/batch-create-coverages/{simulation_id}")
def batch_create_coverages_from_recommendations(
    simulation_id: int,
    coverage_date: date,
    default_dam_weight: Optional[float] = 50.0,
    default_dam_body_condition: int = 3,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    Cria coberturas em lote no Manejo Reprodutivo a partir das recomendações adotadas.
    Útil para transformar recomendações em registros reais de cobertura.
    """
    
    # Buscar recomendações adotadas da simulação
    recommendations = session.exec(
        select(MatingRecommendation)
        .where(MatingRecommendation.simulation_id == simulation_id)
        .where(MatingRecommendation.status == "adopted")
    ).all()
    
    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma recomendação adotada encontrada para esta simulação"
        )
    
    created_count = 0
    errors = []
    
    for rec in recommendations:
        try:
            # Verificar se já existe uma cobertura para este par
            existing = session.exec(
                select(ReproductiveManagement)
                .where(ReproductiveManagement.dam_id == rec.dam_id)
                .where(ReproductiveManagement.sire_id == rec.sire_id)
                .where(ReproductiveManagement.coverage_date == coverage_date)
            ).first()
            
            if existing:
                errors.append(f"Cobertura já existe para Matriz {rec.dam_id} x Reprodutor {rec.sire_id}")
                continue
            
            # Buscar informações da matriz
            dam = session.get(Animal, rec.dam_id)
            sire = session.get(Animal, rec.sire_id)
            
            if not dam or not sire:
                errors.append(f"Animal não encontrado (Dam: {rec.dam_id}, Sire: {rec.sire_id})")
                continue
            
            # Buscar peso mais recente da matriz (opcional)
            latest_weight_record = session.exec(
                select(WeightRecord)
                .where(WeightRecord.animal_id == rec.dam_id)
                .order_by(WeightRecord.measurement_date.desc())
            ).first()
            
            dam_weight = latest_weight_record.weight if latest_weight_record else default_dam_weight
            
            # Buscar perímetro escrotal mais recente do reprodutor (opcional)
            # Nota: Perímetro escrotal pode estar em BodyMeasurement ou em observações
            # Por ora, usar valor padrão None
            latest_scrotal = None
            
            # Criar registro de manejo reprodutivo
            management = ReproductiveManagement(
                property_id=rec.property_id,
                herd_id=rec.herd_id,
                dam_id=rec.dam_id,
                coverage_date=coverage_date,
                dam_weight=dam_weight,
                dam_body_condition_score=default_dam_body_condition,
                sire_id=rec.sire_id,
                sire_scrotal_perimeter=latest_scrotal,
                parturition_status="em_andamento",
                observations=f"Criado automaticamente a partir da recomendação #{rec.id}"
            )
            
            session.add(management)
            created_count += 1
            
        except Exception as e:
            errors.append(f"Erro ao criar cobertura para rec #{rec.id}: {str(e)}")
            continue
    
    session.commit()
    
    return {
        "message": f"{created_count} cobertura(s) criada(s) com sucesso",
        "created_count": created_count,
        "errors": errors if errors else None
    }

@router.get("/reports/birth-predictions/{herd_id}", response_model=List[BirthPrediction])
def get_birth_predictions(
    herd_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    Relatório de Previsão de Partos
    Lista coberturas em andamento com data prevista de parto (cobertura + 152 dias)
    """
    
    managements = session.exec(
        select(ReproductiveManagement)
        .where(ReproductiveManagement.herd_id == herd_id)
        .where(ReproductiveManagement.parturition_status == "em_andamento")
    ).all()
    
    predictions = []
    today = date.today()
    
    for mgmt in managements:
        predicted_date = mgmt.coverage_date + timedelta(days=152)
        days_until = (predicted_date - today).days
        
        dam = session.get(Animal, mgmt.dam_id)
        sire = session.get(Animal, mgmt.sire_id)
        
        predictions.append(BirthPrediction(
            reproductive_management_id=mgmt.id,
            dam_id=mgmt.dam_id,
            dam_name=dam.name if dam else None,
            sire_id=mgmt.sire_id,
            sire_name=sire.name if sire else None,
            coverage_date=mgmt.coverage_date,
            predicted_birth_date=predicted_date,
            days_until_birth=days_until
        ))
    
    return predictions

@router.get("/reports/coverage-by-reproducer/{herd_id}", response_model=List[CoverageByReproducer])
def get_coverage_by_reproducer(
    herd_id: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    Relatório de Coberturas por Reprodutor
    Consolida coberturas por macho e taxas resultantes
    """
    
    # Buscar todos os reprodutores do rebanho
    reproducers = session.exec(
        select(Animal)
        .where(Animal.herd_id == herd_id)
        .where(Animal.gender == "M")
        .where(Animal.category.in_(["reprodutor", "marrão"]))
    ).all()
    
    result = []
    
    for reproducer in reproducers:
        # Contar coberturas
        total_coverages = session.exec(
            select(func.count(ReproductiveManagement.id))
            .where(ReproductiveManagement.sire_id == reproducer.id)
        ).first() or 0
        
        total_births = session.exec(
            select(func.count(ReproductiveManagement.id))
            .where(ReproductiveManagement.sire_id == reproducer.id)
            .where(ReproductiveManagement.parturition_status == "sim")
        ).first() or 0
        
        total_ongoing = session.exec(
            select(func.count(ReproductiveManagement.id))
            .where(ReproductiveManagement.sire_id == reproducer.id)
            .where(ReproductiveManagement.parturition_status == "em_andamento")
        ).first() or 0
        
        birth_rate = (total_births / total_coverages * 100) if total_coverages > 0 else 0.0
        
        result.append(CoverageByReproducer(
            sire_id=reproducer.id,
            sire_name=reproducer.name,
            total_coverages=total_coverages,
            total_births=total_births,
            total_ongoing=total_ongoing,
            birth_rate=round(birth_rate, 2)
        ))
    
    return result

