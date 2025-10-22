#!/usr/bin/env python3
"""
Script para pegar IDs de fazendas e raças
"""
import requests
from getpass import getpass

API_URL = "http://localhost:8000"

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
        print(f"\n✅ Login bem-sucedido!\n")
        return data["access_token"]
    else:
        print(f"\n❌ Erro no login: {response.status_code}")
        return None

def main():
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║         CONSULTAR IDS - FAZENDAS E RAÇAS             ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    
    # Login
    token = login()
    if not token:
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Buscar fazendas
    print("─" * 60)
    print("📍 FAZENDAS:")
    print("─" * 60)
    
    response = requests.get(f"{API_URL}/properties/", headers=headers)
    if response.status_code == 200:
        fazendas = response.json()
        if fazendas:
            for f in fazendas:
                print(f"\n  ID: {f['id']}")
                print(f"  Nome: {f['name']}")
                print(f"  Localização: {f.get('location', 'N/A')}")
        else:
            print("\n  ⚠️  Nenhuma fazenda cadastrada")
    else:
        print(f"\n  ❌ Erro: {response.status_code}")
    
    # Buscar raças
    print("\n" + "─" * 60)
    print("🐐 RAÇAS:")
    print("─" * 60)
    
    response = requests.get(f"{API_URL}/races/", headers=headers)
    if response.status_code == 200:
        racas = response.json()
        if racas:
            for r in racas:
                print(f"\n  ID: {r['id']}")
                print(f"  Nome: {r['name']}")
                print(f"  Espécie: {r.get('species_id', 'N/A')}")
        else:
            print("\n  ⚠️  Nenhuma raça cadastrada")
    else:
        print(f"\n  ❌ Erro: {response.status_code}")
    
    # Buscar rebanhos
    print("\n" + "─" * 60)
    print("🐑 REBANHOS:")
    print("─" * 60)
    
    response = requests.get(f"{API_URL}/herds/", headers=headers)
    if response.status_code == 200:
        rebanhos = response.json()
        if rebanhos:
            for h in rebanhos:
                print(f"\n  ID: {h['id']}")
                print(f"  Nome: {h['name']}")
                print(f"  Fazenda: {h['property_id']}")
        else:
            print("\n  ⚠️  Nenhum rebanho cadastrado")
    else:
        print(f"\n  ❌ Erro: {response.status_code}")
    
    print("\n" + "─" * 60)
    print("\n💡 Use esses IDs no arquivo animais_teste.json\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Operação cancelada.")
    except Exception as e:
        print(f"\n\n❌ Erro: {e}")

