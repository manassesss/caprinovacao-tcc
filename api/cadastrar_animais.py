#!/usr/bin/env python3
"""
Script para cadastro em massa de animais
"""
import json
import requests
from getpass import getpass

# Configurações
API_URL = "http://localhost:8000"
JSON_FILE = "animais_teste.json"

def login():
    """Faz login e retorna o token"""
    email = input("Email: ")
    password = getpass("Senha: ")
    
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"email": email, "password": password}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login bem-sucedido! Usuário: {data.get('user', {}).get('name')}")
        return data["access_token"]
    else:
        print(f"❌ Erro no login: {response.status_code}")
        print(response.text)
        return None

def cadastrar_animal(animal_data, token):
    """Cadastra um animal"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(
        f"{API_URL}/animals/",
        json=animal_data,
        headers=headers
    )
    
    return response

def main():
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║      CADASTRO EM MASSA DE ANIMAIS - PRAVALER         ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    
    # Fazer login
    print("1️⃣  FAZENDO LOGIN...")
    token = login()
    if not token:
        print("\n❌ Não foi possível fazer login. Encerrando.")
        return
    
    print()
    
    # Buscar fazendas do usuário
    print("2️⃣  BUSCANDO FAZENDAS DO USUÁRIO...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/properties/", headers=headers)
    
    if response.status_code != 200:
        print("❌ Erro ao buscar fazendas")
        return
    
    fazendas = response.json()
    if not fazendas:
        print("❌ Você não tem nenhuma fazenda cadastrada!")
        print("💡 Cadastre uma fazenda primeiro em: http://localhost:3000/fazendas")
        return
    
    print(f"✅ {len(fazendas)} fazenda(s) encontrada(s)")
    fazenda_principal = fazendas[0]
    print(f"   Usando: {fazenda_principal['name']} (ID: {fazenda_principal['id']})")
    
    # Buscar raças disponíveis
    print("\n   Buscando raças disponíveis...")
    response = requests.get(f"{API_URL}/races/", headers=headers)
    racas = response.json() if response.status_code == 200 else []
    
    if not racas:
        print("❌ Nenhuma raça cadastrada!")
        print("💡 Cadastre raças primeiro em: http://localhost:3000/races")
        return
    
    print(f"✅ {len(racas)} raça(s) encontrada(s)")
    raca_principal = racas[0]
    print(f"   Usando: {raca_principal['name']} (ID: {raca_principal['id']})")
    
    print()
    
    # Carregar JSON
    print("3️⃣  CARREGANDO ARQUIVO JSON...")
    try:
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            animais = json.load(f)
        print(f"✅ {len(animais)} animais carregados do arquivo")
    except FileNotFoundError:
        print(f"❌ Arquivo {JSON_FILE} não encontrado!")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao ler JSON: {e}")
        return
    
    # Atualizar property_id e race_id automaticamente
    for animal in animais:
        animal['property_id'] = fazenda_principal['id']
        animal['race_id'] = raca_principal['id']
    
    print(f"✅ Animais configurados para:")
    print(f"   Fazenda: {fazenda_principal['name']}")
    print(f"   Raça:    {raca_principal['name']}")
    
    print()
    
    # Cadastrar animais
    print("4️⃣  CADASTRANDO ANIMAIS...")
    print("─" * 60)
    
    sucesso = 0
    erros = 0
    
    for i, animal in enumerate(animais, 1):
        identificacao = animal.get('earring_identification', 'N/A')
        nome = animal.get('name', 'Sem nome')
        
        print(f"\n[{i}/{len(animais)}] {identificacao} - {nome}...", end=" ")
        
        response = cadastrar_animal(animal, token)
        
        if response.status_code == 201:
            print("✅ Sucesso!")
            sucesso += 1
        else:
            print(f"❌ Erro {response.status_code}")
            print(f"    Detalhes: {response.text[:100]}")
            erros += 1
    
    # Resumo
    print("\n" + "─" * 60)
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║                  RESUMO DO CADASTRO                   ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    print(f"  ✅ Sucesso: {sucesso}")
    print(f"  ❌ Erros:   {erros}")
    print(f"  📊 Total:   {len(animais)}")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Operação cancelada pelo usuário.")
    except Exception as e:
        print(f"\n\n❌ Erro inesperado: {e}")

