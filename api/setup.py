#!/usr/bin/env python3
"""
Script de configuração inicial para a API Pravaler
"""
import os
import subprocess
import sys
import secrets

def run_command(command, description):
    """Executa um comando e mostra o resultado"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} concluído!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro em {description}: {e.stderr}")
        return False

def create_env_file():
    """Cria arquivo .env se não existir"""
    if os.path.exists('.env'):
        print("📁 Arquivo .env já existe!")
        return True
    
    print("📝 Criando arquivo .env...")
    
    # Gera uma chave secreta
    secret_key = secrets.token_urlsafe(32)
    
    env_content = f"""# Configurações da API Pravaler
# Gerado automaticamente em {subprocess.run('date', shell=True, capture_output=True, text=True).stdout.strip()}

# Banco de dados (SQLite para desenvolvimento)
DATABASE_URL=sqlite:///./pravaler.db

# Ambiente
APP_ENV=dev

# Segurança (gerada automaticamente)
SECRET_KEY={secret_key}
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ Arquivo .env criado com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar .env: {e}")
        return False

def check_python_version():
    """Verifica se a versão do Python é compatível"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print(f"❌ Python 3.9+ é necessário. Versão atual: {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor} detectado")
    return True

def main():
    """Função principal do script de setup"""
    print("🚀 Configurando API Pravaler...")
    print("=" * 50)
    
    # Verifica versão do Python
    if not check_python_version():
        sys.exit(1)
    
    # Cria ambiente virtual se não existir
    if not os.path.exists('venv'):
        if not run_command('python -m venv venv', 'Criando ambiente virtual'):
            sys.exit(1)
    else:
        print("📁 Ambiente virtual já existe!")
    
    # Ativa ambiente virtual e instala dependências
    if os.name == 'nt':  # Windows
        activate_cmd = 'venv\\Scripts\\activate'
        pip_cmd = 'venv\\Scripts\\pip'
    else:  # Linux/Mac
        activate_cmd = 'source venv/bin/activate'
        pip_cmd = 'venv/bin/pip'
    
    if not run_command(f'{pip_cmd} install -r requirements.txt', 'Instalando dependências'):
        sys.exit(1)
    
    # Cria arquivo .env
    if not create_env_file():
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Configuração concluída com sucesso!")
    print("\n📋 Próximos passos:")
    
    if os.name == 'nt':  # Windows
        print("1. Ative o ambiente virtual: venv\\Scripts\\activate")
    else:  # Linux/Mac
        print("1. Ative o ambiente virtual: source venv/bin/activate")
    
    print("2. Execute a API: python -m uvicorn app.main:app --reload")
    print("3. Acesse: http://localhost:8000/docs")
    print("\n🔐 Sistema de autenticação JWT implementado!")
    print("📚 Documentação completa no README.md")

if __name__ == "__main__":
    main()
