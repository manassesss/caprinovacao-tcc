"""
Script de teste do módulo de acasalamento.
Demonstra o uso das principais funcionalidades.

IMPORTANTE: Execute apenas em ambiente de desenvolvimento/teste!
"""

import requests
from datetime import date
import json

# Configuração
API_URL = "http://localhost:8000"
TOKEN = None  # Será preenchido após login

def login(email="admin@example.com", password="admin123"):
    """Faz login e retorna o token"""
    global TOKEN
    response = requests.post(f"{API_URL}/auth/login", data={
        "username": email,
        "password": password
    })
    
    if response.status_code == 200:
        data = response.json()
        TOKEN = data["access_token"]
        print(f"✅ Login bem-sucedido! Token: {TOKEN[:20]}...")
        return TOKEN
    else:
        print(f"❌ Erro no login: {response.text}")
        return None

def get_headers():
    """Retorna headers com autenticação"""
    return {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }

def list_herds():
    """Lista rebanhos disponíveis"""
    response = requests.get(f"{API_URL}/herds/", headers=get_headers())
    if response.status_code == 200:
        herds = response.json()
        print(f"\n✅ {len(herds)} rebanho(s) encontrado(s):")
        for herd in herds:
            print(f"  - ID: {herd['id']}, Nome: {herd['name']}")
        return herds
    else:
        print(f"❌ Erro ao listar rebanhos: {response.text}")
        return []

def get_eligible_animals(herd_id):
    """Lista animais elegíveis para acasalamento"""
    params = {
        "min_age_male_months": 6,
        "min_age_female_months": 8
    }
    response = requests.get(
        f"{API_URL}/mating/eligible-animals/{herd_id}",
        headers=get_headers(),
        params=params
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Animais elegíveis do rebanho {herd_id}:")
        print(f"  - Machos: {len(data['males'])}")
        print(f"  - Fêmeas: {len(data['females'])}")
        return data
    else:
        print(f"❌ Erro ao buscar animais: {response.text}")
        return None

def calculate_genetic_evaluation(herd_id):
    """Calcula avaliação genética do rebanho"""
    params = {
        "heritability": 0.3,
        "weight_adjustment_days": 60
    }
    response = requests.post(
        f"{API_URL}/mating/calculate-genetic-evaluation/{herd_id}",
        headers=get_headers(),
        params=params
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ {data['message']}")
        return True
    else:
        print(f"❌ Erro ao calcular avaliação: {response.text}")
        return False

def simulate_mating(herd_id, property_id, male_ids, female_ids):
    """Executa simulação de acasalamentos"""
    payload = {
        "property_id": property_id,
        "herd_id": herd_id,
        "heritability": 0.3,
        "selection_method": "individual_massal",
        "min_age_male_months": 6,
        "min_age_female_months": 8,
        "weight_adjustment_days": 60,
        "max_female_percentage_per_male": 50.0
    }
    
    params = {
        "selected_male_ids": male_ids,
        "selected_female_ids": female_ids
    }
    
    response = requests.post(
        f"{API_URL}/mating/simulate",
        headers=get_headers(),
        json=payload,
        params=params
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Simulação executada!")
        print(f"  - ID da simulação: {data['simulation_id']}")
        print(f"  - Total de recomendações: {data['total_recommendations']}")
        return data['simulation_id']
    else:
        print(f"❌ Erro na simulação: {response.text}")
        return None

def get_recommendations(simulation_id):
    """Lista recomendações de uma simulação"""
    response = requests.get(
        f"{API_URL}/mating/recommendations/{simulation_id}",
        headers=get_headers()
    )
    
    if response.status_code == 200:
        recommendations = response.json()
        print(f"\n✅ {len(recommendations)} recomendação(ões):")
        for i, rec in enumerate(recommendations[:5], 1):  # Mostra top 5
            print(f"\n  {i}. Reprodutor #{rec['sire_id']} × Matriz #{rec['dam_id']}")
            print(f"     - Índice: {rec['predicted_offspring_index']:.3f}")
            print(f"     - Endogamia: {rec['predicted_inbreeding']:.2f}%")
            print(f"     - Ganho: {rec['predicted_genetic_gain']:.3f}")
            print(f"     - Status: {rec['status']}")
        return recommendations
    else:
        print(f"❌ Erro ao buscar recomendações: {response.text}")
        return []

def adopt_recommendation(recommendation_id):
    """Adota uma recomendação"""
    response = requests.post(
        f"{API_URL}/mating/recommendations/{recommendation_id}/adopt",
        headers=get_headers()
    )
    
    if response.status_code == 200:
        print(f"\n✅ Recomendação #{recommendation_id} adotada!")
        return True
    else:
        print(f"❌ Erro ao adotar recomendação: {response.text}")
        return False

def get_birth_predictions(herd_id):
    """Relatório de previsão de partos"""
    response = requests.get(
        f"{API_URL}/mating/reports/birth-predictions/{herd_id}",
        headers=get_headers()
    )
    
    if response.status_code == 200:
        predictions = response.json()
        print(f"\n✅ {len(predictions)} previsão(ões) de parto:")
        for pred in predictions[:5]:
            print(f"  - Matriz #{pred['dam_id']}: Previsto para {pred['predicted_birth_date']} ({pred['days_until_birth']} dias)")
        return predictions
    else:
        print(f"❌ Erro ao buscar previsões: {response.text}")
        return []

def get_coverage_by_reproducer(herd_id):
    """Relatório de coberturas por reprodutor"""
    response = requests.get(
        f"{API_URL}/mating/reports/coverage-by-reproducer/{herd_id}",
        headers=get_headers()
    )
    
    if response.status_code == 200:
        coverages = response.json()
        print(f"\n✅ Coberturas por reprodutor:")
        for cov in coverages:
            print(f"  - Reprodutor #{cov['sire_id']}: {cov['total_coverages']} coberturas, {cov['birth_rate']:.1f}% taxa de natalidade")
        return coverages
    else:
        print(f"❌ Erro ao buscar coberturas: {response.text}")
        return []

def run_full_test():
    """Executa um teste completo do módulo"""
    print("=" * 60)
    print("TESTE DO MÓDULO DE ACASALAMENTO")
    print("=" * 60)
    
    # 1. Login
    if not login():
        print("\n❌ Não foi possível fazer login. Encerrando teste.")
        return
    
    # 2. Listar rebanhos
    herds = list_herds()
    if not herds:
        print("\n❌ Nenhum rebanho encontrado. Crie um rebanho antes de testar.")
        return
    
    herd_id = herds[0]['id']
    property_id = herds[0].get('property_id', 'default_property')
    
    # 3. Buscar animais elegíveis
    animals = get_eligible_animals(herd_id)
    if not animals or not animals['males'] or not animals['females']:
        print("\n❌ Não há animais elegíveis suficientes neste rebanho.")
        print("   Certifique-se de ter machos e fêmeas com idades adequadas.")
        return
    
    # 4. Calcular avaliação genética
    calculate_genetic_evaluation(herd_id)
    
    # 5. Executar simulação
    male_ids = [m['id'] for m in animals['males'][:3]]  # Primeiros 3 machos
    female_ids = [f['id'] for f in animals['females'][:5]]  # Primeiras 5 fêmeas
    
    simulation_id = simulate_mating(herd_id, property_id, male_ids, female_ids)
    if not simulation_id:
        print("\n❌ Não foi possível executar a simulação.")
        return
    
    # 6. Buscar recomendações
    recommendations = get_recommendations(simulation_id)
    if not recommendations:
        print("\n❌ Nenhuma recomendação gerada.")
        return
    
    # 7. Adotar primeira recomendação
    if recommendations:
        adopt_recommendation(recommendations[0]['id'])
    
    # 8. Relatórios
    get_birth_predictions(herd_id)
    get_coverage_by_reproducer(herd_id)
    
    print("\n" + "=" * 60)
    print("✅ TESTE CONCLUÍDO COM SUCESSO!")
    print("=" * 60)

if __name__ == "__main__":
    print("\n⚠️  ATENÇÃO: Este script executará operações no banco de dados!")
    print("   Certifique-se de estar em ambiente de desenvolvimento/teste.\n")
    
    resposta = input("Deseja continuar? (s/N): ")
    if resposta.lower() == 's':
        run_full_test()
    else:
        print("Teste cancelado.")


