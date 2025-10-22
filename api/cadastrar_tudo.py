#!/usr/bin/env python3
"""
Script para cadastro completo do sistema
Cadastra: Fazendas → Raças → Rebanhos → Doenças → Medicamentos
"""
import json
import requests
from getpass import getpass
from pathlib import Path

API_URL = "http://localhost:8000"
DADOS_DIR = Path("dados_teste")

def login():
    """Faz login e retorna o token"""
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║           🔐 AUTENTICAÇÃO                            ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    
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
        print(f"✅ Login bem-sucedido! Usuário: {user_name} (ID: {user_id})")
        return data["access_token"], user_id
    else:
        print(f"❌ Erro no login: {response.status_code}")
        print(response.text)
        return None, None

def cadastrar_fazendas(token, user_id):
    """Cadastra fazendas"""
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║           1️⃣  CADASTRANDO FAZENDAS                      ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    
    try:
        with open(DADOS_DIR / "fazendas.json", 'r', encoding='utf-8') as f:
            fazendas = json.load(f)
    except FileNotFoundError:
        print("❌ Arquivo fazendas.json não encontrado!")
        return []
    
    headers = {"Authorization": f"Bearer {token}"}
    fazendas_criadas = []
    
    for i, fazenda in enumerate(fazendas, 1):
        # Adicionar producer_id
        fazenda['producer_id'] = user_id
        
        nome = fazenda.get('name', 'N/A')
        print(f"[{i}/{len(fazendas)}] {nome}...", end=" ")
        
        response = requests.post(f"{API_URL}/properties/", json=fazenda, headers=headers)
        
        if response.status_code == 201:
            fazenda_criada = response.json()
            fazendas_criadas.append(fazenda_criada)
            print(f"✅ ID: {fazenda_criada['id']}")
        else:
            print(f"❌ Erro {response.status_code}")
            if response.status_code != 404:
                print(f"    {response.text[:200]}")
    
    print(f"\n✅ {len(fazendas_criadas)}/{len(fazendas)} fazendas cadastradas")
    return fazendas_criadas

def cadastrar_racas(token):
    """Cadastra raças"""
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║           2️⃣  CADASTRANDO RAÇAS                         ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    
    try:
        with open(DADOS_DIR / "racas.json", 'r', encoding='utf-8') as f:
            racas = json.load(f)
    except FileNotFoundError:
        print("❌ Arquivo racas.json não encontrado!")
        return []
    
    headers = {"Authorization": f"Bearer {token}"}
    racas_criadas = []
    
    for i, raca in enumerate(racas, 1):
        nome = raca.get('name', 'N/A')
        print(f"[{i}/{len(racas)}] {nome}...", end=" ")
        
        response = requests.post(f"{API_URL}/races/", json=raca, headers=headers)
        
        if response.status_code == 201:
            raca_criada = response.json()
            racas_criadas.append(raca_criada)
            print(f"✅ ID: {raca_criada['id']}")
        else:
            print(f"❌ Erro {response.status_code}")
            if response.status_code != 404:
                print(f"    {response.text[:200]}")
    
    print(f"\n✅ {len(racas_criadas)}/{len(racas)} raças cadastradas")
    return racas_criadas

def cadastrar_rebanhos(token, fazendas):
    """Cadastra rebanhos"""
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║           3️⃣  CADASTRANDO REBANHOS                      ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    
    if not fazendas:
        print("⚠️  Nenhuma fazenda disponível para vincular rebanhos")
        return []
    
    try:
        with open(DADOS_DIR / "rebanhos.json", 'r', encoding='utf-8') as f:
            rebanhos = json.load(f)
    except FileNotFoundError:
        print("❌ Arquivo rebanhos.json não encontrado!")
        return []
    
    headers = {"Authorization": f"Bearer {token}"}
    rebanhos_criados = []
    
    # Distribuir rebanhos entre as fazendas
    for i, rebanho in enumerate(rebanhos, 1):
        # Usar a primeira fazenda ou distribuir
        fazenda_idx = (i - 1) % len(fazendas)
        rebanho['property_id'] = fazendas[fazenda_idx]['id']
        
        nome = rebanho.get('name', 'N/A')
        fazenda_nome = fazendas[fazenda_idx]['name']
        print(f"[{i}/{len(rebanhos)}] {nome} → {fazenda_nome}...", end=" ")
        
        response = requests.post(f"{API_URL}/herds/", json=rebanho, headers=headers)
        
        if response.status_code == 201:
            rebanho_criado = response.json()
            rebanhos_criados.append(rebanho_criado)
            print(f"✅ ID: {rebanho_criado['id']}")
        else:
            print(f"❌ Erro {response.status_code}")
            if response.status_code != 404:
                print(f"    {response.text[:200]}")
    
    print(f"\n✅ {len(rebanhos_criados)}/{len(rebanhos)} rebanhos cadastrados")
    return rebanhos_criados

def cadastrar_doencas(token):
    """Cadastra doenças"""
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║           4️⃣  CADASTRANDO DOENÇAS                       ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    
    try:
        with open(DADOS_DIR / "doencas.json", 'r', encoding='utf-8') as f:
            doencas = json.load(f)
    except FileNotFoundError:
        print("❌ Arquivo doencas.json não encontrado!")
        return []
    
    headers = {"Authorization": f"Bearer {token}"}
    doencas_criadas = []
    
    for i, doenca in enumerate(doencas, 1):
        nome = doenca.get('name', 'N/A')
        print(f"[{i}/{len(doencas)}] {nome}...", end=" ")
        
        response = requests.post(f"{API_URL}/illnesses/", json=doenca, headers=headers)
        
        if response.status_code == 201:
            doenca_criada = response.json()
            doencas_criadas.append(doenca_criada)
            print(f"✅")
        else:
            print(f"❌ Erro {response.status_code}")
            if response.status_code != 404:
                print(f"    {response.text[:200]}")
    
    print(f"\n✅ {len(doencas_criadas)}/{len(doencas)} doenças cadastradas")
    return doencas_criadas

def cadastrar_medicamentos(token):
    """Cadastra medicamentos"""
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║           5️⃣  CADASTRANDO MEDICAMENTOS                  ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    
    try:
        with open(DADOS_DIR / "medicamentos.json", 'r', encoding='utf-8') as f:
            medicamentos = json.load(f)
    except FileNotFoundError:
        print("❌ Arquivo medicamentos.json não encontrado!")
        return []
    
    headers = {"Authorization": f"Bearer {token}"}
    medicamentos_criados = []
    
    for i, medicamento in enumerate(medicamentos, 1):
        nome = medicamento.get('name', 'N/A')
        tipo = medicamento.get('type', 'N/A')
        print(f"[{i}/{len(medicamentos)}] {nome} ({tipo})...", end=" ")
        
        response = requests.post(f"{API_URL}/medicines/", json=medicamento, headers=headers)
        
        if response.status_code == 201:
            medicamento_criado = response.json()
            medicamentos_criados.append(medicamento_criado)
            print(f"✅")
        else:
            print(f"❌ Erro {response.status_code}")
            if response.status_code != 404:
                print(f"    {response.text[:200]}")
    
    print(f"\n✅ {len(medicamentos_criados)}/{len(medicamentos)} medicamentos cadastrados")
    return medicamentos_criados

def main():
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║      🐐 CADASTRO COMPLETO DO SISTEMA PRAVALER 🐐     ║")
    print("╚══════════════════════════════════════════════════════════╝")
    
    # Login
    token, user_id = login()
    if not token:
        return
    
    # Cadastrar tudo em ordem
    fazendas = cadastrar_fazendas(token, user_id)
    racas = cadastrar_racas(token)
    rebanhos = cadastrar_rebanhos(token, fazendas)
    doencas = cadastrar_doencas(token)
    medicamentos = cadastrar_medicamentos(token)
    
    # Resumo final
    print("\n" + "═" * 60)
    print("\n╔══════════════════════════════════════════════════════════╗")
    print("║                  RESUMO DO CADASTRO                   ║")
    print("╚══════════════════════════════════════════════════════════╝\n")
    print(f"  ✅ Fazendas:      {len(fazendas)}")
    print(f"  ✅ Raças:         {len(racas)}")
    print(f"  ✅ Rebanhos:      {len(rebanhos)}")
    print(f"  ✅ Doenças:       {len(doencas)}")
    print(f"  ✅ Medicamentos:  {len(medicamentos)}")
    print(f"\n  📊 TOTAL:         {len(fazendas) + len(racas) + len(rebanhos) + len(doencas) + len(medicamentos)} registros\n")
    
    # Mostrar IDs das fazendas
    if fazendas:
        print("📍 FAZENDAS CRIADAS (use esses IDs):")
        for faz in fazendas:
            print(f"   {faz['name']}: {faz['id']}")
        print()
    
    # Mostrar IDs das raças
    if racas:
        print("🐐 RAÇAS CRIADAS (use esses IDs):")
        for raca in racas:
            print(f"   {raca['name']}: {raca['id']}")
        print()
    
    print("═" * 60)
    print("\n🎉 CADASTRO COMPLETO! Acesse: http://localhost:3000\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Operação cancelada pelo usuário.")
    except Exception as e:
        print(f"\n\n❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()

