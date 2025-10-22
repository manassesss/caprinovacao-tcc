#!/usr/bin/env python3
"""
Script para cadastro individual de cada tipo de dado
Uso: python cadastrar_individual.py [tipo]
Tipos: fazendas, racas, rebanhos, doencas, medicamentos
"""
import sys
import json
import requests
from getpass import getpass
from pathlib import Path

API_URL = "http://localhost:8000"
DADOS_DIR = Path("dados_teste")

ENDPOINTS = {
    'fazendas': '/properties/',
    'racas': '/races/',
    'rebanhos': '/herds/',
    'doencas': '/illnesses/',
    'medicamentos': '/medicines/',
}

DISPLAY_NAMES = {
    'fazendas': 'Fazendas',
    'racas': 'Raças',
    'rebanhos': 'Rebanhos',
    'doencas': 'Doenças',
    'medicamentos': 'Medicamentos',
}

def login():
    """Faz login e retorna o token e user_id"""
    email = input("Email: ")
    password = getpass("Senha: ")
    
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"email": email, "password": password}
    )
    
    if response.status_code == 200:
        data = response.json()
        user_id = data.get('user', {}).get('id')
        user_name = data.get('user', {}).get('name')
        print(f"\n✅ Login bem-sucedido! Usuário: {user_name}\n")
        return data["access_token"], user_id
    else:
        print(f"\n❌ Erro no login: {response.status_code}")
        return None, None

def cadastrar(tipo, token, user_id=None):
    """Cadastra dados de um tipo específico"""
    if tipo not in ENDPOINTS:
        print(f"❌ Tipo inválido: {tipo}")
        print(f"Tipos válidos: {', '.join(ENDPOINTS.keys())}")
        return
    
    # Carregar JSON
    json_file = DADOS_DIR / f"{tipo}.json"
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            dados = json.load(f)
    except FileNotFoundError:
        print(f"❌ Arquivo {json_file} não encontrado!")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao ler JSON: {e}")
        return
    
    print(f"\n{'─' * 60}")
    print(f"📦 CADASTRANDO {DISPLAY_NAMES[tipo].upper()}")
    print(f"{'─' * 60}\n")
    
    headers = {"Authorization": f"Bearer {token}"}
    endpoint = ENDPOINTS[tipo]
    sucesso = 0
    erros = 0
    
    for i, item in enumerate(dados, 1):
        # Adicionar producer_id para fazendas
        if tipo == 'fazendas' and user_id:
            item['producer_id'] = user_id
        
        # Mostrar nome do item
        nome = item.get('name', 'N/A')
        print(f"[{i}/{len(dados)}] {nome}...", end=" ")
        
        response = requests.post(f"{API_URL}{endpoint}", json=item, headers=headers)
        
        if response.status_code == 201:
            item_criado = response.json()
            sucesso += 1
            
            # Mostrar ID se disponível
            if 'id' in item_criado:
                print(f"✅ ID: {item_criado['id']}")
            else:
                print(f"✅")
        else:
            erros += 1
            print(f"❌ Erro {response.status_code}")
            if response.status_code != 404:
                try:
                    error_detail = response.json().get('detail', response.text[:100])
                    print(f"    {error_detail}")
                except:
                    print(f"    {response.text[:100]}")
    
    # Resumo
    print(f"\n{'─' * 60}")
    print(f"✅ Sucesso: {sucesso}/{len(dados)}")
    if erros > 0:
        print(f"❌ Erros:   {erros}/{len(dados)}")
    print(f"{'─' * 60}\n")

def main():
    if len(sys.argv) < 2:
        print("\n╔══════════════════════════════════════════════════════════╗")
        print("║       📦 CADASTRO INDIVIDUAL DE DADOS                ║")
        print("╚══════════════════════════════════════════════════════════╝\n")
        print("Uso: python cadastrar_individual.py [tipo]\n")
        print("Tipos disponíveis:")
        print("  • fazendas      - 5 fazendas")
        print("  • racas         - 10 raças")
        print("  • rebanhos      - 5 rebanhos")
        print("  • doencas       - 10 doenças")
        print("  • medicamentos  - 10 medicamentos\n")
        print("Exemplo:")
        print("  python cadastrar_individual.py fazendas")
        print("  python cadastrar_individual.py racas\n")
        return
    
    tipo = sys.argv[1].lower()
    
    print("\n╔══════════════════════════════════════════════════════════╗")
    print(f"║       CADASTRO DE {DISPLAY_NAMES.get(tipo, tipo).upper():^42} ║")
    print("╚══════════════════════════════════════════════════════════╝")
    
    # Login
    token, user_id = login()
    if not token:
        return
    
    # Cadastrar
    cadastrar(tipo, token, user_id)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Operação cancelada.")
    except Exception as e:
        print(f"\n\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()

